# دليل رفع المشروع على Railway 🚀

## 🎯 **الخيارات المتاحة:**

لديك **3 خيارات** لرفع المشروع على Railway:

### **1️⃣ الخيار الأول: مشروع واحد (الأسهل) ⭐**
- رفع Frontend + Backend كخدمة واحدة
- استخدام SQLite كقاعدة بيانات
- **مناسب للتجربة والمشاريع الصغيرة**

### **2️⃣ الخيار الثاني: خدمتين منفصلتين**
- خدمة للـ Backend
- خدمة للـ Frontend
- استخدام PostgreSQL من Railway
- **مناسب للإنتاج**

### **3️⃣ الخيار الثالث: ثلاث خدمات منفصلة**
- خدمة للـ Backend
- خدمة للـ Frontend  
- خدمة منفصلة لقاعدة البيانات PostgreSQL
- **الأكثر مرونة وقابلية للتوسع**

---

## 🚀 **الخيار الأول: مشروع واحد (الموصى به للبداية)**

### **الخطوات:**

#### **1. تحضير المشروع:**
```bash
# إنشاء ملف package.json في الجذر
cat > package.json << 'EOF'
{
  "name": "after-sales-system",
  "version": "1.0.0",
  "scripts": {
    "build": "cd frontend && npm install && npm run build && cd ../backend && npm install",
    "start": "cd backend && npm start",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start"
  },
  "dependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF
```

#### **2. إنشاء ملف Railway:**
```bash
# إنشاء railway.json
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

#### **3. تحديث backend/package.json:**
```bash
# إضافة script للإنتاج
cd backend
npm pkg set scripts.start="node dist/index.js"
npm pkg set scripts.build="tsc"
```

#### **4. إنشاء Dockerfile (اختياري):**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy root package.json
COPY package*.json ./
RUN npm install

# Copy and build frontend
COPY frontend/ ./frontend/
RUN cd frontend && npm install && npm run build

# Copy and build backend
COPY backend/ ./backend/
RUN cd backend && npm install && npm run build

# Copy database
RUN cp backend/prisma/dev.db backend/dist/ || true

EXPOSE 3001

CMD ["npm", "start"]
```

#### **5. الرفع على Railway:**
```bash
# 1. إنشاء حساب على Railway.app
# 2. ربط GitHub repo
# 3. إنشاء مشروع جديد
# 4. اختيار GitHub repo
# 5. Railway سيرفع المشروع تلقائياً
```

---

## 🏗️ **الخيار الثاني: خدمتين منفصلتين (الأفضل للإنتاج)**

### **الخطوات:**

#### **1. إنشاء قاعدة بيانات PostgreSQL:**
```bash
# في Railway Dashboard:
# 1. New Project
# 2. Add PostgreSQL
# 3. نسخ CONNECTION_URL
```

#### **2. تحديث Backend للـ PostgreSQL:**
```bash
# تحديث backend/.env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

#### **3. تحديث schema.prisma:**
```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // تغيير من sqlite
  url      = env("DATABASE_URL")
}
```

#### **4. رفع Backend:**
```bash
# في Railway:
# 1. New Service
# 2. GitHub Repo
# 3. اختيار مجلد backend/
# 4. إضافة متغيرات البيئة:
#    - DATABASE_URL
#    - JWT_SECRET
#    - JWT_REFRESH_SECRET
```

#### **5. رفع Frontend:**
```bash
# في Railway:
# 1. New Service في نفس المشروع
# 2. GitHub Repo
# 3. اختيار مجلد frontend/
# 4. إضافة متغير:
#    - REACT_APP_API_URL=https://your-backend-url.railway.app
```

---

## 🎛️ **الخيار الثالث: ثلاث خدمات منفصلة**

### **الخطوات:**

#### **1. إنشاء PostgreSQL Service:**
```bash
# في Railway Dashboard:
# Add PostgreSQL Service
```

#### **2. إنشاء Backend Service:**
```bash
# Add GitHub Service
# Root Directory: /backend
# Build Command: npm run build
# Start Command: npm start
```

#### **3. إنشاء Frontend Service:**
```bash
# Add GitHub Service  
# Root Directory: /frontend
# Build Command: npm run build
# Start Command: serve -s build
```

---

## ⚙️ **متغيرات البيئة المطلوبة:**

### **للـ Backend:**
```env
# قاعدة البيانات
DATABASE_URL=postgresql://user:pass@host:port/db

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key

# الخادم
PORT=3001
NODE_ENV=production

# معدل الطلبات
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS
CORS_ORIGIN=https://your-frontend-url.railway.app
```

### **للـ Frontend:**
```env
# API
REACT_APP_API_URL=https://your-backend-url.railway.app

# إعدادات الإنتاج
GENERATE_SOURCEMAP=false
```

---

## 📁 **هيكل المشروع للرفع:**

### **الخيار الأول (مشروع واحد):**
```
project-root/
├── package.json          # ملف الجذر
├── railway.json          # إعدادات Railway
├── Dockerfile           # اختياري
├── frontend/            # مجلد الواجهة
│   ├── package.json
│   ├── src/
│   └── public/
└── backend/             # مجلد الخادم
    ├── package.json
    ├── src/
    ├── prisma/
    └── dist/           # بعد البناء
