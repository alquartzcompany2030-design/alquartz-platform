// ==========================================
// 🚀 منصة أبو حمزة السحابية - النسخة المحدثة 2025
// ==========================================
require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// --- [ الإعدادات العامة ] ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- [ استدعاء الراوترات ] ---
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const licenseRouter = require('./routes/licenseRouter'); // راوتر السجلات الجديد 📄

// --- [ تفعيل المسارات ] ---
app.use('/manager', managerRoutes);          // لوحة المدير (الموظفين)
app.use('/manager/licenses', licenseRouter); // لوحة التحكم بالسجلات والرخص ⚖️
app.use('/admin', adminRoutes);            // السوبر أدمن
app.use('/employee', employeeRoutes);      // روابط تسجيل الموظفين

// --- [ النظام العام ] ---
app.get('/', (req, res) => res.render('index'));

// معالجة الخطأ 404
app.use((req, res) => res.status(404).render('404'));

// --- [ تشغيل السيرفر ] ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`✅ منصة أبو حمزة تعمل بنظام الراوترات المستقلة`);
    console.log(`📡 راوتر الموظفين: aktif`);
    console.log(`📄 راوتر السجلات القانونية: aktif`);
    console.log(`🔗 لوحة المدير: http://localhost:${PORT}/manager/login`);
    console.log(`=========================================`);
});