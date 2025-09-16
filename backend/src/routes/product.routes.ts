import { Router } from 'express';
import { prisma } from '../index';
import { ApiResponse, ValidationError } from '../types';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with optional search and pagination
 * @access  Private
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, search, departmentId } = req.query as any;

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: 'insensitive' } },
      { model: { contains: String(search), mode: 'insensitive' } },
      { category: { contains: String(search), mode: 'insensitive' } },
      { serialNumber: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  if (departmentId) where.departmentId = Number(departmentId);

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { department: true },
    }),
    prisma.product.count({ where }),
  ]);

  const response: ApiResponse = {
    success: true,
    data: { products },
    meta: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
  };

  res.status(200).json(response);
});

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private
 */
router.post('/', async (req, res) => {
  const { name, model, serialNumber, category, departmentId, warrantyMonths = 12 } = req.body;

  if (!name || !model || !category || !departmentId) {
    const error = new ValidationError('name, model, category, departmentId are required');
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  // Ensure department exists
  const department = await prisma.department.findUnique({ where: { id: Number(departmentId) } });
  if (!department) {
    const error = new ValidationError('Department not found');
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  const product = await prisma.product.create({
    data: {
      name,
      model,
      serialNumber: serialNumber || null,
      category,
      departmentId: Number(departmentId),
      warrantyMonths: Number(warrantyMonths) || 12,
    },
    include: { department: true },
  });

  const response: ApiResponse = {
    success: true,
    message: 'Product created successfully',
    data: { product },
  };

  res.status(201).json(response);
});

export default router;