```

### **الخيار الثاني/الثالث:**
```
project-root/
├── frontend/           # خدمة منفصلة
│   ├── package.json
│   ├── railway.json   # إعدادات Frontend
│   └── src/
└── backend/           # خدمة منفصلة  
    ├── package.json
    ├── railway.json   # إعدادات Backend
    ├── src/
    └── prisma/
```

---

## 🔧 **إعدادات خاصة لـ Railway:**

### **ملف nixpacks.toml للـ Backend:**
```toml
# backend/nixpacks.toml
[phases.build]
cmds = ["npm install", "npx prisma generate", "npm run build"]

[phases.deploy]
cmds = ["npx prisma db push", "npm start"]

[variables]
NODE_ENV = "production"
```

### **ملف nixpacks.toml للـ Frontend:**
```toml
# frontend/nixpacks.toml
[phases.build]
cmds = ["npm install", "npm run build"]

[phases.deploy]
cmds = ["npx serve -s build -l 3000"]

[variables]
NODE_ENV = "production"
```

---

## 🗄️ **إعداد قاعدة البيانات:**

### **تحويل من SQLite إلى PostgreSQL:**
```bash
# 1. تحديث schema.prisma
# 2. تشغيل Migration
npx prisma migrate dev --name init

# 3. إنشاء البيانات الأولية
npx prisma db seed
```

### **نسخ البيانات (إذا كانت موجودة):**
```bash
# تصدير من SQLite
sqlite3 dev.db .dump > data.sql

# استيراد للـ PostgreSQL (يحتاج تعديل)
# تحويل صيغة SQL حسب PostgreSQL
```

---

## 📋 **خطوات الرفع التفصيلية:**

### **1. تحضير الكود:**
```bash
# تنظيف المشروع
rm -rf node_modules
rm -rf frontend/node_modules  
rm -rf backend/node_modules
rm -rf backend/dist

# التأكد من .gitignore
echo "node_modules/
dist/
.env
*.log" > .gitignore
```

### **2. رفع على GitHub:**
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### **3. إنشاء مشروع Railway:**
1. اذهب لـ [Railway.app](https://railway.app)
2. **"New Project"**
3. **"Deploy from GitHub repo"**
4. اختر المستودع
5. اختر الفرع (main)

### **4. إعداد الخدمات:**
```bash
# إضافة PostgreSQL
Add Service → PostgreSQL

# إعداد متغيرات البيئة
Variables → Add Variable

# ربط النطاق (اختياري)
Settings → Custom Domain
```

---

## 🎯 **التوصية:**

### **للمبتدئين:**
- ابدأ بـ **الخيار الأول** (مشروع واحد)
- استخدم SQLite للبداية
- سهل الإعداد والإدارة

### **للإنتاج:**
- استخدم **الخيار الثاني** (خدمتين)
- PostgreSQL لقاعدة البيانات
- أفضل أداء وموثوقية

### **للمشاريع الكبيرة:**
- استخدم **الخيار الثالث** (ثلاث خدمات)
- مرونة كاملة في التحكم
- قابلية توسع عالية

---

## 💰 **التكلفة:**

### **Railway Pricing:**
- **Hobby Plan**: $5/شهر - مناسب للتجربة
- **Pro Plan**: $20/شهر - للإنتاج
- **استهلاك الموارد**: حسب الاستخدام

### **تقدير التكلفة:**
- **مشروع واحد**: ~$5-10/شهر
- **خدمتين**: ~$10-15/شهر  
- **ثلاث خدمات**: ~$15-25/شهر

---

## 🔍 **مراقبة وصيانة:**

### **السجلات:**
```bash
# عرض السجلات
railway logs

# متابعة السجلات الحية
railway logs --follow
```

### **قاعدة البيانات:**
```bash
# الاتصال بقاعدة البيانات
railway connect postgresql

# تشغيل migrations
railway run npx prisma migrate deploy
```

---

## 🆘 **حل المشاكل الشائعة:**

### **مشكلة البناء:**
```bash
# تحقق من logs
railway logs --service backend

# تأكد من package.json
# تأكد من متغيرات البيئة
```

### **مشكلة قاعدة البيانات:**
```bash
# تحقق من DATABASE_URL
# تشغيل prisma generate
# تشغيل migrations
```

### **مشكلة CORS:**
```bash
# تحديث CORS_ORIGIN في Backend
# التأكد من رابط Frontend الصحيح
```

---

## 🎉 **النتيجة النهائية:**

بعد الرفع الناجح ستحصل على:
- ✅ **رابط للواجهة**: `https://your-app.railway.app`
- ✅ **رابط للـ API**: `https://your-api.railway.app`
- ✅ **قاعدة بيانات موثوقة**
- ✅ **نسخ احتياطية تلقائية**
- ✅ **مراقبة الأداء**

**أي خيار تفضل أن نبدأ به؟** 🤔
