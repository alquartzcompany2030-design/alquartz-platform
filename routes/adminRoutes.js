const express = require('express');
const router = express.Router(); 
const crypto = require('crypto');
const Organization = require('../models/Organization'); 
const Manager = require('../models/Manager');
const Employee = require('../models/Employee');

// --- [ مسارات العرض ] ---
router.get('/dashboard', (req, res) => {
    res.render('super_admin_dashboard');
});

// --- [ عمليات الـ API ] ---

// 1. جلب كل المنشآت (النطاقات)
router.get('/get-all-scopes', async (req, res) => {
    try {
        const orgs = await Organization.find().sort({ createdAt: -1 });
        res.json(orgs);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب البيانات" });
    }
});

// 2. تفعيل منشأة جديدة فوراً
router.post('/add-scope', async (req, res) => {
    try {
        const { name, months } = req.body;
        if (!name) return res.status(400).json({ message: "يرجى كتابة اسم الشركة" });

        const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
        const expiryDate = new Date();
        const m = parseInt(months) || 12;
        expiryDate.setMonth(expiryDate.getMonth() + m);

        const newOrg = new Organization({ 
            name: name.trim(), 
            uniqueId: uniqueId, 
            subscriptionExpiry: expiryDate, 
            status: 'active',
            saudiMale: 0, saudiFemale: 0,
            expatMale: 0, expatFemale: 0,
            totalWorkers: 0
        });

        await newOrg.save();
        res.status(200).json({ success: true, uniqueId });
    } catch (err) {
        res.status(500).json({ message: "حدث خطأ في السيرفر" });
    }
});

// 3. ✅ إضافة مدير جديد وربطه بنطاق (جديد)
router.post('/add-manager', async (req, res) => {
    try {
        const { name, email, password, scopeId } = req.body; // scopeId هو الـ uniqueId للمنشأة

        // التأكد من عدم تكرار البريد الإلكتروني
        const existingManager = await Manager.findOne({ email });
        if (existingManager) {
            return res.status(400).json({ message: "هذا البريد الإلكتروني مسجل لمدير آخر" });
        }

        const newManager = new Manager({ 
            name, 
            email, 
            password, 
            scopeId // الربط يتم عبر المعرف الفريد SC-XXXX
        });

        await newManager.save();
        console.log(`👤 تم إنشاء حساب مدير جديد لـ: ${name}`);
        res.status(200).json({ success: true, message: "تم حفظ وصرف صلاحية المدير" });
    } catch (err) {
        console.error("خطأ إضافة مدير:", err);
        res.status(400).json({ message: "بيانات غير مكتملة أو خطأ في السيرفر" });
    }
});

// 4. ✅ جلب كل المدراء لعرضهم في الجدول
router.get('/get-all-managers', async (req, res) => {
    try {
        const managers = await Manager.find().sort({ createdAt: -1 });
        res.json(managers);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب كشف المدراء" });
    }
});

// 5. مسار الحذف الآمن
router.delete('/verify-and-delete', async (req, res) => {
    const { id, type, password } = req.body;
    if (password !== 'hDB3xqff@') return res.status(403).json({ message: "كلمة المرور خاطئة" });

    try {
        if (type === 'scope' || type === 'organization') {
            await Organization.findByIdAndDelete(id);
        } else if (type === 'manager') {
            await Manager.findByIdAndDelete(id);
        }
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ message: "خطأ في الحذف" });
    }
});
// 6. عرض منشأة معينة (للانتقال من لوحة السوبر أدمن إلى لوحة المنشأة)
router.get('/view-scope/:id', async (req, res) => {
    try {
        const scopeId = req.params.id; // هذا هو الـ SC-XXXX
        const scopeData = await Organization.findOne({ uniqueId: scopeId });
        
        if (!scopeData) return res.redirect('/admin/dashboard');

        res.render('manager_dashboard', { 
            scope: scopeData, 
            scopeId: scopeId, 
            role: 'super-admin',
            user: { name: 'أبو حمزة' } 
        });
    } catch (err) {
        console.error("خطأ في الانتقال للمنشأة:", err);
        res.redirect('/admin/dashboard');
    }
});
module.exports = router;