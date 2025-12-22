const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Scope = require('../models/Scope');
const Manager = require('../models/Manager');

// --- [ واجهات العرض - UI ] ---

router.get('/login', (req, res) => {
    res.render('manager_login'); 
});

// التعديل الجوهري: جعل الداتشبورد يقرأ الـ scopeId من الرابط أو الجلسة
router.get('/dashboard', (req, res) => {
    // جلب المعرف من الرابط (لخدمة السوبر أدمن) أو من الجلسة (لخدمة المدير)
    const scopeId = req.query.scope || (req.session ? req.session.scopeId : null);

    // إذا لم يوجد معرف، يتم التوجيه للرئيسية بدلاً من التعليق أو الخروج
    if (!scopeId) {
        console.log("⚠️ محاولة دخول بدون معرف نطاق - تحويل للرئيسية");
        return res.redirect('/');
    }

    // إرسال البيانات للصفحة لضمان استمرار الجلسة وعرض الموظفين
    res.render('manager_dashboard', { 
        scopeId: scopeId,
        user: req.session && req.session.user ? req.session.user : { name: 'أبو حمزة' }
    });
});

router.get('/register/:uniqueId', async (req, res) => {
    try {
        const scope = await Scope.findOne({ uniqueId: req.params.uniqueId });
        if (!scope) return res.status(404).render('404');
        res.render('employee_form', { scope });
    } catch (err) { res.status(500).send("خطأ في النظام"); }
});

// --- [ العمليات - API ] ---

// 1. تسجيل الدخول
router.post('/api/login', async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const password = req.body.password.trim();

        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + email + "$", "i") } 
        });
        
        if (manager && manager.password === password) {
            // حفظ البيانات في الجلسة لمنع تسجيل الخروج التلقائي
            if (req.session) {
                req.session.scopeId = manager.scopeId;
                req.session.role = 'manager';
                req.session.user = { name: manager.name };
            }

            res.json({ 
                success: true, 
                scopeId: manager.scopeId, 
                name: manager.name 
            });
        } else {
            res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "خطأ داخلي في السيرفر" });
    }
});

// 2. جلب الموظفين
router.get('/api/get-employees/:scopeId', async (req, res) => {
    try {
        const employees = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) { res.status(500).json({ message: "خطأ في الجلب" }); }
});

// 3. تحديث بيانات الموظف الشامل
router.post('/api/update-employee', async (req, res) => {
    try {
        const { empId, ...updateData } = req.body;
        const updatedEmployee = await Employee.findByIdAndUpdate(
            empId, 
            { $set: updateData }, 
            { new: true }
        );
        if (!updatedEmployee) return res.status(404).json({ success: false, message: "الموظف غير موجود" });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 4. تغيير حالة الموظف
router.post('/api/update-status', async (req, res) => {
    try {
        const { empId, status } = req.body;
        await Employee.findByIdAndUpdate(empId, { status: status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 5. مسار الحذف
router.delete('/api/delete-employee/:id', async (req, res) => {
    try {
        const result = await Employee.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "الموظف غير موجود" });
        res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) {
        res.status(500).json({ success: false, message: "فشل الحذف من السيرفر" });
    }
});

// 6. جلب بيانات موظف واحد
router.get('/api/employee/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        res.json(employee);
    } catch (err) {
        res.status(404).json({ message: "غير موجود" });
    }
});

module.exports = router;