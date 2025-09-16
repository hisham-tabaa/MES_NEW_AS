import { Router } from 'express';

const router = Router();

/**
 * @route   GET /api/reports
 * @desc    Get various reports
 * @access  Private
 */
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reports endpoint - to be implemented' });
});

export default router;
