const express = require('express');
const router = express.Router();

// 1. عرض اللوحة الأم (نقطة الارتكاز)
router.get('/main-panel', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    
    // هامة جداً: نمرر req.session.user لكي تعرف صفحة EJS من هو المستخدم (أبو حمزة أم غيره)
    res.render('main_panel', { 
        scopeId: scopeId, 
        user: req.session.user || null // نمرر بيانات الجلسة
    });
});

// 2. توجيه الموارد البشرية (متاح للجميع)
router.get('/hr-system', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    res.redirect(`/manager/dashboard?scope=${scopeId}`);
});

// 3. حماية نظام الحسابات (متاح فقط لأبو حمزة حالياً)
router.get('/finance-system', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    const user = req.session.user;

    // فحص الصلاحية قبل التوجيه
    if (user && user.email === "admin@golden.com") {
        res.redirect(`/finance/dashboard?scope=${scopeId}`);
    } else {
        // إذا حاول مستخدم آخر الدخول عبر الرابط المباشر
        res.send("<script>alert('هذا النظام قيد المعايرة النهائية، سيتاح قريباً'); window.location='/panel/main-panel';</script>");
    }
});

// 4. توجيه المخازن (مغلق ومحمي)
router.get('/inventory-system', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    const user = req.session.user;

    if (user && user.email === "admin@golden.com") {
        // يمكنك مستقبلاً توجيهه لنظام المخازن هنا
        res.send("<h3>نظام المخازن: جاري البناء يا أبا حمزة..</h3>");
    } else {
        res.redirect(`/panel/main-panel?scope=${scopeId}`);
    }
});

module.exports = router;