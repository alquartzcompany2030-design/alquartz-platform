const express = require('express');
const router = express.Router();
const Scope = require('../models/Organization'); 
const Employee = require('../models/Employee');
const License = require('../models/License'); // التأكد من وجود موديل الرخص للحساب

// 1. عرض صفحة المصفوفة
router.get('/matrix', (req, res) => {
    res.render('matrix'); 
});

// 2. نقطة جلب البيانات (API) - المسار المحدث والموحد
// تم تعديل المسار ليتوافق مع استدعاء الواجهة: /admin/get-all-orgs
router.get('/get-all-orgs', async (req, res) => {
    try {
        const scopes = await Scope.find(); 
        const today = new Date();
        
        const processedOrgs = await Promise.all(scopes.map(async (s) => {
            // حساب الإحصائيات الحية من قاعدة البيانات مباشرة لضمان الدقة
            const [saudiMale, saudiFemale, expatMale, expatFemale, expiredLicsCount] = await Promise.all([
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'أنثى' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'أنثى' }),
                License.countDocuments({ scopeId: s.uniqueId, expiryDate: { $lt: today } }) // حساب الرخص المنتهية
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