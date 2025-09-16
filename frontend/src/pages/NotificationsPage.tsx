import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { 
  BellIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'ASSIGNMENT' | 'OVERDUE' | 'STATUS_CHANGE' | 'COMPLETION';
  isRead: boolean;
  requestId?: number;
  requestNumber?: string;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'طلب جديد تم تعيينه لك',
      message: 'تم تعيين طلب الصيانة REQ241213-001 لك من قبل مشرف القسم',
      type: 'ASSIGNMENT',
      isRead: false,
      requestId: 1,
      requestNumber: 'REQ241213-001',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: 2,
      title: 'تنبيه: طلب متأخر',
      message: 'الطلب REQ241212-005 تجاوز المدة المحددة وبحاجة إلى اهتمام فوري',
      type: 'OVERDUE',
      isRead: false,
      requestId: 5,
      requestNumber: 'REQ241212-005',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: 3,
      title: 'تم تحديث حالة الطلب',
      message: 'تم تغيير حالة الطلب REQ241211-003 من "قيد الفحص" إلى "قيد الإصلاح"',
      type: 'STATUS_CHANGE',
      isRead: true,
      requestId: 3,
      requestNumber: 'REQ241211-003',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: 4,
      title: 'تم إكمال طلب الصيانة',
      message: 'تم إكمال الطلب REQ241210-002 بنجاح وإرساله للمراجعة النهائية',
      type: 'COMPLETION',
      isRead: true,
      requestId: 2,
      requestNumber: 'REQ241210-002',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT':
        return <BellIcon className="h-6 w-6 text-blue-500" />;
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'STATUS_CHANGE':
        return <InformationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'COMPLETION':
        return <CheckIcon className="h-6 w-6 text-green-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `منذ ${days} يوم`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">الإشعارات</h1>
          <p className="mt-2 text-sm text-gray-700">
            {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-content p-0">
          {notifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      {notification.requestId && (
                        <div className="mt-2">
                          <Link
                            to={`/requests/${notification.requestId}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            عرض الطلب {notification.requestNumber} ←
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد إشعارات</h3>
              <p className="mt-1 text-sm text-gray-500">
                ستظهر الإشعارات هنا عند توفرها
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
