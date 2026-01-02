const express = require('express');
const router = express.Router();
const Wage = require('../models/Wage');

// كلمة المرور الخاصة بالعمليات المالية (يمكنك تغييرها من هنا)
const ADMIN_PASSWORD = "hDB3xqff@"; 

// --- 1. عرض الصفحات (Views) ---
router.get('/manager/wages', (req, res) => res.render('wages'));
router.get('/wage-entry', (req, res) => res.render('wage-entry'));

// --- 2. جلب البيانات حسب النطاق ---
router.get('/manager/api/get-wages/:scopeId', async (req, res) => {
    try {
        const wages = await Wage.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(wages);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب البيانات" });
    }
});

// --- 3. حفظ بيانات موظف جديد (مع منع التكرار) ---
router.post('/api/submit-wage', async (req, res) => {
    try {
        const { idNumber, scope } = req.body;
        
        // التحقق من وجود الهوية مسبقاً
        const existing = await Wage.findOne({ idNumber: idNumber.trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: "رقم الهوية مسجل مسبقاً في النظام" });
        }

        const newWage = new Wage({
            ...req.body,
            scopeId: scope,
            idNumber: idNumber.trim(),
            totalSalary: parseFloat(req.body.totalSalary),
            workFriday: req.body.workFriday === true || req.body.workFriday === 'true',
            deduction: 0 // يبدأ الخصم دائماً من صفر
        });

        await newWage.save();
        res.json({ success: true, message: "تم الحفظ بنجاح" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "خطأ فني في السيرفر" });
    }
});

// --- 4. تحديث الخصومات (محمي بكلمة مرور) ---
router.post('/manager/api/update-deduction', async (req, res) => {
    try {
        const { idNumber, deduction, password } = req.body;

        // التحقق من كلمة المرور قبل التعديل
        if (password !== ADMIN_PASSWORD) {
            return res.status(403).json({ success: false, message: "كلمة مرور خاطئة! لا تملك صلاحية التعديل المالي." });
        }

        const result = await Wage.findOneAndUpdate(
            { idNumber: idNumber },
            { deduction: parseFloat(deduction) || 0 },
            { new: true }
        );
        
        if (result) {
            res.json({ success: true, message: "تم تحديث الخصم بنجاح" });
        } else {
            res.status(404).json({ success: false, message: "الموظف غير موجود" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "فشل تحديث الخصم" });
    }
});

// --- 5. الحذف النهائي من قاعدة البيانات (محمي بكلمة مرور) ---
router.delete('/manager/api/delete-wage/:idNumber', async (req, res) => {
    try {
        const { password } = req.body;

        // التحقق من كلمة المرور قبل الحذف
        if (password !== ADMIN_PASSWORD) {
            return res.status(403).json({ success: false, message: "كلمة مرور خاطئة! لا تملك صلاحية الحذف." });
        }

        const result = await Wage.findOneAndDelete({ idNumber: req.params.idNumber });
        if (result) {
            res.json({ success: true, message: "تم الحذف نهائياً" });
        } else {
            res.status(404).json({ success: false, message: "السجل غير موجود" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "فشل الحذف" });
    }
});

module.exports = router;