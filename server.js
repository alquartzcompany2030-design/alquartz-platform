require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Manager = require('./models/Manager');

// 1. استيراد الروترات
const orgRouter = require('./routes/orgRouter');
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const licenseRouter = require('./routes/licenseRouter');

const app = express();

// 2. الاتصال بقاعدة البيانات
connectDB();

// 3. الإعدادات والوسائط (Middleware)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- [ مسار تسجيل الدخول الموحد المطور ] ---
app.post('/api/unified-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.toLowerCase().trim() : "";

        console.log(`🚀 محاولة دخول: ${cleanEmail}`);

        // أ. فحص السوبر أدمن (أبو حمزة)
        if (cleanEmail === "admin@golden.com" && password === "Golden2025@") {
            console.log("👑 تم دخول السوبر أدمن بنجاح");
            return res.json({ 
                success: true, 
                role: 'super-admin', 
                name: 'أبو حمزة' 
            });
        }

        // ب. فحص المدراء (المتزن، مدار سهيل، التخزين الذهبي)
        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + cleanEmail + "$", "i") } 
        });

        if (manager && manager.password === password) {
            console.log(`✅ تم دخول المدير: ${manager.name}`);
            return res.json({ 
                success: true, 
                role: 'manager', 
                name: manager.name,
                scopeId: manager.scopeId 
            });
        }

        // ج. في حال فشل البيانات
        return res.status(401).json({ 
            success: false, 
            message: "بيانات الدخول غير صحيحة" 
        });

    } catch (err) {
        console.error("❌ Login Error:", err);
        return res.status(500).json({ 
            success: false, 
            message: "خطأ فني في السيرفر" 
        });
    }
});

// --- [ تفعيل المسارات - Routing Management ] ---

// مسارات الإدارة العليا (أبو حمزة)
app.use('/admin', adminRoutes);
app.use('/admin', orgRouter); 

// مسارات لوحة تحكم المنشآت (الموظفين)
app.use('/manager', managerRoutes);

// مسارات السجلات والرخص (المسار الموحد)
app.use('/manager/licenses', licenseRouter);

// مسارات الموظفين ورابط التسجيل الخارجي
app.use('/employee', employeeRoutes);

// الصفحة الرئيسية
app.get('/', (req, res) => res.render('index'));

// معالجة الروابط الخاطئة (404)
app.use((req, res) => {
    console.log(`⚠️ مسار غير موجود: ${req.url}`);
    res.status(404).render('404');
});

// 4. تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`✅ Golden Cloud Server Live on port ${PORT}`);
    console.log(`📅 Date: ${new Date().toLocaleString('ar-SA')}`);
    console.log('-------------------------------------------');
});