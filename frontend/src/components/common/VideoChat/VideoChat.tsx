/**
 * Video Chat Main Component
 * Manages video call state and UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Phone, User, Clock } from 'lucide-react';
import { useWebSocket } from '../../../Hooks/useWebSocket';
import { useWebRTC } from '../../../Hooks/useWebRTC';
import {
  initiateVideoCall,
  updateCallStatus,
  logCommunicationEvent,
} from '../../../services/communicationApi';
import type { ICallIncomingEvent, IICEServersEvent } from '../../../types/communication.types';
import IncomingCallModal from './IncomingCallModal';
import VideoCallControls from './VideoCallControls';

type CallState = 'idle' | 'calling' | 'ringing' | 'active' | 'ended';

interface VideoChatProps {
  receiverId?: string;
  receiverType?: 'guest' | 'staff';
  autoStart?: boolean;
}

export const VideoChat: React.FC<VideoChatProps> = ({
  receiverId,
  receiverType = 'staff',
  autoStart = false,
}) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<ICallIncomingEvent | null>(null);
  const [iceServers, setICEServers] = useState<IICEServersEvent | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callerId, setCallerId] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // WebSocket handlers
  const websocketHandlers = {
    onICEServers: (data: IICEServersEvent) => {
      console.log('[VideoChat] Received ICE servers');
      setICEServers(data);
    },
    onCallIncoming: (data: ICallIncomingEvent) => {
      console.log('[VideoChat] Incoming call');
      setIncomingCall(data);
      setCallState('ringing');
    },
    onCallAnswered: async (data: any) => {
      console.log('[VideoChat] Call answered');
      await webrtc.setRemoteDescription(data.answer);
      setCallState('active');
      startCallDuration();
    },
    onCallRejected: () => {
      console.log('[VideoChat] Call rejected');
      endCall();
    },
    onCallEnded: () => {
      console.log('[VideoChat] Call ended by remote');
      endCall();
    },
    onICECandidate: (data: any) => {
      webrtc.addICECandidate(data.candidate);
    },
    onCallError: (data: any) => {
      console.error('[VideoChat] Call error:', data.message);
      alert(`Call error: ${data.message}`);
      endCall();
    },
  };

  const { connected, emit } = useWebSocket(websocketHandlers);

  const webrtc = useWebRTC({
    iceServers: iceServers?.iceServers,
    onICECandidate: (candidate) => {
      if (sessionId && (callerId || receiverId)) {
        emit('call:ice-candidate', {
          sessionId,
          targetUserId: callerId || receiverId,
          candidate: candidate.toJSON(),
        });
      }
    },
    onTrack: (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    },
  });

  // Update local video when stream changes
  useEffect(() => {
    if (localVideoRef.current && webrtc.localStream) {
      localVideoRef.current.srcObject = webrtc.localStream;
    }
  }, [webrtc.localStream]);

  // Auto-start call if specified
  useEffect(() => {
    if (autoStart && receiverId && connected && !sessionId) {
      initiateCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, receiverId, connected]);

  const startCallDuration = () => {
    callStartTimeRef.current = Date.now();
    durationIntervalRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
      }
    }, 1000);
  };

  const stopCallDuration = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    callStartTimeRef.current = null;
  };

  const initiateCall = async () => {
    if (!receiverId) {
      alert('Please select a user to call');
      return;
    }

    try {
      setCallState('calling');

      // Initialize WebRTC
      webrtc.initializePeerConnection();

      // Start local stream
      await webrtc.startLocalStream();

      // Create session via API
      const { sessionId: newSessionId } = await initiateVideoCall({
        receiverId,
        receiverType,
      });
      setSessionId(newSessionId);

      // Create and send offer
      const offer = await webrtc.createOffer();
      emit('call:offer', {
        sessionId: newSessionId,
        receiverId,
        offer,
      });

      logCommunicationEvent('call_initiated', {
        sessionId: newSessionId,
        receiverId,
        receiverType,
      });
    } catch (error: any) {
      console.error('[VideoChat] Failed to initiate call:', error);
      alert(`Failed to start call: ${error.message}`);
      endCall();
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      setCallState('active');
      setSessionId(incomingCall.sessionId);
      setCallerId(incomingCall.callerId);

      // Initialize WebRTC
      webrtc.initializePeerConnection();

      // Start local stream
      await webrtc.startLocalStream();

      // Create and send answer
      const answer = await webrtc.createAnswer(incomingCall.offer);
      emit('call:answer', {
        sessionId: incomingCall.sessionId,
        callerId: incomingCall.callerId,
        answer,
      });

      // Update call status
      await updateCallStatus(incomingCall.sessionId, { status: 'active' });

      setIncomingCall(null);
      startCallDuration();

      logCommunicationEvent('call_accepted', {
        sessionId: incomingCall.sessionId,
        callerId: incomingCall.callerId,
      });
    } catch (error: any) {
      console.error('[VideoChat] Failed to accept call:', error);
      alert(`Failed to accept call: ${error.message}`);
      endCall();
    }
  };

  const rejectCall = async () => {
    if (!incomingCall) return;

    emit('call:reject', {
      sessionId: incomingCall.sessionId,
      callerId: incomingCall.callerId,
    });

    await updateCallStatus(incomingCall.sessionId, { status: 'rejected' });

    setIncomingCall(null);
    setCallState('idle');

    logCommunicationEvent('call_rejected', {
      sessionId: incomingCall.sessionId,
    });
  };

  const endCall = async () => {
    if (sessionId && (callerId || receiverId)) {
      emit('call:hangup', {
        sessionId,
        targetUserId: callerId || receiverId,
      });

      if (callState === 'active') {
        await updateCallStatus(sessionId, {
          status: 'ended',
          metadata: {
            quality: 'good', // Can be enhanced with actual quality metrics
          },
        });
      }
    }

    stopCallDuration();
    webrtc.closePeerConnection();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setSessionId(null);
      setCallerId(null);
      setCallDuration(0);
    }, 3000);

    logCommunicationEvent('call_ended', {
      sessionId,
      duration: callDuration,
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Incoming call modal
  if (incomingCall && callState === 'ringing') {
    return <IncomingCallModal callData={incomingCall} onAccept={acceptCall} onReject={rejectCall} />;
  }

  // Idle state
  if (callState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Phone className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Video Chat</h2>
        <p className="text-gray-500 mb-6">Ready to start a video call</p>
        {receiverId && (
          <button
            onClick={initiateCall}
            disabled={!connected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold px-8 py-3 rounded-lg flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Start Call
          </button>
        )}
        {!connected && <p className="text-red-500 text-sm mt-2">Connecting...</p>}
      </div>
    );
  }

  // Calling state
  if (callState === 'calling') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-900 text-white">
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">Calling...</h2>
        <p className="text-gray-400">Waiting for answer</p>
        <button
          onClick={endCall}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Active call or ended state
  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Remote Video (Full Screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
        />
        {!webrtc.isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Call Duration */}
      {callState === 'active' && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatDuration(callDuration)}</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <VideoCallControls
          isAudioEnabled={webrtc.isAudioEnabled}
          isVideoEnabled={webrtc.isVideoEnabled}
          onToggleAudio={webrtc.toggleAudio}
          onToggleVideo={webrtc.toggleVideo}
          onEndCall={endCall}
        />
      </div>

      {/* Call Ended Overlay */}
      {callState === 'ended' && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
            <p className="text-gray-400">Duration: {formatDuration(callDuration)}</p>
          </div>
        </div>
      )}

      {/* No remote stream placeholder */}
      {callState === 'active' && !webrtc.remoteStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
          <p className="text-white ml-4">Connecting...</p>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
