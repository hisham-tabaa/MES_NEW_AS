import { Router } from 'express';
import * as requestController from '../controllers/request.controller';
import { requireRoles, requireRequestAccess } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

/**
 * @route   GET /api/requests
 * @desc    Get all requests with filters and pagination
 * @access  Private
 */
router.get('/', requestController.getRequests);

/**
 * @route   POST /api/requests
 * @desc    Create new request
 * @access  Private (All roles can create requests)
 */
router.post('/', requestController.createRequest);

/**
 * @route   GET /api/requests/:id
 * @desc    Get single request by ID
 * @access  Private (Must have access to the specific request)
 */
router.get('/:id', requireRequestAccess, requestController.getRequestById);

/**
 * @route   PUT /api/requests/:id/status
 * @desc    Update request status
 * @access  Private (Request access required)
 */
router.put('/:id/status', requireRequestAccess, requestController.updateRequestStatus);

/**
 * @route   PUT /api/requests/:id/assign
 * @desc    Assign technician to request
 * @access  Private (Supervisor level and above)
 */
router.put(
  '/:id/assign',
  requireRoles([
    UserRole.COMPANY_MANAGER,
    UserRole.DEPUTY_MANAGER,
    UserRole.DEPARTMENT_MANAGER,
    UserRole.SECTION_SUPERVISOR
  ]),
  requestController.assignTechnician
);

/**
 * @route   POST /api/requests/:id/costs
 * @desc    Add cost to request
 * @access  Private (Request access required)
 */
router.post('/:id/costs', requireRequestAccess, requestController.addCost);

/**
 * @route   PUT /api/requests/:id/close
 * @desc    Close request
 * @access  Private (Manager level and above)
 */
router.put(
  '/:id/close',
  requireRoles([
    UserRole.COMPANY_MANAGER,
    UserRole.DEPUTY_MANAGER,
    UserRole.DEPARTMENT_MANAGER,
    UserRole.SECTION_SUPERVISOR
  ]),
  requestController.closeRequest
);

export default router;
