const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Scope = require('../models/Scope');
const Manager = require('../models/Manager');
const Employee = require('../models/Employee'); // تأكد من استدعاء موديل الموظفين

// --- [ واجهات العرض - Render ] ---

// لوحة التحكم الرئيسية (سوبر أدمن - أبو حمزة)
router.get('/dashboard', (req, res) => {
    res.render('super_admin_dashboard');
});

// عرض منشأة معينة (الدخول بصلاحية الأدمن)
router.get('/view-scope/:id', async (req, res) => {
    try {
        const scopeId = req.params.id;
        const scopeData = await Scope.findOne({ uniqueId: scopeId });
        
        res.render('manager_dashboard', { 
            scope: scopeData, // تمرير بيانات المنشأة بالكامل
            scopeId: scopeId, 
            role: 'super-admin',
            user: { name: 'أبو حمزة' } 
        });
    } catch (err) {
        console.error("خطأ في الانتقال للمنشأة:", err);
        res.redirect('/admin/dashboard');
    }
});

// --- [ عمليات الـ API للشركات والمدراء ] ---

// جلب كل النطاقات (الشركات)
router.get('/get-all-scopes', async (req, res) => {
    try {
        const scopes = await Scope.find().sort({ createdAt: -1 });
        res.json(scopes);
    } catch (err) { res.status(500).json({ message: "خطأ في الجلب" }); }
});

// جلب بيانات منشأة واحدة (للتحديثات السريعة في الواجهة)
router.get('/get-scope-info/:scopeId', async (req, res) => {
    try {
        const scope = await Scope.findOne({ uniqueId: req.params.scopeId });
        res.json(scope);
    } catch (err) { res.status(500).json({ message: "خطأ" }); }
});

// جلب كل المدراء
router.get('/get-all-managers', async (req, res) => {
    try {
        const managers = await Manager.find().sort({ createdAt: -1 });
        res.json(managers);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب المدراء" }); }
});

// --- [ عمليات الـ API للموظفين - لخدمة لوحة الإدارة ] ---

// جلب موظفي منشأة معينة
router.get('/get-employees/:scopeId', async (req, res) => {
    try {
        const employees = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب الموظفين" }); }
});

// جلب تفاصيل موظف واحد (للنافذة المنبثقة Modal)
router.get('/api/employee/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "الموظف غير موجود" });
        res.json(employee);
    } catch (err) { res.status(500).json({ message: "خطأ في السيرفر" }); }
});

// إضافة نطاق (منشأة) جديد
router.post('/add-scope', async (req, res) => {
    try {
        const { name, months } = req.body;
        const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.setMonth() + parseInt(months));
        
        const newScope = new Scope({ 
            name, 
            uniqueId, 
            expiry: expiryDate, 
            status: 'active' 
        });
        await newScope.save();
        res.status(200).json({ message: "تم الإنشاء بنجاح", uniqueId });
    } catch (err) { res.status(400).json({ message: "فشل الإنشاء" }); }
});

// إضافة مدير منشأة
router.post('/add-manager', async (req, res) => {
    try {
        const { name, email, password, scopeId } = req.body;
        const newManager = new Manager({ name, email, password, scopeId });
        await newManager.save();
        res.status(200).json({ message: "تم تفعيل المدير بنجاح" });
    } catch (err) { res.status(400).json({ message: "الإيميل مكرر أو البيانات غير مكتملة" }); }     
});

// تحديث بيانات موظف (من لوحة الإدارة)
router.put('/update-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ message: "تم التحديث بنجاح" });
    } catch (err) { res.status(400).json({ message: "فشل التحديث" }); }
});

// الحذف الآمن (للمنشآت أو المدراء أو الموظفين)
router.delete('/delete-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "تم حذف الموظف" });
    } catch (err) { res.status(500).json({ message: "خطأ في الحذف" }); }
});

router.delete('/verify-and-delete', async (req, res) => {
    const { id, type, password } = req.body;
    // كلمة سر الحماية الخاصة بك يا أبو حمزة
    if (password !== 'hDB3xqff@') return res.status(403).json({ message: "كلمة المرور غير صحيحة!" });
    
    try {
        if (type === 'scope') {
            await Scope.findByIdAndDelete(id);
            // اختياري: حذف الموظفين والمدير التابعين لهذا النطاق عند حذفه
        } else {
            await Manager.findByIdAndDelete(id);
        }
        res.status(200).json({ message: "تم الحذف بنجاح" });
    } catch (err) { res.status(500).json({ message: "حدث خطأ أثناء محاولة الحذف" }); }
});

module.exports = router;