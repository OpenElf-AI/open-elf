import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  useNotifications,
  useUnreadCount,
  useMarkAllAsRead,
  useMarkAsRead,
} from '../hooks/useNotifications';

type NotificationFilter = 'all' | 'system' | 'interaction';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsReadMutation = useMarkAsRead();

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return format(date, 'HH:mm');
    if (diff < 86400000 * 7) return format(date, 'EEE', { locale: zhCN });
    return format(date, 'MM-dd', { locale: zhCN });
  };

  return (
    <div className="bg-black min-h-screen pb-32">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-white font-semibold text-xl">通知</h1>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-[#888888] hover:text-white transition-colors flex items-center gap-1.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              全部已读
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-8">
          {(['all', 'system', 'interaction'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-black'
                  : 'bg-[#1A1A1A] text-[#888888] hover:bg-[#242424]'
              }`}
            >
              {f === 'all' ? '全部' : f === 'system' ? '系统' : '互动'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center pt-20">
            <div className="flex gap-2">
              <div
                className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-10">
            <div className="mb-5">
              <svg
                className="w-16 h-16 text-[#666666]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">暂无通知</h3>
            <p className="text-[#666666] text-sm">新通知会显示在这里</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <button
                key={notification.id}
                onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                className={`w-full text-left p-4 rounded-2xl transition-colors ${
                  notification.isRead ? 'bg-transparent' : 'bg-[#121212]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.isRead ? 'bg-transparent' : 'bg-primary'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="text-white font-medium text-sm truncate">
                        {notification.title}
                      </h3>
                      <span className="text-[#666666] text-xs flex-shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-[#888888] text-sm">{notification.content}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
