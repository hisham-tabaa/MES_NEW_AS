const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const roleLabels = {
  COMPANY_MANAGER: 'مدير الشركة',
  DEPUTY_MANAGER: 'نائب المدير',
  DEPARTMENT_MANAGER: 'مدير قسم',
  SECTION_SUPERVISOR: 'مشرف قسم',
  TECHNICIAN: 'فني',
};

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true,
      },
      orderBy: [
        { role: 'asc' },
        { firstName: 'asc' },
      ],
    });

    if (users.length === 0) {
      console.log('لا يوجد مستخدمون في النظام');
      return;
    }

    console.log(`📋 إجمالي المستخدمين: ${users.length}\n`);
    
    // تجميع المستخدمين حسب الدور
    const usersByRole = {};
    users.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });

    // عرض المستخدمين حسب الدور
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`\n👥 ${roleLabels[role]} (${roleUsers.length}):`);
      console.log('─'.repeat(50));
      
      roleUsers.forEach((user, index) => {
        const status = user.isActive ? '🟢' : '🔴';
        const department = user.department ? user.department.name : 'بدون قسم';
        
        console.log(`${index + 1}. ${status} ${user.firstName} ${user.lastName}`);
        console.log(`   اسم المستخدم: ${user.username}`);
        console.log(`   البريد: ${user.email}`);
        console.log(`   الهاتف: ${user.phone || 'غير محدد'}`);
        console.log(`   القسم: ${department}`);
        console.log(`   الحالة: ${user.isActive ? 'نشط' : 'غير نشط'}`);
        if (index < roleUsers.length - 1) console.log('');
      });
    });

    // إحصائيات سريعة
    console.log('\n📊 الإحصائيات:');
    console.log('─'.repeat(30));
    
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    
    console.log(`المستخدمون النشطون: ${activeUsers}`);
    console.log(`المستخدمون غير النشطون: ${inactiveUsers}`);
    
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`${roleLabels[role]}: ${roleUsers.length}`);
    });

  } catch (error) {
    console.error('❌ خطأ في جلب المستخدمين:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
