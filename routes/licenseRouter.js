const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// تعريف الموديل (تأكد من مطابقة الحقول)
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

// كلمة المرور الموحدة (مطابقة لنظام الأجور لديك)
const ADMIN_PASSWORD = "hDB3xqff@"; 

// --- 1. واجهة العرض ---
router.get('/', (req, res) => {
    res.render('manager_licenses'); 
});

// --- 2. جلب البيانات ---
router.get('/api/all/:scopeId', async (req, res) => {
    try {
        const licenses = await License.find({ scopeId: req.params.scopeId }).sort({ expiryDate: 1 });
        res.json(licenses);
    } catch (err) {
        res.status(500).json({ message: "خطأ في جلب السجلات" });
    }
});

// --- 3. حفظ أو تحديث ---
router.post('/api/save', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        if (id && id !== "" && id !== "undefined") {
            await License.findByIdAndUpdate(id, data);
            res.json({ success: true, message: "تم التحديث بنجاح" });
        } else {
            const newLicense = new License(data);
            await newLicense.save();
            res.status(201).json({ success: true, message: "تمت الإضافة بنجاح" });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: "خطأ في حفظ البيانات" });
    }
});

// --- راوتر الرخص والسجلات المؤمن (نسخة أبو حمزة النهائية) ---

// داخل ملف licenseRouter.js
// داخل ملف licenseRouter.js
router.delete('/secure-delete/:id', async (req, res) => { // غيرنا api/delete إلى secure-delete
    const password = req.query.password; 
    const ADMIN_PASSWORD = "hDB3xqff@";

    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(403).json({ success: false, message: "الباسورد غلط!" });
    }

    await License.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم الحذف بنجاح" });
});
// --- 5. تغيير الحالة ---
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