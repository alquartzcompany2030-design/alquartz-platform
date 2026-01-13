const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 1. تعريف الموديل مع دعم إحداثيات الخريطة
const LicenseSchema = new mongoose.Schema({
    scopeId: String,
    orgName: String,
    licenseType: String,
    unifiedNumber: String,
    licenseNumber: String,
    expiryDate: Date,
    lat: Number, // خط العرض للخريطة
    lng: Number, // خط الطول للخريطة
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const License = mongoose.models.License || mongoose.model('License', LicenseSchema);

// 2. كلمة المرور المعتمدة التي حددتها
const ADMIN_PASSWORD = "hDB3xqff@"; 

// --- جلب جميع السجلات ---
router.get('/api/all/:scopeId', async (req, res) => {
    try {
        const licenses = await License.find({ scopeId: req.params.scopeId }).sort({ expiryDate: 1 });
        res.json(licenses);
    } catch (err) {
        res.status(500).json({ success: false, message: "خطأ في جلب البيانات" });
    }
});

// --- حفظ أو تحديث السجل والموقع ---
router.post('/api/save', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        
        if (id && id !== "" && id !== "undefined" && id.length > 10) {
            // تحديث سجل موجود
            await License.findByIdAndUpdate(id, data);
            res.json({ success: true, message: "تم تحديث البيانات والموقع" });
        } else {
            // إضافة سجل جديد لأول مرة
            const newLicense = new License(data);
            await newLicense.save();
            res.status(201).json({ success: true, message: "تم الحفظ بنجاح" });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: "فشل في حفظ البيانات" });
    }
});

// --- الحذف المؤمن بكلمة المرور المعتمدة ---
router.delete('/secure-delete/:id', async (req, res) => {
    const password = req.query.password; 

    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, message: "كلمة المرور غير صحيحة!" });
    }

    try {
        await License.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) {
        res.status(500).json({ success: false, message: "حدث خطأ أثناء الحذف" });
    }
});

module.exports = router;