const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Scope = require('../models/Scope');

// --- [ أولاً: واجهة الموظف - عرض نموذج التسجيل ] ---
router.get('/register/:uniqueId', async (req, res) => {
    try {
        const scope = await Scope.findOne({ uniqueId: req.params.uniqueId });
        if (!scope) return res.status(404).render('404', { message: "النطاق غير موجود" });
        res.render('employee_form', { scope });
    } catch (err) { 
        res.status(500).send("خطأ في النظام - يرجى المحاولة لاحقاً"); 
    }
});

// --- [ ثانياً: عمليات الـ API للموظف - حفظ التسجيل الجديد ] ---
router.post('/api/register', async (req, res) => {
    try {
        const data = req.body;
        const booleanFields = ['hasHealthInsurance', 'hasFamilyInKSA', 'hasCarAuthorization', 'hasDrivingLicense'];
        booleanFields.forEach(field => {
            if (data[field] !== undefined) {
                data[field] = (data[field] === 'true' || data[field] === true);
            }
        });

        const existingEmp = await Employee.findOne({ idNumber: data.idNumber });
        if (existingEmp) {
            return res.status(400).json({ success: false, message: "رقم الهوية مسجل مسبقاً" });
        }

        const newEmployee = new Employee({ ...data, status: 'active' });
        await newEmployee.save();
        res.status(200).json({ success: true, message: "تم تسجيل بياناتك بنجاح يا " + data.fullName });
    } catch (err) { 
        res.status(400).json({ success: false, message: "فشل حفظ البيانات" }); 
    }
});

// --- [ ثالثاً: عمليات الـ API للمدير - التحكم والتعليق ] ---
// ملاحظة: هذه المسارات تنادى من لوحة التحكم (Manager Dashboard)

// 1. جلب بيانات موظف واحد للتعديل
router.get('/manager/api/employee/:id', async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id);
        if (!emp) return res.status(404).json({ message: "الموظف غير موجود" });
        res.json(emp);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب البيانات" }); }
});

// 2. تحديث بيانات الموظف (PUT) - المسار الذي سقط سابقاً
router.put('/manager/api/update-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndUpdate(req.params.id, { $set: req.body });
        res.json({ success: true, message: "تم التحديث بنجاح" });
    } catch (err) { 
        res.status(400).json({ success: false, message: "خطأ في التحديث" }); 
    }
});

// 3. تحديث بيانات الموظف (POST - احتياطي)
router.post('/manager/api/update-employee', async (req, res) => {
    try {
        const { empId, ...updateData } = req.body;
        await Employee.findByIdAndUpdate(empId, updateData, { runValidators: true });
        res.json({ success: true, message: "تم التحديث بنجاح" });
    } catch (err) { res.status(400).json({ success: false }); }
});

// 4. تغيير الحالة (تنشيط / تعليق)
router.post('/manager/api/update-status', async (req, res) => {
    try {
        const { empId, status } = req.body;
        await Employee.findByIdAndUpdate(empId, { status: status });
        res.json({ success: true });
    } catch (err) { res.status(400).json({ success: false }); }
});

// 5. جلب جميع موظفي النطاق
router.get('/manager/api/get-employees/:scopeId', async (req, res) => {
    try {
        const emps = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(emps);
    } catch (err) { res.status(500).json([]); }
});

// 6. حذف موظف نهائياً (مسار إضافي هام للوحة التحكم)
router.delete('/manager/api/delete-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;