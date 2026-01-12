const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PropertyLease = require('../models/Contract');

// التأكد من المجلد
const uploadDir = path.join(__dirname, '../public/uploads/contracts/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/uploads/contracts/'); },
    filename: (req, file, cb) => {
        cb(null, 'Lease-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// عرض الصفحة
router.get('/manager/contracts', (req, res) => {
    res.render('contracts_management'); 
});

// إضافة عقد (معدلة لتجاوز أخطاء الـ Validation)
router.post('/api/add-contract', upload.single('contractFile'), async (req, res) => {
    try {
        const { scopeId, propertyName, propertyType, ownerName, annualRent, startDate, endDate, lat, lng, contractNumber } = req.body;
        
        const newLease = new PropertyLease({
            scopeId: scopeId, // سيقبل الآن "SC-57A2E5"
            propertyName,
            propertyType,
            ownerName,
            annualRent: Number(annualRent) || 0,
            startDate: startDate || null, // إذا كان فارغاً لن يسبب خطأ
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
        console.error("❌ فشل في قاعدة البيانات:", err.message);
        res.status(500).json({ success: false, message: "خطأ في البيانات: " + err.message });
    }
});

// جلب العقود
router.get('/api/get-contracts/:scopeId', async (req, res) => {
    try {
        const contracts = await PropertyLease.find({ scopeId: req.params.scopeId }).sort({ endDate: 1 });
        res.json(contracts);
    } catch (err) {
        res.status(500).json({ message: "خطأ في الجلب" });
    }
});

// الحذف بكلمة مرور (أبو حمزة)
router.delete('/api/delete-contract/:id', async (req, res) => {
    try {
        const { password } = req.body;
        if (password === "hDB3xxqff@") {
            await PropertyLease.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } else {
            res.status(403).json({ success: false, message: "كلمة مرور خاطئة" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;