const express = require('express');
const router = express.Router();

router.get('/main-panel', (req, res) => {
    const scopeId = req.query.scope || 'GENERAL';
    const user = req.session.user || null;

    // تعريف أسماء النطاقات
    let scopeName = "نطاق عام";
    let isDevMode = false;

    if (scopeId === 'SC-8EEF65') {
        scopeName = "المتزن لخدمات السيارات";
    } 
    else if (scopeId === 'SC-57A2E5') {
        scopeName = "بيئة التجربة والمعاينة (تجريبي)";
        isDevMode = true; // تفعيل وضع المعاينة لهذا النطاق
    }

    res.render('main_panel', { 
        scopeId: scopeId, 
        scopeName: scopeName,
        user: user,
        isDevMode: isDevMode
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

module.exports = router;