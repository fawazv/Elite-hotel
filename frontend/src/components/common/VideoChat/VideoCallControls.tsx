/**
 * Video Call Controls Component
 * Controls for mute, video toggle, and ending call
 */

import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  className?: string;
}

export const VideoCallControls: React.FC<VideoCallControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* Mute/Unmute */}
      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full transition-all ${
          isAudioEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>

      {/* Video On/Off */}
      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full transition-all ${
          isVideoEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
      </button>

      {/* End Call */}
      <button
        onClick={onEndCall}
        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
        aria-label="End call"
        title="End call"
      >
        <PhoneOff className="w-6 h-6" />
      </button>
    </div>
  );
};

export default VideoCallControls;
