import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
// Fix: Corrected import for react-router-dom components.
import { Link } from 'react-router-dom';
import { Notification } from '../types';

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 00-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NotificationItem: React.FC<{ notification: Notification; onClick: () => void }> = ({ notification, onClick }) => {
    return (
        <Link
            to={notification.link}
            onClick={onClick}
            className="block p-3 hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
        >
            <div className="flex items-start gap-3">
                {!notification.read && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>}
                <p className={`text-sm text-slate-700 dark:text-slate-300 ${notification.read ? 'ml-[14px]' : ''}`}>{notification.message}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1 ml-[14px]">{timeSince(notification.createdAt)}</p>
        </Link>
    )
}

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
      e.stopPropagation();
      markAllAsRead();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-2">
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
            <button onClick={handleMarkAllAsRead} disabled={unreadCount === 0} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">Mark all as read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
                notifications.map(n => (
                    <NotificationItem key={n.id} notification={n} onClick={() => handleNotificationClick(n.id)} />
                ))
            ) : (
                <p className="text-center text-slate-500 p-6">No notifications yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;