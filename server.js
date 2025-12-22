// ==========================================
// 🚀 منصة أبو حمزة السحابية - النسخة المحدثة 2025
// ==========================================
require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Manager = require('./models/Manager'); // استيراد الموديل في الأعلى

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
// وضعناه هنا لضمان سرعة الاستجابة قبل الدخول في دهاليز الراوترات
app.post('/api/unified-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. فحص السوبر أدمن (أبو حمزة)
        if (email === "admin@quartz.com" && password === "hDB3xqff@") {
            return res.json({ 
                success: true, 
                role: 'super-admin', 
                name: 'أبو حمزة' 
            });
        }

        // 2. فحص المدراء في قاعدة البيانات
        const manager = await Manager.findOne({ email, password });
        
        if (manager) {
            return res.json({ 
                success: true, 
                role: 'manager', 
                name: manager.name,
                scopeId: manager.scopeId 
            });
        }

        res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "خطأ في السيرفر" });
    }
});

// --- [ تفعيل المسارات ] ---
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const licenseRouter = require('./routes/licenseRouter');

app.use('/manager', managerRoutes);          // لوحة المدير
app.use('/manager/licenses', licenseRouter); // السجلات والرخص
app.use('/admin', adminRoutes);              // السوبر أدمن
app.use('/employee', employeeRoutes);        // روابط الموظفين

// --- [ النظام العام ] ---
app.get('/', (req, res) => res.render('index'));

// 🛑 معالجة الخطأ 404 (يجب أن يكون دائماً في الأخير)
app.use((req, res) => res.status(404).render('404'));

// --- [ تشغيل السيرفر ] ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`✅ منصة أبو حمزة تعمل بنظام الدخول الموحد`);
    console.log(`🌍 الرابط الرئيسي: http://localhost:${PORT}`);
    console.log(`=========================================`);
});