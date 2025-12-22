const express = require('express');
const router = express.Router();
const License = require('../models/License'); // تأكد من إنشاء الموديل كما في الرد السابق

// 1. عرض الصفحة الخاصة بالسجلات
router.get('/page', (req, res) => {
    res.render('manager_licenses');
});

// 2. جلب كافة سجلات النطاق (API)
router.get('/api/all/:scopeId', async (req, res) => {
    try {
        const licenses = await License.find({ scopeId: req.params.scopeId }).sort({ expiryDate: 1 });
        res.json(licenses);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب البيانات" });
    }
});

// 3. إضافة أو تحديث سجل
router.post('/api/save', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        if (id) {
            await License.findByIdAndUpdate(id, data);
        } else {
            const newLic = new License(data);
            await newLic.save();
        }
        res.json({ success: true, message: "تم الحفظ بنجاح" });
    } catch (err) {
        res.status(500).json({ success: false, message: "فشل الحفظ" });
    }
});

// 4. تغيير الحالة (تنشيط/تعليق)
router.post('/api/status', async (req, res) => {
    try {
        const { id, status } = req.body;
        await License.findByIdAndUpdate(id, { status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 5. حذف سجل نهائياً
router.delete('/api/delete/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;