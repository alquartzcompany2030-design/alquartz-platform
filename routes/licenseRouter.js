const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// تعريف الموديل
const LicenseSchema = new mongoose.Schema({
    scopeId: String,
    orgName: String,
    licenseType: String,
    unifiedNumber: String,
    licenseNumber: String,
    expiryDate: Date,
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const License = mongoose.models.License || mongoose.model('License', LicenseSchema);

// --- [ 1. واجهة العرض UI ] ---
// هذا المسار لفتح صفحة الرخص عند طلب /manager/licenses
router.get('/', (req, res) => {
    res.render('manager_licenses'); 
});

// --- [ 2. مسارات الـ API ] ---

// جلب جميع السجلات لنطاق معين
router.get('/api/all/:scopeId', async (req, res) => {
    try {
        const licenses = await License.find({ scopeId: req.params.scopeId }).sort({ expiryDate: 1 });
        res.json(licenses);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب السجلات" });
    }
});

// حفظ سجل جديد أو تحديث سجل موجود
router.post('/api/save', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        // تنظيف الـ ID إذا كان فارغاً (لتجنب أخطاء CastError)
        if (id && id !== "" && id !== "undefined") {
            await License.findByIdAndUpdate(id, data);
            res.json({ success: true, message: "تم التحديث بنجاح" });
        } else {
            const newLicense = new License(data);
            await newLicense.save();
            res.status(201).json({ success: true, message: "تمت الإضافة بنجاح" });
        }
    } catch (err) {
        console.error("License Save Error:", err);
        res.status(400).json({ success: false, message: "خطأ في حفظ البيانات" });
    }
});

// حذف سجل
router.delete('/api/delete/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// تغيير حالة السجل (نشط / موقوف)
router.post('/api/status', async (req, res) => {
    try {
        const { id, status } = req.body;
        await License.findByIdAndUpdate(id, { status: status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;