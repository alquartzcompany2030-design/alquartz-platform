/**
 * نظام السحابة الذهبية (Golden Cloud) - 2026
 * المطور والمسؤول: أبو حمزة
 * الوصف: الإصدار النهائي لحل مشكلة كلمة المرور وربط كافة المسارات
 */

const express = require('express');
const router = express.Router();
const Wage = require('../models/Wage');

// كلمة المرور الموحدة (تأكد من كتابتها يدوياً في المتصفح: hDB3xqff@)
const ADMIN_PASSWORD = "hDB3xqff@"; 

// --- 1. مسارات عرض الصفحات (Views) ---
router.get('/manager/wages', (req, res) => res.render('wages'));
router.get('/wage-entry', (req, res) => res.render('wage-entry'));
router.get('/manager/clearance', (req, res) => res.render('clearance'));

// --- 2. جلب البيانات (تطبيق معادلة أبو حمزة المعتمدة 70:30) ---
router.get('/manager/api/get-wages/:scopeId', async (req, res) => {
    try {
        const wages = await Wage.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 }).lean();
        
        const calculatedWages = wages.map(emp => {
            const total = parseFloat(emp.totalSalary) || 0;
            const basic = 400.00; 
            const housing = 50.00;
            const remaining = total - (basic + housing);
            
            let fridayPay = 0, overtime = 0;
            if (emp.workFriday === true || emp.workFriday === 'true') {
                fridayPay = parseFloat((remaining * 0.30).toFixed(2));
                overtime = parseFloat((remaining * 0.70).toFixed(2));
            } else {
                overtime = remaining > 0 ? parseFloat(remaining.toFixed(2)) : 0;
            }

            return {
                ...emp,
                basicSalary: basic,
                housingTransportAllowance: housing,
                overtimePay: overtime,
                fridayPay: fridayPay
            };
        });
        res.json(calculatedWages);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب البيانات" });
    }
});

// --- 3. تحديث الخصم (حل مشكلة كلمة المرور الظاهرة في الصور) ---
router.post('/manager/api/update-deduction', async (req, res) => {
    try {
        const { idNumber, deduction, reason, password } = req.body;

        // استخدام .trim() ضروري جداً لتجاوز أي مسافات مخفية من المتصفح
        if (!password || password.trim() !== ADMIN_PASSWORD) {
            return res.status(403).json({ success: false, message: "كلمة مرور خاطئة!" });
        }

        const result = await Wage.findOneAndUpdate(
            { idNumber: idNumber },
            { 
                deduction: parseFloat(deduction) || 0, 
                deductionReason: reason || "" 
            },
            { new: true }
        );
        
        if (result) {
            res.json({ success: true, message: "تم التحديث بنجاح" });
        } else {
            res.status(404).json({ success: false, message: "السجل غير موجود" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// --- 4. الحذف النهائي الموحد (حل مشكلة زر الحذف في الصورة) ---
// تم تعديل المسار ليدعم الطريقتين DELETE و POST لضمان العمل في كل المتصفحات
router.all('/manager/api/delete-wage/:idNumber', async (req, res) => {
    try {
        // البحث عن كلمة المرور في الـ body (لطلب POST) أو الـ query (لطلب DELETE)
        const password = req.body.password || req.query.password;

        if (!password || password.trim() !== ADMIN_PASSWORD) {
            return res.status(403).json({ success: false, message: "كلمة مرور خاطئة!" });
        }

        const result = await Wage.findOneAndDelete({ idNumber: req.params.idNumber });
        if (result) {
            res.json({ success: true, message: "تم الحذف بنجاح" });
        } else {
            res.status(404).json({ success: false, message: "الموظف غير موجود" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// مسار احتياطي للحفظ لضمان عدم تعطل فورم العمال
router.post('/api/submit-wage', async (req, res) => {
    try {
        const { idNumber } = req.body;
        const existing = await Wage.findOne({ idNumber: idNumber.trim() });
        if (existing) return res.status(409).json({ success: false, message: "موجود مسبقاً" });

        const newWage = new Wage({ ...req.body, deduction: 0 });
        await newWage.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;