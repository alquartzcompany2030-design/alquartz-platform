const express = require('express');
const router = express.Router();

// 1. عرض اللوحة الأم (نقطة الارتكاز)
router.get('/main-panel', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    res.render('main_panel', { scopeId: scopeId });
});

// 2. توجيه الموارد البشرية (النظام الحالي)
router.get('/hr-system', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    res.redirect(`/manager/dashboard?scope=${scopeId}`);
});

// 3. تفعيل رابط الحسابات الحقيقي
// قمنا بإزالة الـ redirect المؤقت وربطه بالراوتر الجديد
router.get('/finance-system', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    res.redirect(`/finance/dashboard?scope=${scopeId}`);
});

// 4. توجيه المخازن (سيبقى مؤقتاً حتى ننتهي من بناء نظام المخزون بعد قليل)
router.get('/inventory-system', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    // سنوفر لك كود المخازن الآن لتعود وتفعل هذا الرابط
    res.redirect(`/manager/main-panel?scope=${scopeId}`);
});

module.exports = router;