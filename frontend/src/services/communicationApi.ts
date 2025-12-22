/**
 * Communication API Service
 * Handles all HTTP requests to the communication service
 */

import axios from 'axios';
import type {
  ICreateConversationRequest,
  ICreateConversationResponse,
  ISendMessageRequest,
  ISendMessageResponse,
  IGetConversationsResponse,
  IGetConversationByIdResponse,
  IUpdateContextRequest,
  IUpdateContextResponse,
  IHandoffToAgentRequest,
  IHandoffToAgentResponse,
  ICloseConversationResponse,
  IInitiateCallRequest,
  IInitiateCallResponse,
  IUpdateCallStatusRequest,
  IUpdateCallStatusResponse,
  IGetCallHistoryResponse,
  IGetActiveCallResponse,
  IGetAllActiveCallsResponse,
  IVideoChatSession,
} from '../types/communication.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const CHATBOT_API = `${API_BASE_URL}/api/communication/api/chat`;
const VIDEOCHAT_API = `${API_BASE_URL}/api/communication/api/videochat`;

// Create axios instance with auth token interceptor
const createApiClient = () => {
  const client = axios.create({
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  // Add auth token to requests
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle response errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const apiClient = createApiClient();

// ============================================
// Chatbot API
// ============================================

/**
 * Create a new chatbot conversation
 */
export const createConversation = async (
  data?: ICreateConversationRequest
): Promise<ICreateConversationResponse> => {
  const response = await apiClient.post<ICreateConversationResponse>(
    `${CHATBOT_API}/conversation`,
    data || {}
  );
  return response.data;
};

/**
 * Get all conversations for the current user
 */
export const getConversations = async (page: number = 1, limit: number = 20): Promise<IGetConversationsResponse> => {
  const response = await apiClient.get<IGetConversationsResponse>(
    `${CHATBOT_API}/conversations`,
    { params: { page, limit } }
  );
  return response.data;
};

/**
 * Get a specific conversation by ID
 */
export const getConversationById = async (
  conversationId: string
): Promise<IGetConversationByIdResponse> => {
  const response = await apiClient.get<IGetConversationByIdResponse>(
    `${CHATBOT_API}/conversation/${conversationId}`
  );
  return response.data;
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (
  data: ISendMessageRequest
): Promise<ISendMessageResponse> => {
  const response = await apiClient.post<ISendMessageResponse>(
    `${CHATBOT_API}/message`,
    data
  );
  return response.data;
};

/**
 * Update conversation context
 */
export const updateContext = async (
  conversationId: string,
  data: IUpdateContextRequest
): Promise<IUpdateContextResponse> => {
  const response = await apiClient.put<IUpdateContextResponse>(
    `${CHATBOT_API}/context/${conversationId}`,
    data
  );
  return response.data;
};

/**
 * Hand off conversation to a human agent
 */
export const handoffToAgent = async (
  data: IHandoffToAgentRequest
): Promise<IHandoffToAgentResponse> => {
  const response = await apiClient.post<IHandoffToAgentResponse>(
    `${CHATBOT_API}/handoff`,
    data
  );
  return response.data;
};

/**
 * Close a conversation
 */
export const closeConversation = async (
  conversationId: string
): Promise<ICloseConversationResponse> => {
  const response = await apiClient.delete<ICloseConversationResponse>(
    `${CHATBOT_API}/conversation/${conversationId}`
  );
  return response.data;
};

// ============================================
// Video Chat API
// ============================================

/**
 * Initiate a video call
 */
export const initiateVideoCall = async (
  data: IInitiateCallRequest
): Promise<IInitiateCallResponse> => {
  const response = await apiClient.post<IInitiateCallResponse>(
    `${VIDEOCHAT_API}/initiate`,
    data
  );
  return response.data;
};

/**
 * Update call status
 */
export const updateCallStatus = async (
  sessionId: string,
  data: IUpdateCallStatusRequest
): Promise<IUpdateCallStatusResponse> => {
  const response = await apiClient.put<IUpdateCallStatusResponse>(
    `${VIDEOCHAT_API}/${sessionId}/status`,
    data
  );
  return response.data;
};

/**
 * Get call history for current user
 */
export const getCallHistory = async (page: number = 1, limit: number = 20): Promise<IGetCallHistoryResponse> => {
  const response = await apiClient.get<IGetCallHistoryResponse>(
    `${VIDEOCHAT_API}/history`,
    { params: { page, limit } }
  );
  return response.data;
};

/**
 * Get current active call for user
 */
export const getActiveCall = async (): Promise<IGetActiveCallResponse> => {
  const response = await apiClient.get<IGetActiveCallResponse>(
    `${VIDEOCHAT_API}/active`
  );
  return response.data;
};

/**
 * Get a specific call by session ID
 */
export const getCallById = async (sessionId: string): Promise<IVideoChatSession> => {
  const response = await apiClient.get<{ session: IVideoChatSession }>(
    `${VIDEOCHAT_API}/${sessionId}`
  );
  return response.data.session;
};

/**
 * Admin only: Get all active calls
 */
export const getAllActiveCalls = async (): Promise<IGetAllActiveCallsResponse> => {
  const response = await apiClient.get<IGetAllActiveCallsResponse>(
    `${VIDEOCHAT_API}/admin/active-calls`
  );
  return response.data;
};

// ============================================
// Analytics/Logging
// ============================================

/**
 * Log a communication event for analytics
 */
export const logCommunicationEvent = async (
  eventType: string,
  metadata: Record<string, any>
): Promise<void> => {
  try {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[Communication Analytics]', {
        eventType,
        ...metadata,
        timestamp: new Date().toISOString(),
      });
    }

    // In production, you could send to an analytics service
    // await apiClient.post('/api/analytics/communication', { eventType, metadata });
  } catch (error) {
    console.error('Failed to log communication event:', error);
  }
};

// Export all as named exports
export default {
  // Chatbot
  createConversation,
  getConversations,
  getConversationById,
  sendMessage,
  updateContext,
  handoffToAgent,
  closeConversation,
  
  // Video Chat
  initiateVideoCall,
  updateCallStatus,
  getCallHistory,
  getActiveCall,
  getCallById,
  getAllActiveCalls,
  
  // Analytics
  logCommunicationEvent,
};
