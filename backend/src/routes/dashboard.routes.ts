import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  // Get total requests
  const totalRequests = await prisma.request.count();
  
  // Get pending requests (not completed or closed)
  const pendingRequests = await prisma.request.count({
    where: {
      status: {
        notIn: ['COMPLETED', 'CLOSED']
      }
    }
  });
  
  // Get overdue requests
  const overdueRequests = await prisma.request.count({
    where: {
      isOverdue: true,
      status: {
        notIn: ['COMPLETED', 'CLOSED']
      }
    }
  });
  
  // Get completed requests
  const completedRequests = await prisma.request.count({
    where: {
      status: 'COMPLETED'
    }
  });
  
  // Get warranty stats
  const underWarranty = await prisma.request.count({
    where: {
      warrantyStatus: 'UNDER_WARRANTY'
    }
  });
  
  const outOfWarranty = await prisma.request.count({
    where: {
      warrantyStatus: 'OUT_OF_WARRANTY'
    }
  });
  
  // Get requests by department
  const requestsByDepartment = await prisma.request.groupBy({
    by: ['departmentId'],
    _count: {
      id: true
    }
  });
  
  // Get department names
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true
    }
  });
  
  // Get requests by status
  const requestsByStatus = await prisma.request.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });
  
  // Calculate average resolution time (for completed requests)
  const completedRequestsWithTime = await prisma.request.findMany({
    where: {
      status: 'COMPLETED',
      completedAt: { not: null }
    },
    select: {
      createdAt: true,
      completedAt: true
    }
  });
  
  let averageResolutionTime = 0;
  if (completedRequestsWithTime.length > 0) {
    const validRequests = completedRequestsWithTime.filter(req => req.createdAt && req.completedAt);
    if (validRequests.length > 0) {
      const totalTime = validRequests.reduce((sum, req) => {
        const created = new Date(req.createdAt).getTime();
        const completed = new Date(req.completedAt!).getTime();
        return sum + (completed - created);
      }, 0);
      averageResolutionTime = totalTime / validRequests.length / (1000 * 60 * 60); // Convert to hours
    }
  }
  
  // Calculate customer satisfaction average
  const satisfactionData = await prisma.request.aggregate({
    _avg: {
      customerSatisfaction: true
    },
    where: {
      customerSatisfaction: { not: null }
    }
  });
  
  const stats = {
    totalRequests,
    pendingRequests,
    overdueRequests,
    completedRequests,
    underWarranty,
    outOfWarranty,
    requestsByDepartment: requestsByDepartment.map(item => {
      const dept = departments.find(d => d.id === item.departmentId);
      return {
        departmentId: item.departmentId,
        departmentName: dept?.name || 'Unknown',
        count: item._count.id
      };
    }),
    requestsByStatus: requestsByStatus.map(item => ({
      status: item.status,
      count: item._count.id
    })),
    averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
    customerSatisfactionAverage: satisfactionData._avg.customerSatisfaction || 0
  };
  
  res.json({
    success: true,
    data: stats
  });
}));

export default router;
