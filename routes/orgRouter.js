const express = require('express');
const router = express.Router();
const Scope = require('../models/Organization'); // استدعاء موديل النطاقات (Scopes) كما هو مسجل عندك
const Employee = require('../models/Employee');
const License = require('../models/License');

// 1. عرض صفحة المصفوفة
router.get('/matrix', (req, res) => {
    res.render('matrix'); 
});

// 2. نقطة جلب البيانات (API) - المسار الذي تطلبه الواجهة
router.get('/get-all-orgs', async (req, res) => {
    try {
        // البحث في جدول الـ Scopes فعلياً
        const scopes = await Scope.find(); 
        console.log(`تم العثور على ${scopes.length} نطاق (Scope) في قاعدة البيانات`);

        const today = new Date();

        const processedOrgs = await Promise.all(scopes.map(async (s) => {
            // حساب الموظفين الحقيقيين بربط الـ uniqueId الخاص بالـ Scope مع الموظفين
            const [saudiMale, saudiFemale, expatMale, expatFemale, expiredLicsCount] = await Promise.all([
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'أنثى' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'أنثى' }),
                License.countDocuments({ scopeId: s.uniqueId, expiryDate: { $lt: today } })
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
                expiredLicenses: expiredLicsCount || 0
            };
        }));

        res.json(processedOrgs);

    } catch (err) {
        console.error("API Matrix Error:", err);
        res.status(500).json({ error: "فشل تجميع بيانات المصفوفة" });
    }
});

module.exports = router;