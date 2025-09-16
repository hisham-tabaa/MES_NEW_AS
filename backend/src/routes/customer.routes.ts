import { Router } from 'express';
import { prisma } from '../index';
import { ApiResponse, ValidationError } from '../types';

const router = Router();

/**
 * @route   GET /api/customers
 * @desc    Get all customers with optional search and pagination
 * @access  Private
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search } = req.query as any;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { phone: { contains: String(search), mode: 'insensitive' } },
      { email: { contains: String(search), mode: 'insensitive' } },
      { address: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
    prisma.customer.count({ where }),
  ]);

  const response: ApiResponse = {
    success: true,
    data: { customers },
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  };

  res.status(200).json(response);
});

/**
 * @route   POST /api/customers
 * @desc    Create new customer
 * @access  Private
 */
router.post('/', async (req, res) => {
  const { name, phone, email, address, city } = req.body;

  if (!name || !phone || !address) {
    const error = new ValidationError('Name, phone, and address are required');
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  const customer = await prisma.customer.create({
    data: { name, phone, email, address, city },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Customer created successfully',
    data: { customer },
  };

  res.status(201).json(response);
});

export default router;
