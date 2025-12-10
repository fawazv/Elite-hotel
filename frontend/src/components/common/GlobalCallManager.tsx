/**
 * Global Call Manager
 * Handles incoming calls and active video sessions globally
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux'; // Assuming auth is in redux
import IncomingCallModal from './VideoChat/IncomingCallModal';
import VideoChat from './VideoChat/VideoChat';
import { useSocket } from '../../contexts/SocketContext';
import { Dialog, DialogContent } from '../ui/dialog';
import type { ICallIncomingEvent } from '../../types/communication.types';

export const GlobalCallManager: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [incomingCall, setIncomingCall] = useState<ICallIncomingEvent | null>(null);
  const [activeCallSession, setActiveCallSession] = useState<string | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // You might want to get current user info to know if we should listen
  // const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleIncomingCall = (data: ICallIncomingEvent) => {
      console.log('GlobalCallManager received call:', data);
      setIncomingCall(data);
    };

    socket.on('call:incoming', handleIncomingCall);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
    };
  }, [socket, isConnected]);

  const handleAcceptCall = () => {
    if (incomingCall) {
      setActiveCallSession(incomingCall.sessionId);
      setIncomingCall(null);
      setIsCallModalOpen(true);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall && socket) {
      socket.emit('call:reject', { sessionId: incomingCall.sessionId });
      setIncomingCall(null);
    }
  };

  const handleEndCall = () => {
    setActiveCallSession(null);
    setIsCallModalOpen(false);
  };

  return (
    <>
      {/* Incoming Call Notification */}
      {incomingCall && (
        <IncomingCallModal
          callerName={`User ${incomingCall.callerId.substr(0, 5)}`} // Replace with actual name lookup if available
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Active Video Call Modal */}
      <Dialog open={isCallModalOpen} onOpenChange={(open) => !open && handleEndCall()}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] h-[80vh] p-0 overflow-hidden bg-black border-none text-white">
           {activeCallSession && (
             <VideoChat 
               // For the receiver, we typically just join the session. 
               // VideoChat might need refactoring if it requires a receiverId to START a call.
               // If we are accepting, we are JOINING. 
               // We might need to pass sessionId to VideoChat.
               sessionId={activeCallSession}
               autoStart={true}
               onEndCall={handleEndCall}
             />
           )}
        </DialogContent>
      </Dialog>
    </>
  );
};
