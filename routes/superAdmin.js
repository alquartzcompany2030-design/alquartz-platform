const express = require('express');
const router = express.Router();
const Scope = require('../models/Scope');
const Manager = require('../models/Manager');
const crypto = require('crypto'); // لتوليد معرفات فريدة

// جلب كافة النطاقات
router.get('/get-all-scopes', async (req, res) => {
    const scopes = await Scope.find();
    res.json(scopes);
});

// إضافة نطاق جديد بتوليد معرف فريد
router.post('/add-scope', async (req, res) => {
    const { name, months } = req.body;
    const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + parseInt(months));

    const newScope = new Scope({ name, uniqueId, expiry: expiryDate });
    await newScope.save();
    res.sendStatus(200);
});

// إضافة مدير جديد
router.post('/add-manager', async (req, res) => {
    const { name, email, password, scopeId } = req.body;
    const newManager = new Manager({ name, email, password, scopeId });
    await newManager.save();
    res.sendStatus(200);
});

// الحذف الآمن بكلمة مرور السوبر أدمن
router.delete('/verify-and-delete', async (req, res) => {
    const { id, type, password } = req.body;
    // هنا نتحقق من كلمة مرورك الشخصية (أبو حمزة)
    if (password !== 'hDB3xqff@') {
        return res.status(403).json({ message: "كلمة مرور السوبر أدمن خاطئة!" });
    }

    if (type === 'scope') await Scope.findByIdAndDelete(id);
    else await Manager.findByIdAndDelete(id);
    
    res.sendStatus(200);
});

module.exports = router;