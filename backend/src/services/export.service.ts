import ExcelJS from 'exceljs';
import { prisma } from '../index';
import { RequestStatus, WarrantyStatus, ExecutionMethod } from '../types';

export class ExportService {
  
  static async exportAllRequests(): Promise<Buffer> {
    try {
      console.log('Fetching all requests from database...');
      const requests = await prisma.request.findMany({
        include: {
          customer: true,
          product: true,
          department: true,
          assignedTechnician: true,
          receivedBy: true,
          costs: true,
          activities: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`Found ${requests.length} requests to export`);
      return this.createRequestsExcel(requests, 'جميع الطلبات');
    } catch (error) {
      console.error('Error in exportAllRequests:', error);
      throw error;
    }
  }

  static async exportRequestsByStatus(status: RequestStatus): Promise<Buffer> {
    const requests = await prisma.request.findMany({
      where: { status },
      include: {
        customer: true,
        product: true,
        department: true,
        assignedTechnician: true,
        receivedBy: true,
        costs: true,
        activities: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const statusLabels = {
      'NEW': 'الطلبات الجديدة',
      'ASSIGNED': 'الطلبات المُعيّنة',
      'UNDER_INSPECTION': 'تحت الفحص',
      'WAITING_PARTS': 'في انتظار القطع',
      'IN_REPAIR': 'قيد الإصلاح',
      'COMPLETED': 'مكتملة',
      'CLOSED': 'مغلقة',
    };

    return this.createRequestsExcel(requests, statusLabels[status] || status);
  }

  static async exportOverdueRequests(): Promise<Buffer> {
    const requests = await prisma.request.findMany({
      where: { isOverdue: true },
      include: {
        customer: true,
        product: true,
        department: true,
        assignedTechnician: true,
        receivedBy: true,
        costs: true,
        activities: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.createRequestsExcel(requests, 'الطلبات المتأخرة');
  }

  static async exportRequestsByDepartment(departmentId: number): Promise<Buffer> {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    const requests = await prisma.request.findMany({
      where: { departmentId },
      include: {
        customer: true,
        product: true,
        department: true,
        assignedTechnician: true,
        receivedBy: true,
        costs: true,
        activities: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.createRequestsExcel(requests, `طلبات قسم ${department?.name || 'غير محدد'}`);
  }

  static async exportRequestsByWarrantyStatus(warrantyStatus: WarrantyStatus): Promise<Buffer> {
    const requests = await prisma.request.findMany({
      where: { warrantyStatus },
      include: {
        customer: true,
        product: true,
        department: true,
        assignedTechnician: true,
        receivedBy: true,
        costs: true,
        activities: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const warrantyLabels = {
      'UNDER_WARRANTY': 'الطلبات ضمن الكفالة',
      'OUT_OF_WARRANTY': 'الطلبات خارج الكفالة',
    };

    return this.createRequestsExcel(requests, warrantyLabels[warrantyStatus] || warrantyStatus);
  }

  private static async createRequestsExcel(requests: any[], sheetName: string): Promise<Buffer> {
    try {
      console.log(`Creating Excel file for ${requests.length} requests with sheet name: ${sheetName}`);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

    // تعيين اتجاه النص من اليمين إلى اليسار
    worksheet.views = [{ rightToLeft: true }];

    // إعداد الأعمدة
    worksheet.columns = [
      { header: 'رقم الطلب', key: 'requestNumber', width: 15 },
      { header: 'العميل', key: 'customerName', width: 20 },
      { header: 'الهاتف', key: 'customerPhone', width: 15 },
      { header: 'المنتج', key: 'productName', width: 20 },
      { header: 'الموديل', key: 'productModel', width: 15 },
      { header: 'القسم', key: 'departmentName', width: 15 },
      { header: 'الحالة', key: 'status', width: 15 },
      { header: 'حالة الكفالة', key: 'warrantyStatus', width: 15 },
      { header: 'طريقة التنفيذ', key: 'executionMethod', width: 15 },
      { header: 'الفني المُعيّن', key: 'assignedTechnician', width: 20 },
      { header: 'وصف المشكلة', key: 'issueDescription', width: 30 },
      { header: 'تاريخ الإنشاء', key: 'createdAt', width: 20 },
      { header: 'تاريخ الاستحقاق', key: 'slaDueDate', width: 20 },
      { header: 'متأخر؟', key: 'isOverdue', width: 10 },
      { header: 'التكلفة الإجمالية', key: 'totalCost', width: 15 },
      { header: 'رضا العميل', key: 'customerSatisfaction', width: 12 },
      { header: 'الملاحظات النهائية', key: 'finalNotes', width: 30 },
    ];

    // تنسيق رأس الجدول
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.font = { ...headerRow.font, color: { argb: 'FFFFFFFF' } };

    // إضافة البيانات
    const statusLabels = {
      'NEW': 'جديد',
      'ASSIGNED': 'مُعيّن',
      'UNDER_INSPECTION': 'تحت الفحص',
      'WAITING_PARTS': 'في انتظار القطع',
      'IN_REPAIR': 'قيد الإصلاح',
      'COMPLETED': 'مكتمل',
      'CLOSED': 'مغلق',
    };

    const warrantyLabels = {
      'UNDER_WARRANTY': 'ضمن الكفالة',
      'OUT_OF_WARRANTY': 'خارج الكفالة',
    };

    const executionLabels = {
      'ON_SITE': 'زيارة موقعية',
      'WORKSHOP': 'ورشة',
    };

    requests.forEach((request, index) => {
      const totalCost = request.costs.reduce((sum: number, cost: any) => sum + cost.amount, 0);
      
      const row = worksheet.addRow({
        requestNumber: request.requestNumber,
        customerName: request.customer.name,
        customerPhone: request.customer.phone,
        productName: request.product?.name || 'غير محدد',
        productModel: request.product?.model || 'غير محدد',
        departmentName: request.department.name,
        status: statusLabels[request.status as keyof typeof statusLabels] || request.status,
        warrantyStatus: warrantyLabels[request.warrantyStatus as keyof typeof warrantyLabels] || request.warrantyStatus,
        executionMethod: executionLabels[request.executionMethod as keyof typeof executionLabels] || request.executionMethod,
        assignedTechnician: request.assignedTechnician 
          ? `${request.assignedTechnician.firstName} ${request.assignedTechnician.lastName}`
          : 'غير مُعيّن',
        issueDescription: request.issueDescription,
        createdAt: new Date(request.createdAt).toLocaleString('ar-EG'),
        slaDueDate: request.slaDueDate ? new Date(request.slaDueDate).toLocaleString('ar-EG') : 'غير محدد',
        isOverdue: request.isOverdue ? 'نعم' : 'لا',
        totalCost: totalCost > 0 ? `${totalCost.toFixed(2)} ج.م` : 'مجاناً',
        customerSatisfaction: request.customerSatisfaction || 'غير مُقيّم',
        finalNotes: request.finalNotes || 'لا توجد ملاحظات',
      });

      // تلوين الصفوف المتأخرة
      if (request.isOverdue) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEAA7' }
        };
      }
    });

    // إضافة إحصائيات في نهاية الجدول
    worksheet.addRow([]);
    const statsStartRow = worksheet.rowCount + 1;
    
    // إحصائيات عامة
    worksheet.addRow(['إحصائيات عامة']);
    worksheet.getRow(worksheet.rowCount).font = { bold: true, size: 14 };
    
    worksheet.addRow(['إجمالي الطلبات:', requests.length]);
    worksheet.addRow(['الطلبات المتأخرة:', requests.filter(r => r.isOverdue).length]);
    worksheet.addRow(['الطلبات المكتملة:', requests.filter(r => r.status === 'COMPLETED' || r.status === 'CLOSED').length]);
    worksheet.addRow(['الطلبات ضمن الكفالة:', requests.filter(r => r.warrantyStatus === 'UNDER_WARRANTY').length]);
    worksheet.addRow(['الطلبات خارج الكفالة:', requests.filter(r => r.warrantyStatus === 'OUT_OF_WARRANTY').length]);

    // تنسيق الإحصائيات
    for (let i = statsStartRow; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' }
      };
    }

    // إضافة ورقة عمل للأنشطة
    if (requests.length > 0) {
      const activitiesSheet = workbook.addWorksheet('سجل الأنشطة');
      activitiesSheet.views = [{ rightToLeft: true }];
      
      activitiesSheet.columns = [
        { header: 'رقم الطلب', key: 'requestNumber', width: 15 },
        { header: 'نوع النشاط', key: 'activityType', width: 20 },
        { header: 'الوصف', key: 'description', width: 40 },
        { header: 'المستخدم', key: 'userName', width: 20 },
        { header: 'التاريخ', key: 'createdAt', width: 20 },
      ];

      // تنسيق رأس جدول الأنشطة
      const activitiesHeaderRow = activitiesSheet.getRow(1);
      activitiesHeaderRow.font = { bold: true, size: 12 };
      activitiesHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF70AD47' }
      };
      activitiesHeaderRow.font = { ...activitiesHeaderRow.font, color: { argb: 'FFFFFFFF' } };

      // إضافة بيانات الأنشطة
      requests.forEach(request => {
        request.activities.forEach((activity: any) => {
          activitiesSheet.addRow({
            requestNumber: request.requestNumber,
            activityType: this.getActivityTypeLabel(activity.activityType),
            description: activity.description,
            userName: `${activity.user.firstName} ${activity.user.lastName}`,
            createdAt: new Date(activity.createdAt).toLocaleString('ar-EG'),
          });
        });
      });
    }

      console.log('Generating Excel buffer...');
      return await workbook.xlsx.writeBuffer() as any;
    } catch (error) {
      console.error('Error creating Excel file:', error);
      throw error;
    }
  }

  private static getActivityTypeLabel(activityType: string): string {
    const labels = {
      'REQUEST_CREATED': 'إنشاء الطلب',
      'STATUS_CHANGED': 'تغيير الحالة',
      'TECHNICIAN_ASSIGNED': 'تعيين فني',
      'COST_ADDED': 'إضافة تكلفة',
      'REQUEST_CLOSED': 'إغلاق الطلب',
      'COMMENT_ADDED': 'إضافة تعليق',
    };
    return labels[activityType as keyof typeof labels] || activityType;
  }

  static async exportDashboardStats(): Promise<Buffer> {
    // إحصائيات شاملة للوحة التحكم
    const [
      totalRequests,
      overdueRequests,
      completedRequests,
      pendingRequests,
      underWarrantyRequests,
      outOfWarrantyRequests,
      departments,
      requestsByStatus,
      requestsByDepartment
    ] = await Promise.all([
      prisma.request.count(),
      prisma.request.count({ where: { isOverdue: true } }),
      prisma.request.count({ where: { status: { in: ['COMPLETED', 'CLOSED'] } } }),
      prisma.request.count({ where: { status: { notIn: ['COMPLETED', 'CLOSED'] } } }),
      prisma.request.count({ where: { warrantyStatus: 'UNDER_WARRANTY' } }),
      prisma.request.count({ where: { warrantyStatus: 'OUT_OF_WARRANTY' } }),
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.request.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.request.groupBy({
        by: ['departmentId'],
        _count: { departmentId: true }
      })
    ]);

    const workbook = new ExcelJS.Workbook();
    const statsSheet = workbook.addWorksheet('إحصائيات لوحة التحكم');
    statsSheet.views = [{ rightToLeft: true }];

    // الإحصائيات العامة
    statsSheet.columns = [
      { header: 'المؤشر', key: 'metric', width: 25 },
      { header: 'القيمة', key: 'value', width: 15 },
    ];

    const headerRow = statsSheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.font = { ...headerRow.font, color: { argb: 'FFFFFFFF' } };

    // إضافة الإحصائيات
    const stats = [
      { metric: 'إجمالي الطلبات', value: totalRequests },
      { metric: 'الطلبات المتأخرة', value: overdueRequests },
      { metric: 'الطلبات المكتملة', value: completedRequests },
      { metric: 'الطلبات المعلقة', value: pendingRequests },
      { metric: 'ضمن الكفالة', value: underWarrantyRequests },
      { metric: 'خارج الكفالة', value: outOfWarrantyRequests },
    ];

    stats.forEach(stat => {
      statsSheet.addRow(stat);
    });

    return await workbook.xlsx.writeBuffer() as any;
  }
}
