import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { IICEServer } from '../types/communication.types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  iceServers: IICEServer[];
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Get the communication service URL from env or default
const SOCKET_URL = import.meta.env.VITE_COMMUNICATION_SERVICE_URL || 'http://localhost:4009';

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [iceServers, setIceServers] = useState<IICEServer[]>([]);

  const connect = () => {
    // Get token from storage
    const authList = [localStorage.getItem('token'), localStorage.getItem('guest_token')];
    const validToken = authList.find(t => t);

    // If socket exists
    if (socket) {
        console.log('Socket connect called. Current socket connected:', socket.connected, 'ID:', socket.id);
        
        // Check if token changed (simple comparison if possible, or assume valid if connected)
        // Accessing socket.auth might act weird if it was mutated. 
        // But we can check if we are connected.
        if (socket.connected) {
             const currentToken = (socket.auth as any)?.token;
             if (currentToken === validToken) {
                 console.log('Socket already connected with same token. Skipping reconnect.');
                 return;
             }
             console.log('Token changed. Disconnecting old socket...');
             socket.disconnect();
        }
    }

    if (!validToken) {
        console.warn('Socket connect called but no token found.');
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
  };

  const disconnect = () => {
    if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, iceServers, connect, disconnect }}>
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
