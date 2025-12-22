const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Scope = require('../models/Scope');

// --- [ واجهة الموظف ] ---
router.get('/register/:uniqueId', async (req, res) => {
    try {
        const scope = await Scope.findOne({ uniqueId: req.params.uniqueId });
        if (!scope) return res.status(404).render('404');
        res.render('employee_form', { scope });
    } catch (err) { res.status(500).send("خطأ في النظام"); }
});

// --- [ عمليات الـ API للموظف ] ---
router.post('/api/register', async (req, res) => {
    try {
        const data = req.body;
        // تحويل القيم النصية إلى Boolean
        ['hasHealthInsurance', 'hasFamilyInKSA', 'hasCarAuthorization', 'hasDrivingLicense'].forEach(field => {
            if (data[field]) data[field] = data[field] === 'true';
        });

        const newEmployee = new Employee({
            ...data,
            status: 'active' // تعيين الحالة نشط تلقائياً عند التسجيل
        });
        await newEmployee.save();
        res.status(200).json({ success: true, message: "تم الحفظ بنجاح" });
    } catch (err) { res.status(400).json({ success: false }); }
});

// --- [ عمليات الـ API للمدير - التحكم والتعليق ] ---

// 1. جلب بيانات موظف واحد للتعديل
router.get('/manager/api/employee/:id', async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id);
        res.json(emp);
    } catch (err) { res.status(404).json({ message: "الموظف غير موجود" }); }
});

// 2. تحديث بيانات الموظف (التعديل اليدوي من المدير)
router.post('/manager/api/update-employee', async (req, res) => {
    try {
        const { empId, ...updateData } = req.body;
        await Employee.findByIdAndUpdate(empId, updateData);
        res.json({ success: true });
    } catch (err) { res.status(400).json({ success: false }); }
});

// 3. تغيير الحالة (تنشيط / تعليق)
router.post('/manager/api/update-status', async (req, res) => {
    try {
        const { empId, status } = req.body;
        await Employee.findByIdAndUpdate(empId, { status: status });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ success: false }); }
});

// 4. جلب جميع موظفي النطاق (للوحة التحكم)
router.get('/manager/api/get-employees/:scopeId', async (req, res) => {
    try {
        const emps = await Employee.find({ scopeId: req.params.scopeId });
        res.json(emps);
    } catch (err) { res.status(500).json([]); }
});

module.exports = router;