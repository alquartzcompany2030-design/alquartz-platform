const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Scope = require('../models/Scope');
const Manager = require('../models/Manager');

// --- [ واجهات العرض - UI ] ---

router.get('/login', (req, res) => {
    res.render('manager_login'); 
});

// التعديل: دعم كامل للسوبر أدمن (أبو حمزة) والمدراء الفرعيين
router.get('/dashboard', (req, res) => {
    const scopeId = req.query.scope || (req.session ? req.session.scopeId : null);

    if (!scopeId) {
        console.log("⚠️ محاولة دخول بدون معرف نطاق - تحويل للرئيسية");
        return res.redirect('/manager/login');
    }

    res.render('manager_dashboard', { 
        scopeId: scopeId,
        user: req.session && req.session.user ? req.session.user : { name: 'أبو حمزة' }
    });
});

// --- [ العمليات - API ] ---

// 1. تسجيل الدخول (محسن للتعامل مع الأحرف الكبيرة والصغيرة)
router.post('/api/login', async (req, res) => {
    try {
        const email = req.body.email.toLowerCase().trim();
        const password = req.body.password.trim();

        const manager = await Manager.findOne({ 
            email: { $regex: new RegExp("^" + email + "$", "i") } 
        });
        
        if (manager && manager.password === password) {
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
        res.status(500).json({ success: false, message: "خطأ في السيرفر" });
    }
});

// 2. جلب الموظفين (مرتب بالأحدث)
router.get('/api/get-employees/:scopeId', async (req, res) => {
    try {
        // نجلب جميع الموظفين التابعين لهذا النطاق
        const employees = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(employees);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب الموظفين" }); }
});

// 3. تحديث بيانات الموظف الشامل (يدعم الحقول الجديدة)
router.post('/api/update-employee', async (req, res) => {
    try {
        const { empId, ...updateData } = req.body;
        
        // التأكد من معالجة حقل التأمين الصحي كقيمة منطقية إذا لزم الأمر
        if(updateData.hasHealthInsurance) {
            updateData.hasHealthInsurance = (updateData.hasHealthInsurance === 'true');
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            empId, 
            { $set: updateData }, 
            { new: true }
        );

        if (!updatedEmployee) return res.status(404).json({ success: false, message: "الموظف غير موجود" });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ success: false });
    }
});

// 4. حذف موظف
router.delete('/api/delete-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 5. مسار تسجيل الموظف (الاستقبال من الفورم الخارجي)
router.post('/api/register-employee', async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json({ success: true, message: "تم تسجيلك بنجاح" });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(400).json({ success: false, message: "تأكد من إدخال جميع البيانات بشكل صحيح" });
    }
});

module.exports = router;