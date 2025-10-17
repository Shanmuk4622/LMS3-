import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import Toast from '../components/Toast';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { apiGetNotifications, apiMarkNotificationAsRead, apiMarkAllNotificationsAsRead } from '../services/api';

type ToastType = 'success' | 'error' | 'info';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  addToast: (message: string, type: ToastType) => void;
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let toastId = 0;

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
    }
    try {
        const userNotifications = await apiGetNotifications(user.id);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const newToast = { id: toastId++, message, type };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((notificationId: number) => {
    setToasts(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
        await apiMarkNotificationAsRead(notificationId);
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
        await apiMarkAllNotificationsAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
    }
  };

  const value = {
      addToast,
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};