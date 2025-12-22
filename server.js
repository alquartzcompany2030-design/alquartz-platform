// ==========================================
// ☁️ Golden Cloud Server - النسخة المحدثة 2025
// ==========================================
require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Manager = require('./models/Manager');
const orgRouter = require('./routes/orgRouter');
const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// --- [ الإعدادات العامة ] ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', orgRouter);
// --- [ مسار تسجيل الدخول الموحد الذكي ] ---
app.post('/api/unified-login', async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
        const password = req.body.password ? req.body.password.trim() : "";

        console.log(`محاولة دخول للنظام: ${email}`);

        // 1. فحص السوبر أدمن (أبو حمزة)
        if (email === "admin@golden.com" && password === "Golden2025@") {
            console.log("✅ تم دخول أبو حمزة بنجاح (سوبر أدمن)");
            return res.json({ success: true, role: 'super-admin', name: 'أبو حمزة' });
        }

        // 2. فحص المدراء مع تجاهل حالة الأحرف (لحل مشكلة المتزن)
        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + email + "$", "i") } 
        });
        
        if (manager && manager.password === password) {
            console.log(`✅ تم دخول المدير بنجاح: ${manager.name}`);
            return res.json({ 
                success: true, 
                role: 'manager', 
                name: manager.name,
                scopeId: manager.scopeId 
            });
        }

        console.log(`❌ فشل الدخول للبريد: ${email}`);
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

app.get('/', (req, res) => res.render('index'));
app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`✅ Golden Cloud Server يعمل بنجاح`);
    console.log(`🌍 الرابط: http://localhost:${PORT}`);
    console.log(`=========================================`);
});