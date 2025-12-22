const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Scope = require('../models/Scope');
const Manager = require('../models/Manager');

// --- [ واجهات العرض - Render ] ---

// لوحة التحكم الرئيسية لأبو حمزة
router.get('/dashboard', (req, res) => {
    res.render('super_admin_dashboard');
});

// المسار الجديد: عرض منشأة معينة من المصفوفة بدون تسجيل خروج
router.get('/view-scope/:id', async (req, res) => {
    try {
        const scopeId = req.params.id;
        // توجيه الأدمن إلى لوحة تحكم المدير مع تمرير هويته كأدمن
        res.render('manager_dashboard', { 
            scopeId: scopeId, 
            role: 'super-admin',
            user: { name: 'أبو حمزة' } 
        });
    } catch (err) {
        console.error("خطأ في الانتقال للمنشأة:", err);
        res.redirect('/admin/matrix');
    }
});

// --- [ عمليات الـ API ] ---

// جلب الشركات
router.get('/get-all-scopes', async (req, res) => {
    try {
        const scopes = await Scope.find().sort({ createdAt: -1 });
        res.json(scopes);
    } catch (err) { res.status(500).json({ message: "خطأ في الجلب" }); }
});

// جلب المدراء
router.get('/get-all-managers', async (req, res) => {
    try {
        const managers = await Manager.find().sort({ createdAt: -1 });
        res.json(managers);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب المدراء" }); }
});

// إضافة نطاق
router.post('/add-scope', async (req, res) => {
    try {
        const { name, months } = req.body;
        const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(months));
        const newScope = new Scope({ name, uniqueId, expiry: expiryDate, status: 'active' });
        await newScope.save();
        res.status(200).json({ message: "تم الإنشاء بنجاح" });
    } catch (err) { res.status(400).json({ message: "فشل الإنشاء" }); }
});

// إضافة مدير
router.post('/add-manager', async (req, res) => {
    try {
        const { name, email, password, scopeId } = req.body;
        const newManager = new Manager({ name, email, password, scopeId });
        await newManager.save();
        res.status(200).json({ message: "تم التفعيل" });
    } catch (err) { res.status(400).json({ message: "الإيميل مكرر" }); }     
});

// الحذف الآمن
router.delete('/verify-and-delete', async (req, res) => {
    const { id, type, password } = req.body;
    if (password !== 'hDB3xqff@') return res.status(403).json({ message: "خطأ!" });
    try {
        if (type === 'scope') await Scope.findByIdAndDelete(id);
        else await Manager.findByIdAndDelete(id);
        res.status(200).json({ message: "تم الحذف" });
    } catch (err) { res.status(500).json({ message: "خطأ" }); }
});

module.exports = router;