import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import * as notificationService from '../services/notification.service';
import { NotificationType } from '../types';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticateToken, authController.changePassword);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify', authenticateToken, authController.verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   GET /api/auth/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
router.get('/notifications', authenticateToken, async (req: any, res) => {
  const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
  const userId = req.user!.id;
  const result = await notificationService.getUserNotifications(userId, Number(page), Number(limit), unreadOnly === 'true');
  res.status(200).json({ success: true, data: result });
});

/**
 * @route   POST /api/auth/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.post('/notifications/:id/read', authenticateToken, async (req: any, res) => {
  const userId = req.user!.id;
  const id = Number(req.params.id);
  const ok = await notificationService.markNotificationAsRead(id, userId);
  res.status(ok ? 200 : 400).json({ success: ok });
});

/**
 * @route   POST /api/auth/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/notifications/read-all', authenticateToken, async (req: any, res) => {
  const userId = req.user!.id;
  const ok = await notificationService.markAllNotificationsAsRead(userId);
  res.status(ok ? 200 : 400).json({ success: ok });
});

/**
 * @route   POST /api/auth/restore-admin
 * @desc    Restore admin account with default credentials
 * @access  Public (for emergency admin restoration)
 */
router.post('/restore-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { prisma } = require('../index');
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      // Update existing admin with new password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const updatedAdmin = await prisma.user.update({
        where: { username: 'admin' },
        data: {
          passwordHash: hashedPassword,
          role: 'COMPANY_MANAGER',
          isActive: true,
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@company.com',
          phone: '+963911234567'
        }
      });
      
      res.status(200).json({
        success: true,
        message: 'Admin account updated successfully',
        data: { 
          username: 'admin',
          password: 'admin123',
          role: 'COMPANY_MANAGER'
        }
      });
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@company.com',
          passwordHash: hashedPassword,
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+963911234567',
          role: 'COMPANY_MANAGER',
          isActive: true,
          preferredCurrency: 'SYP'
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: { 
          username: 'admin',
          password: 'admin123',
          role: 'COMPANY_MANAGER'
        }
      });
    }
  } catch (error: any) {
    console.error('Error restoring admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore admin account',
      error: error.message
    });
  }
});

export default router;
