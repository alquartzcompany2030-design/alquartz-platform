const express = require('express');
const router = express.Router();
const Scope = require('../models/Scope');
const Manager = require('../models/Manager');
const crypto = require('crypto');

// --- [ 1. مسارات النطاقات Scopes ] ---

// جلب كافة النطاقات
router.get('/get-all-scopes', async (req, res) => {
    try {
        const scopes = await Scope.find().sort({ createdAt: -1 });
        res.json(scopes);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب النطاقات" });
    }
});

// إضافة نطاق جديد
router.post('/add-scope', async (req, res) => {
    try {
        const { name, months } = req.body;
        // توليد معرف فريد وتحديد تاريخ الانتهاء
        const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + parseInt(months || 12)); // افتراضي سنة إذا لم يحدد

        const newScope = new Scope({ name, uniqueId, expiry: expiryDate, status: 'active' });
        await newScope.save();
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ message: "خطأ في إنشاء النطاق" });
    }
});

// ✅ المسار الجديد المخصص لزر "تفعيل النطاق فوراً" الظاهر في الصور
router.post('/activate-scope-now', async (req, res) => {
    try {
        const { name, months } = req.body;
        
        // التحقق لضمان عدم حدوث خطأ 400 مجدداً
        if (!name) return res.status(400).json({ message: "اسم الشركة مطلوب" });

        const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
        const expiryDate = new Date();
        // معالجة القيمة النصية من القائمة المنسدلة (اشتراك سنة كاملة = 12)
        const monthsToAdd = (months === 'اشتراك سنة كاملة' || !months) ? 12 : parseInt(months);
        expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

        const newScope = new Scope({ 
            name, 
            uniqueId, 
            expiry: expiryDate, 
            status: 'active' 
        });

        await newScope.save();
        res.status(200).json({ message: "تم التفعيل بنجاح", uniqueId });
    } catch (err) {
        console.error("خطأ التفعيل الفوري:", err);
        res.status(500).json({ message: "فشل تفعيل النطاق" });
    }
});

// تحديث وتمديد النطاق
router.put('/update-scope/:id', async (req, res) => {
    try {
        const { name, months } = req.body;
        const scope = await Scope.findById(req.params.id);
        if (name) scope.name = name;
        if (months && parseInt(months) > 0) {
            let date = new Date(scope.expiry);
            date.setMonth(date.getMonth() + parseInt(months));
            scope.expiry = date;
        }
        await scope.save();
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send("خطأ في التحديث");
    }
});

// تعليق أو تنشيط نطاق
router.post('/toggle-scope', async (req, res) => {
    try {
        const { id, status } = req.body;
        await Scope.findByIdAndUpdate(id, { status });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send("خطأ في تغيير الحالة");
    }
});

// --- [ 2. مسارات المدراء Managers ] ---

router.get('/get-all-managers', async (req, res) => {
    try {
        const managers = await Manager.find().sort({ createdAt: -1 });
        res.json(managers);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب المدراء" });
    }
});

router.post('/add-manager', async (req, res) => {
    try {
        const { name, email, password, scopeId } = req.body;
        const newManager = new Manager({ name, email, password, scopeId });
        await newManager.save();
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ message: "خطأ في إضافة المدير" });
    }
});

router.put('/update-manager/:id', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const updateData = { name, email };
        if (password) updateData.password = password;

        await Manager.findByIdAndUpdate(req.params.id, updateData);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ message: "خطأ في تحديث بيانات المدير" });
    }
});

// --- [ 3. نظام الحماية والحذف ] ---

router.delete('/verify-and-delete', async (req, res) => {
    const { id, type, password } = req.body;
    
    if (password !== 'hDB3xqff@') {
        return res.status(403).json({ message: "كلمة مرور السوبر أدمن خاطئة!" });
    }

    try {
        if (type === 'scope') {
            await Scope.findByIdAndDelete(id);
        } else {
            await Manager.findByIdAndDelete(id);
        }
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ message: "خطأ أثناء الحذف" });
    }
});

module.exports = router;