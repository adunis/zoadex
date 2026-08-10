import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, ThumbsUp, MessageCircle, UserPlus, Award, CheckCheck } from 'lucide-react';
import api from '../../services/api';
import { timeAgo } from '../../utils/timeAgo';

interface Notification {
  id: string;
  type: 'confirmation' | 'comment' | 'friend_request' | 'badge' | 'general';
  title: string;
  referenceUrl: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  content: Notification[];
  unreadCount: number;
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'confirmation': return <ThumbsUp size={14} />;
    case 'comment': return <MessageCircle size={14} />;
    case 'friend_request': return <UserPlus size={14} />;
    case 'badge': return <Award size={14} />;
    default: return <Bell size={14} />;
  }
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<NotificationsResponse>('/notifications');
      return res.data;
    },
    refetchInterval: 30000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.content ?? [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false);
    if (notification.referenceUrl) {
      navigate(notification.referenceUrl);
    }
  };

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        className="notification-bell__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-bell__badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell__panel" role="menu">
          <div className="notification-bell__header">
            <h4 className="notification-bell__title">Notifications</h4>
            {unreadCount > 0 && (
              <button
                className="notification-bell__mark-all"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notification-bell__list">
            {notifications.length === 0 && (
              <p className="notification-bell__empty">No notifications yet.</p>
            )}
            {notifications.map((notif) => (
              <button
                key={notif.id}
                className={`notification-item ${!notif.read ? 'notification-item--unread' : ''}`}
                onClick={() => handleNotificationClick(notif)}
                role="menuitem"
              >
                <span className="notification-item__icon">
                  {getNotificationIcon(notif.type)}
                </span>
                <span className="notification-item__content">
                  <span className="notification-item__title">{notif.title}</span>
                  <span className="notification-item__time">{timeAgo(notif.createdAt)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
