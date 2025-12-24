import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Minimize2, Loader2, User } from 'lucide-react'; 
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'guest' | 'staff';
  sessionId: string | null; // Null for guest initially
  targetName?: string; 
  targetUserId?: string; // Explicit ID of the other user
  initiate?: boolean;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  mode,
  sessionId: initialSessionId,
  targetName,
  targetUserId,
  initiate
}) => {
  const { socket } = useSocket();
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [targetId, setTargetId] = useState<string | null>(targetUserId || null);
  
  // Refs for stable access in listeners
  const sessionIdRef = useRef(initialSessionId);
  const targetIdRef = useRef(targetUserId || null);
  const modeRef = useRef(mode);

  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { targetIdRef.current = targetId; }, [targetId]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  
  // Call State
  const [status, setStatus] = useState<'initializing' | 'calling' | 'connected' | 'reconnecting' | 'rejected' | 'ended'>('initializing');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);


  // Queue for ICE candidates generated before we have a targetId
  const iceCandidatesQueue = useRef<RTCIceCandidate[]>([]);



  // Initialize Media and Call
  useEffect(() => {
    if (!isOpen || !socket) return;
    
    let isMounted = true;

    const initializeMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (isMounted) setLocalStream(stream);
            
            // Setup WebRTC
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Use Google STUN
            });
            peerConnection.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const currentTargetId = targetIdRef.current || targetId;
                    if (sessionId && currentTargetId) {
                        socket.emit('call:signal', {
                            targetId: currentTargetId,
                            type: 'ice-candidate',
                            signal: event.candidate
                        });
                    } else {
                        console.log("[VideoCallModal] No targetId yet, queuing ICE candidate");
                        iceCandidatesQueue.current.push(event.candidate);
                    }
                }
            };

            pc.onconnectionstatechange = () => {
                console.log("[VideoCallModal] Connection State:", pc.connectionState);
            };

            pc.oniceconnectionstatechange = () => {
                console.log("[VideoCallModal] ICE Connection State:", pc.iceConnectionState);
            };

            pc.onsignalingstatechange = () => {
                console.log("[VideoCallModal] Signaling State:", pc.signalingState);
            };

            pc.ontrack = (event) => {
                console.log("[VideoCallModal] Received Remote Track:", event.streams[0].id, event.track.kind);
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                    setStatus('connected');
                }
            };
            
            // Initiate Flow (Guest)
            if (mode === 'guest' && initiate) {
                setStatus('calling');
                const guestName = localStorage.getItem('guest_name') || 'Guest';
                socket.emit('call:initiate', { guestName });
            } 
            // Staff Flow (Accepting)
            // Emitting 'call:accept' here ensures we only signal readiness AFTER media permissions are granted and PC is set up.
            if (mode === 'staff' && sessionId && targetId) {
                 console.log("[VideoCallModal] Media ready. Emitting call:accept to", targetId);
                 socket.emit('call:accept', { 
                     sessionId: sessionId, 
                     guestId: targetId 
                 });
            }

        } catch (err) {
            console.error("Media Access Error", err);
            toast.error("Could not access camera/microphone");
            onClose();
        }
    };

    initializeMedia();

    return () => {
        isMounted = false;
        localStream?.getTracks().forEach(track => track.stop());
        peerConnection.current?.close();
    };
  }, [isOpen, socket]); // Run once on open


  // Socket Events
  useEffect(() => {
      if (!socket) return;

      // Guest: Call Accepted
      const handleCallAccepted = async (data: { sessionId: string, staffId: string, staffName: string }) => {
          console.log("[VideoCallModal] Received call:accepted:", data);
          
          if (modeRef.current === 'guest') {
              console.log("[VideoCallModal] Mode is guest, setting session and target");
              setSessionId(data.sessionId);
              setTargetId(data.staffId);
              
              // Verify PC exists
              const pc = peerConnection.current;
              if (pc) {
                  try {
                    console.log("[VideoCallModal] Creating offer...");
                    const offer = await pc.createOffer();
                    console.log("[VideoCallModal] Offer created, setting local description");
                    await pc.setLocalDescription(offer);
                    
                    console.log("[VideoCallModal] Emitting call:signal (offer) to", data.staffId);
                    socket.emit('call:signal', {
                        targetId: data.staffId,
                        type: 'offer',
                        signal: offer
                    });

                    // Flush queued ICE candidates AFTER sending offer
                    if (iceCandidatesQueue.current.length > 0) {
                        console.log(`[VideoCallModal] Flushing ${iceCandidatesQueue.current.length} queued ICE candidates`);
                        iceCandidatesQueue.current.forEach(candidate => {
                            socket.emit('call:signal', {
                                targetId: data.staffId,
                                type: 'ice-candidate',
                                signal: candidate
                            });
                        });
                        iceCandidatesQueue.current = [];
                    }

                  } catch (err) {
                    console.error("[VideoCallModal] Error creating offer:", err);
                  }
              } else {
                  console.error("[VideoCallModal] PeerConnection is null! Retrying in 500ms");
                  // Optional retry logic if needed, but PC should be ready
                  setTimeout(async () => {
                       const retryPc = peerConnection.current;
                       if (retryPc) {
                           const offer = await retryPc.createOffer();
                           await retryPc.setLocalDescription(offer);
                           socket.emit('call:signal', { targetId: data.staffId, type: 'offer', signal: offer });
                           
                           // Flush queue in retry too
                           if (iceCandidatesQueue.current.length > 0) {
                               iceCandidatesQueue.current.forEach(candidate => {
                                   socket.emit('call:signal', { targetId: data.staffId, type: 'ice-candidate', signal: candidate });
                               });
                               iceCandidatesQueue.current = [];
                           }
                       }
                  }, 500);
              }
          }
      };

      const handleCallSignal = async (data: { senderId: string, type: 'offer' | 'answer' | 'ice-candidate', signal: any }) => {
          const pc = peerConnection.current;
          if (!pc) return;

          console.log(`[VideoCallModal] Received signal ${data.type} from ${data.senderId}`);

          // For Staff, we lock onto the sender if not already set (or if we trust the signal)
          // For Guest, we expect signal from Staff
          
          // Using ref to check if we need to lock target
          if (!targetIdRef.current && data.senderId) {
               setTargetId(data.senderId);
          }

          if (data.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              
              // Send answer back to SENDER (whoever sent the offer)
              socket.emit('call:signal', {
                  targetId: data.senderId,
                  type: 'answer',
                  signal: answer
              });
          } else if (data.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.signal));
          } else if (data.type === 'ice-candidate') {
              await pc.addIceCandidate(new RTCIceCandidate(data.signal));
          }
      };

      const handleCallRejected = () => {
          setStatus('rejected');
          toast.error("Staff is currently busy.");
          setTimeout(onClose, 3000);
      };

      const handleCallEnded = () => {
          setStatus('ended');
          toast.info("Call ended.");
          setTimeout(onClose, 2000);
      };

      const handleCallError = (err: any) => {
         toast.error(err.message || "Call failed");
         onClose();
      };

      socket.on('call:accepted', handleCallAccepted);
      socket.on('call:signal', handleCallSignal);
      socket.on('call:rejected', handleCallRejected);
      socket.on('call:ended', handleCallEnded);
      socket.on('call:error', handleCallError);

      return () => {
          socket.off('call:accepted', handleCallAccepted);
          socket.off('call:signal', handleCallSignal);
          socket.off('call:rejected', handleCallRejected);
          socket.off('call:ended', handleCallEnded);
          socket.off('call:error', handleCallError);
      };
      // Minimized dependencies to prevent re-binding
  }, [socket]);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream, isMinimized]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream, isMinimized]);


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div 
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className={`transition-all duration-500 overflow-hidden relative
                ${isMinimized ? 'w-48 h-64 fixed bottom-6 right-6 rounded-2xl border border-white/20 shadow-2xl z-50 bg-gray-900' : 'w-full max-w-5xl h-[85vh] bg-gray-900 rounded-3xl border border-white/10 shadow-2xl'}
            `}
        >
            {/* Header */}
            {!isMinimized && (
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-white text-xl font-bold tracking-tight">{targetName || (mode === 'guest' ? 'Elite Staff' : 'Guest')}</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`} />
                                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{status === 'calling' ? 'Calling...' : status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsMinimized(true)} className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all">
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Remote Video (Main) */}
            <div className="relative w-full h-full bg-black flex items-center justify-center">
                {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain bg-black" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-white/50 gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-white/30" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" style={{ animationDuration: '1.5s' }}/>
                        </div>
                        <p className="text-lg font-light tracking-wide text-white/40">
                           {status === 'calling' ? 'Waiting for response...' : 'Connecting...'}
                        </p>
                    </div>
                )}

                {/* Local Video (PIP) */}
                <motion.div 
                    layout
                    drag
                    dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }} 
                    className={`absolute overflow-hidden shadow-2xl border border-white/20 bg-gray-800 z-30 cursor-move group
                        ${isMinimized ? 'inset-0 border-0 pointer-events-none' : 'bottom-8 right-8 w-64 h-40 rounded-2xl'}
                    `}
                >
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    {!localStream && <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">No Camera</div>}
                </motion.div>
            </div>

            {/* Controls */}
            {!isMinimized && (
                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6 z-20">
                    <button 
                        onClick={() => {
                             if (localStream) {
                                 localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
                                 setIsMuted(!isMuted);
                             }
                        }}
                        className={`p-4 rounded-full backdrop-blur-2xl border transition-all duration-300 ${isMuted ? 'bg-red-500/90 border-red-500 text-white' : 'bg-black/40 border-white/10 text-white hover:bg-black/60 hover:scale-110'}`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    <button 
                        onClick={() => {
                            socket?.emit('call:end', { targetId });
                            onClose();
                        }}
                        className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/30 transition-all hover:scale-110 active:scale-95"
                    >
                        <PhoneOff className="w-8 h-8 fill-current" />
                    </button>

                    <button 
                        onClick={() => {
                             if (localStream) {
                                 localStream.getVideoTracks().forEach(t => t.enabled = !isVideoOff);
                                 setIsVideoOff(!isVideoOff);
                             }
                        }}
                        className={`p-4 rounded-full backdrop-blur-2xl border transition-all duration-300 ${isVideoOff ? 'bg-red-500/90 border-red-500 text-white' : 'bg-black/40 border-white/10 text-white hover:bg-black/60 hover:scale-110'}`}
                    >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </button>
                </div>
            )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
