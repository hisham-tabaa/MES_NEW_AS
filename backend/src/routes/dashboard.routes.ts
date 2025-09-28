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
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Build where clause based on user role
  let whereClause: any = {};

  if (user.role === 'TECHNICIAN') {
    // Technicians can only see their assigned requests or ones they received
    whereClause.OR = [
      { assignedTechnicianId: user.id },
      { receivedById: user.id },
    ];
  } else if (user.role === 'SECTION_SUPERVISOR' || user.role === 'DEPARTMENT_MANAGER') {
    // Department-level access
    whereClause.departmentId = user.departmentId;
  }
  // Company and deputy managers can see all requests (no additional filter)

  // Get total requests
  const totalRequests = await prisma.request.count({ where: whereClause });
  
  // Get pending requests (not completed or closed)
  const pendingRequests = await prisma.request.count({
    where: {
      ...whereClause,
      status: {
        notIn: ['COMPLETED', 'CLOSED']
      }
    }
  });
  
  // Get overdue requests
  const overdueRequests = await prisma.request.count({
    where: {
      ...whereClause,
      isOverdue: true,
      status: {
        notIn: ['COMPLETED', 'CLOSED']
      }
    }
  });
  
  // Get completed requests
  const completedRequests = await prisma.request.count({
    where: {
      ...whereClause,
      status: 'COMPLETED'
    }
  });
  
  // Get warranty stats
  const underWarranty = await prisma.request.count({
    where: {
      ...whereClause,
      warrantyStatus: 'UNDER_WARRANTY'
    }
  });
  
  const outOfWarranty = await prisma.request.count({
    where: {
      ...whereClause,
      warrantyStatus: 'OUT_OF_WARRANTY'
    }
  });
  
  // Get requests by department
  const requestsByDepartment = await prisma.request.groupBy({
    by: ['departmentId'],
    where: whereClause,
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
    where: whereClause,
    _count: {
      id: true
    }
  });
  
  // Calculate average resolution time (for completed requests)
  const completedRequestsWithTime = await prisma.request.findMany({
    where: {
      ...whereClause,
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
      ...whereClause,
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
  
  return res.json({
    success: true,
    data: stats
  });
}));

export default router;
