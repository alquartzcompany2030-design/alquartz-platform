const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const License = require('../models/License');
const Scope = require('../models/Scope');
const HealthCertificate = require('../models/HealthCertificate');

// --- [ 1. واجهات العرض UI ] ---
router.get('/dashboard', (req, res) => res.render('manager_dashboard'));
router.get('/licenses', (req, res) => res.render('manager_licenses'));

// --- [ 2. جلب اسم المنشأة ] ---
router.get('/api/get-scope-info/:scopeId', async (req, res) => {
    try {
        const scope = await Scope.findOne({ uniqueId: req.params.scopeId });
        if (scope) return res.json(scope);
        const manager = await Manager.findOne({ scopeId: req.params.scopeId });
        res.json({ name: manager ? manager.name : "منشأة غير معروفة" });
    } catch (err) { res.status(500).json({ name: "خطأ في السيرفر" }); }
});

// --- [ 3. محرك الإحصائيات الشامل (القلب النابض للوحة) ] ---
router.get('/api/get-dashboard-data/:scopeId', async (req, res) => {
    try {
        const scopeId = req.params.scopeId;
        const today = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(today.getDate() + 30);

        // جلب البيانات من 3 جداول مختلفة
        const [employees, healthCerts, licenses] = await Promise.all([
            Employee.find({ scopeId }),
            HealthCertificate.find({ scopeId }),
            License.find({ scopeId })
        ]);

        // تحليل الشهادات الصحية
        const healthStats = {
            total: healthCerts.length,
            expired: healthCerts.filter(c => new Date(c.expiryDate) < today).length,
            nearExpiry: healthCerts.filter(c => {
                const d = new Date(c.expiryDate);
                return d >= today && d <= thirtyDays;
            }).length
        };

        // تحليل التراخيص (بلدي/سجل/سلامة) - هنا حل مشكلتك
        const licenseStats = {
            total: licenses.length,
            expired: licenses.filter(l => l.expiryDate && new Date(l.expiryDate) < today).length,
            nearExpiry: licenses.filter(l => {
                const d = new Date(l.expiryDate);
                return l.expiryDate && d >= today && d <= thirtyDays;
            }).length
        };

        res.json({ employees, healthStats, licenseStats });
    } catch (err) {
        console.error("Dashboard API Error:", err);
        res.status(500).json({ error: "فشل في تحميل البيانات" });
    }
});

// --- [ 4. عمليات الموظفين ] ---
router.get('/api/employee/:id', async (req, res) => {
    try { res.json(await Employee.findById(req.params.id)); } catch (err) { res.status(500).send(); }
});

router.put('/api/update-employee/:id', async (req, res) => {
    try {
        const data = req.body;
        if (data.idNumber?.startsWith('1')) data.nationality = "السعودية";
        await Employee.findByIdAndUpdate(req.params.id, { $set: data });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

router.delete('/api/delete-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- [ 5. عمليات السجلات والرخص ] ---
router.get('/licenses/api/all/:scopeId', async (req, res) => {
    try { res.json(await License.find({ scopeId: req.params.scopeId }).sort({ expiryDate: 1 })); } catch (err) { res.json([]); }
});

router.post('/licenses/api/save', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        id ? await License.findByIdAndUpdate(id, data) : await new License(data).save();
        res.json({ success: true });
    } catch (err) { res.status(400).json({ success: false }); }
});

router.delete('/licenses/api/delete/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

router.post('/licenses/api/status', async (req, res) => {
    try {
        await License.findByIdAndUpdate(req.body.id, { status: req.body.status });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;