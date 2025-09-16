import { Router } from 'express';
import { UserRole, ApiResponse, AuthenticatedRequest } from '../types';
import { requireRoles } from '../middleware/auth';
import { prisma } from '../index';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get users with optional filters (role, departmentId, isActive)
 * @access  Private (managers only)
 */
router.get(
  '/',
  requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.SECTION_SUPERVISOR, UserRole.TECHNICIAN]),
  async (req: AuthenticatedRequest, res) => {
    const { role, departmentId, isActive = true, page = 1, limit = 50 } = req.query as any;
    const user = req.user!;

    const where: any = {};
    if (role) where.role = String(role);
    if (departmentId) where.departmentId = Number(departmentId);
    if (isActive !== undefined) where.isActive = String(isActive) !== 'false';

    // If user is a technician, restrict to their department only
    if (user.role === UserRole.TECHNICIAN) {
      where.departmentId = user.departmentId;
      // Technicians can only see other technicians
      where.role = UserRole.TECHNICIAN;
    }
    
    // If user is department manager or section supervisor, restrict to their department
    if (user.role === UserRole.DEPARTMENT_MANAGER || user.role === UserRole.SECTION_SUPERVISOR) {
      if (!departmentId) {
        where.departmentId = user.departmentId;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { firstName: 'asc' },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          department: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const response: ApiResponse = {
      success: true,
      data: { users },
      meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    };

    res.status(200).json(response);
  }
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (managers only)
 */
router.post(
  '/',
  requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { username, email, password, firstName, lastName, phone, role, departmentId } = req.body;
      const currentUser = req.user!;

      // Validation
      if (!username || !email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({
          success: false,
          message: 'جميع الحقول المطلوبة يجب ملؤها',
        });
      }

      // Check if username or email already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل',
        });
      }

      // Role-based restrictions
      if (currentUser.role === UserRole.DEPARTMENT_MANAGER) {
        // Department managers can only create technicians and supervisors in their department
        if (![UserRole.TECHNICIAN, UserRole.SECTION_SUPERVISOR].includes(role)) {
          return res.status(403).json({
            success: false,
            message: 'لا يمكنك إنشاء هذا النوع من المستخدمين',
          });
        }
        // Must be in the same department
        if (departmentId !== currentUser.departmentId) {
          return res.status(403).json({
            success: false,
            message: 'يمكنك فقط إنشاء مستخدمين في قسمك',
          });
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
          firstName,
          lastName,
          phone: phone || null,
          role,
          departmentId: departmentId ? Number(departmentId) : null,
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          department: { select: { id: true, name: true } },
        },
      });

      const response: ApiResponse = {
        success: true,
        message: 'تم إنشاء المستخدم بنجاح',
        data: { user: newUser },
      };

      return res.status(201).json(response);
    } catch (error: any) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في إنشاء المستخدم',
        data: { error: error.message },
      });
    }
  }
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (managers only)
 */
router.put(
  '/:id',
  requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, role, departmentId, isActive } = req.body;
      const currentUser = req.user!;

      const userId = Number(id);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'معرف المستخدم غير صحيح',
        });
      }

      // Get existing user
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { department: true },
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'المستخدم غير موجود',
        });
      }

      // Role-based restrictions
      if (currentUser.role === UserRole.DEPARTMENT_MANAGER) {
        // Department managers can only update users in their department
        if (existingUser.departmentId !== currentUser.departmentId) {
          return res.status(403).json({
            success: false,
            message: 'لا يمكنك تعديل مستخدمين من أقسام أخرى',
          });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: firstName || existingUser.firstName,
          lastName: lastName || existingUser.lastName,
          phone: phone !== undefined ? phone : existingUser.phone,
          role: role || existingUser.role,
          departmentId: departmentId !== undefined ? (departmentId ? Number(departmentId) : null) : existingUser.departmentId,
          isActive: isActive !== undefined ? isActive : existingUser.isActive,
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          department: { select: { id: true, name: true } },
        },
      });

      const response: ApiResponse = {
        success: true,
        message: 'تم تحديث المستخدم بنجاح',
        data: { user: updatedUser },
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحديث المستخدم',
        data: { error: error.message },
      });
    }
  }
);

export default router;
