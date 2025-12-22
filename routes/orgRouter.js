const express = require('express');
const router = express.Router();
const Scope = require('../models/Scope'); 
const Employee = require('../models/Employee');

router.get('/matrix', async (req, res) => {
    try {
        const scopes = await Scope.find(); 
        
        const processedOrgs = await Promise.all(scopes.map(async (s) => {
            // حساب العدادات بتفصيل الجنس والجنسية
            // ملاحظة: نستخدم 'السعودية' كما تم ضبطها في نموذج التسجيل
            
            const saudiMale = await Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'ذكر' });
            const saudiFemale = await Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'السعودية', gender: 'أنثى' });
            
            const expatMale = await Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'ذكر' });
            const expatFemale = await Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'أنثى' });

            // حساب التراخيص المنتهية (اختياري إذا كان لديك حقل expiry في السجلات)
            // لنفترض أننا سنحسب الموظفين الذين انتهت إقامتهم
            const today = new Date();
            const expiredImmigrations = await Employee.countDocuments({ 
                scopeId: s.uniqueId, 
                idExpiry: { $lt: today } 
            });

            return {
                name: s.name,
                uniqueId: s.uniqueId,
                // الإجماليات للمصفوفة
                saudiWorkers: saudiMale + saudiFemale,
                expatWorkers: expatMale + expatFemale,
                // التفاصيل التي طلبناها في واجهة المصفوفة المحدثة
                saudiMale: saudiMale,
                saudiFemale: saudiFemale,
                expatMale: expatMale,
                expatFemale: expatFemale,
                expiredLicenses: expiredImmigrations || 0,
                expiry: s.expiry 
            };
        }));

        res.render('matrix', { orgs: processedOrgs });
    } catch (err) {
        console.error("Matrix Error:", err);
        res.status(500).send("خطأ في جلب بيانات المصفوفة المحدثة");
    }
});

module.exports = router;