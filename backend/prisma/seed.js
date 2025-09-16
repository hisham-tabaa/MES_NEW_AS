"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const types_1 = require("../src/types");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('Creating departments...');
    const departments = await Promise.all([
        prisma.department.create({
            data: {
                name: 'LG Maintenance',
                description: 'TVs, refrigerators, washing machines, dishwashers, ACs, others',
            },
        }),
        prisma.department.create({
            data: {
                name: 'Solar Energy',
                description: 'Solar panels and energy systems',
            },
        }),
        prisma.department.create({
            data: {
                name: 'TP-Link',
                description: 'Networking equipment and routers',
            },
        }),
        prisma.department.create({
            data: {
                name: 'Epson',
                description: 'Printers and printing solutions',
            },
        }),
    ]);
    console.log(`✅ Created ${departments.length} departments`);
    console.log('Creating users...');
    const saltRounds = 12;
    const users = await Promise.all([
        prisma.user.create({
            data: {
                username: 'admin',
                email: 'admin@company.com',
                passwordHash: await bcryptjs_1.default.hash('admin123', saltRounds),
                firstName: 'Ahmed',
                lastName: 'Hassan',
                phone: '+963911234567',
                role: types_1.UserRole.COMPANY_MANAGER,
            },
        }),
        prisma.user.create({
            data: {
                username: 'deputy',
                email: 'deputy@company.com',
                passwordHash: await bcryptjs_1.default.hash('deputy123', saltRounds),
                firstName: 'Fatma',
                lastName: 'Ali',
                phone: '+963911234568',
                role: types_1.UserRole.DEPUTY_MANAGER,
            },
        }),
        prisma.user.create({
            data: {
                username: 'lg_manager',
                email: 'lg.manager@company.com',
                passwordHash: await bcryptjs_1.default.hash('manager123', saltRounds),
                firstName: 'Mohamed',
                lastName: 'Mahmoud',
                phone: '+963911234569',
                role: types_1.UserRole.DEPARTMENT_MANAGER,
                departmentId: departments[0].id,
            },
        }),
        prisma.user.create({
            data: {
                username: 'solar_manager',
                email: 'solar.manager@company.com',
                passwordHash: await bcryptjs_1.default.hash('manager123', saltRounds),
                firstName: 'Sara',
                lastName: 'Ahmed',
                phone: '+963911234570',
                role: types_1.UserRole.DEPARTMENT_MANAGER,
                departmentId: departments[1].id,
            },
        }),
        prisma.user.create({
            data: {
                username: 'lg_supervisor',
                email: 'lg.supervisor@company.com',
                passwordHash: await bcryptjs_1.default.hash('supervisor123', saltRounds),
                firstName: 'Omar',
                lastName: 'Khalil',
                phone: '+963911234571',
                role: types_1.UserRole.SECTION_SUPERVISOR,
                departmentId: departments[0].id,
            },
        }),
        prisma.user.create({
            data: {
                username: 'tplink_supervisor',
                email: 'tplink.supervisor@company.com',
                passwordHash: await bcryptjs_1.default.hash('supervisor123', saltRounds),
                firstName: 'Nour',
                lastName: 'Ibrahim',
                phone: '+963911234572',
                role: types_1.UserRole.SECTION_SUPERVISOR,
                departmentId: departments[2].id,
            },
        }),
        prisma.user.create({
            data: {
                username: 'tech1',
                email: 'tech1@company.com',
                passwordHash: await bcryptjs_1.default.hash('tech123', saltRounds),
                firstName: 'Youssef',
                lastName: 'Mansour',
                phone: '+963911234573',
                role: types_1.UserRole.TECHNICIAN,
                departmentId: departments[0].id,
            },
        }),
        prisma.user.create({
            data: {
                username: 'tech2',
                email: 'tech2@company.com',
                passwordHash: await bcryptjs_1.default.hash('tech123', saltRounds),
                firstName: 'Menna',
                lastName: 'Farouk',
                phone: '+963911234574',
                role: types_1.UserRole.TECHNICIAN,
                departmentId: departments[1].id,
            },
        }),
        prisma.user.create({
            data: {
                username: 'tech3',
                email: 'tech3@company.com',
                passwordHash: await bcryptjs_1.default.hash('tech123', saltRounds),
                firstName: 'Kareem',
                lastName: 'Mostafa',
                phone: '+963911234575',
                role: types_1.UserRole.TECHNICIAN,
                departmentId: departments[2].id,
            },
        }),
        prisma.user.create({
            data: {
                username: 'tech4',
                email: 'tech4@company.com',
                passwordHash: await bcryptjs_1.default.hash('tech123', saltRounds),
                firstName: 'Heba',
                lastName: 'Salah',
                phone: '+963911234576',
                role: types_1.UserRole.TECHNICIAN,
                departmentId: departments[3].id,
            },
        }),
    ]);
    await Promise.all([
        prisma.department.update({
            where: { id: departments[0].id },
            data: { managerId: users[2].id },
        }),
        prisma.department.update({
            where: { id: departments[1].id },
            data: { managerId: users[3].id },
        }),
    ]);
    console.log(`✅ Created ${users.length} users`);
    console.log('Creating customers...');
    const customers = await Promise.all([
        prisma.customer.create({
            data: {
                name: 'أحمد محمد علي',
                phone: '+201123456789',
                email: 'ahmed.mohamed@email.com',
                address: '123 شارع النيل، المعادي، القاهرة',
                city: 'القاهرة',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'فاطمة حسن محمود',
                phone: '+963911234567',
                email: 'fatma.hassan@email.com',
                address: '456 شارع الجمهورية، الأسكندرية',
                city: 'الأسكندرية',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'محمد عبدالله إبراهيم',
                phone: '+201345678901',
                address: '789 شارع التحرير، الجيزة',
                city: 'الجيزة',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'سارة أحمد خالد',
                phone: '+201456789012',
                email: 'sara.ahmed@email.com',
                address: '321 شارع الهرم، الجيزة',
                city: 'الجيزة',
            },
        }),
        prisma.customer.create({
            data: {
                name: 'عمر محمد فاروق',
                phone: '+201567890123',
                address: '654 شارع الجلاء، الأقصر',
                city: 'الأقصر',
            },
        }),
    ]);
    console.log(`✅ Created ${customers.length} customers`);
    console.log('Creating products...');
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'LG Smart TV',
                model: 'LG-55UN7300',
                serialNumber: 'LG55UN7300001',
                category: 'Television',
                departmentId: departments[0].id,
                warrantyMonths: 24,
            },
        }),
        prisma.product.create({
            data: {
                name: 'LG Refrigerator',
                model: 'LG-GR-X257CSAV',
                serialNumber: 'LGGR257001',
                category: 'Refrigerator',
                departmentId: departments[0].id,
                warrantyMonths: 36,
            },
        }),
        prisma.product.create({
            data: {
                name: 'LG Washing Machine',
                model: 'LG-F4J5TN7S',
                serialNumber: 'LGF4J5TN001',
                category: 'Washing Machine',
                departmentId: departments[0].id,
                warrantyMonths: 24,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Solar Panel System',
                model: 'SP-5000W',
                serialNumber: 'SP5000W001',
                category: 'Solar Panel',
                departmentId: departments[1].id,
                warrantyMonths: 120,
            },
        }),
        prisma.product.create({
            data: {
                name: 'TP-Link Archer Router',
                model: 'Archer-AX73',
                serialNumber: 'TPAX73001',
                category: 'Router',
                departmentId: departments[2].id,
                warrantyMonths: 36,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Epson EcoTank Printer',
                model: 'ET-2850',
                serialNumber: 'EPET2850001',
                category: 'Printer',
                departmentId: departments[3].id,
                warrantyMonths: 24,
            },
        }),
    ]);
    console.log(`✅ Created ${products.length} products`);
    console.log('Creating sample requests...');
    const now = new Date();
    const requests = [];
    for (let i = 1; i <= 15; i++) {
        const createdAt = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const customerId = customers[i % customers.length].id;
        const productId = products[i % products.length].id;
        const receivedById = users[0].id;
        const warrantyStatus = i % 3 === 0 ? types_1.WarrantyStatus.OUT_OF_WARRANTY : types_1.WarrantyStatus.UNDER_WARRANTY;
        const executionMethod = i % 4 === 0 ? types_1.ExecutionMethod.ON_SITE : types_1.ExecutionMethod.WORKSHOP;
        const hours = warrantyStatus === types_1.WarrantyStatus.UNDER_WARRANTY ? 168 : 240;
        const bufferHours = executionMethod === types_1.ExecutionMethod.ON_SITE ? 48 : 0;
        const slaDueDate = new Date(createdAt.getTime() + ((hours + bufferHours) * 60 * 60 * 1000));
        let status = types_1.RequestStatus.NEW;
        let assignedTechnicianId = null;
        let assignedAt = null;
        let completedAt = null;
        if (i <= 5) {
            status = types_1.RequestStatus.COMPLETED;
            assignedTechnicianId = users[6 + (i % 4)].id;
            assignedAt = new Date(createdAt.getTime() + (2 * 60 * 60 * 1000));
            completedAt = new Date(createdAt.getTime() + (48 * 60 * 60 * 1000));
        }
        else if (i <= 10) {
            status = [types_1.RequestStatus.ASSIGNED, types_1.RequestStatus.UNDER_INSPECTION, types_1.RequestStatus.IN_REPAIR][i % 3];
            assignedTechnicianId = users[6 + (i % 4)].id;
            assignedAt = new Date(createdAt.getTime() + (2 * 60 * 60 * 1000));
        }
        const requestNumber = `REQ24${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(i).padStart(3, '0')}`;
        const request = await prisma.request.create({
            data: {
                requestNumber,
                customerId,
                productId,
                departmentId: products.find(p => p.id === productId)?.departmentId || departments[0].id,
                receivedById,
                assignedTechnicianId,
                issueDescription: [
                    'Device not turning on, no power indicator visible',
                    'Making strange noises during operation',
                    'Display shows error codes intermittently',
                    'Performance degraded, operating very slowly',
                    'Overheating issues, auto-shutdown occurring',
                    'Network connectivity problems',
                    'Software malfunction, freezing frequently',
                    'Physical damage to external components',
                    'Battery not holding charge properly',
                    'Installation support and configuration needed',
                    'Regular maintenance and cleaning service',
                    'Upgrade and optimization requirements',
                    'Training needed for proper operation',
                    'Replacement parts installation required',
                    'Quality inspection and performance testing'
                ][i - 1] || 'General maintenance and repair needed',
                executionMethod,
                warrantyStatus,
                purchaseDate: new Date(createdAt.getTime() - (365 * 24 * 60 * 60 * 1000)),
                status,
                slaDueDate,
                isOverdue: slaDueDate < now && status !== types_1.RequestStatus.COMPLETED && status !== types_1.RequestStatus.CLOSED,
                createdAt,
                assignedAt,
                completedAt,
            },
        });
        requests.push(request);
    }
    console.log(`✅ Created ${requests.length} sample requests`);
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Seed Data Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏢 Departments: ${departments.length}`);
    console.log(`   👤 Customers: ${customers.length}`);
    console.log(`   📦 Products: ${products.length}`);
    console.log(`   📋 Requests: ${requests.length}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Company Manager: admin / admin123');
    console.log('   Deputy Manager: deputy / deputy123');
    console.log('   LG Manager: lg_manager / manager123');
    console.log('   Solar Manager: solar_manager / manager123');
    console.log('   LG Supervisor: lg_supervisor / supervisor123');
    console.log('   TP-Link Supervisor: tplink_supervisor / supervisor123');
    console.log('   Technician 1: tech1 / tech123');
    console.log('   Technician 2: tech2 / tech123');
    console.log('   Technician 3: tech3 / tech123');
    console.log('   Technician 4: tech4 / tech123');
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map