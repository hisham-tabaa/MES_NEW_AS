import { Router } from 'express';
import * as statusController from '../controllers/status.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

/**
 * @route   GET /api/statuses
 * @desc    Get all custom request statuses
 * @access  Private (Admin, Supervisor, Technician)
 */
router.get('/', authenticateToken, statusController.getCustomStatuses);

/**
 * @route   GET /api/statuses/:id
 * @desc    Get a single custom request status
 * @access  Private (Admin, Supervisor, Technician)
 */
router.get('/:id', authenticateToken, statusController.getCustomStatusById);

/**
 * @route   POST /api/statuses
 * @desc    Create a new custom request status
 * @access  Private (Admin, Supervisor, Technician)
 */
router.post('/', authenticateToken, statusController.createCustomStatus);

/**
 * @route   PUT /api/statuses/:id
 * @desc    Update a custom request status
 * @access  Private (Admin, Supervisor, Technician)
 */
router.put('/:id', authenticateToken, statusController.updateCustomStatus);

/**
 * @route   DELETE /api/statuses/:id
 * @desc    Delete a custom request status (soft delete)
 * @access  Private (Admin, Supervisor, Technician)
 */
router.delete('/:id', authenticateToken, statusController.deleteCustomStatus);

export default router;
