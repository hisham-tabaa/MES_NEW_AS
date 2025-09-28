import { Response } from 'express';
import { prisma } from '../index';
import { AuthenticatedRequest, ApiResponse, ValidationError, NotFoundError, ForbiddenError } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Get all custom request statuses
export const getCustomStatuses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  // Check if user has permission (admin, supervisor, or technician)
  const hasPermission = [
    'COMPANY_MANAGER',
    'DEPUTY_MANAGER', 
    'DEPARTMENT_MANAGER',
    'SECTION_SUPERVISOR',
    'TECHNICIAN'
  ].includes(req.user.role);

  if (!hasPermission) {
    throw new ForbiddenError('Insufficient permissions to view custom statuses');
  }

  const statuses = await prisma.customRequestStatus.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Custom statuses retrieved successfully',
    data: { statuses },
  };

  res.status(200).json(response);
});

// Create a new custom request status
export const createCustomStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  // Check if user has permission (admin, supervisor, or technician)
  const hasPermission = [
    'COMPANY_MANAGER',
    'DEPUTY_MANAGER', 
    'DEPARTMENT_MANAGER',
    'SECTION_SUPERVISOR',
    'TECHNICIAN'
  ].includes(req.user.role);

  if (!hasPermission) {
    throw new ForbiddenError('Insufficient permissions to create custom statuses');
  }

  const { name, displayName, description, sortOrder } = req.body;

  if (!name || !displayName) {
    throw new ValidationError('Name and display name are required');
  }

  // Check if status with same name already exists
  const existingStatus = await prisma.customRequestStatus.findUnique({
    where: { name },
  });

  if (existingStatus) {
    throw new ValidationError('A status with this name already exists');
  }

  const customStatus = await prisma.customRequestStatus.create({
    data: {
      name,
      displayName,
      description,
      sortOrder: sortOrder || 0,
      createdById: req.user.id,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  logger.info(`Custom status "${name}" created by user ${req.user.username}`);

  const response: ApiResponse = {
    success: true,
    message: 'Custom status created successfully',
    data: { status: customStatus },
  };

  res.status(201).json(response);
});

// Update a custom request status
export const updateCustomStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  // Check if user has permission (admin, supervisor, or technician)
  const hasPermission = [
    'COMPANY_MANAGER',
    'DEPUTY_MANAGER', 
    'DEPARTMENT_MANAGER',
    'SECTION_SUPERVISOR',
    'TECHNICIAN'
  ].includes(req.user.role);

  if (!hasPermission) {
    throw new ForbiddenError('Insufficient permissions to update custom statuses');
  }

  const statusId = parseInt(req.params.id);
  const { name, displayName, description, sortOrder, isActive } = req.body;

  if (!statusId) {
    throw new ValidationError('Status ID is required');
  }

  // Check if status exists
  const existingStatus = await prisma.customRequestStatus.findUnique({
    where: { id: statusId },
  });

  if (!existingStatus) {
    throw new NotFoundError('Custom status not found');
  }

  // Check if new name conflicts with existing status
  if (name && name !== existingStatus.name) {
    const nameConflict = await prisma.customRequestStatus.findUnique({
      where: { name },
    });

    if (nameConflict) {
      throw new ValidationError('A status with this name already exists');
    }
  }

  const updatedStatus = await prisma.customRequestStatus.update({
    where: { id: statusId },
    data: {
      name: name || existingStatus.name,
      displayName: displayName || existingStatus.displayName,
      description: description !== undefined ? description : existingStatus.description,
      sortOrder: sortOrder !== undefined ? sortOrder : existingStatus.sortOrder,
      isActive: isActive !== undefined ? isActive : existingStatus.isActive,
      updatedAt: new Date(),
    },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  logger.info(`Custom status "${updatedStatus.name}" updated by user ${req.user.username}`);

  const response: ApiResponse = {
    success: true,
    message: 'Custom status updated successfully',
    data: { status: updatedStatus },
  };

  res.status(200).json(response);
});

// Delete a custom request status (soft delete)
export const deleteCustomStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  // Check if user has permission (admin, supervisor, or technician)
  const hasPermission = [
    'COMPANY_MANAGER',
    'DEPUTY_MANAGER', 
    'DEPARTMENT_MANAGER',
    'SECTION_SUPERVISOR',
    'TECHNICIAN'
  ].includes(req.user.role);

  if (!hasPermission) {
    throw new ForbiddenError('Insufficient permissions to delete custom statuses');
  }

  const statusId = parseInt(req.params.id);

  if (!statusId) {
    throw new ValidationError('Status ID is required');
  }

  // Check if status exists
  const existingStatus = await prisma.customRequestStatus.findUnique({
    where: { id: statusId },
  });

  if (!existingStatus) {
    throw new NotFoundError('Custom status not found');
  }

  // Soft delete by setting isActive to false
  await prisma.customRequestStatus.update({
    where: { id: statusId },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });

  logger.info(`Custom status "${existingStatus.name}" deleted by user ${req.user.username}`);

  const response: ApiResponse = {
    success: true,
    message: 'Custom status deleted successfully',
  };

  res.status(200).json(response);
});

// Get a single custom request status
export const getCustomStatusById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  // Check if user has permission (admin, supervisor, or technician)
  const hasPermission = [
    'COMPANY_MANAGER',
    'DEPUTY_MANAGER', 
    'DEPARTMENT_MANAGER',
    'SECTION_SUPERVISOR',
    'TECHNICIAN'
  ].includes(req.user.role);

  if (!hasPermission) {
    throw new ForbiddenError('Insufficient permissions to view custom statuses');
  }

  const statusId = parseInt(req.params.id);

  if (!statusId) {
    throw new ValidationError('Status ID is required');
  }

  const status = await prisma.customRequestStatus.findUnique({
    where: { id: statusId },
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  if (!status) {
    throw new NotFoundError('Custom status not found');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Custom status retrieved successfully',
    data: { status },
  };

  res.status(200).json(response);
});
