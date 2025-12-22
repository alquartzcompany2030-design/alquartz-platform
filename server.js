// ==========================================
// ☁️ Golden Cloud Server - النسخة المحدثة النهائية
// ==========================================
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

// الاتصال بقاعدة البيانات
connectDB();

// --- [ الإعدادات العامة ] ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- [ مسار تسجيل الدخول الموحد ] ---
app.post('/api/unified-login', async (req, res) => {
    // ... كود تسجيل الدخول الخاص بك (يبقى كما هو)
});

// --- [ تفعيل المسارات مع ضمان الربط ] ---

// جعل مسارات الأدمن مترابطة لمنع تسجيل الخروج التلقائي
app.use('/admin', adminRoutes); // لوحة التحكم الأساسية (التي تحتوي على Session)
app.use('/admin', orgRouter);   // المصفوفة الذكية (أصبحت الآن تحت نفس الحماية)

app.use('/manager', managerRoutes);
app.use('/manager/licenses', licenseRouter);
app.use('/employee', employeeRoutes);

app.get('/', (req, res) => res.render('index'));
app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 10000; // متوافق مع Render
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`✅ Golden Cloud Server يعمل بنجاح`);
    console.log(`🌍 الرابط: http://localhost:${PORT}`);
    console.log(`=========================================`);
});