/**
 * Communications Dashboard (Admin)
 * Manage chatbot conversations and video calls
 */

import React, { useState, useEffect } from 'react';
import { MessageSquare, Video, BarChart3, Clock, Users, Phone } from 'lucide-react';
import {
  getConversations,
  getCallHistory,
  getAllActiveCalls,
  handoffToAgent,
  logCommunicationEvent,
} from '../../services/communicationApi';
import type { IConversation, IVideoChatSession } from '../../types/communication.types';

type TabType = 'conversations' | 'calls' | 'stats';

export const CommunicationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [calls, setCalls] = useState<IVideoChatSession[]>([]);
  const [activeCalls, setActiveCalls] = useState<IVideoChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'conversations') {
        const { conversations: convos } = await getConversations(50);
        setConversations(convos);
      } else if (activeTab === 'calls') {
        const { calls: callHistory } = await getCallHistory();
        setCalls(callHistory);
        
        const { calls: activeCallList } = await getAllActiveCalls();
        setActiveCalls(activeCallList);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeOver = async (conversationId: string) => {
    try {
      await handoffToAgent({ conversationId });
      alert('Conversation taken over successfully');
      loadData();
      
      logCommunicationEvent('conversation_takeover', { conversationId });
    } catch (error) {
      console.error('Failed to take over conversation:', error);
      alert('Failed to take over conversation');
    }
  };

  const getCallStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      missed: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getConversationStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      handoff: 'bg-yellow-100 text-yellow-800',
      closed: '​bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Communications</h1>
        <p className="text-gray-600">Manage chatbot conversations and video calls</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'conversations'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Conversations
        </button>
        <button
          onClick={() => setActiveTab('calls')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'calls'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Video className="w-5 h-5" />
          Video Calls
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'stats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Statistics
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Conversations Tab */}
          {activeTab === 'conversations' && (
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Messages
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conversations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No conversations found
                        </td>
                      </tr>
                    ) : (
                      conversations.map((convo) => (
                        <tr key={convo.conversationId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {convo.context?.userName || convo.userId.substring(0, 8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{convo.userType}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{convo.messages.length}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getConversationStatusBadge(
                                convo.status
                              )}`}
                            >
                              {convo.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(convo.updatedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedConversation(convo)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View
                            </button>
                            {convo.status !== 'handoff' && (
                              <button
                                onClick={() => handleTakeOver(convo.conversationId)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Take Over
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Calls Tab */}
          {activeTab === 'calls' && (
            <div className="space-y-6">
              {/* Active Calls */}
              {activeCalls.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Active Calls ({activeCalls.length})
                  </h2>
                  <div className="bg-white rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Caller
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Receiver
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Started
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeCalls.map((call) => (
                          <tr key={call.sessionId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {call.callerId.substring(0, 8)} ({call.callerType})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {call.receiverId.substring(0, 8)} ({call.receiverType})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(call.startTime).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCallStatusBadge(
                                  call.status
                                )}`}
                              >
                                {call.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Call History */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Call History
                </h2>
                <div className="bg-white rounded-lg shadow overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Caller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receiver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {calls.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No call history found
                          </td>
                        </tr>
                      ) : (
                        calls.map((call) => (
                          <tr key={call.sessionId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {call.callerId.substring(0, 8)} ({call.callerType})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {call.receiverId.substring(0, 8)} ({call.receiverType})
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDuration(call.duration)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCallStatusBadge(
                                  call.status
                                )}`}
                              >
                                {call.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(call.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-medium">Total Conversations</h3>
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{conversations.length}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Active: {conversations.filter((c) => c.status === 'active').length}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-medium">Total Calls</h3>
                  <Video className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{calls.length}</p>
                <p className="text-sm text-gray-500 mt-2">Active: {activeCalls.length}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-medium">Avg Call Duration</h3>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {formatDuration(
                    Math.floor(
                      calls.reduce((sum, call) => sum + (call.duration || 0), 0) / calls.length || 0
                    )
                  )}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-600 text-sm font-medium">Handoff Rate</h3>
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {conversations.length > 0
                    ? Math.round(
                        (conversations.filter((c) => c.status === 'handoff').length /
                          conversations.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Conversation Detail Modal */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Conversation Details</h2>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {selectedConversation.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">{msg.sender}</div>
                    <div
                      className={`rounded-lg p-3 ${
                        msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationsDashboard;
