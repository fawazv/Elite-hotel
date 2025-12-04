/**
 * WebRTC Hook for Video Chat
 * Manages WebRTC peer connection and media streams
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { IICEServer } from '../types/communication.types';
import { logCommunicationEvent } from '../services/communicationApi';

interface UseWebRTCOptions {
  iceServers?: IICEServer[];
  onICECandidate?: (candidate: RTCIceCandidate) => void;
  onTrack?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

interface UseWebRTCReturn {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  
  // Media control methods
  startLocalStream: (constraints?: MediaStreamConstraints) => Promise<MediaStream>;
  stopLocalStream: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  
  // WebRTC signaling methods
  createOffer: () => Promise<RTCSessionDescriptionInit>;
  createAnswer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>;
  setRemoteDescription: (description: RTCSessionDescriptionInit) => Promise<void>;
  addICECandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  
  // Connection management
  initializePeerConnection: () => void;
  closePeerConnection: () => void;
  
  // Media state
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}

const DEFAULT_ICE_SERVERS: IICEServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

/**
 * Custom hook for managing WebRTC peer connection
 */
export const useWebRTC = (options: UseWebRTCOptions = {}): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());

  /**
   * Initialize RTCPeerConnection
   */
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      console.log('[WebRTC] Peer connection already exists');
      return;
    }

    console.log('[WebRTC] Initializing peer connection...');

    const iceServers = options.iceServers || DEFAULT_ICE_SERVERS;
    const pc = new RTCPeerConnection({ iceServers });

    // ICE candidate event
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] New ICE candidate');
        options.onICECandidate?.(event.candidate);
      }
    };

    // Track event (remote stream)
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track:', event.track.kind);
      
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });
      
      setRemoteStream(remoteStreamRef.current);
      options.onTrack?.(remoteStreamRef.current);

      logCommunicationEvent('webrtc_track_received', {
        trackKind: event.track.kind,
      });
    };

    // Connection state change
    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      setConnectionState(pc.connectionState);
      options.onConnectionStateChange?.(pc.connectionState);

      logCommunicationEvent('webrtc_connection_state_change', {
        state: pc.connectionState,
      });
    };

    // ICE connection state change
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
    };

    peerConnectionRef.current = pc;
    console.log('[WebRTC] ✅ Peer connection initialized');
  }, [options]);

  /**
   * Start local media stream (camera and microphone)
   */
  const startLocalStream = useCallback(async (
    constraints: MediaStreamConstraints = { video: true, audio: true }
  ): Promise<MediaStream> => {
    try {
      console.log('[WebRTC] Requesting local media stream...');
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Add tracks to peer connection if it exists
      if (peerConnectionRef.current) {
        stream.getTracks().forEach((track) => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
      }

      console.log('[WebRTC] ✅ Local stream started');
      logCommunicationEvent('webrtc_local_stream_started', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
      });

      return stream;
    } catch (error: any) {
      console.error('[WebRTC] Failed to get local stream:', error);
      logCommunicationEvent('webrtc_local_stream_error', {
        error: error.message,
      });
      throw error;
    }
  }, []);

  /**
   * Stop local media stream
   */
  const stopLocalStream = useCallback(() => {
    if (localStream) {
      console.log('[WebRTC] Stopping local stream');
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);

      logCommunicationEvent('webrtc_local_stream_stopped', {});
    }
  }, [localStream]);

  /**
   * Toggle audio track
   */
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        console.log('[WebRTC] Audio:', audioTrack.enabled ? 'enabled' : 'disabled');

        logCommunicationEvent('webrtc_audio_toggle', {
          enabled: audioTrack.enabled,
        });
      }
    }
  }, [localStream]);

  /**
   * Toggle video track
   */
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        console.log('[WebRTC] Video:', videoTrack.enabled ? 'enabled' : 'disabled');

        logCommunicationEvent('webrtc_video_toggle', {
          enabled: videoTrack.enabled,
        });
      }
    }
  }, [localStream]);

  /**
   * Create WebRTC offer
   */
  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit> => {
    if (!peerConnectionRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      console.log('[WebRTC] Creating offer...');
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('[WebRTC] ✅ Offer created');

      logCommunicationEvent('webrtc_offer_created', {});

      return offer;
    } catch (error: any) {
      console.error('[WebRTC] Failed to create offer:', error);
      logCommunicationEvent('webrtc_offer_error', {
        error: error.message,
      });
      throw error;
    }
  }, []);

  /**
   * Create WebRTC answer
   */
  const createAnswer = useCallback(async (
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> => {
    if (!peerConnectionRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      console.log('[WebRTC] Creating answer...');
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('[WebRTC] ✅ Answer created');

      logCommunicationEvent('webrtc_answer_created', {});

      return answer;
    } catch (error: any) {
      console.error('[WebRTC] Failed to create answer:', error);
      logCommunicationEvent('webrtc_answer_error', {
        error: error.message,
      });
      throw error;
    }
  }, []);

  /**
   * Set remote description
   */
  const setRemoteDescription = useCallback(async (
    description: RTCSessionDescriptionInit
  ): Promise<void> => {
    if (!peerConnectionRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      console.log('[WebRTC] Setting remote description...');
      await peerConnectionRef.current.setRemoteDescription(description);
      console.log('[WebRTC] ✅ Remote description set');

      logCommunicationEvent('webrtc_remote_description_set', {
        type: description.type,
      });
    } catch (error: any) {
      console.error('[WebRTC] Failed to set remote description:', error);
      logCommunicationEvent('webrtc_remote_description_error', {
        error: error.message,
      });
      throw error;
    }
  }, []);

  /**
   * Add ICE candidate
   */
  const addICECandidate = useCallback(async (
    candidate: RTCIceCandidateInit
  ): Promise<void> => {
    if (!peerConnectionRef.current) {
      throw new Error('Peer connection not initialized');
    }

    try {
      await peerConnectionRef.current.addIceCandidate(candidate);
      console.log('[WebRTC] ICE candidate added');
    } catch (error: any) {
      console.error('[WebRTC] Failed to add ICE candidate:', error);
    }
  }, []);

  /**
   * Close peer connection and cleanup
   */
  const closePeerConnection = useCallback(() => {
    console.log('[WebRTC] Closing peer connection...');

    stopLocalStream();

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    remoteStreamRef.current.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current = new MediaStream();
    setRemoteStream(null);
    setConnectionState('closed');

    logCommunicationEvent('webrtc_connection_closed', {});

    console.log('[WebRTC] ✅ Connection closed');
  }, [stopLocalStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePeerConnection();
    };
  }, []);

  return {
    peerConnection: peerConnectionRef.current,
    localStream,
    remoteStream,
    connectionState,
    
    startLocalStream,
    stopLocalStream,
    toggleAudio,
    toggleVideo,
    
    createOffer,
    createAnswer,
    setRemoteDescription,
    addICECandidate,
    
    initializePeerConnection,
    closePeerConnection,
    
    isAudioEnabled,
    isVideoEnabled,
  };
};

export default useWebRTC;
