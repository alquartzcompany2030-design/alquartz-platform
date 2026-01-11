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
        let userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (userIp && userIp.includes('::ffff:')) userIp = userIp.split(':').pop();

        // req.body يحتوي الآن على fullName, idNumber, companyName, scopeId, faceImage, signatureData
        const dataToSave = new Clearance({
            ...req.body,
            userIp: userIp,
            createdAt: new Date()
        });

        await dataToSave.save();
        res.status(200).json({ success: true, message: "تم الحفظ والتوثيق بنجاح" });
    } catch (err) {
        console.error("خطأ في الحفظ:", err);
        res.status(500).json({ error: "فشل الحفظ", details: err.message });
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