import { NotificationType } from '../types';
import { prisma } from '../index';
import { NotificationData } from '../types';
import { logger } from '../utils/logger';

// Create a new notification
export const createNotification = async (data: NotificationData): Promise<void> => {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        requestId: data.requestId || null,
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
      },
    });

    logger.info(`Notification created for user ${data.userId}: ${data.title}`);
  } catch (error) {
    logger.error('Error creating notification:', error);
  }
};

// Get notifications for a user
export const getUserNotifications = async (
  userId: number,
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
) => {
  try {
    const whereClause: any = { userId };
    
    if (unreadOnly) {
      whereClause.isRead = false;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          request: {
            select: {
              id: true,
              requestNumber: true,
              status: true,
            },
          },
        },
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    return {
      notifications,
      total,
      unreadCount: await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    };
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    return {
      notifications: [],
      total: 0,
      unreadCount: 0,
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number, userId: number): Promise<boolean> => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user can only mark their own notifications
      },
      data: {
        isRead: true,
      },
    });

    return result.count > 0;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: number): Promise<boolean> => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    logger.info(`All notifications marked as read for user ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Delete old notifications (cleanup job)
export const deleteOldNotifications = async (daysOld: number = 30): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isRead: true, // Only delete read notifications
      },
    });

    logger.info(`Deleted ${result.count} old notifications`);
    return result.count;
  } catch (error) {
    logger.error('Error deleting old notifications:', error);
    return 0;
  }
};

// Get notification statistics
export const getNotificationStats = async (userId: number) => {
  try {
    const [total, unread, byType] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unread,
      byType: typeStats,
    };
  } catch (error) {
    logger.error('Error getting notification stats:', error);
    return {
      total: 0,
      unread: 0,
      byType: {},
    };
  }
};

// Send bulk notifications to multiple users
export const sendBulkNotifications = async (
  userIds: number[],
  title: string,
  message: string,
  type: NotificationType,
  requestId?: number
): Promise<void> => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      requestId: requestId || null,
      title,
      message,
      type,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    logger.info(`Bulk notifications sent to ${userIds.length} users: ${title}`);
  } catch (error) {
    logger.error('Error sending bulk notifications:', error);
  }
};

// Create system-wide notification for all users with specific roles
export const createSystemNotification = async (
  roles: string[],
  title: string,
  message: string,
  type: NotificationType,
  departmentId?: number
): Promise<void> => {
  try {
    const whereClause: any = {
      role: { in: roles },
      isActive: true,
    };

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true },
    });

    const userIds = users.map(user => user.id);

    if (userIds.length > 0) {
      await sendBulkNotifications(userIds, title, message, type);
    }
  } catch (error) {
    logger.error('Error creating system notification:', error);
  }
};
