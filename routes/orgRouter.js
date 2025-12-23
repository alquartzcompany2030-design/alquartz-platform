const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization'); 
const Employee = require('../models/Employee');
const License = require('../models/License');

// 1. عرض صفحة المصفوفة
router.get('/matrix', (req, res) => {
    res.render('matrix'); 
});

// 2. نقطة جلب البيانات المحدثة (API) مع مراقب الـ 60 يوماً
router.get('/get-all-orgs', async (req, res) => {
    try {
        const organizations = await Organization.find().sort({ createdAt: -1 });
        
        const today = new Date();
        // ✅ تعديل أبو حمزة: التنبيه يبدأ قبل شهرين (60 يوماً) من تاريخ اليوم
        const notificationThreshold = new Date();
        notificationThreshold.setDate(notificationThreshold.getDate() + 60);

        const processedOrgs = await Promise.all(organizations.map(async (org) => {
            // ✅ 1. مراقب الموظفين (دعم كافة المسميات لضمان دقة الأرقام)
            const [saudiMale, saudiFemale, expatMale, expatFemale] = await Promise.all([
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: 'السعودية', gender: { $in: ['ذكر', 'male'] } }),
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: 'السعودية', gender: { $in: ['أنثى', 'female'] } }),
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: { $ne: 'السعودية' }, gender: { $in: ['ذكر', 'male'] } }),
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: { $ne: 'السعودية' }, gender: { $in: ['أنثى', 'female'] } })
            ]);

            // ✅ 2. مراقب الرخص الذكي المحدث
            const [expiredCount, nearExpiryCount] = await Promise.all([
                // رخص منتهية (تاريخها أصغر من اليوم)
                License.countDocuments({ 
                    scopeId: org.uniqueId, 
                    expiryDate: { $lt: today } 
                }),
                // رخص "تنبيه": تنتهي بين اليوم وبعد 60 يوماً
                License.countDocuments({ 
                    scopeId: org.uniqueId, 
                    expiryDate: { $gte: today, $lte: notificationThreshold } 
                })
            ]);

            return {
                name: org.name,
                uniqueId: org.uniqueId,
                // إحصائيات الموظفين
                saudiWorkers: saudiMale + saudiFemale,
                expatWorkers: expatMale + expatFemale,
                saudiMale,
                saudiFemale,
                expatMale,
                expatFemale,
                // إحصائيات الرقابة
                expiredLicenses: expiredCount,
                nearExpiryLicenses: nearExpiryCount // ستفعل اللون البرتقالي في الواجهة
            };
        }));

        res.json(processedOrgs);

    } catch (err) {
        console.error("Matrix API Error:", err);
        res.status(500).json({ error: "فشل في تحديث بيانات الرقابة" });
    }
});

module.exports = router;