const express = require('express');
const router = express.Router();
// استيراد الموديلات الصحيحة
const Scope = require('../models/Scope'); // الموديل الذي يحتوي على المنشآت الثلاث الحالية
const Employee = require('../models/Employee'); 

router.get('/matrix', async (req, res) => {
    try {
        // 1. جلب المنشآت من جدول Scopes (الذي يحتوي على مدار سهيل والمتزن والتخزين)
        const scopes = await Scope.find();

        // 2. معالجة البيانات لإضافة إحصائيات العمالة لكل منشأة
        const processedOrgs = await Promise.all(scopes.map(async (s) => {
            
            // حساب المواطنين (سعودي) في هذا النطاق
            const saudiCount = await Employee.countDocuments({ 
                scopeId: s.uniqueId, 
                nationality: 'سعودي' 
            });

            // حساب المقيمين (أي جنسية غير سعودي) في هذا النطاق
            const expatCount = await Employee.countDocuments({ 
                scopeId: s.uniqueId, 
                nationality: { $ne: 'سعودي' } 
            });

            // حساب الرخص المنتهية (اختياري حالياً)
            const expiredCount = 0; 

            return {
                name: s.name,
                uniqueId: s.uniqueId,
                saudiWorkers: saudiCount || 0,
                expatWorkers: expatCount || 0,
                expiredLicenses: expiredCount,
                expiry: s.expiry // تاريخ انتهاء الاشتراك الظاهر في جدولك
            };
        }));

        // 3. إرسال البيانات المجمعة لصفحة المصفوفة
        res.render('matrix', { orgs: processedOrgs });

    } catch (err) {
        console.error("خطأ أثناء جلب بيانات المصفوفة:", err);
        res.status(500).send("عذراً أبو حمزة، حدث خطأ في النظام الداخلي أثناء الربط.");
    }
});

module.exports = router;