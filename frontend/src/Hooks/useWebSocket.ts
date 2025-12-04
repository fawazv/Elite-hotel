/**
 * WebSocket Hook for Communication Service
 * Manages WebSocket connection for real-time messaging and video call signaling
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import type {
  IICEServersEvent,
  ICallIncomingEvent,
  ICallAnsweredEvent,
  ICallRejectedEvent,
  ICallEndedEvent,
  IICECandidateEvent,
  ICallErrorEvent,
} from '../types/communication.types';
import { logCommunicationEvent } from '../services/communicationApi';

const SOCKET_URL = import.meta.env.VITE_COMMUNICATION_WS_URL || 'http://localhost:4009';

interface WebSocketEventHandlers {
  onICEServers?: (data: IICEServersEvent) => void;
  onCallIncoming?: (data: ICallIncomingEvent) => void;
  onCallAnswered?: (data: ICallAnsweredEvent) => void;
  onCallRejected?: (data: ICallRejectedEvent) => void;
  onCallEnded?: (data: ICallEndedEvent) => void;
  onICECandidate?: (data: IICECandidateEvent) => void;
  onCallError?: (data: ICallErrorEvent) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, data: any) => void;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for managing WebSocket connection to communication service
 */
export const useWebSocket = (handlers?: WebSocketEventHandlers): UseWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  // Get auth token from Redux store
  const token = useSelector((state: any) => state.auth?.token || localStorage.getItem('token'));

  /**
   * Establish WebSocket connection
   */
  const connect = useCallback(() => {
    if (!token) {
      console.warn('[WebSocket] No auth token available, skipping connection');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting to communication service...');

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[WebSocket] ✅ Connected to communication service');
      setConnected(true);
      reconnectAttemptsRef.current = 0;
      
      logCommunicationEvent('websocket_connected', {
        socketId: socket.id,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      setConnected(false);
      
      logCommunicationEvent('websocket_disconnected', {
        reason,
      });

      // Auto-reconnect on unexpected disconnect
      if (reason === 'io server disconnect') {
        // Server explicitly disconnected, attempt to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          if (reconnectAttemptsRef.current < 5) {
            reconnectAttemptsRef.current++;
            console.log(`[WebSocket] Reconnection attempt ${reconnectAttemptsRef.current}/5`);
            socket.connect();
          }
        }, 2000);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      setConnected(false);
      
      logCommunicationEvent('websocket_error', {
        error: error.message,
      });
    });

    // Video call event handlers
    socket.on('ice-servers', (data: IICEServersEvent) => {
      console.log('[WebSocket] Received ICE servers');
      handlers?.onICEServers?.(data);
    });

    socket.on('call:incoming', (data: ICallIncomingEvent) => {
      console.log('[WebSocket] 📞 Incoming call from:', data.callerId);
      handlers?.onCallIncoming?.(data);
      
      logCommunicationEvent('call_incoming', {
        sessionId: data.sessionId,
        callerId: data.callerId,
        callerType: data.callerType,
      });
    });

    socket.on('call:answered', (data: ICallAnsweredEvent) => {
      console.log('[WebSocket] ✅ Call answered:', data.sessionId);
      handlers?.onCallAnswered?.(data);
      
      logCommunicationEvent('call_answered', {
        sessionId: data.sessionId,
      });
    });

    socket.on('call:rejected', (data: ICallRejectedEvent) => {
      console.log('[WebSocket] ❌ Call rejected:', data.sessionId);
      handlers?.onCallRejected?.(data);
      
      logCommunicationEvent('call_rejected', {
        sessionId: data.sessionId,
      });
    });

    socket.on('call:ended', (data: ICallEndedEvent) => {
      console.log('[WebSocket] 📴 Call ended:', data.sessionId);
      handlers?.onCallEnded?.(data);
      
      logCommunicationEvent('call_ended', {
        sessionId: data.sessionId,
      });
    });

    socket.on('call:ice-candidate', (data: IICECandidateEvent) => {
      console.log('[WebSocket] Received ICE candidate');
      handlers?.onICECandidate?.(data);
    });

    socket.on('call:error', (data: ICallErrorEvent) => {
      console.error('[WebSocket] ❌ Call error:', data.message);
      handlers?.onCallError?.(data);
      
      logCommunicationEvent('call_error', {
        message: data.message,
        sessionId: data.sessionId,
      });
    });

    socketRef.current = socket;
  }, [token, handlers]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (socketRef.current) {
      console.log('[WebSocket] Disconnecting...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, []);

  /**
   * Emit event to server
   */
  const emit = useCallback((event: string, data: any) => {
    if (!socketRef.current?.connected) {
      console.warn('[WebSocket] Cannot emit - not connected');
      return;
    }

    console.log(`[WebSocket] Emitting: ${event}`, data);
    socketRef.current.emit(event, data);
  }, []);

  // Auto-connect on mount, disconnect on unmount
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [token]); // Only reconnect if token changes

  return {
    socket: socketRef.current,
    connected,
    emit,
    connect,
    disconnect,
  };
};

export default useWebSocket;
