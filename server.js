require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const Manager = require('./models/Manager');

// استيراد الروترات
const orgRouter = require('./routes/orgRouter');
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const licenseRouter = require('./routes/licenseRouter');

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// --- [ مسار تسجيل الدخول الموحد المصلح ] ---
app.post('/api/unified-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = email ? email.toLowerCase().trim() : "";

        console.log(`محاولة دخول: ${cleanEmail}`);

        // 1. فحص السوبر أدمن (أبو حمزة)
        if (cleanEmail === "admin@golden.com" && password === "Golden2025@") {
            console.log("✅ تم دخول السوبر أدمن");
            return res.json({ success: true, role: 'super-admin' }); // الرد ضروري لإنهاء "جاري التحقق"
        }

        // 2. فحص المدراء (مدار سهيل، المتزن، التخزين)
        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + cleanEmail + "$", "i") } 
        });

        if (manager && manager.password === password) {
            console.log(`✅ تم دخول المدير: ${manager.name}`);
            return res.json({ 
                success: true, 
                role: 'manager', 
                scopeId: manager.scopeId 
            });
        }

        // 3. في حال فشل البيانات (يجب إرسال رد بدلاً من الصمت)
        return res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });

    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ success: false, message: "خطأ فني في السيرفر" });
    }
});

// تفعيل المسارات
app.use('/admin', adminRoutes);
app.use('/admin', orgRouter); // لضمان عمل المصفوفة
app.use('/manager', managerRoutes);
app.use('/manager/licenses', licenseRouter);
app.use('/employee', employeeRoutes);

app.get('/', (req, res) => res.render('index'));
app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server Live on port ${PORT}`));