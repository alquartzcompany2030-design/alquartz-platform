const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PropertyLease = require('../models/Contract');

// --- [جدار الحماية المطور - خاص بأبو حمزة] ---
const protectManagerArea = (req, res, next) => {
    // 1. التحقق من وجود جلسة عمل (Session)
    if (!req.session || !req.session.user) {
        console.warn("⚠️ محاولة دخول غير مصرح بها من مجهول");
        return res.redirect('/login'); // توجيه لصفحة تسجيل الدخول
    }

    const user = req.session.user;
    const requestedScope = req.query.scope || req.params.scopeId || req.body.scopeId;

    // 2. السماح للسوبر أدمن بالدخول الكامل
    if (user.role === 'superadmin') return next();

    // 3. التحقق من أن المدير لا يدخل إلا على نطاقه الخاص (SC-XXXX)
    if (user.role === 'manager') {
        if (requestedScope && user.scopeId !== requestedScope) {
            console.error(`❌ المدير ${user.username} حاول التسلل لنطاق غير تابع له: ${requestedScope}`);
            return res.status(403).render('error_page', { message: "غير مصرح لك بإدارة هذا النطاق!" });
        }
        return next();
    }

    // 4. منع أي رتبة أخرى (مثل العملاء)
    res.status(403).send("عذراً، هذه المنطقة مخصصة للإدارة فقط.");
};

// --- إعدادات التخزين ---
const uploadDir = path.join(__dirname, '../public/uploads/contracts/');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/uploads/contracts/'); },
    filename: (req, file, cb) => {
        cb(null, 'Lease-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- الروابط المحمية ---

// 1. عرض الصفحة (تمت إضافة الحماية)
router.get('/manager/contracts', protectManagerArea, (req, res) => {
    res.render('contracts_management', { scopeId: req.query.scope }); 
});

// 2. إضافة عقد (تمت إضافة الحماية)
router.post('/api/add-contract', protectManagerArea, upload.single('contractFile'), async (req, res) => {
    try {
        const { scopeId, propertyName, propertyType, ownerName, annualRent, startDate, endDate, lat, lng, contractNumber } = req.body;
        
        const newLease = new PropertyLease({
            scopeId: scopeId,
            propertyName,
            propertyType,
            ownerName,
            annualRent: Number(annualRent) || 0,
            startDate: startDate || null,
            endDate: endDate,
            contractNumber,
            location: {
                lat: parseFloat(lat) || 0,
                lng: parseFloat(lng) || 0
            },
            attachmentUrl: req.file ? `/uploads/contracts/${req.file.filename}` : null
        });

        await newLease.save();
        res.json({ success: true, message: "تم تسجيل البيانات في سحابة الكوارتز بنجاح" });
    } catch (err) {
        res.status(500).json({ success: false, message: "خطأ في البيانات: " + err.message });
    }
});

// 3. جلب العقود (محمي بالنطاق)
router.get('/api/get-contracts/:scopeId', protectManagerArea, async (req, res) => {
    try {
        const contracts = await PropertyLease.find({ scopeId: req.params.scopeId }).sort({ endDate: 1 });
        res.json(contracts);
    } catch (err) {
        res.status(500).json({ message: "خطأ في الجلب" });
    }
});

// 4. الحذف (كلمة المرور + حماية المسار)
router.delete('/api/delete-contract/:id', protectManagerArea, async (req, res) => {
    try {
        const { password } = req.body;
        // كلمة مرور أبو حمزة الخاصة
        if (password === "hDB3xxqff@") {
            await PropertyLease.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } else {
            res.status(403).json({ success: false, message: "كلمة مرور الحذف خاطئة" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;