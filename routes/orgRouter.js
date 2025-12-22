const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
// افترضنا وجود مودل للموظفين لسحب الأعداد منه
const Employee = require('../models/Employee'); 

router.get('/matrix', async (req, res) => {
    try {
        // 1. جلب كافة المنشآت
        const orgs = await Organization.find();

        // 2. معالجة البيانات لإضافة إحصائيات العمالة لكل منشأة
        const processedOrgs = await Promise.all(orgs.map(async (org) => {
            // حساب المواطنين في هذا النطاق
            const saudiCount = await Employee.countDocuments({ 
                scopeId: org.uniqueId, 
                nationality: 'سعودي' 
            });

            // حساب المقيمين في هذا النطاق
            const expatCount = await Employee.countDocuments({ 
                scopeId: org.uniqueId, 
                nationality: { $ne: 'سعودي' } 
            });

            return {
                ...org._doc,
                saudiWorkers: saudiCount || 0,
                expatWorkers: expatCount || 0,
                // يمكنك إضافة منطق لحساب الرخص المنتهية هنا أيضاً
            };
        }));

        // 3. إرسال البيانات لملف العرض المحدث
        res.render('matrix', { orgs: processedOrgs });

    } catch (err) {
        console.error("خطأ أثناء النشر والعرض:", err);
        res.status(500).send("عذراً أبو حمزة، حدث خطأ في النظام الداخلي.");
    }
});

module.exports = router;