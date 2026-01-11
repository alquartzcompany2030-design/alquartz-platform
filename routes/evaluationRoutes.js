const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating'); // تأكد من إنشاء المودل الذي ذكرناه سابقاً

// مسار استقبال التقييم من العميل
router.post('/submit-evaluation', async (req, res) => {
    try {
        const { employeeId, employeeName, stars, comment } = req.body;
        
        const newRating = new Rating({
            employeeId,
            employeeName,
            stars,
            comment
        });

        await newRating.save();
        res.status(201).json({ message: "تم حفظ التقييم في سيرفرك بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "خطأ في الاتصال بالسيرفر", error });
    }
});

module.exports = router;