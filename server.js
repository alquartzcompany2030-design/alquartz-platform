/**
 * نظام السحابة الذهبية (Golden Cloud) - 2026
 * المطور والمسؤول: أبو حمزة
 * الوصف: السيرفر الرئيسي الموحد - يجمع بين مصفوفة الرصد، الأجور، والتوثيق الرقمي
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

// استيراد الموديلات
const Manager = require('./models/Manager');

// 1. استيراد جميع الروترات (القديمة والجديدة)
const adminRoutes = require('./routes/adminRoutes');     // لوحة السوبر أدمن الأساسية
const orgRouter = require('./routes/orgRouter');         // مصفوفة الرصد الذكي (Matrix)
const managerRoutes = require('./routes/managerRoutes'); // لوحة تحكم المدراء
const employeeRoutes = require('./routes/employeeRoutes'); // إدارة الموظفين
const wageRouter = require('./routes/wageRouter');       // نظام الأجور والمراقبة المالية
const healthRouter = require('./routes/healthRouter');   // الشهادات الصحية والموارد البشرية
const licenseRouter = require('./routes/licenseRouter'); // التراخيص والعمليات الميدانية
const clearanceRouter = require('./routes/clearanceRouter'); // نظام التوثيق الرقمي والأرشيف (الجديد)
const contractRoutes = require('./routes/contractRoutes');
const app = express();

// 2. الاتصال بقاعدة البيانات
connectDB();

// 3. الإعدادات والوسائط (Middleware)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * --- [ نظام التوثيق الرقمي والأرشيف ] ---
 * ربط نظام التوثيق ليعمل ببادئة وبدونها لضمان عمل روابط الموظفين المباشرة
 */
app.use('/clearance-system', clearanceRouter); 
app.use('/', clearanceRouter); 

/**
 * --- [ نظام الإدارة والمصفوفة الرقابية ] ---
 * دمج مسارات الإدارة القديمة والجديدة
 */
app.use('/admin', orgRouter);   // للتعامل مع /admin/get-all-orgs (Matrix)
app.use('/admin', adminRoutes); // للتعامل مع /admin/dashboard و /admin/matrix

/**
 * --- [ مسارات المدراء والعمليات ] ---
 */
app.use('/manager/licenses', licenseRouter);
app.use('/manager', managerRoutes);
app.use('/manager', wageRouter);
app.use('/employee', employeeRoutes);
app.use('/health', healthRouter);

/**
 * --- [ مسارات الوصول المباشر ] ---
 */
app.use('/', wageRouter); // لتمكين /wage-entry المباشر
app.use('/', contractRoutes);
app.use('/uploads', express.static('public/uploads'));
/**
 * --- [ تسجيل الدخول الموحد ] ---
 */
app.post('/api/unified-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.toLowerCase().trim() : "";

        // دخول السوبر أدمن (أبو حمزة)
        if (cleanEmail === "admin@golden.com" && password === "Golden2025@") {
            return res.json({ 
                success: true, 
                role: 'super-admin', 
                name: 'أبو حمزة',
                dashboardUrl: '/admin/dashboard'
            });
        }

        // دخول مدراء المنشآت
        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + cleanEmail + "$", "i") } 
        });

        if (manager && manager.password === password) {
            return res.json({ 
                success: true, 
                role: 'manager', 
                name: manager.name,
                scopeId: manager.scopeId,
                dashboardUrl: `/manager/dashboard?scope=${manager.scopeId}`
            });
        }
        return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "خطأ فني في السيرفر" });
    }
});

/**
 * --- [ المسارات الأساسية ] ---
 */
app.get('/', (req, res) => res.render('index'));
app.get('/wage-entry', (req, res) => res.render('wage-entry'));

// معالجة الصفحات غير الموجودة (404) - يجب أن تكون في النهاية دائماً
app.use((req, res) => {
    res.status(404).render('404');
});

/**
 * --- [ تشغيل السيرفر ] ---
 */
const PORT = process.env.PORT || 10000; // استخدمنا منفذ رندر الافتراضي
app.listen(PORT, () => {
    console.log('===========================================');
    console.log(`🚀 السيرفر يعمل بنجاح على المنفذ: ${PORT}`);
    console.log(`⚖️  نظام حماية الأجور (أبو حمزة): نشط`);
    console.log(`📊 مصفوفة الرصد (Matrix): مرتبطة وجاهزة`);
    console.log(`📂 أرشيف التوثيق الرقمي: مفعل`);
    console.log('===========================================');
});