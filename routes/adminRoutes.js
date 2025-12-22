const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Scope = require('../models/Scope');
const Manager = require('../models/Manager');

// --- [ واجهات السوبر أدمن ] ---

// صفحة إنشاء النطاقات (الشركات)
router.get('/master-setup', (req, res) => res.render('super_admin_dashboard'));

// --- [ عمليات الـ API للسوبر أدمن ] ---

// 1. جلب كل الشركات
router.get('/get-all-scopes', async (req, res) => {
    try {
        const scopes = await Scope.find().sort({ createdAt: -1 });
        res.json(scopes);
    } catch (err) { res.status(500).json({ message: "خطأ في الجلب" }); }
});

// 2. إضافة شركة (نطاق) جديد
router.post('/add-scope', async (req, res) => {
    try {
        const { name, months } = req.body;
        const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(months));

        const newScope = new Scope({ name, uniqueId, expiry: expiryDate });
        await newScope.save();
        res.status(200).json({ message: "تم إنشاء النطاق بنجاح" });
    } catch (err) { res.status(400).json({ message: "فشل إنشاء النطاق" }); }
});

// 3. إضافة مدير لنطاق
router.post('/add-manager', async (req, res) => {
    try {
        const { name, email, password, scopeId } = req.body;
        const newManager = new Manager({ name, email, password, scopeId });
        await newManager.save();
        res.status(200).json({ message: "تم تفعيل حساب المدير" });
    } catch (err) { res.status(400).json({ message: "الإيميل مسجل مسبقاً" }); }
});

// 4. الحذف الآمن بكلمة مرور الماستر
router.delete('/verify-and-delete', async (req, res) => {
    const { id, type, password } = req.body;
    if (password !== 'hDB3xqff@') return res.status(403).json({ message: "كلمة المرور خاطئة!" });

    try {
        if (type === 'scope') await Scope.findByIdAndDelete(id);
        else await Manager.findByIdAndDelete(id);
        res.status(200).json({ message: "تم الحذف بنجاح" });
    } catch (err) { res.status(500).json({ message: "حدث خطأ" }); }
});

module.exports = router;