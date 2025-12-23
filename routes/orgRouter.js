const express = require('express');
const router = express.Router();
const Scope = require('../models/Scope'); 
const Employee = require('../models/Employee');

// 1. عرض صفحة المصفوفة
// سيصبح الرابط: /admin/matrix
router.get('/matrix', async (req, res) => {
    try {
        res.render('matrix'); 
    } catch (err) {
        res.status(500).send("خطأ في تحميل الصفحة");
    }
});

// 2. نقطة الاتصال جلب البيانات (API)
// تم تعديل المسار ليتوافق مع طلب المتصفح في الصورة (404)
// بما أن app.js يستخدم /admin، فهذا المسار سيصبح: /admin/get-all-orgs
router.get('/get-all-orgs', async (req, res) => {
    try {
        const scopes = await Scope.find(); 
        const today = new Date();
        
        const processedOrgs = await Promise.all(scopes.map(async (s) => {
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
                saudiMale, saudiFemale, expatMale, expatFemale,
                expiredLicenses: expiredImmigrations || 0
            };
        }));
        res.json(processedOrgs);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب البيانات" });
    }
});

module.exports = router;