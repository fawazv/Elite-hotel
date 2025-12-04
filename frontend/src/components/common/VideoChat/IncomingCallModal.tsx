/**
 * Incoming Call Modal Component
 * Displays incoming video call notifications
 */

import React, { useEffect, useState } from 'react';
import { Video, Phone, PhoneOff } from 'lucide-react';
import type { ICallIncomingEvent } from '../../../types/communication.types';

interface IncomingCallModalProps {
  callData: ICallIncomingEvent;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callData,
  onAccept,
  onReject,
}) => {
  const [timeLeft, setTimeLeft] = useState(30);

  // Auto-reject after 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReject]);

  // Play ringtone (browser notification sound)
  useEffect(() => {
    const audio = new Audio('/ringtone.mp3'); // Add ringtone file to public folder
    audio.loop = true;
    audio.play().catch((error) => {
      console.log('Cannot play ringtone:', error);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-pulse">
        {/* Caller Info */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Incoming Video Call
          </h2>
          <p className="text-gray-600">
            {callData.callerName || `${callData.callerType === 'guest' ? 'Guest' : 'Staff Member'}`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {callData.callerType === 'guest' ? '🏨 Guest' : '👔 Staff'}
          </p>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm text-gray-600">
              Auto-reject in <span className="font-bold text-red-600">{timeLeft}s</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onReject}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors animate-bounce"
          >
            <Phone className="w-5 h-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
