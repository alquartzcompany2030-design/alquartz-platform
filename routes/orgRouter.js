const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization'); // الموديل الجديد الذي أرسلته
const Employee = require('../models/Employee');         // لحساب الموظفين فعلياً
const License = require('../models/License');           // لحساب الرخص المنتهية

// 1. عرض صفحة المصفوفة
router.get('/matrix', (req, res) => {
    res.render('matrix'); 
});

// 2. نقطة جلب البيانات (API) - الحساب الذكي والشامل
router.get('/get-all-orgs', async (req, res) => {
    try {
        // جلب قائمة المنشآت الأساسية
        const orgs = await Organization.find(); 
        const today = new Date();

        // معالجة كل منشأة لحساب إحصائياتها الحية
        const processedOrgs = await Promise.all(orgs.map(async (org) => {
            
            // تنفيذ استعلامات متوازية للحصول على أرقام دقيقة من جدول الموظفين
            const [
                saudiMale, 
                saudiFemale, 
                expatMale, 
                expatFemale, 
                expiredLicsCount
            ] = await Promise.all([
                // عدد السعوديين الذكور
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: 'السعودية', gender: 'ذكر' }),
                // عدد السعوديات الإناث
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: 'السعودية', gender: 'أنثى' }),
                // عدد المقيمين الذكور
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'ذكر' }),
                // عدد المقيمات الإناث
                Employee.countDocuments({ scopeId: org.uniqueId, nationality: { $ne: 'السعودية' }, gender: 'أنثى' }),
                // عدد الرخص المنتهية في جدول الرخص
                License.countDocuments({ scopeId: org.uniqueId, expiryDate: { $lt: today } })
            ]);

            // تجميع البيانات في كائن واحد لإرساله للواجهة
            return {
                _id: org._id,
                name: org.name,
                uniqueId: org.uniqueId,
                // حساب المجاميع
                saudiWorkers: saudiMale + saudiFemale,
                expatWorkers: expatMale + expatFemale,
                // تفاصيل النوع الاجتماعي
                saudiMale: saudiMale,
                saudiFemale: saudiFemale,
                expatMale: expatMale,
                expatFemale: expatFemale,
                // حالة التنبيهات
                expiredLicenses: expiredLicsCount || 0,
                subscriptionExpiry: org.subscriptionExpiry,
                lastAudit: org.lastAudit
            };
        }));

        // إرسال المصفوفة كاملة للواجهة الأمامية
        res.json(processedOrgs);

    } catch (err) {
        console.error("Matrix Data Error:", err);
        res.status(500).json({ error: "حدث خطأ أثناء تجميع بيانات المصفوفة" });
    }
});

module.exports = router;