import API from "@/app/utils/axios";

export interface Notification {
  id: number;
  type: 'ticket' | 'requisition' | 'access_request' | 'registration' | 'system';
  title: string;
  message: string;
  recipient_id: number;
  sender_id?: number;
  related_id?: number;
  related_type?: string;
  status: 'unread' | 'read';
  created_at: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationPreferences {
  user_id: number;
  email_notifications: boolean;
  push_notifications: boolean;
  ticket_updates: boolean;
  requisition_updates: boolean;
  access_request_updates: boolean;
  approval_requests: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize real-time notifications
  async initializeRealTimeNotifications(userId: number) {
    try {
      // Close existing connection
      if (this.eventSource) {
        this.eventSource.close();
      }

      // Create new SSE connection
      this.eventSource = new EventSource(`https://smartflow-g5sk.onrender.com/notifications/stream/${userId}`);
      
      this.eventSource.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        this.handleNotification(notification);
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Implement reconnection logic
        setTimeout(() => this.initializeRealTimeNotifications(userId), 5000);
      };

    } catch (error) {
      console.error('Failed to initialize real-time notifications:', error);
    }
  }

  // Handle incoming notifications
  private handleNotification(notification: Notification) {
    // Trigger UI updates
    this.emit('new-notification', notification);
    
    // Show browser notification if enabled
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // API methods
  async getNotifications(userId: number): Promise<Notification[]> {
    try {
      const response = await API.get(`/api/notifications/user/${userId}`);
      return response.data.notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: number): Promise<void> {
    try {
      await API.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    try {
      const idNum = Number(userId);
      if (!idNum || Number.isNaN(idNum)) return 0;
      const response = await API.get(`/api/notifications/unread-count/${encodeURIComponent(idNum)}`);
      return typeof response.data?.count === 'number' ? response.data.count : 0;
    } catch (_error) {
      // Swallow and return 0 to avoid noisy console/UX disruptions
      return 0;
    }
  }

  async updatePreferences(userId: number, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await API.put(`/api/notifications/preferences/${userId}`, preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  // Cleanup
  destroy() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }
}

export default NotificationService.getInstance(); 