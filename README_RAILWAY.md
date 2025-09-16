# After-Sales Service Management System 🚀

نظام إدارة خدمات ما بعد البيع - مبني بـ React و Node.js مع دعم العملات المتعددة (الليرة السورية والدولار الأمريكي).

## ⚡ نشر سريع على Railway

### الطريقة الأولى: مشروع واحد (موصى به)

1. **Fork أو Clone المشروع**
2. **اذهب لـ [Railway.app](https://railway.app)**
3. **New Project** → **Deploy from GitHub repo**
4. **اختر هذا المستودع**
5. **أضف متغيرات البيئة:**

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-chars
CORS_ORIGIN=https://your-app.railway.app
DATABASE_URL=file:./dev.db
```

6. **انتظر البناء والنشر** ✅

### الطريقة الثانية: مع PostgreSQL

1. **أضف PostgreSQL Service** في Railway
2. **انسخ DATABASE_URL**
3. **أضف متغيرات البيئة:**

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-chars
CORS_ORIGIN=https://your-app.railway.app
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
```

## 🎯 الميزات

- ✅ **إدارة الطلبات** - من الإنشاء للإغلاق
- ✅ **إدارة المستخدمين** - 5 أدوار مختلفة
- ✅ **العملات المتعددة** - ليرة سورية ودولار أمريكي
- ✅ **التقارير** - تصدير Excel
- ✅ **الإشعارات** - تتبع الأنشطة
- ✅ **SLA Monitoring** - مراقبة المواعيد
- ✅ **واجهة عربية** - RTL Support

## 👥 المستخدمون الافتراضيون

| الدور | المستخدم | كلمة المرور |
|-------|----------|------------|
| مدير الشركة | `admin` | `[مخفي للأمان]` |
| نائب المدير | `deputy` | `[مخفي للأمان]` |
| مدير قسم | `lg_manager` | `[مخفي للأمان]` |
| مشرف قسم | `lg_supervisor` | `[مخفي للأمان]` |
| فني | `tech1` | `[مخفي للأمان]` |

> **ملاحظة**: تم إخفاء كلمات المرور للأمان. اتصل بالمدير للحصول على بيانات الدخول.

## 🛠️ التكنولوجيا

### Frontend
- **React 18** + TypeScript
- **TailwindCSS** للتصميم
- **React Router** للتنقل
- **Axios** للـ API calls

### Backend
- **Node.js** + Express
- **TypeScript** للأمان
- **Prisma ORM** لقاعدة البيانات
- **JWT** للمصادقة
- **Winston** للسجلات

### قاعدة البيانات
- **SQLite** (افتراضي)
- **PostgreSQL** (للإنتاج)

## 📱 العملات المدعومة

### الليرة السورية (SYP)
- الرمز: `ل.س`
- التنسيق: `50,000 ل.س`

### الدولار الأمريكي (USD)
- الرمز: `$`
- التنسيق: `$1,234.56`

## 🔧 التطوير المحلي

```bash
# استنساخ المشروع
git clone <repo-url>
cd after-sales-system

# تثبيت التبعيات
npm install
cd frontend && npm install
cd ../backend && npm install

# إعداد قاعدة البيانات
cd backend
cp env.example .env
npx prisma db push
npx prisma db seed

# تشغيل المشروع
cd ..
npm run dev
```

## 🌍 المتغيرات البيئية

### مطلوبة للإنتاج:
```env
NODE_ENV=production
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret
DATABASE_URL=your-database-url
CORS_ORIGIN=your-frontend-url
```

### اختيارية:
```env
PORT=3001
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000
LOG_LEVEL=info
```

## 📊 الهيكل

```
project/
├── frontend/          # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── prisma/
├── package.json       # Root package
└── nixpacks.toml      # Railway config
```

## 🚀 بعد النشر

1. **سجل دخول بحساب admin**
2. **أضف الأقسام والمستخدمين**
3. **ابدأ بإنشاء الطلبات**
4. **اختبر التقارير والتصدير**

## 📞 الدعم

- **الوثائق**: متوفرة في مجلد المشروع
- **GitHub Issues**: للمشاكل التقنية
- **العملات**: دعم الليرة السورية والدولار

---

**🎉 مرحباً بك في نظام إدارة خدمات ما بعد البيع!**
