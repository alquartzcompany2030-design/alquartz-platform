const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization'); 
const Employee = require('../models/Employee');
const License = require('../models/License');

/**
 * @description عرض صفحة مصفوفة الرصد (Matrix)
 */
router.get('/matrix', (req, res) => {
    res.render('matrix'); 
});

/**
 * @description API الرصد الذكي - المطور خصيصاً لأبو حمزة
 * يعالج مشكلة الأرقام الوهمية (مثل الـ 1000 في المتزن) ويظهر الأجور الحقيقية
 */
router.get('/get-all-orgs', async (req, res) => {
    try {
        // 1. جلب المنشآت
        const organizations = await Organization.find().sort({ createdAt: -1 });
        
        const today = new Date();
        const notificationThreshold = new Date();
        notificationThreshold.setDate(notificationThreshold.getDate() + 60);

        const processedOrgs = await Promise.all(organizations.map(async (org) => {
            
            // 2. البحث عن الموظفين المرتبطين بهذه المنشأة فقط عبر uniqueId
            // ملاحظة: تأكد أن خانة scopeId في الموظف تطابق uniqueId في المنشأة
            const employees = await Employee.find({ scopeId: org.uniqueId });
            
            let saudiMale = 0, saudiFemale = 0, expatMale = 0, expatFemale = 0;
            let currentTotalWages = 0; 
            let healthCertsCount = 0, expiredHealthCerts = 0, nearExpiryHealth = 0;

            // 3. الحساب اللحظي (Real-time Calculation)
            // نحن هنا لا نسأل المنشأة عن أجورها، بل نعد رواتب موظفيها الآن
            employees.forEach(emp => {
                // تصنيف الجنسيات
                const isSaudi = emp.nationality === 'السعودية';
                const isMale = ['ذكر', 'male'].includes(emp.gender?.toLowerCase());
                
                if (isSaudi) {
                    isMale ? saudiMale++ : saudiFemale++;
                } else {
                    isMale ? expatMale++ : expatFemale++;
                }

                // --- معالجة الأجور بدقة متناهية ---
                // نجبر النظام على قراءة الراتب كعدد حقيقي ونزيل أي نصوص
                const salaryValue = parseFloat(String(emp.salary || 0).replace(/[^\d.]/g, '')) || 0;
                const allowanceValue = parseFloat(String(emp.allowances || 0).replace(/[^\d.]/g, '')) || 0;
                
                currentTotalWages += (salaryValue + allowanceValue);

                // --- معالجة الشهادات الصحية ---
                if (emp.healthCertificateExpiry) {
                    healthCertsCount++;
                    const healthExpiry = new Date(emp.healthCertificateExpiry);
                    if (healthExpiry < today) {
                        expiredHealthCerts++;
                    } else if (healthExpiry <= notificationThreshold) {
                        nearExpiryHealth++;
                    }
                }
            });

            // 4. جلب إحصائيات الرخص
            const [expiredLicCount, nearExpiryLicCount] = await Promise.all([
                License.countDocuments({ scopeId: org.uniqueId, expiryDate: { $lt: today } }),
                License.countDocuments({ scopeId: org.uniqueId, expiryDate: { $gte: today, $lte: notificationThreshold } })
            ]);

            // 5. النتيجة النهائية التي ستظهر في الصور التي أرسلتها
            return {
                name: org.name,
                uniqueId: org.uniqueId,
                // أعداد الموظفين الفعلية (الموجودة في قاعدة بيانات الموظفين)
                saudiWorkers: saudiMale + saudiFemale,
                expatWorkers: expatMale + expatFemale,
                saudiMale, saudiFemale, expatMale, expatFemale,
                // الرقابة
                expiredLicenses: expiredLicCount,
                nearExpiryLicenses: nearExpiryLicCount,
                healthCertsCount,
                expiredHealthCerts, 
                nearExpiryHealth,
                // الأجور المحدثة (ستلغي الـ 1000 الوهمية في المتزن إذا كان مجموع موظفيه 0)
                totalWages: currentTotalWages > 0 ? currentTotalWages.toLocaleString('en-US') : "0"
            };
        }));

        res.json(processedOrgs);

    } catch (err) {
        console.error("Matrix Sync Error:", err);
        res.status(500).json({ error: "خطأ في مزامنة البيانات" });
    }
});

module.exports = router;