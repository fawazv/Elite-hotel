/**
 * Chatbot Widget Component
 * Floating AI chatbot interface accessible from all pages
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, X, Minus, Send, User, Bot, UserCircle, Loader2, Video } from 'lucide-react';
import { useChatbot } from '../../contexts/ChatbotContext';
import {
  createConversation,
  sendMessage,
  getConversations,
  handoffToAgent,
  logCommunicationEvent,
} from '../../services/communicationApi';
import { fetchUsers } from '../../services/adminApi';
import type { IMessage, IConversation } from '../../types/communication.types';
import VideoChat from './VideoChat/VideoChat';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

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
    resetUnreadCount,
  } = useChatbot();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Video Chat State
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoReceiverId, setVideoReceiverId] = useState<string | null>(null);
  const [findingStaff, setFindingStaff] = useState(false);

  /**
   * Load or create conversation on mount
   */
  useEffect(() => {
    if (isOpen && !currentConversation) {
      loadOrCreateConversation();
    }
  }, [isOpen]);

  /**
   * Update messages when conversation changes
   */
  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages);
    }
  }, [currentConversation]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOrCreateConversation = async () => {
    try {
      setIsLoading(true);

      // Try to load existing conversations
      const { conversations } = await getConversations(1);
      
      if (conversations.length > 0 && conversations[0].status === 'active') {
        // Use existing active conversation
        setCurrentConversation(conversations[0]);
        logCommunicationEvent('conversation_loaded', {
          conversationId: conversations[0].conversationId,
        });
      } else {
        // Create new conversation
        const { conversation } = await createConversation();
        setCurrentConversation(conversation);
        logCommunicationEvent('conversation_created', {
          conversationId: conversation.conversationId,
        });
      }
    } catch (error) {
      console.error('Failed to load/create conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation || isSending) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      // Optimistically add user message
      const tempUserMessage: IMessage = {
        sender: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Send to backend
      const { conversation } = await sendMessage({
        conversationId: currentConversation.conversationId,
        message: userMessage,
      });

      // Update with full conversation including bot response
      setCurrentConversation(conversation);
      setMessages(conversation.messages);

      logCommunicationEvent('message_sent', {
        conversationId: conversation.conversationId,
        messageLength: userMessage.length,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    } catch (error) {
      console.error('Failed to handoff to agent:', error);
    }
  };

  const handleStartVideoCall = async () => {
    try {
      setFindingStaff(true);
      // Find an admin or receptionist
      // Note context: "Guests calls Staff"
      // We'll search for 'admin' first, then 'receptionist'
      let staffResponse = await fetchUsers({ role: 'admin', limit: 5 });
      let staffList = staffResponse.data;

      if (staffList.length === 0) {
        staffResponse = await fetchUsers({ role: 'receptionist', limit: 5 });
        staffList = staffResponse.data;
      }

      // Filter for approved/verified if needed, or just pick the first one
      const targetStaff = staffList[0];

      if (targetStaff) {
        setVideoReceiverId(targetStaff._id);
        setShowVideoCall(true);
      } else {
        alert('No staff currently available for video call. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to find staff for video call:', error);
      alert('Could not initiate video call.');
    } finally {
      setFindingStaff(false);
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

  // Minimized floating button
  if (!isOpen) {
    return (
      <button
        onClick={openWidget}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 z-50"
        aria-label={t('chatbot.open')}
        aria-expanded={false}
      >
        <MessageSquare className="w-6 h-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            <span aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
            <span className="sr-only">{t('chatbot.unreadMessages', { count: unreadCount })}</span>
          </span>
        )}
      </button>
    );
  }

  // Minimized widget state
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        role="dialog"
        aria-label={t('chatbot.title', 'AI Assistant')}
      >
        <div 
          className="flex items-center justify-between p-4 border-b cursor-pointer" 
          onClick={maximizeWidget}
          role="button"
          aria-label={t('chatbot.maximize')}
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && maximizeWidget()}
        >
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span className="font-semibold">{t('chatbot.title', 'AI Assistant')}</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                <span aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>
                <span className="sr-only">{t('chatbot.unreadMessages', { count: unreadCount })}</span>
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWidget();
            }}
            className="text-gray-400 hover:text-gray-600"
            aria-label={t('chatbot.close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  // Full widget
  return (
    <>
      <div 
        className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50"
        role="dialog"
        aria-label={t('chatbot.title', 'AI Assistant')}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" aria-hidden="true" />
            <span className="font-semibold">{t('chatbot.title', 'AI Assistant')}</span>
            {currentConversation?.status === 'handoff' && (
              <span className="text-xs bg-yellow-500 px-2 py-1 rounded">
                {t('chatbot.agentMode', 'Agent Mode')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartVideoCall}
              className="text-white hover:bg-blue-800 rounded p-1 transition-colors"
              title="Start Video Call"
              disabled={findingStaff}
            >
               {findingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" aria-hidden="true" />}
            </button>
            <button
              onClick={minimizeWidget}
              className="text-white hover:bg-blue-800 rounded p-1 transition-colors"
              aria-label={t('chatbot.minimize')}
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              onClick={closeWidget}
              className="text-white hover:bg-blue-800 rounded p-1 transition-colors"
              aria-label={t('chatbot.close')}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" aria-label={t('common.loading', 'Loading...')} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <Bot className="w-16 h-16 mb-4 text-gray-300" aria-hidden="true" />
              <p className="font-semibold mb-2">{t('chatbot.welcome', 'Welcome to Elite Hotel!')}</p>
              <p className="text-sm">{t('chatbot.greeting', 'How can I assist you today?')}</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.sender === 'agent'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  aria-hidden="true"
                >
                  {getSenderIcon(msg.sender)}
                </div>
                <div className={`flex-1 max-w-[75%]`}>
                  <div className="text-xs text-gray-500 mb-1">{getSenderName(msg.sender)}</div>
                  <div
                    className={`rounded-lg p-3 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex gap-2" role="status" aria-label={t('chatbot.typing')}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-700" aria-hidden="true" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" aria-hidden="true" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Buttons */}
        {currentConversation?.status === 'active' && messages.length > 3 && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <button
              onClick={handleHandoff}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              🙋 {t('chatbot.agentHandoff')}
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">{t('chatbot.inputPlaceholder')}</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbot.inputPlaceholder')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              aria-label={t('chatbot.send')}
            >
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Video Chat Modal */}
      <Dialog open={showVideoCall} onOpenChange={setShowVideoCall}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] h-[80vh] p-0 overflow-hidden bg-black border-none text-white">
          <DialogHeader className="sr-only">
             <DialogTitle>Video Call</DialogTitle>
             <DialogDescription>Video call interface</DialogDescription>
          </DialogHeader>
          <div className="w-full h-full">
            {videoReceiverId && <VideoChat receiverId={videoReceiverId} autoStart={true} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatbotWidget;
