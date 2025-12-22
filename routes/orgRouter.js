const express = require('express');
const router = express.Router();
const Scope = require('../models/Scope'); // التغيير هنا: القراءة من Scopes
const Employee = require('../models/Employee');

router.get('/matrix', async (req, res) => {
    try {
        const scopes = await Scope.find(); // جلب المنشآت الثلاث الحالية
        const processedOrgs = await Promise.all(scopes.map(async (s) => {
            const saudiCount = await Employee.countDocuments({ scopeId: s.uniqueId, nationality: 'سعودي' });
            const expatCount = await Employee.countDocuments({ scopeId: s.uniqueId, nationality: { $ne: 'سعودي' } });
            
            return {
                name: s.name,
                uniqueId: s.uniqueId,
                saudiWorkers: saudiCount || 0,
                expatWorkers: expatCount || 0,
                expiredLicenses: 0,
                expiry: s.expiry // تاريخ الانتهاء الظاهر في صورتك
            };
        }));
        res.render('matrix', { orgs: processedOrgs });
    } catch (err) {
        res.status(500).send("خطأ في جلب بيانات المصفوفة");
    }
});
module.exports = router;