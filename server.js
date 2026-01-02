/**
 * نظام السحابة الذهبية (Golden Cloud) - 2026
 * المطور: أبو حمزة
 * الوصف: السيرفر الرئيسي للتحكم في المنشآت والمصفوفة الرقابية
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Manager = require('./models/Manager');

// 1. استيراد الروترات (جميع الأنظمة الفرعية)
const orgRouter = require('./routes/orgRouter');      // مصفوفة الرصد الذكي (Matrix)
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const licenseRouter = require('./routes/licenseRouter');
const healthRouter = require('./routes/healthRouter'); // نظام الشهادات الصحية المطور
const wageRouter = require('./routes/wageRouter');     // نظام الأجور والمراقبة المالية

const app = express();

// 2. الاتصال بقاعدة البيانات (MongoDB)
connectDB();

// 3. الإعدادات والوسائط (Middleware)
// الإعدادات والوسائط (Middleware) المحدثة لرفع سعة البيانات
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * --- [ مسار تسجيل الدخول الموحد ] ---
 * الصلاحية الخاصة لأبو حمزة ومدراء المواقع
 */
app.post('/api/unified-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.toLowerCase().trim() : "";

        // دخول السوبر أدمن (أبو حمزة) - Golden Matrix Access
        if (cleanEmail === "admin@golden.com" && password === "Golden2025@") {
            return res.json({ 
                success: true, 
                role: 'super-admin', 
                name: 'أبو حمزة' 
            });
        }

        // دخول مدراء المواقع والمنشآت بناءً على النطاق (Scope)
        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + cleanEmail + "$", "i") } 
        });

        if (manager && manager.password === password) {
            return res.json({ 
                success: true, 
                role: 'manager', 
                name: manager.name,
                scopeId: manager.scopeId 
            });
        }
        return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "خطأ فني في السيرفر" });
    }
});

/**
 * --- [ تفعيل المسارات - Routing Management ] ---
 * الترتيب هنا يضمن عدم تداخل الروابط وسرعة الاستجابة
 */

// أ) مسارات الأجور (يتعامل مع الروابط الرئيسية /api/submit-wage)
app.use('/', wageRouter); 

// ب) مسارات الموظفين والشهادات الصحية (الموارد البشرية)
app.use('/employee', employeeRoutes); 
app.use('/health', healthRouter);

// ج) مسارات المصفوفة الرقابية (لوحة أبو حمزة الموحدة)
// orgRouter هو المسؤول عن /admin/get-all-orgs
app.use('/admin', orgRouter); 
app.use('/admin', adminRoutes);

// د) مسارات التراخيص والعمليات الميدانية للمدراء
app.use('/manager/licenses', licenseRouter);
app.use('/manager', managerRoutes);

/**
 * --- [ المسارات الأساسية والنهايات ] ---
 */

// الصفحة الرئيسية (Login Page)
app.get('/', (req, res) => res.render('index'));
// أضف هذا المسار يدوياً في ملف app.js لضمان فتح الصفحة
app.get('/wage-entry', (req, res) => {
    res.render('wage-entry'); 
});

// تأكد أن هذا السطر يظل موجوداً كما هو لديك
app.use('/', wageRouter);
// معالجة الروابط غير الموجودة (Error 404)
app.use((req, res) => {
    res.status(404).render('404');
});

/**
 * --- [ تشغيل السيرفر ] ---
 */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('===========================================');
    console.log(`🚀 السيرفر يعمل بنجاح على المنفذ: ${PORT}`);
    console.log(`✅ تم ربط نظام الأجور (Wage System)`);
    console.log(`✅ تم ربط الرصد الصحي (Health HR)`);
    console.log(`📊 لوحة المصفوفة جاهزة للاستخدام: أبو حمزة`);
    console.log('===========================================');
});