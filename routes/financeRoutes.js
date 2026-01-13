const express = require('express');
const router = express.Router();
const Transaction = require('../models/operations/Transaction');

// 1. عرض لوحة المعاينة المالية
router.get('/preview', async (req, res) => {
    try {
        const scopeId = req.query.scope || 'GENERAL';
        const user = req.session.user || { name: 'أبو حمزة' };

        // جلب آخر 10 عمليات مالية مرتبة من الأحدث للأقدم
        const transactions = await Transaction.find({ scopeId }).sort({ date: -1 }).limit(10);
        
        // جلب كافة العمليات لحساب الإجماليات
        const allTransactions = await Transaction.find({ scopeId });
        
        // تحسين الحسابات لضمان التعامل مع الأرقام فقط
        const income = allTransactions
            .filter(t => t.type === 'قبض')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
            
        const expenses = allTransactions
            .filter(t => t.type === 'صرف')
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        // تحديد اسم النطاق للعرض
        let scopeName = "النطاق الافتراضي";
        if (scopeId === 'SC-57A2E5') {
            scopeName = "بيئة التجربة والمعاينة";
        } else if (user.scopeId === scopeId) {
            scopeName = `منشأة ${user.name}`;
        }

        res.render('finance_main', { 
            scopeId: scopeId,
            scopeName: scopeName,
            transactions: transactions || [],
            income: income,
            expenses: expenses,
            balance: income - expenses,
            user: user
        });
    } catch (err) {
        console.error("Finance Preview Error:", err);
        res.status(500).send("عذراً، حدث خطأ أثناء تحميل البيانات المالية.");
    }
});

// 2. إضافة عملية مالية جديدة (سند قبض/صرف)
router.post('/add-transaction', async (req, res) => {
    try {
        const { scopeId, type, amount, description, partyName, accountType } = req.body;
        
        const newTransaction = new Transaction({
            scopeId: scopeId || 'GENERAL',
            type, // 'قبض' أو 'صرف'
            amount: Number(amount),
            description,
            partyName: partyName || 'عميل عام',
            accountType: accountType || 'كاش',
            date: new Date()
        });

        await newTransaction.save();
        
        // العودة لصفحة المعاينة مع الحفاظ على النطاق الحالي
        res.redirect(`/finance/preview?scope=${scopeId || 'GENERAL'}`);
    } catch (err) {
        console.error("Add Transaction Error:", err);
        res.status(500).send("فشل في ترحيل السند المالي.");
    }
});

module.exports = router;