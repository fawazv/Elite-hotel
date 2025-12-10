import { privateApi } from '@/services/instances/axiosConfig';

// Dashboard API service for aggregated data
export const dashboardApi = {
  /**
   * Get Admin Dashboard data
   * Aggregates financial, occupancy, user, and system health metrics
   */
  getAdminDashboard: async () => {
    const { data } = await privateApi.get('/dashboard/admin');
    return data.data;
  },

  /**
   * Get Receptionist Dashboard data
   * Real-time operational data for front desk
   */
  getReceptionistDashboard: async () => {
    const { data } = await privateApi.get('/dashboard/receptionist');
    return data.data;
  },

  /**
   * Get Housekeeper Dashboard data
   * Task-focused view with assigned tasks
   */
  getHousekeeperDashboard: async () => {
    const { data } = await privateApi.get('/dashboard/housekeeper');
    return data.data;
  },

  /**
   * Clear dashboard cache (Admin only)
   */
  clearCache: async () => {
    const { data } = await privateApi.post('/dashboard/cache/clear');
    return data;
  },
};

// TypeScript interfaces for dashboard data
export interface AdminDashboardData {
  financialMetrics: {
    totalRevenue: number;
    pendingPayments: number;
    pendingAmount: number;
    refundedAmount: number;
    averageTransactionValue: number;
    revenueByPeriod: {
      today: number;
      week: number;
      month: number;
      year: number;
    };
  } | null;
  billingStatus: {
    paid: number;
    pending: number;
    overdue: number;
    disputed: number;
  } | null;
  occupancyMetrics: {
    currentOccupancy: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    maintenanceRooms: number;
    occupancyTrend: Array<{
      date: string;
      percentage: number;
    }>;
    bookingsByStatus: {
      confirmed: number;
      checkedIn: number;
      checkedOut: number;
      cancelled: number;
      pendingPayment: number;
    };
    upcomingCheckIns: number;
    upcomingCheckOuts: number;
  } | null;
  roomInventory: {
    byType: Record<string, { total: number; available: number }>;
    averageDailyRate: number;
    revPAR: number;
    totalRooms: number;
    occupiedRooms: number;
  } | null;
  userMetrics: {
    totalGuests: number;
    newGuestsThisMonth: number;
    returningGuests: number;
    staffCount: {
      admin: number;
      receptionist: number;
      housekeeper: number;
    };
    pendingApprovals: number;
  } | null;
  housekeepingStatus: {
    cleanRooms: number;
    dirtyRooms: number;
    inProgressRooms: number;
    inspectionPendingRooms: number;
    averageCleaningTime: number;
    tasksOverdue: number;
  } | null;
  communicationMetrics: {
    activeChatSessions: number;
    videoCallsToday: number;
    pendingMessages: number;
    averageResponseTime: number;
  } | null;
  systemHealth: {
    services: {
      payments: 'healthy' | 'degraded' | 'down';
      billing: 'healthy' | 'degraded' | 'down';
      reservations: 'healthy' | 'degraded' | 'down';
      rooms: 'healthy' | 'degraded' | 'down';
      users: 'healthy' | 'degraded' | 'down';
      housekeeping: 'healthy' | 'degraded' | 'down';
      communication: 'healthy' | 'degraded' | 'down';
    };
    lastUpdated: string;
  };
}

export interface ReceptionistDashboardData {
  todayActivity: any;
  roomStatus: any;
  guestDirectory: any;
  liveCommunication: any;
  pendingPayments: any;
  quickActions: {
    roomsToAssign: number;
    earlyCheckInRequests: number;
    lateCheckOutRequests: number;
  };
  serviceHealth: {
    reservations: 'healthy' | 'down';
    rooms: 'healthy' | 'down';
    communication: 'healthy' | 'down';
  };
  lastUpdated: string;
}

export interface HousekeeperDashboardData {
  assignedTasks: any[];
  myStats: any;
  roomContext: Record<string, any>;
  serviceHealth: {
    housekeeping: 'healthy' | 'down';
    reservations: 'healthy' | 'down';
  };
  lastUpdated: string;
}
