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
  incomingCallData?: ICallIncomingEvent | null;
  sessionId?: string;
  onEndCall?: () => void;
}

export const VideoChat: React.FC<VideoChatProps> = ({
  receiverId,
  receiverType = 'staff',
  autoStart = false,
  incomingCallData,
  sessionId: propSessionId,
  onEndCall,
}) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(propSessionId || null);
  const [incomingCall, setIncomingCall] = useState<ICallIncomingEvent | null>(incomingCallData || null);
  const [iceServers, setICEServers] = useState<IICEServersEvent | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callerId, setCallerId] = useState<string | null>(incomingCallData?.callerId || null);

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
      // Only handle if we aren't already in a call
      if (callState === 'idle' && !incomingCallData) {
        console.log('[VideoChat] Incoming call');
        setIncomingCall(data);
        setCallState('ringing');
      }
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
          targetUserId: callerId || receiverId || (incomingCallData?.callerId),
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

  // Handle incoming call prop (Answer immediately if provided)
  useEffect(() => {
    if (incomingCallData && connected && callState === 'idle') {
      acceptCall(incomingCallData);
    }
  }, [incomingCallData, connected]);

  // Auto-start call if specified
  useEffect(() => {
    if (autoStart && receiverId && connected && !sessionId && !incomingCallData) {
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

  const acceptCall = async (callData: ICallIncomingEvent | null = incomingCall) => {
    if (!callData) return;

    try {
      setCallState('active'); // Set active immediately to show UI
      setSessionId(callData.sessionId);
      setCallerId(callData.callerId);

      // Initialize WebRTC
      webrtc.initializePeerConnection();

      // Start local stream
      await webrtc.startLocalStream();

      // Create and send answer
      const answer = await webrtc.createAnswer(callData.offer);
      emit('call:answer', {
        sessionId: callData.sessionId,
        callerId: callData.callerId,
        answer,
      });

      // Update call status
      await updateCallStatus(callData.sessionId, { status: 'active' });

      setIncomingCall(null);
      startCallDuration();

      logCommunicationEvent('call_accepted', {
        sessionId: callData.sessionId,
        callerId: callData.callerId,
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
    
    if (onEndCall) onEndCall();
  };

  const endCall = async () => {
    const target = callerId || receiverId;
    if (sessionId && target) {
      emit('call:hangup', {
        sessionId,
        targetUserId: target,
      });

      if (callState === 'active') {
        try {
          await updateCallStatus(sessionId, {
            status: 'ended',
            metadata: {
              quality: 'good',
            },
          });
        } catch (e) {
          console.error('Failed to update call status to ended', e);
        }
      }
    }

    stopCallDuration();
    webrtc.closePeerConnection();
    setCallState('ended');
    
    // Notify parent
    if (onEndCall) {
       onEndCall();
    }
    
    // Reset state after delay
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

  // Incoming call modal (Only used if NOT triggered via props)
  if (incomingCall && callState === 'ringing' && !incomingCallData) {
    return <IncomingCallModal callData={incomingCall} onAccept={() => acceptCall()} onReject={rejectCall} />;
  }

  // Idle state
  if (callState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
        <p className="text-gray-500 mt-4">Initializing...</p>
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
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
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
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
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
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
            <p className="text-gray-400">Duration: {formatDuration(callDuration)}</p>
          </div>
        </div>
      )}

      {/* No remote stream placeholder */}
      {callState === 'active' && !webrtc.remoteStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 -z-10">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
          <p className="text-white ml-4">Connecting...</p>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
