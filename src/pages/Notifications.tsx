import React from 'react';
import { Bell, Check } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { apiClient } from '../api/client';

const Notifications: React.FC = () => {
  const { notifications, loading, refreshData } = useAppContext();

  const markAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      refreshData();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      refreshData();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Check size={16} className="mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`bg-white rounded-lg shadow-sm border border-gray-100 p-4 ${
              !notification.is_read ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start">
              <div className="rounded-full p-2 bg-blue-100 text-blue-600 mr-4">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                {notification.action_url && (
                  <a 
                    href={notification.action_url} 
                    className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800"
                  >
                    View details
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
          <p className="text-gray-500 mt-2">You're all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;