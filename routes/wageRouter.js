const express = require('express');
const router = express.Router();
const Wage = require('../models/Wage');

// أ. عرض الصفحات (Views)
// رابط المدير: /manager/wages
router.get('/manager/wages', (req, res) => {
    res.render('wages'); 
});

// رابط الموظف: /employee/wage-entry
router.get('/employee/wage-entry', (req, res) => {
    res.render('wage-entry'); 
});

// ب. العمليات البرمجية (APIs)

// جلب بيانات الأجور حسب النطاق
router.get('/manager/api/get-wages/:scopeId', async (req, res) => {
    try {
        const wages = await Wage.find({ scopeId: req.params.scopeId });
        res.json(wages);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب البيانات" });
    }
});

// حفظ بيانات أجور موظف جديد (مع المهنة وبدل الجمعة)
router.post('/api/submit-wage', async (req, res) => {
    try {
        // منع تكرار الهوية في نفس المنشأة
        const existing = await Wage.findOne({ idNumber: req.body.idNumber, scopeId: req.body.scope });
        if (existing) {
            return res.status(409).json({ success: false, message: "رقم الهوية مسجل مسبقاً" });
        }

        const newWage = new Wage({
            scopeId: req.body.scope,
            fullName: req.body.fullName,
            jobTitle: req.body.jobTitle, // إضافة المهنة
            idNumber: req.body.idNumber,
            phoneNumber: req.body.phoneNumber,
            iban: req.body.iban,
            totalSalary: parseFloat(req.body.totalSalary),
            workFriday: req.body.workFriday === true || req.body.workFriday === 'true'
        });

        await newWage.save();
        res.json({ success: true });
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json({ success: false, message: "خطأ في حفظ البيانات" });
    }
});

// حذف سجل أجر
router.delete('/manager/api/delete-wage/:id', async (req, res) => {
    try {
        await Wage.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "فشل الحذف" });
    }
});

module.exports = router;