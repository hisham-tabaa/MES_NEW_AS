import { Router } from 'express';
import { ExportService } from '../services/export.service';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { RequestStatus, WarrantyStatus, UserRole } from '../types';

const router = Router();

// تصدير جميع الطلبات
router.get('/requests/all', authenticateToken, requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER]), async (req, res, next) => {
  try {
    console.log('Starting export all requests...');
    const buffer = await ExportService.exportAllRequests();
    console.log('Export completed, buffer size:', buffer.length);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="all_requests.xlsx"');
    res.send(buffer);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data', details: error?.message || 'Unknown error' });
  }
});

// تصدير الطلبات حسب الحالة
router.get('/requests/status/:status', authenticateToken, requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER]), async (req, res, next) => {
  try {
    const { status } = req.params;
    const buffer = await ExportService.exportRequestsByStatus(status as RequestStatus);
    
    const statusFileNames = {
      'NEW': 'new_requests',
      'ASSIGNED': 'assigned_requests',
      'UNDER_INSPECTION': 'under_inspection',
      'WAITING_PARTS': 'waiting_parts',
      'IN_REPAIR': 'in_repair',
      'COMPLETED': 'completed_requests',
      'CLOSED': 'closed_requests',
    };
    
    const fileName = statusFileNames[status as keyof typeof statusFileNames] || status;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data', details: error?.message || 'Unknown error' });
  }
});

// تصدير الطلبات المتأخرة
router.get('/requests/overdue', authenticateToken, requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER]), async (req, res, next) => {
  try {
    const buffer = await ExportService.exportOverdueRequests();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="overdue_requests.xlsx"');
    res.send(buffer);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data', details: error?.message || 'Unknown error' });
  }
});

// تصدير الطلبات حسب القسم
router.get('/requests/department/:departmentId', authenticateToken, async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const buffer = await ExportService.exportRequestsByDepartment(parseInt(departmentId));
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="department_${departmentId}_requests.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data', details: error?.message || 'Unknown error' });
  }
});

// تصدير الطلبات حسب حالة الكفالة
router.get('/requests/warranty/:warrantyStatus', authenticateToken, requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER]), async (req, res, next) => {
  try {
    const { warrantyStatus } = req.params;
    const buffer = await ExportService.exportRequestsByWarrantyStatus(warrantyStatus as WarrantyStatus);
    
    const warrantyFileNames = {
      'UNDER_WARRANTY': 'under_warranty',
      'OUT_OF_WARRANTY': 'out_of_warranty',
    };
    
    const fileName = warrantyFileNames[warrantyStatus as keyof typeof warrantyFileNames] || warrantyStatus;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data', details: error?.message || 'Unknown error' });
  }
});

// تصدير إحصائيات لوحة التحكم
router.get('/dashboard/stats', authenticateToken, requireRoles([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER]), async (req, res, next) => {
  try {
    const buffer = await ExportService.exportDashboardStats();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="dashboard_stats.xlsx"');
    res.send(buffer);
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data', details: error?.message || 'Unknown error' });
  }
});

export { router as exportRoutes };
