const express = require('express');
const router = express.Router();
const HealthCertificate = require('../models/HealthCertificate');

// 1. عرض المصفوفة (للمدير)
router.get('/view-certificates', async (req, res) => {
    try {
        const scopeId = req.query.scope;
        const certificates = await HealthCertificate.find({ scopeId: scopeId }).sort({ createdAt: -1 });
        res.render('health-certificates', { scopeId, certificates });
    } catch (err) {
        res.status(500).send("خطأ في جلب البيانات");
    }
});

// 2. إضافة شهادة جديدة (POST)
router.post('/add', async (req, res) => {
    try {
        const { idNum, scopeId } = req.body;

        // منع تكرار الهوية في نفس المنشأة
        const existingCert = await HealthCertificate.findOne({ idNum, scopeId });
        if (existingCert) {
            return res.status(400).json({ 
                success: false, 
                message: "رقم الهوية هذا مسجل مسبقاً في هذه المنشأة" 
            });
        }

        const newCert = new HealthCertificate(req.body);
        await newCert.save();
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "خطأ أثناء حفظ البيانات" });
    }
});

// 3. تحديث بيانات شهادة (PUT) - هذا ما يجعل زر التعديل يعمل
router.put('/update/:id', async (req, res) => {
    try {
        const { idNum, scopeId } = req.body;
        
        // التأكد أن رقم الهوية الجديد لا يخص موظف آخر في نفس المنشأة
        const duplicate = await HealthCertificate.findOne({ 
            idNum, 
            scopeId, 
            _id: { $ne: req.params.id } 
        });

        if (duplicate) {
            return res.status(400).json({ success: false, message: "رقم الهوية مستخدم لموظف آخر" });
        }

        await HealthCertificate.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "فشل تحديث البيانات" });
    }
});

router.delete('/secure-delete/:id', async (req, res) => {
    try {
        const password = req.query.password; 
        const ADMIN_PASSWORD = "hDB3xqff@"; // كلمتك الموحدة

        if (!password || password !== ADMIN_PASSWORD) {
            return res.status(403).json({ success: false, message: "عذراً.. كلمة مرور الإدارة خاطئة!" });
        }

        const deleted = await HealthCertificate.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "الشهادة غير موجودة" });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "فشل عملية الحذف" });
    }
});

// 5. رابط تسجيل الموظفين (خارجي)
router.get('/register', (req, res) => {
    const scopeId = req.query.scope;
    if (!scopeId) return res.status(400).send("رابط غير صالح");
    res.render('health-register', { scopeId }); 
});

// 6. عرض البطاقة الفردية (للموظف/المفتش)
router.get('/card/:id', async (req, res) => {
    try {
        const cert = await HealthCertificate.findById(req.params.id);
        if (!cert) return res.status(404).send("البطاقة غير موجودة");
        res.render('single-card', { cert }); 
    } catch (err) {
        res.status(500).send("خطأ في الوصول للبطاقة");
    }
});

module.exports = router;