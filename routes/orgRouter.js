const express = require('express');
const router = express.Router();
const Scope = require('../models/Scope'); 
const Employee = require('../models/Employee');

// 1. المسار الأساسي لعرض صفحة المصفوفة (Render)
router.get('/matrix', async (req, res) => {
    try {
        // نحن هنا نقوم فقط بعرض الصفحة، والبيانات سيتم جلبها عبر الـ JavaScript في الواجهة
        res.render('matrix'); 
    } catch (err) {
        res.status(500).send("خطأ في تحميل الصفحة");
    }
});

// 2. نقطة الاتصال الذكية (API) التي تغذي المصفوفة بالبيانات
router.get('/api/admin/get-all-orgs', async (req, res) => {
    try {
        const scopes = await Scope.find(); 
        const today = new Date();
        
        const processedOrgs = await Promise.all(scopes.map(async (s) => {
            // تنفيذ الاستعلامات بشكل متوازي لزيادة السرعة
            const [saudiMale, saudiFemale, expatMale, expatFemale, expiredImmigrations] = await Promise.all([
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'أنثى' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'أنثى' }),
                Employee.countDocuments({ scopeId: s.uniqueId, idExpiry: { $lt: today } })
            ]);

            return {
                name: s.name,
                uniqueId: s.uniqueId,
                saudiWorkers: saudiMale + saudiFemale,
                expatWorkers: expatMale + expatFemale,
                saudiMale,
                saudiFemale,
                expatMale,
                expatFemale,
                expiredLicenses: expiredImmigrations || 0
            };
        }));

        // إرسال البيانات كـ JSON للواجهة الأمامية
        res.json(processedOrgs);

    } catch (err) {
        console.error("API Matrix Error:", err);
        res.status(500).json({ error: "خطأ في جلب البيانات" });
    }
});

module.exports = router;