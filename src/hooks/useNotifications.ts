import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Notification } from '../types';

export const useNotifications = (isRead?: boolean, limit = 10) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [isRead, limit]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = { limit };
      if (isRead !== undefined) params.is_read = isRead;

      const response = await apiClient.getNotifications(params);
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Notifications fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.getUnreadNotificationsCount();
      setUnreadCount(response.count || 0);
    } catch (err) {
      console.error('Unread count fetch error:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read error:', err);
      throw err;
    }
  };

  return { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    refresh: fetchNotifications 
  };
};