import { ActivityType } from '../types';
import { prisma } from '../index';
import { logger } from '../utils/logger';

// Log an activity for a request
export const logActivity = async (
  requestId: number,
  userId: number,
  activityType: ActivityType,
  description: string,
  oldValue?: string | null,
  newValue?: string | null
): Promise<void> => {
  try {
    await prisma.requestActivity.create({
      data: {
        requestId,
        userId,
        activityType,
        description,
        oldValue,
        newValue,
      },
    });

    logger.info(`Activity logged for request ${requestId}: ${description}`);
  } catch (error) {
    logger.error('Error logging activity:', error);
  }
};

// Get activities for a request
export const getRequestActivities = async (
  requestId: number,
  page: number = 1,
  limit: number = 50
) => {
  try {
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.requestActivity.findMany({
        where: { requestId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      prisma.requestActivity.count({ where: { requestId } }),
    ]);

    return {
      activities,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    logger.error('Error getting request activities:', error);
    return {
      activities: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
};

// Get activities by user
export const getUserActivities = async (
  userId: number,
  page: number = 1,
  limit: number = 50,
  dateFrom?: Date,
  dateTo?: Date
) => {
  try {
    const whereClause: any = { userId };

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) whereClause.createdAt.lte = dateTo;
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.requestActivity.findMany({
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
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.requestActivity.count({ where: whereClause }),
    ]);

    return {
      activities,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    logger.error('Error getting user activities:', error);
    return {
      activities: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
};

// Get activity statistics
export const getActivityStats = async (
  requestId?: number,
  userId?: number,
  departmentId?: number,
  dateFrom?: Date,
  dateTo?: Date
) => {
  try {
    let whereClause: any = {};

    if (requestId) whereClause.requestId = requestId;
    if (userId) whereClause.userId = userId;

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) whereClause.createdAt.lte = dateTo;
    }

    // If filtering by department, need to join through request
    if (departmentId) {
      whereClause.request = {
        departmentId,
      };
    }

    const [
      totalActivities,
      activitiesByType,
      activitiesByUser,
      recentActivities
    ] = await Promise.all([
      // Total activities
      prisma.requestActivity.count({ where: whereClause }),
      
      // Activities by type
      prisma.requestActivity.groupBy({
        by: ['activityType'],
        where: whereClause,
        _count: { id: true },
      }),
      
      // Activities by user (top 10)
      prisma.requestActivity.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      
      // Recent activities (last 10)
      prisma.requestActivity.findMany({
        where: whereClause,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          request: {
            select: {
              requestNumber: true,
            },
          },
        },
      }),
    ]);

    // Get user details for activities by user
    const userIds = activitiesByUser.map(item => item.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = user;
      return acc;
    }, {} as Record<number, any>);

    const activitiesByUserWithNames = activitiesByUser.map(item => ({
      userId: item.userId,
      user: userMap[item.userId],
      count: item._count.id,
    }));

    return {
      totalActivities,
      activitiesByType,
      activitiesByUser: activitiesByUserWithNames,
      recentActivities,
    };
  } catch (error) {
    logger.error('Error getting activity stats:', error);
    return null;
  }
};

// Search activities
export const searchActivities = async (
  searchTerm: string,
  userId?: number,
  departmentId?: number,
  activityType?: ActivityType,
  dateFrom?: Date,
  dateTo?: Date,
  page: number = 1,
  limit: number = 20
) => {
  try {
    let whereClause: any = {
      OR: [
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { oldValue: { contains: searchTerm, mode: 'insensitive' } },
        { newValue: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    if (userId) whereClause.userId = userId;
    if (activityType) whereClause.activityType = activityType;

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) whereClause.createdAt.lte = dateTo;
    }

    if (departmentId) {
      whereClause.request = {
        departmentId,
      };
    }

    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.requestActivity.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          request: {
            select: {
              id: true,
              requestNumber: true,
              status: true,
              customer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.requestActivity.count({ where: whereClause }),
    ]);

    return {
      activities,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    logger.error('Error searching activities:', error);
    return {
      activities: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
};

// Export activities to CSV format (returns data that can be converted to CSV)
export const exportActivities = async (
  requestId?: number,
  userId?: number,
  departmentId?: number,
  dateFrom?: Date,
  dateTo?: Date,
  activityType?: ActivityType
) => {
  try {
    let whereClause: any = {};

    if (requestId) whereClause.requestId = requestId;
    if (userId) whereClause.userId = userId;
    if (activityType) whereClause.activityType = activityType;

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) whereClause.createdAt.lte = dateTo;
    }

    if (departmentId) {
      whereClause.request = {
        departmentId,
      };
    }

    const activities = await prisma.requestActivity.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        request: {
          select: {
            requestNumber: true,
            customer: {
              select: {
                name: true,
              },
            },
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Format for CSV export
    const csvData = activities.map(activity => ({
      requestNumber: activity.request.requestNumber,
      customerName: activity.request.customer?.name || 'N/A',
      department: activity.request.department?.name || 'N/A',
      activityType: activity.activityType,
      description: activity.description,
      oldValue: activity.oldValue || '',
      newValue: activity.newValue || '',
      userName: `${activity.user.firstName} ${activity.user.lastName}`,
      userRole: activity.user.role,
      createdAt: activity.createdAt.toISOString(),
    }));

    return csvData;
  } catch (error) {
    logger.error('Error exporting activities:', error);
    return [];
  }
};
