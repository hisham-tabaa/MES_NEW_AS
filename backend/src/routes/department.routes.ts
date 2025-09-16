import { Router } from 'express';
import { prisma } from '../index';
import { ApiResponse } from '../types';

const router = Router();

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get('/', async (req, res) => {
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      manager: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  const response: ApiResponse = {
    success: true,
    data: { departments },
  };

  res.status(200).json(response);
});

export default router;
