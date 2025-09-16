const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addTechnician() {
  const args = process.argv.slice(2);
  
  if (args.length < 6) {
    console.log('استخدام: node add-technician.js <اسم_المستخدم> <البريد_الإلكتروني> <كلمة_المرور> <الاسم_الأول> <اسم_العائلة> <رقم_القسم> [رقم_الهاتف]');
    console.log('مثال: node add-technician.js tech2 tech2@company.com tech123 محمد أحمد 1 0911234567');
    process.exit(1);
  }

  const [username, email, password, firstName, lastName, departmentId, phone] = args;

  try {
    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      console.error('❌ اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل');
      process.exit(1);
    }

    // التحقق من وجود القسم
    const department = await prisma.department.findUnique({
      where: { id: parseInt(departmentId) }
    });

    if (!department) {
      console.error('❌ القسم غير موجود');
      console.log('الأقسام المتاحة:');
      const departments = await prisma.department.findMany();
      departments.forEach(dept => {
        console.log(`  ${dept.id}: ${dept.name}`);
      });
      process.exit(1);
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 12);

    // إنشاء الفني
    const newTechnician = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        role: 'TECHNICIAN',
        departmentId: parseInt(departmentId),
        isActive: true,
      },
      include: {
        department: true,
      },
    });

    console.log('✅ تم إنشاء الفني بنجاح!');
    console.log('📋 تفاصيل الفني:');
    console.log(`   الاسم: ${newTechnician.firstName} ${newTechnician.lastName}`);
    console.log(`   اسم المستخدم: ${newTechnician.username}`);
    console.log(`   البريد الإلكتروني: ${newTechnician.email}`);
    console.log(`   الهاتف: ${newTechnician.phone || 'غير محدد'}`);
    console.log(`   القسم: ${newTechnician.department.name}`);
    console.log(`   الحالة: ${newTechnician.isActive ? 'نشط' : 'غير نشط'}`);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الفني:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTechnician();
