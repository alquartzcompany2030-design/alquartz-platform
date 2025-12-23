const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization'); // التعديل: استدعاء الموديل الصحيح
const Employee = require('../models/Employee');
const License = require('../models/License');

// 1. عرض الصفحة
router.get('/matrix', (req, res) => { res.render('matrix'); });

// 2. جلب البيانات (المسؤول الحقيقي)
router.get('/get-all-orgs', async (req, res) => {
    try {
        // السطر الذهبي: جلب البيانات من الموديل الجديد
        const orgs = await Organization.find(); 
        const today = new Date();

        const processedOrgs = await Promise.all(orgs.map(async (org) => {
            // حساب الموظفين من جدول Employee بربطه مع uniqueId الخاص بالمنشأة
            const [sMale, sFemale, eMale, eFemale, licCount] = await Promise.all([
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: 'السعودية', gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: 'السعودية', gender: 'أنثى' }),
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'ذكر' }),
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'أنثى' }),
                License.countDocuments({ scopeId: org.uniqueId, expiryDate: { $lt: today } })
            ]);

            return {
                name: org.name,
                uniqueId: org.uniqueId,
                saudiWorkers: sMale + sFemale,
                expatWorkers: eMale + eFemale,
                saudiMale: sMale,
                saudiFemale: sFemale,
                expatMale: eMale,
                expatFemale: eFemale,
                expiredLicenses: licCount || 0,
                // أضفت لك هذه البيانات من الموديل الجديد لاستخدامها لاحقاً
                subscriptionExpiry: org.subscriptionExpiry,
                lastAudit: org.lastAudit
            };
        }));

        res.json(processedOrgs);
    } catch (err) {
        console.error("خطأ في جلب بيانات المنشآت:", err);
        res.status(500).json({ error: "فشل الاتصال بقاعدة البيانات" });
    }
});

module.exports = router;