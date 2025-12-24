import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { MessageSquare, Video, BarChart3, Clock, Users, Phone, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { TableSkeleton } from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';
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
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<TabType>('conversations');
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [calls, setCalls] = useState<IVideoChatSession[]>([]);
  const [activeCalls, setActiveCalls] = useState<IVideoChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    // Reset page to 1 on tab change
    setCurrentPage(1); 
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, currentPage]);

  // Listen for socket events to auto-update
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
        // Simple strategy: Reload data when any call event happens
        loadData();
    };

    socket.on('videochat.call.initiated', handleUpdate);
    socket.on('videochat.call.active', handleUpdate);
    socket.on('videochat.call.ended', handleUpdate);
    socket.on('videochat.call.rejected', handleUpdate);
    
    // Also listen for raw events if the RabbitMQ events aren't forwarded to this socket
    // The backend socket.config.ts emits 'call:incoming' to specific users, but 'publishEvent' goes to RMQ.
    // If the Admin Dashboard relies on 'getActiveCalls', we need to know when that list changes.
    // Unless we assume the backend broadacsts these events to admins?
    // Checking socket.config.ts: it does NOT broadcast global events to admins.
    // It only emits to specific sockets.
    // So assume we need to poll OR modify backend.
    // BUT the User Request implies "real time".
    // Let's add polling as a fallback AND the listeners (in case backend is updated later).
    // Actually, looking at the logs/code, 'videochat.call.*' are RabbitMQ events. 
    // Does the socket forward them? Unlikely by default.
    // I shall add a Polling Interval for the Dashboard specifically, as it's the safest non-invasive fix.
    // 10 seconds poll?
    const interval = setInterval(() => {
        if (activeTab === 'calls') { // Only poll if viewing calls
            getAllActiveCalls().then(res => setActiveCalls(res.calls)).catch(console.error);
        }
    }, 5000); // 5 seconds polling for responsiveness

    return () => {
        socket.off('videochat.call.initiated', handleUpdate);
        socket.off('videochat.call.active', handleUpdate);
        socket.off('videochat.call.ended', handleUpdate);
        socket.off('videochat.call.rejected', handleUpdate);
        clearInterval(interval);
    };
  }, [socket, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'conversations') {
        const response = await getConversations(currentPage, itemsPerPage);
        setConversations(response.conversations);
        if (response.pagination) {
            setTotalItems(response.pagination.total);
            setTotalPages(response.pagination.pages);
        } else {
            // Fallback if pagination is missing from response structure but logic expects it
             setTotalItems(response.conversations.length);
             setTotalPages(1);
        }
      } else if (activeTab === 'calls') {
        const response = await getCallHistory(currentPage, itemsPerPage);
        setCalls(response.calls);
        
        // Parallel fetch for active calls if on calls tab
        const activeResponse = await getAllActiveCalls();
        setActiveCalls(activeResponse.calls);

        if (response.pagination) {
             setTotalItems(response.pagination.total);
             setTotalPages(response.pagination.pages);
        } else {
             setTotalItems(response.calls.length);
             setTotalPages(1);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load communication data. Please try again.');
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
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-b-lg">
         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
         </div>
      </div>
    );
  }

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
      {error ? (
        <div className="flex items-center justify-center h-64">
           <EmptyState
             title="Error loading data"
             description={error}
             icon={AlertTriangle}
             action={{ label: 'Retry', onClick: loadData }}
           />
        </div>
      ) : loading ? (
        <TableSkeleton rows={8} />
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
                        <td colSpan={6} className="px-6 py-12">
                          <EmptyState
                            title="No conversations found"
                            description="There are no active conversations at the moment."
                            icon={MessageSquare}
                          />
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
              {renderPagination()}
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
                <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto">
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
                              <td colSpan={5} className="px-6 py-12">
                                <EmptyState
                                  title="No call history"
                                  description="No past video calls found."
                                  icon={Video}
                                />
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
                    {renderPagination()}
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
