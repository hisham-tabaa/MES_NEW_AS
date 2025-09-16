import { Response } from 'express';
import { 
  RequestStatus, 
  WarrantyStatus, 
  ExecutionMethod, 
  UserRole, 
  ActivityType,
  RequestPriority 
} from '../types';
import { prisma } from '../index';
import { 
  AuthenticatedRequest, 
  ApiResponse, 
  RequestFilters,
  ValidationError,
  NotFoundError,
  ForbiddenError
} from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { isManagerLevel, canAssignTechnicians } from '../middleware/auth';
import { calculateSLADueDate, checkSLAOverdue } from '../services/sla.service';
import { createNotification } from '../services/notification.service';
import { logActivity } from '../services/activity.service';

// Generate unique request number
const generateRequestNumber = async (): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  const prefix = `REQ${year}${month}${day}`;
  
  // Get the count of requests created today
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  const todayCount = await prisma.request.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });
  
  const sequence = (todayCount + 1).toString().padStart(3, '0');
  return `${prefix}-${sequence}`;
};

// Create new request
export const createRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    customerId,
    productId,
    issueDescription,
    executionMethod,
    warrantyStatus,
    purchaseDate,
    priority = RequestPriority.NORMAL,
  } = req.body;

  if (!req.user) {
    throw new ValidationError('Authentication required');
  }

  // Validate required fields
  if (!customerId || !issueDescription || !executionMethod || !warrantyStatus) {
    throw new ValidationError('Missing required fields');
  }

  // Validate customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(customerId) },
  });

  if (!customer) {
    throw new ValidationError('Customer not found');
  }

  // Validate product if provided
  let product = null;
  let departmentId = null;

  if (productId) {
    product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: { department: true },
    });

    if (!product) {
      throw new ValidationError('Product not found');
    }

    departmentId = product.departmentId;
  }

  // If no product provided, try to auto-assign department based on issue description
  if (!departmentId) {
    // Simple keyword matching for department assignment
    const description = issueDescription.toLowerCase();
    
    if (description.includes('tv') || description.includes('refrigerator') || 
        description.includes('washing') || description.includes('dishwasher') || 
        description.includes('air condition') || description.includes('lg')) {
      const lgDept = await prisma.department.findFirst({ where: { name: 'LG Maintenance' } });
      departmentId = lgDept?.id || 1;
    } else if (description.includes('solar') || description.includes('panel')) {
      const solarDept = await prisma.department.findFirst({ where: { name: 'Solar Energy' } });
      departmentId = solarDept?.id || 2;
    } else if (description.includes('tp-link') || description.includes('router') || description.includes('wifi')) {
      const tplinkDept = await prisma.department.findFirst({ where: { name: 'TP-Link' } });
      departmentId = tplinkDept?.id || 3;
    } else if (description.includes('printer') || description.includes('epson')) {
      const epsonDept = await prisma.department.findFirst({ where: { name: 'Epson' } });
      departmentId = epsonDept?.id || 4;
    } else {
      // Default to LG Maintenance if no match
      const lgDept = await prisma.department.findFirst({ where: { name: 'LG Maintenance' } });
      departmentId = lgDept?.id || 1;
    }
  }

  // Generate request number
  const requestNumber = await generateRequestNumber();

  // Calculate SLA due date
  const slaDueDate = calculateSLADueDate(
    warrantyStatus as WarrantyStatus,
    executionMethod as ExecutionMethod
  );

  // Create the request
  const newRequest = await prisma.request.create({
    data: {
      requestNumber,
      customerId: parseInt(customerId),
      productId: productId ? parseInt(productId) : null,
      departmentId,
      receivedById: req.user.id,
      issueDescription,
      executionMethod: executionMethod as ExecutionMethod,
      warrantyStatus: warrantyStatus as WarrantyStatus,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      priority: priority as RequestPriority,
      slaDueDate,
      status: RequestStatus.NEW,
    },
    include: {
      customer: true,
      product: true,
      department: true,
      receivedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log activity
  await logActivity(newRequest.id, req.user.id, ActivityType.CREATED, 'Request created');

  // Notify department manager/supervisor
  const departmentUsers = await prisma.user.findMany({
    where: {
      departmentId,
      role: { in: [UserRole.DEPARTMENT_MANAGER, UserRole.SECTION_SUPERVISOR] },
      isActive: true,
    },
  });

  for (const user of departmentUsers) {
    await createNotification({
      userId: user.id,
      requestId: newRequest.id,
      title: 'New Request Assigned',
      message: `New request ${requestNumber} has been assigned to your department`,
      type: 'ASSIGNMENT',
    });
  }

  logger.info(`Request ${requestNumber} created by user ${req.user.username}`);

  const response: ApiResponse = {
    success: true,
    message: 'Request created successfully',
    data: { request: newRequest },
  };

  res.status(201).json(response);
});

// Get all requests with filters and pagination
export const getRequests = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ValidationError('Authentication required');
  }

  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    status,
    priority,
    departmentId,
    assignedTechnicianId,
    warrantyStatus,
    isOverdue,
    dateFrom,
    dateTo,
    search,
  } = req.query as RequestFilters;

  // Build where clause based on user role and filters
  let whereClause: any = {};

  // Role-based access control
  if (req.user.role === UserRole.TECHNICIAN) {
    // Technicians can only see their assigned requests or ones they received
    whereClause.OR = [
      { assignedTechnicianId: req.user.id },
      { receivedById: req.user.id },
    ];
  } else if (req.user.role === UserRole.SECTION_SUPERVISOR || req.user.role === UserRole.DEPARTMENT_MANAGER) {
    // Department-level access
    whereClause.departmentId = req.user.departmentId;
  }
  // Company and deputy managers can see all requests (no additional filter)

  // Apply filters
  if (status) whereClause.status = status;
  if (priority) whereClause.priority = priority;
  if (departmentId) whereClause.departmentId = parseInt(departmentId.toString());
  if (assignedTechnicianId) whereClause.assignedTechnicianId = parseInt(assignedTechnicianId.toString());
  if (warrantyStatus) whereClause.warrantyStatus = warrantyStatus;
  if (isOverdue !== undefined) whereClause.isOverdue = String(isOverdue) === 'true';

  // Date range filter
  if (dateFrom || dateTo) {
    whereClause.createdAt = {};
    if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom.toString());
    if (dateTo) whereClause.createdAt.lte = new Date(dateTo.toString());
  }

  // Search functionality
  if (search) {
    whereClause.OR = [
      ...(whereClause.OR || []),
      { requestNumber: { contains: search.toString(), mode: 'insensitive' } },
      { issueDescription: { contains: search.toString(), mode: 'insensitive' } },
      { customer: { name: { contains: search.toString(), mode: 'insensitive' } } },
      { product: { name: { contains: search.toString(), mode: 'insensitive' } } },
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Get total count
  const total = await prisma.request.count({ where: whereClause });

  // Get requests
  const requests = await prisma.request.findMany({
    where: whereClause,
    skip,
    take: Number(limit),
    orderBy: { [sortBy.toString()]: sortOrder },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          model: true,
          category: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTechnician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      receivedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Check for overdue requests and update if necessary
  const overdueRequestIds = await checkSLAOverdue();
  if (overdueRequestIds.length > 0) {
    // Update the overdue status in our results if any match
    requests.forEach(request => {
      if (overdueRequestIds.includes(request.id)) {
        request.isOverdue = true;
      }
    });
  }

  const response: ApiResponse = {
    success: true,
    data: { requests },
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };

  res.status(200).json(response);
});

// Get single request by ID
export const getRequestById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id);

  if (!requestId) {
    throw new ValidationError('Invalid request ID');
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      customer: true,
      product: true,
      department: true,
      assignedTechnician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      receivedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      activities: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      costs: {
        include: {
          addedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!request) {
    throw new NotFoundError('Request not found');
  }

  const response: ApiResponse = {
    success: true,
    data: { request },
  };

  res.status(200).json(response);
});

// Update request status
export const updateRequestStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id);
  const { status, comment } = req.body;

  if (!requestId || !status) {
    throw new ValidationError('Request ID and status are required');
  }

  if (!req.user) {
    throw new ValidationError('Authentication required');
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('Request not found');
  }

  // Check if user can update this request
  const canUpdate = 
    req.user.role === UserRole.COMPANY_MANAGER ||
    req.user.role === UserRole.DEPUTY_MANAGER ||
    (req.user.role === UserRole.DEPARTMENT_MANAGER && req.user.departmentId === request.departmentId) ||
    (req.user.role === UserRole.SECTION_SUPERVISOR && req.user.departmentId === request.departmentId) ||
    (req.user.role === UserRole.TECHNICIAN && request.assignedTechnicianId === req.user.id);

  if (!canUpdate) {
    throw new ForbiddenError('Cannot update this request');
  }

  const oldStatus = request.status;
  const updateData: any = { status };

  // Set timestamps based on status
  if (status === RequestStatus.UNDER_INSPECTION && !request.startedAt) {
    updateData.startedAt = new Date();
  }
  if (status === RequestStatus.COMPLETED && !request.completedAt) {
    updateData.completedAt = new Date();
  }
  if (status === RequestStatus.CLOSED && !request.closedAt) {
    updateData.closedAt = new Date();
  }

  const updatedRequest = await prisma.request.update({
    where: { id: requestId },
    data: updateData,
    include: {
      customer: true,
      assignedTechnician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log activity
  const activityDescription = comment 
    ? `Status changed from ${oldStatus} to ${status}. Comment: ${comment}`
    : `Status changed from ${oldStatus} to ${status}`;
  
  await logActivity(requestId, req.user.id, ActivityType.STATUS_CHANGE, activityDescription, oldStatus, status);

  // Create notification for relevant users
  if (updatedRequest.assignedTechnician && updatedRequest.assignedTechnicianId !== req.user.id) {
    await createNotification({
      userId: updatedRequest.assignedTechnician.id,
      requestId: requestId,
      title: 'Request Status Updated',
      message: `Request ${updatedRequest.requestNumber} status changed to ${status}`,
      type: 'STATUS_CHANGE',
    });
  }

  logger.info(`Request ${updatedRequest.requestNumber} status updated to ${status} by user ${req.user.username}`);

  const response: ApiResponse = {
    success: true,
    message: 'Request status updated successfully',
    data: { request: updatedRequest },
  };

  res.status(200).json(response);
});

// Assign technician to request
export const assignTechnician = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id);
  const { technicianId } = req.body;

  if (!requestId || !technicianId) {
    throw new ValidationError('Request ID and technician ID are required');
  }

  if (!req.user) {
    throw new ValidationError('Authentication required');
  }

  if (!canAssignTechnicians(req.user.role)) {
    throw new ForbiddenError('Insufficient permissions to assign technicians');
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('Request not found');
  }

  // Check if technician exists and is active
  const technician = await prisma.user.findUnique({
    where: { 
      id: parseInt(technicianId),
      role: UserRole.TECHNICIAN,
      isActive: true,
    },
  });

  if (!technician) {
    throw new ValidationError('Valid technician not found');
  }

  // Check if technician is from the same department (except for company/deputy managers)
  if (!isManagerLevel(req.user.role) && technician.departmentId !== req.user.departmentId) {
    throw new ForbiddenError('Cannot assign technician from different department');
  }

  const updatedRequest = await prisma.request.update({
    where: { id: requestId },
    data: {
      assignedTechnicianId: parseInt(technicianId),
      assignedAt: new Date(),
      status: RequestStatus.ASSIGNED,
    },
    include: {
      assignedTechnician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log activity
  await logActivity(
    requestId, 
    req.user.id, 
    ActivityType.ASSIGNMENT, 
    `Assigned to technician: ${technician.firstName} ${technician.lastName}`,
    request.assignedTechnicianId?.toString(),
    technicianId.toString()
  );

  // Notify technician
  await createNotification({
    userId: parseInt(technicianId),
    requestId: requestId,
    title: 'New Request Assigned',
    message: `Request ${updatedRequest.requestNumber} has been assigned to you`,
    type: 'ASSIGNMENT',
  });

  logger.info(`Request ${updatedRequest.requestNumber} assigned to technician ${technician.firstName} ${technician.lastName} by user ${req.user.username}`);

  const response: ApiResponse = {
    success: true,
    message: 'Technician assigned successfully',
    data: { request: updatedRequest },
  };

  res.status(200).json(response);
});

// Add cost to request
export const addCost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id);
  const { description, amount, costType, currency = 'SYP' } = req.body;

  if (!requestId || !description || !amount || !costType) {
    throw new ValidationError('All cost fields are required');
  }

  if (!req.user) {
    throw new ValidationError('Authentication required');
  }

  if (amount <= 0) {
    throw new ValidationError('Cost amount must be greater than zero');
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('Request not found');
  }

  // Only allow adding costs to out-of-warranty requests or by managers
  if (request.warrantyStatus === WarrantyStatus.UNDER_WARRANTY && !isManagerLevel(req.user.role)) {
    throw new ForbiddenError('Cannot add costs to under-warranty requests');
  }

  const cost = await prisma.requestCost.create({
    data: {
      requestId,
      description,
      amount: parseFloat(amount),
      costType,
      currency,
      addedById: req.user.id,
    },
    include: {
      addedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log activity
  await logActivity(
    requestId,
    req.user.id,
    ActivityType.COST_ADDED,
    `Cost added: ${description} - $${amount}`,
    null,
    `${description}: $${amount}`
  );

  logger.info(`Cost added to request ${request.requestNumber} by user ${req.user.username}: ${description} - $${amount}`);

  const response: ApiResponse = {
    success: true,
    message: 'Cost added successfully',
    data: { cost },
  };

  res.status(201).json(response);
});

// Close request
export const closeRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id);
  const { finalNotes, customerSatisfaction } = req.body;

  if (!requestId) {
    throw new ValidationError('Request ID is required');
  }

  if (!req.user) {
    throw new ValidationError('Authentication required');
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('Request not found');
  }

  if (request.status !== RequestStatus.COMPLETED) {
    throw new ValidationError('Request must be completed before closing');
  }

  // Check permissions
  const canClose = 
    isManagerLevel(req.user.role) ||
    (req.user.role === UserRole.SECTION_SUPERVISOR && req.user.departmentId === request.departmentId);

  if (!canClose) {
    throw new ForbiddenError('Insufficient permissions to close request');
  }

  const updatedRequest = await prisma.request.update({
    where: { id: requestId },
    data: {
      status: RequestStatus.CLOSED,
      closedAt: new Date(),
      finalNotes,
      customerSatisfaction: customerSatisfaction ? parseInt(customerSatisfaction) : null,
    },
  });

  // Log activity
  await logActivity(
    requestId,
    req.user.id,
    ActivityType.STATUS_CHANGE,
    'Request closed',
    RequestStatus.COMPLETED,
    RequestStatus.CLOSED
  );

  logger.info(`Request ${request.requestNumber} closed by user ${req.user.username}`);

  const response: ApiResponse = {
    success: true,
    message: 'Request closed successfully',
    data: { request: updatedRequest },
  };

  res.status(200).json(response);
});
