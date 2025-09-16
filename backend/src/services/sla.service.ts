import { WarrantyStatus, ExecutionMethod } from '../types';
import { prisma } from '../index';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { createNotification } from './notification.service';

// Calculate SLA due date based on warranty status and execution method
export const calculateSLADueDate = (
  warrantyStatus: WarrantyStatus,
  executionMethod: ExecutionMethod
): Date => {
  const now = new Date();
  let hours = 0;

  // Base SLA hours
  if (warrantyStatus === WarrantyStatus.UNDER_WARRANTY) {
    hours = config.slaUnderWarranty;
  } else {
    hours = config.slaOutOfWarranty;
  }

  // Add buffer for on-site visits
  if (executionMethod === ExecutionMethod.ON_SITE) {
    hours += config.slaOnsiteBuffer;
  }

  // Calculate due date
  const dueDate = new Date(now.getTime() + (hours * 60 * 60 * 1000));
  return dueDate;
};

// Check for overdue requests and update their status
export const checkSLAOverdue = async (): Promise<number[]> => {
  const now = new Date();
  
  try {
    // Find requests that are overdue but not marked as such
    const overdueRequests = await prisma.request.findMany({
      where: {
        slaDueDate: {
          lt: now,
        },
        isOverdue: false,
        status: {
          notIn: ['COMPLETED', 'CLOSED'],
        },
      },
      include: {
        assignedTechnician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            managerId: true,
          },
        },
      },
    });

    if (overdueRequests.length === 0) {
      return [];
    }

    const overdueRequestIds = overdueRequests.map(request => request.id);

    // Update overdue status
    await prisma.request.updateMany({
      where: {
        id: {
          in: overdueRequestIds,
        },
      },
      data: {
        isOverdue: true,
      },
    });

    logger.warn(`Marked ${overdueRequests.length} requests as overdue`);

    // Create notifications for overdue requests
    for (const request of overdueRequests) {
      const notifications = [];

      // Notify assigned technician
      if (request.assignedTechnician) {
        notifications.push({
          userId: request.assignedTechnician.id,
          requestId: request.id,
          title: 'Request Overdue',
          message: `Request ${request.requestNumber} is now overdue`,
          type: 'OVERDUE' as const,
        });
      }

      // Notify department manager
      if (request.department.managerId) {
        notifications.push({
          userId: request.department.managerId,
          requestId: request.id,
          title: 'Request Overdue in Your Department',
          message: `Request ${request.requestNumber} in ${request.department.name} is now overdue`,
          type: 'OVERDUE' as const,
        });
      }

      // Create notifications
      for (const notification of notifications) {
        await createNotification(notification);
      }
    }

    return overdueRequestIds;
  } catch (error) {
    logger.error('Error checking SLA overdue requests:', error);
    return [];
  }
};

// Get SLA statistics for reporting
export const getSLAStats = async (departmentId?: number, dateFrom?: Date, dateTo?: Date) => {
  try {
    const whereClause: any = {};
    
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = dateFrom;
      if (dateTo) whereClause.createdAt.lte = dateTo;
    }

    const [
      totalRequests,
      overdueRequests,
      completedOnTime,
      completedOverdue,
      avgResolutionTime
    ] = await Promise.all([
      // Total requests
      prisma.request.count({ where: whereClause }),
      
      // Overdue requests
      prisma.request.count({
        where: {
          ...whereClause,
          isOverdue: true,
        },
      }),
      
      // Completed on time
      prisma.request.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          isOverdue: false,
        },
      }),
      
      // Completed overdue
      prisma.request.count({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          isOverdue: true,
        },
      }),
      
      // Average resolution time
      prisma.request.aggregate({
        where: {
          ...whereClause,
          status: 'COMPLETED',
          completedAt: { not: null },
        },
        _avg: {
          // We'll calculate this manually as Prisma doesn't support date math directly
        },
      }),
    ]);

    // Calculate actual average resolution time
    const completedRequests = await prisma.request.findMany({
      where: {
        ...whereClause,
        status: 'COMPLETED',
        completedAt: { not: null },
      },
      select: {
        createdAt: true,
        completedAt: true,
      },
    });

    let totalResolutionHours = 0;
    completedRequests.forEach(request => {
      if (request.completedAt) {
        const hours = (request.completedAt.getTime() - request.createdAt.getTime()) / (1000 * 60 * 60);
        totalResolutionHours += hours;
      }
    });

    const averageResolutionHours = completedRequests.length > 0 
      ? totalResolutionHours / completedRequests.length 
      : 0;

    return {
      totalRequests,
      overdueRequests,
      completedOnTime,
      completedOverdue,
      overduePercentage: totalRequests > 0 ? (overdueRequests / totalRequests) * 100 : 0,
      onTimePercentage: totalRequests > 0 ? (completedOnTime / totalRequests) * 100 : 0,
      averageResolutionHours: Math.round(averageResolutionHours * 100) / 100,
    };
  } catch (error) {
    logger.error('Error calculating SLA stats:', error);
    return null;
  }
};

// Check if a request will be overdue soon (within next 24 hours)
export const checkUpcomingOverdue = async (): Promise<any[]> => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));

  try {
    const upcomingOverdue = await prisma.request.findMany({
      where: {
        slaDueDate: {
          gte: now,
          lte: next24Hours,
        },
        isOverdue: false,
        status: {
          notIn: ['COMPLETED', 'CLOSED'],
        },
      },
      include: {
        assignedTechnician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    return upcomingOverdue;
  } catch (error) {
    logger.error('Error checking upcoming overdue requests:', error);
    return [];
  }
};
