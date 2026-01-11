const express = require('express');
const router = express.Router();
const Clearance = require('../models/ClearanceCertificate');

/**
 * 1. رابط الموظفين (للتوقيع)
 */
router.get('/worker-auth', (req, res) => {
    res.render('sign-clearance', { 
        scopeKey: req.query.scope, 
        companyName: req.query.company || '', // القيمة الافتراضية إذا لم تتوفر
        viewMode: false,
        nameVal: '',
        idVal: ''
    });
});

/**
 * 2. حفظ التوقيع (تم التأكد من استقبال اسم المنشأة المكتوب)
 */
router.post('/api/save-signature', async (req, res) => {
    try {
        // تنظيف البيانات القادمة لضمان المطابقة
        const cleanedData = {
            ...req.body,
            idNumber: String(req.body.idNumber).trim(), // إزالة أي مسافات من الهوية
            scopeId: String(req.body.scopeId).trim(),   // إزالة أي مسافات من الكود SC-ED2064
            createdAt: new Date()
        };

        const dataToSave = new Clearance(cleanedData);
        await dataToSave.save();
        
        console.log(`✅ تم توثيق مخالصة جديدة للمنشأة: ${cleanedData.scopeId}`);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("❌ خطأ في الحفظ:", err);
        res.status(500).json({ error: "فشل الحفظ" });
    }
});

/**
 * 3. جلب قائمة الأرشيف
 */
router.get('/api/list/:scope', async (req, res) => {
    try {
        const results = await Clearance.find({ scopeId: req.params.scope }).sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json([]);
    }
});

/**
 * 4. عرض المستند للطباعة
 */
router.get('/view/:id', async (req, res) => {
    try {
        const document = await Clearance.findById(req.params.id);
        if (!document) return res.status(404).send("المستند غير موجود");
        
        res.render('view-signature', { 
            doc: document 
        });
    } catch (err) {
        res.status(500).send("خطأ في جلب بيانات المستند");
    }
});

module.exports = router;