require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');

// استيراد الروترات
const panelRouter = require('./routes/panelRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const orgRouter = require('./routes/orgRouter'); 
const managerRoutes = require('./routes/managerRoutes'); 
const employeeRoutes = require('./routes/employeeRoutes'); 
const wageRouter = require('./routes/wageRouter'); 
const healthRouter = require('./routes/healthRouter'); 
const licenseRouter = require('./routes/licenseRouter'); 
const clearanceRouter = require('./routes/clearanceRouter'); 
const contractRoutes = require('./routes/contractRoutes');
const financeRoutes = require('./routes/financeRoutes');

const Manager = require('./models/Manager');

const app = express();

// 1. الاتصال بقاعدة البيانات
connectDB();

// 2. الإعدادات والوسائط (Middleware)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- [ نظام الجلسات ] ---
app.use(session({
    secret: 'Golden-Cloud-Secret-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('public/uploads'));

// 3. تفعيل الروترات

// لوحة التحكم الأم
app.use('/panel', panelRouter); 

// إعدادات المدير والتراخيص
app.use('/manager/licenses', licenseRouter);
app.use('/manager', managerRoutes);

// --- [ إصلاح مسار الرواتب المحوري ] ---
// تم ربطه بـ /manager لأن المتصفح يطلب /manager/api/submit-wage
app.use('/manager', wageRouter); 
// إبقاء الربط العام كاحتياط للمسارات الأخرى داخل الروتر
app.use('/', wageRouter); 

app.use('/employee', employeeRoutes);
app.use('/health', healthRouter);
app.use('/admin', orgRouter);
app.use('/admin', adminRoutes);
app.use('/clearance-system', clearanceRouter); 
app.use('/', contractRoutes); 
app.use('/finance', financeRoutes);

/**
 * --- [ تسجيل الدخول الموحد ] ---
 */
app.post('/api/unified-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.toLowerCase().trim() : "";

        if (cleanEmail === "admin@golden.com" && password === "Golden2025@") {
            req.session.user = { role: 'superadmin', name: 'أبو حمزة' };
            return res.json({ 
                success: true, 
                role: 'super-admin', 
                name: 'أبو حمزة',
                dashboardUrl: '/admin/dashboard'
            });
        }

        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + cleanEmail + "$", "i") } 
        });

        if (manager && manager.password === password) {
            req.session.user = { 
                role: 'manager', 
                name: manager.name, 
                scopeId: manager.scopeId 
            };

            return res.json({ 
                success: true, 
                role: 'manager', 
                name: manager.name,
                scopeId: manager.scopeId,
                dashboardUrl: `/panel/main-panel?scope=${manager.scopeId}`
            });
        }
        return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "خطأ فني في السيرفر" });
    }
});

// المسارات الأساسية
app.get('/', (req, res) => res.render('index'));
app.get('/login', (req, res) => res.render('index'));
app.get('/wage-entry', (req, res) => res.render('wage-entry'));

// التعامل مع الخطأ 404 لضمان عدم إرسال HTML عند توقع JSON
app.use((req, res) => {
    if (req.accepts('json') && req.path.includes('/api/')) {
        return res.status(404).json({ success: false, message: "المسار البرمجي غير موجود" });
    }
    res.status(404).render('404', { 
        user: req.session.user || null, 
        scopeName: null,
        isErrorPage: true 
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('===========================================');
    console.log(`🚀 تم التحديث: السيرفر يعمل على المنفذ: ${PORT}`);
    console.log(`🔗 نظام الكوارتز جاهز للاستخدام`);
    console.log('===========================================');
});