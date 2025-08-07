"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import notificationService from '../services/notificationService';

// Global state types
export interface GlobalState {
  notifications: {
    unreadCount: number;
    notifications: any[];
    loading: boolean;
  };
  dashboard: {
    stats: any;
    recentActivity: any[];
    loading: boolean;
  };
  workflows: {
    pendingApprovals: any[];
    myWorkflows: any[];
    loading: boolean;
  };
  ui: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
    loading: boolean;
  };
  cache: {
    departments: any[];
    roles: any[];
    systems: any[];
    users: any[];
  };
}

// Action types
export type GlobalAction =
  | { type: 'SET_NOTIFICATIONS'; payload: any[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'ADD_NOTIFICATION'; payload: any }
  | { type: 'MARK_NOTIFICATION_READ'; payload: number }
  | { type: 'SET_DASHBOARD_STATS'; payload: any }
  | { type: 'SET_RECENT_ACTIVITY'; payload: any[] }
  | { type: 'SET_PENDING_APPROVALS'; payload: any[] }
  | { type: 'SET_MY_WORKFLOWS'; payload: any[] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'auto' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_LOADING'; payload: { key: string; loading: boolean } }
  | { type: 'SET_CACHE_DATA'; payload: { key: string; data: any } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: GlobalState = {
  notifications: {
    unreadCount: 0,
    notifications: [],
    loading: false,
  },
  dashboard: {
    stats: {},
    recentActivity: [],
    loading: false,
  },
  workflows: {
    pendingApprovals: [],
    myWorkflows: [],
    loading: false,
  },
  ui: {
    sidebarCollapsed: false,
    theme: 'auto',
    language: 'en',
    loading: false,
  },
  cache: {
    departments: [],
    roles: [],
    systems: [],
    users: [],
  },
};

// Reducer function
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          notifications: action.payload,
        },
      };

    case 'SET_UNREAD_COUNT':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          unreadCount: action.payload,
        },
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          notifications: [action.payload, ...state.notifications.notifications],
          unreadCount: state.notifications.unreadCount + 1,
        },
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          notifications: state.notifications.notifications.map(notification =>
            notification.id === action.payload
              ? { ...notification, status: 'read' }
              : notification
          ),
          unreadCount: Math.max(0, state.notifications.unreadCount - 1),
        },
      };

    case 'SET_DASHBOARD_STATS':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          stats: action.payload,
        },
      };

    case 'SET_RECENT_ACTIVITY':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          recentActivity: action.payload,
        },
      };

    case 'SET_PENDING_APPROVALS':
      return {
        ...state,
        workflows: {
          ...state.workflows,
          pendingApprovals: action.payload,
        },
      };

    case 'SET_MY_WORKFLOWS':
      return {
        ...state,
        workflows: {
          ...state.workflows,
          myWorkflows: action.payload,
        },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        ui: {
          ...state.ui,
          language: action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        [action.payload.key]: {
          ...state[action.payload.key as keyof GlobalState],
          loading: action.payload.loading,
        },
      };

    case 'SET_CACHE_DATA':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: action.payload.data,
        },
      };

    case 'CLEAR_CACHE':
      return {
        ...state,
        cache: {
          departments: [],
          roles: [],
          systems: [],
          users: [],
        },
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Context interface
interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  actions: {
    fetchNotifications: () => Promise<void>;
    markNotificationAsRead: (id: number) => Promise<void>;
    fetchDashboardStats: () => Promise<void>;
    fetchRecentActivity: () => Promise<void>;
    fetchPendingApprovals: () => Promise<void>;
    fetchMyWorkflows: () => Promise<void>;
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark' | 'auto') => void;
    setLanguage: (language: string) => void;
    clearCache: () => void;
    resetState: () => void;
  };
}

// Create context
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider component
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Initialize real-time notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize notification service
      notificationService.initializeRealTimeNotifications(user.id);
      
      // Listen for new notifications
      const handleNewNotification = (notification: any) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      };

      notificationService.on('new-notification', handleNewNotification);

      // Fetch initial data
      fetchInitialData();

      return () => {
        notificationService.off('new-notification', handleNewNotification);
        notificationService.destroy();
      };
    }
  }, [isAuthenticated, user]);

  // Fetch initial data
  const fetchInitialData = async () => {
    if (!user) return;

    try {
      // Fetch notifications
      await actions.fetchNotifications();
      
      // Fetch dashboard stats
      await actions.fetchDashboardStats();
      
      // Fetch pending approvals
      await actions.fetchPendingApprovals();
      
      // Fetch my workflows
      await actions.fetchMyWorkflows();
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  // Action creators
  const actions = {
    fetchNotifications: async () => {
      if (!user) return;

      dispatch({ type: 'SET_LOADING', payload: { key: 'notifications', loading: true } });
      
      try {
        const notifications = await notificationService.getNotifications(user.id);
        const unreadCount = await notificationService.getUnreadCount(user.id);
        
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'notifications', loading: false } });
      }
    },

    markNotificationAsRead: async (id: number) => {
      try {
        await notificationService.markAsRead(id);
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },

    fetchDashboardStats: async () => {
      if (!user) return;

      dispatch({ type: 'SET_LOADING', payload: { key: 'dashboard', loading: true } });
      
      try {
        // This would be replaced with actual API calls
        const stats: any = { tickets: 0, requisitions: 0, approvals: 0 };
        dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'dashboard', loading: false } });
      }
    },

    fetchRecentActivity: async () => {
      if (!user) return;

      try {
        // This would be replaced with actual API calls
        const activity: any[] = [];
        dispatch({ type: 'SET_RECENT_ACTIVITY', payload: activity });
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    },

    fetchPendingApprovals: async () => {
      if (!user) return;

      dispatch({ type: 'SET_LOADING', payload: { key: 'workflows', loading: true } });
      
      try {
        // This would be replaced with actual API calls
        const approvals: any[] = [];
        dispatch({ type: 'SET_PENDING_APPROVALS', payload: approvals });
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'workflows', loading: false } });
      }
    },

    fetchMyWorkflows: async () => {
      if (!user) return;

      try {
        // This would be replaced with actual API calls
        const workflows: any[] = [];
        dispatch({ type: 'SET_MY_WORKFLOWS', payload: workflows });
      } catch (error) {
        console.error('Error fetching my workflows:', error);
      }
    },

    toggleSidebar: () => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    },

    setTheme: (theme: 'light' | 'dark' | 'auto') => {
      dispatch({ type: 'SET_THEME', payload: theme });
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);
    },

    setLanguage: (language: string) => {
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    },

    clearCache: () => {
      dispatch({ type: 'CLEAR_CACHE' });
    },

    resetState: () => {
      dispatch({ type: 'RESET_STATE' });
    },
  };

  const value: GlobalContextType = {
    state,
    dispatch,
    actions,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

// Hook to use global state
export function useGlobalState() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}

// Selector hooks for specific state slices
export function useNotifications() {
  const { state } = useGlobalState();
  return state.notifications;
}

export function useDashboard() {
  const { state } = useGlobalState();
  return state.dashboard;
}

export function useWorkflows() {
  const { state } = useGlobalState();
  return state.workflows;
}

export function useUI() {
  const { state } = useGlobalState();
  return state.ui;
}

export function useCache() {
  const { state } = useGlobalState();
  return state.cache;
} 