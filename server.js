// ==========================================
// ☁️ Golden Cloud Server - النسخة المحدثة 2025
// ==========================================
require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Manager = require('./models/Manager');

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// --- [ الإعدادات العامة ] ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- [ مسار تسجيل الدخول الموحد الذكي ] ---
app.post('/api/unified-login', async (req, res) => {
    try {
        // تنظيف البريد من الفراغات وتحويله لأحرف صغيرة لضمان المطابقة
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        // تنظيف كلمة المرور من الفراغات لضمان عدم وجود أخطاء عند النسخ واللصق
        const password = req.body.password ? req.body.password.trim() : "";

        console.log(`محاولة دخول للنظام: ${email}`);

        // 1. فحص السوبر أدمن (أبو حمزة) - بيانات ثابتة (Hardcoded)
        if (email === "admin@golden.com" && password === "Golden2025@") {
            console.log("✅ تم دخول أبو حمزة بنجاح (سوبر أدمن)");
            return res.json({ 
                success: true, 
                role: 'super-admin', 
                name: 'أبو حمزة' 
            });
        }

        // 2. فحص المدراء في قاعدة البيانات
        const manager = await Manager.findOne({ email: email });
        
        // التحقق من وجود المدير ومطابقة كلمة المرور
        if (manager && manager.password === password) {
            console.log(`✅ تم دخول المدير بنجاح: ${manager.name}`);
            return res.json({ 
                success: true, 
                role: 'manager', 
                name: manager.name,
                scopeId: manager.scopeId 
            });
        }

        console.log(`❌ فشل الدخول للبريد: ${email} - بيانات غير صحيحة`);
        res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "خطأ في السيرفر الداخلي" });
    }
});

// --- [ تفعيل المسارات ] ---
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const licenseRouter = require('./routes/licenseRouter');

app.use('/manager', managerRoutes);
app.use('/manager/licenses', licenseRouter);
app.use('/admin', adminRoutes);
app.use('/employee', employeeRoutes);

// --- [ النظام العام ] ---
app.get('/', (req, res) => res.render('index'));

// 🛑 معالجة الخطأ 404
app.use((req, res) => res.status(404).render('404'));

// --- [ تشغيل السيرفر ] ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`✅ Golden Cloud Server يعمل بنجاح`);
    console.log(`🌍 الرابط الموحد: http://localhost:${PORT}`);
    console.log(`=========================================`);
});