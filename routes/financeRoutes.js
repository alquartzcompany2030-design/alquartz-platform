const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// 1. عرض لوحة التحكم المالية وجلب البيانات
router.get('/dashboard', async (req, res) => {
    try {
        const scopeId = req.query.scope || 'GENERAL';
        
        // جلب آخر 10 عمليات مالية لهذا النطاق
        const transactions = await Transaction.find({ scopeId }).sort({ date: -1 }).limit(10);
        
        // حساب الإجمالي (إيرادات ومصروفات)
        const allTransactions = await Transaction.find({ scopeId });
        const income = allTransactions.filter(t => t.type === 'قبض').reduce((sum, t) => sum + t.amount, 0);
        const expenses = allTransactions.filter(t => t.type === 'صرف').reduce((sum, t) => sum + t.amount, 0);

        res.render('finance_main', { 
            scopeId: scopeId,
            transactions: transactions,
            income: income,
            expenses: expenses,
            balance: income - expenses
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("خطأ في جلب البيانات المالية");
    }
});

// 2. إضافة عملية مالية جديدة (سند)
router.post('/add-transaction', async (req, res) => {
    try {
        const { scopeId, type, category, amount, description } = req.body;
        const newTransaction = new Transaction({
            scopeId,
            type,
            category,
            amount,
            description
        });
        await newTransaction.save();
        res.redirect(`/finance/dashboard?scope=${scopeId}`);
    } catch (err) {
        res.status(500).send("خطأ في حفظ العملية");
    }
});

module.exports = router;