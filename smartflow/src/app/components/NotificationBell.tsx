"use client";

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import notificationService, { Notification } from '@/app/services/notificationService';

interface NotificationBellProps {
  className?: string;
  filterTypes?: Array<Notification['type']>;
}

export default function NotificationBell({ className, filterTypes }: NotificationBellProps) {
  const { user } = useAuth();
  const userId = user?.id;
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const matchesFilter = (n: Notification) => {
    if (!filterTypes || filterTypes.length === 0) return true;
    return filterTypes.includes(n.type);
  };

  const computeFilteredUnread = (items: Notification[]) => {
    return items.filter(n => n.status === 'unread' && matchesFilter(n)).length;
  };

  useEffect(() => {
    if (!userId) return;

    notificationService.initializeRealTimeNotifications(userId);

    // Initial load: fetch full list, compute filtered unread locally
    (async () => {
      const all = await notificationService.getNotifications(userId);
      setNotifications(all);
      setUnreadCount(computeFilteredUnread(all));
    })();

    const onNew = (n: Notification) => {
      setNotifications(prev => {
        const next = [n as Notification, ...prev].slice(0, 50);
        return next;
      });
      // Recompute to respect filters
      setUnreadCount(prev => {
        // We'll recompute from the next state in a microtask to avoid stale prev
        setTimeout(() => setUnreadCount(computeFilteredUnread([n as Notification, ...notifications])), 0);
        return prev;
      });
    };

    notificationService.on('new-notification', onNew);
    return () => {
      notificationService.off('new-notification', onNew);
    };
  }, [userId]);

  useEffect(() => {
    // When notifications change or filterTypes changes, recompute badge
    setUnreadCount(computeFilteredUnread(notifications));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, JSON.stringify(filterTypes)]);

  const toggle = () => setOpen(o => !o);

  // Close when clicking outside or pressing escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleMarkRead = async (id?: number) => {
    if (!id) return;
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } as Notification : n));
  };

  const dotShown = unreadCount > 0;
  const unreadLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  const visibleNotifications = filterTypes && filterTypes.length > 0
    ? notifications.filter(matchesFilter)
    : notifications;

  return (
    <div className={`relative ${className || ''}`}>
      <button onClick={toggle} className="relative p-2 text-gray-400 hover:text-gray-600">
        <Bell className="h-5 w-5" />
        {dotShown && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] font-semibold px-1.5 py-0.5 min-w-[16px] text-center leading-none">
            {unreadLabel}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile full-screen overlay */}
          <div className="fixed inset-0 bg-black/30 z-50 sm:hidden" onClick={() => setOpen(false)}></div>
          <div
            ref={panelRef}
            className="fixed top-14 left-0 right-0 w-full sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white rounded-t-2xl sm:rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl sm:rounded-t-lg">
              <div className="text-sm font-medium text-gray-900">Notifications</div>
              <div className="text-xs text-gray-500">{unreadCount} unread</div>
            </div>
            <div className="max-h-[70vh] sm:max-h-80 overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">No notifications</div>
              ) : (
                visibleNotifications.slice(0, 20).map((n, idx) => (
                  <div key={idx} className={`px-4 py-4 sm:py-3 text-sm hover:bg-gray-50 flex items-start gap-3 ${n.status === 'unread' ? 'bg-sky-50' : ''}`}>
                    <div className="mt-0.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${n.status === 'unread' ? 'bg-sky-500' : 'bg-gray-300'}`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-gray-900 ${expandedIdx===idx ? '' : 'truncate'}`}>{n.title}</div>
                      <div className={`${expandedIdx===idx ? 'text-gray-700 whitespace-pre-wrap break-words' : 'text-gray-600 truncate'}`}>{n.message}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-2">
                      <button onClick={() => setExpandedIdx(expandedIdx===idx ? null : idx)} className="text-gray-400 hover:text-gray-600" title={expandedIdx===idx ? 'View less' : 'View more'}>
                        {expandedIdx===idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {n.status === 'unread' && (
                        <button onClick={() => handleMarkRead(n.id)} className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 