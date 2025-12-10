import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { IICEServer } from '../types/communication.types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  iceServers: IICEServer[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Get the communication service URL from env or default
const SOCKET_URL = import.meta.env.VITE_COMMUNICATION_SERVICE_URL || 'http://localhost:4009';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [iceServers, setIceServers] = useState<IICEServer[]>([]);

  useEffect(() => {
    // Get token from storage
    // Also support guest tokens which might be stored separately or same key
    // For now we assume standard auth token or a guest token is in 'token' or 'guestToken'
    const authList = [localStorage.getItem('token'), localStorage.getItem('guestToken')];
    const validToken = authList.find(t => t);

    if (!validToken) {
      // If no token, we don't connect yet. 
      // The ChatWidget will likely trigger a guest token generation if needed.
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: validToken
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('ice-servers', (data: { iceServers: IICEServer[] }) => {
      console.log('🧊 Received ICE servers');
      setIceServers(data.iceServers);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []); // Depend on token changes? Ideally yes, but for now mount/unmount is safer to avoid thrashing.
  // We might want to expose a "connect" function to manually trigger connection after login/guest token gen.

  return (
    <SocketContext.Provider value={{ socket, isConnected, iceServers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
