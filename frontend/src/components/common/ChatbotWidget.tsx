
/**
 * Chatbot Widget Component
 * Floating AI chatbot interface accessible from all pages
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, X, Minus, Send, User, Bot, UserCircle, Loader2, Mic, Image as ImageIcon, Video } from 'lucide-react';
import { useChatbot } from '../../contexts/ChatbotContext';
import { useSocket } from '../../contexts/SocketContext';
import { useLocation } from 'react-router-dom';
import {
  createConversation,
  sendMessage,
  getConversations,
  updateContext,
  logCommunicationEvent,
  generateGuestToken,
  handoffToAgent,
} from '../../services/communicationApi';
// import { fetchUsers } from '../../services/adminApi';
import type { IMessage } from '../../types/communication.types';
import { SmartWidgetRenderer } from './SmartWidgetRenderer';
import { GuestInfoForm } from './ChatbotWidget/GuestInfoForm';
import { VideoCallModal } from './VideoCallModal';
import { toast } from 'sonner';

// ... (imports)

// Helper: Convert File to Base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const ChatbotWidget: React.FC = () => {
  const {
    isOpen,
    isMinimized,
    unreadCount,
    currentConversation,
    openWidget,
    closeWidget,
    minimizeWidget,
    maximizeWidget,
    setCurrentConversation,

  } = useChatbot();
  const { connect: connectSocket } = useSocket();



  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false); // Voice state
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // App Context Awareness
  const location = useLocation();

  /**
   * Load or create conversation on mount
   */
  useEffect(() => {
    if (isOpen && !currentConversation) {
      if (!localStorage.getItem('token') && !localStorage.getItem('guest_token')) {
        setShowGuestForm(true);
      } else {
        setShowGuestForm(false);
        loadOrCreateConversation();
      }
    }
  }, [isOpen]);

  const handleGuestSubmit = async (name: string, roomNumber?: string) => {
    try {
      // 1. Generate guest token
      const { token, guestId } = await generateGuestToken(name, roomNumber);
      
      // 2. Save to local storage
      localStorage.setItem('guest_token', token);
      localStorage.setItem('guest_id', guestId);
      
      // 3. Hide form and load conversation
      setShowGuestForm(false);
      
      // 4. Connect socket with new token
      connectSocket();
      
      // 5. Update request context if needed (optional context update)
      // We will rely on createConversation passing context if it's a new conversation
      // But loadOrCreateConversation calls createConversation without args currently...
      // Let's just proceed to load/create
      await loadOrCreateConversation();
      
      toast.success(`Welcome, ${name}!`);
    } catch (error) {
      console.error('Guest login failed:', error);
      toast.error('Failed to start session.');
    }
  };

  /**
   * Update messages when conversation changes
   */
  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages);
    }
  }, [currentConversation]);

  /**
   * Update Context on Route Change
   */
  useEffect(() => {
    if (currentConversation && isOpen) {
        updateContext(currentConversation.conversationId, {
            context: { currentUrl: location.pathname }
        }).catch(err => console.error("Failed to update context", err));
    }
  }, [location.pathname, currentConversation, isOpen]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Focus input when widget opens
   */
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  /**
   * Handle Token Refresh / Login Switch
   */
  useEffect(() => {
    const handleTokenRefresh = () => {
         // Reset state to force re-initialization
         setCurrentConversation(null);
         setMessages([]);
         setShowGuestForm(false);
         // If open, this will trigger the main loadOrCreateConversation effect
         if (isOpen) {
             loadOrCreateConversation();
         }
    };

    window.addEventListener('token-refreshed', handleTokenRefresh);
    return () => window.removeEventListener('token-refreshed', handleTokenRefresh);
  }, [isOpen]); // Depend on isOpen so we know whether to reload immediately

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOrCreateConversation = async () => {
    try {
      setIsLoading(true);

      // Try to load existing conversations
      const { conversations } = await getConversations(1);
      
      if (conversations.length > 0 && conversations[0].status === 'active') {
        setCurrentConversation(conversations[0]);
      } else {
        const { conversation } = await createConversation();
        setCurrentConversation(conversation);
      }
    } catch (error) {
      console.error('Failed to load/create conversation:', error);
      toast.error('Failed to connect to chat service. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text?: string, imageBase64?: string) => {
    const content = text || inputValue.trim();
    if ((!content && !imageBase64) || !currentConversation || isSending) return;

    setInputValue('');
    setIsSending(true);

    try {
      // Optimistically add user message
      const tempUserMessage: IMessage = {
        sender: 'user',
        content: content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Send to backend
      const { conversation } = await sendMessage({
        conversationId: currentConversation.conversationId,
        message: content,
        image: imageBase64
      });

      setCurrentConversation(conversation);
      setMessages(conversation.messages);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please check your connection.');
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
      setInputValue(content); // Restore input
    } finally {
      setIsSending(false);
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            toast.error('Invalid file type. Please upload an image.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Image is too large. Max size is 5MB.');
            return;
        }

        try {
            const base64 = await convertFileToBase64(file);
            const caption = inputValue.trim() || "Analyze this image";
            await handleSendMessage(caption, base64);
            toast.success('Image uploaded successfully');
        } catch (err) {
            console.error("Image upload failed", err);
            toast.error('Failed to upload image.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }
  };

  // Voice Input Handler
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
        toast.warning('Voice input is not supported in this browser.');
        return;
    }

    if (isListening) return;

    setIsListening(true);
    toast.info('Listening...', { duration: 2000 });

    try {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setInputValue(text);
            setIsListening(false);
            toast.dismiss(); // Dismiss listening toast
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            toast.error('Voice recognition failed. Please try again.');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    } catch (e) {
        console.error("Failed to start speech recognition", e);
        setIsListening(false);
        toast.error('Could not start microphone.');
    }
  };

  const handleHandoff = async () => {
    if (!currentConversation) return;

    try {
      await handoffToAgent({ conversationId: currentConversation.conversationId });
      
      // Add system message
      const systemMessage: IMessage = {
        sender: 'bot',
        content: 'Your conversation has been handed off to a human agent. They will respond shortly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);

      logCommunicationEvent('handoff_requested', {
        conversationId: currentConversation.conversationId,
      });
      toast.success('Handoff requested. An agent will join shortly.');
    } catch (error) {
      console.error('Failed to handoff to agent:', error);
      toast.error('Failed to request handoff. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSenderIcon = (sender: IMessage['sender']) => {
    switch (sender) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'bot':
        return <Bot className="w-4 h-4" />;
      case 'agent':
        return <UserCircle className="w-4 h-4" />;
    }
  };

  const { t } = useTranslation();

  const getSenderName = (sender: IMessage['sender']) => {
    switch (sender) {
      case 'user':
        return t('chatbot.sender.user', 'You');
      case 'bot':
        return t('chatbot.sender.bot', 'AI Assistant');
      case 'agent':
        return t('chatbot.sender.agent', 'Support Agent');
    }
  };

  // Parsing Helper for Smart Widgets
  const renderMessageContent = (content: string) => {
    const parts = content.split(/\[WIDGET_DATA\]|\[\/WIDGET_DATA\]/);
    if (parts.length === 1) return <p className="text-sm whitespace-pre-wrap">{content}</p>;

    return (
        <div className="flex flex-col gap-2">
            {parts.map((part, idx) => {
                if (part.startsWith('{"type":"widget"')) {
                    try {
                        const widgetData = JSON.parse(part);
                        return <SmartWidgetRenderer key={idx} type={widgetData.widgetType} data={widgetData.data} />;
                    } catch (e) {
                        return null; 
                    }
                }
                return part.trim() ? <p key={idx} className="text-sm whitespace-pre-wrap">{part.trim()}</p> : null;
            })}
        </div>
    );
  };

  // Minimized floating button
  if (!isOpen) {
    return (
      <button
        onClick={openWidget}
        className="fixed bottom-6 right-6 bg-black/80 backdrop-blur-md hover:bg-black text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-105 z-50 border border-white/10"
        aria-label={t('chatbot.open')}
      >
        <MessageSquare className="w-6 h-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
            <span aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>
    );
  }

  // Minimized widget state
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 w-72"
        role="dialog"
      >
        <div 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/5 rounded-2xl transition-colors" 
          onClick={maximizeWidget}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-5 h-5" />
            </div>
            <div>
                <span className="font-semibold block text-sm">Elite Concierge</span>
                {unreadCount > 0 && <span className="text-xs text-blue-600 font-medium">{unreadCount} new messages</span>}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); closeWidget(); }} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Full widget
  return (
    <>
      <div 
        className="fixed bottom-6 right-6 w-[400px] h-[650px] bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 flex flex-col z-50 overflow-hidden font-sans ring-1 ring-black/5"
        role="dialog"
      >
        {/* Header Glassmorphism */}
        <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white shadow-lg">
                <Bot className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-gray-900">Elite Concierge</span>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-500 font-medium">Online</span>
                </div>
            </div>
          </div>

            <button onClick={minimizeWidget} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50">
              <Minus className="w-5 h-5" />
            </button>
            <button 
                onClick={() => {
                    localStorage.removeItem('guest_token');
                    localStorage.removeItem('guest_id');
                    localStorage.removeItem('token'); // Just in case
                    window.location.reload();
                }} 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/50 hover:text-red-500 transition-colors"
                title="End Session"
            >
                <span className="text-xs font-bold">RESET</span>
            </button>
            {/* Only show Video Call button for Guests, not Staff */}
            {!localStorage.getItem('token') && (
            <button 
                onClick={() => setIsVideoCallOpen(true)} 
                className="p-2 text-gray-400 hover:text-black hover:bg-black/5 rounded-full transition-colors mr-1"
                title="Video Support"
            >
                <Video className="w-5 h-5" />
            </button>
            )}
        </div>

        {/* Content Area */}
        {showGuestForm ? (
            <GuestInfoForm onSubmit={handleGuestSubmit} onCancel={closeWidget} />
        ) : (
            <>
        {/* Messages with specialized rendering */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                 <Bot className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                  <p className="font-bold text-gray-900 text-lg">Welcome, Guest</p>
                  <p className="text-sm text-gray-500 max-w-[200px] mx-auto mt-1">How can I make your stay perfect today?</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {['Room Service', 'Pool Hours', 'My Bill'].map(suggestion => (
                      <button key={suggestion} onClick={() => handleSendMessage(suggestion)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors text-gray-700 font-medium">
                          {suggestion}
                      </button>
                  ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} group`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-black text-white'
                      : 'bg-white text-blue-600 border border-gray-100'
                  }`}
                >
                  {getSenderIcon(msg.sender)}
                </div>
                <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {getSenderName(msg.sender)} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`rounded-2xl p-3.5 shadow-sm text-sm ${
                      msg.sender === 'user'
                        ? 'bg-black text-white rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                 <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 rounded-tl-none shadow-sm flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Bar */}
        {currentConversation?.status === 'active' && messages.length > 5 && (
            <div className="px-4 py-2 text-center">
                 <button onClick={handleHandoff} className="text-xs font-medium text-gray-400 hover:text-black transition-colors flex items-center justify-center gap-1 mx-auto">
                    <span>Need human help?</span>
                    <span className="underline decoration-dotted">Talk to agent</span>
                 </button>
            </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white/80 backdrop-blur-md border-t border-white/20">
          <div className="flex items-end gap-2 bg-gray-50/80 rounded-2xl p-2 border border-gray-200 focus-within:bg-white focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <button 
                className="p-2 text-gray-400 hover:text-black hover:bg-gray-200/50 rounded-xl transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
            >
                <ImageIcon className="w-5 h-5" />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
            />
            
            <textarea
              ref={inputRef as any}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 max-h-24 text-sm scrollbar-none"
              rows={1}
              disabled={isSending}
            />
            
            {inputValue.trim() ? (
                <button
                onClick={() => handleSendMessage()}
                disabled={isSending}
                className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                <Send className="w-4 h-4" />
                </button>
            ) : (
                <button
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-black hover:bg-gray-200/50'}`}
                title="Voice Search"
                >
                <Mic className="w-5 h-5" />
                </button>
            )}
          </div>
        </div>
        </>
        )}
      </div>
      
      {isVideoCallOpen && (
        <VideoCallModal 
            isOpen={isVideoCallOpen}
            onClose={() => setIsVideoCallOpen(false)}
            mode="guest"
            sessionId={null} 
            initiate={true}
        />
      )}
    </>
  );
};

export default ChatbotWidget;
