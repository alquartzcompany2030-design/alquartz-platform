const mongoose = require('mongoose');

const wageSchema = new mongoose.Schema({
    scopeId: { type: String, required: true }, // النطاق العام للمدير (أبو حمزة)
    sponsorName: { type: String, required: true, default: "عام" }, // الحقل الجديد للمنشأة الكفيلة (السجل التجاري)
    fullName: { type: String, required: true },
    jobTitle: { type: String, default: "غير محددة" }, 
    idNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    iban: { type: String, required: true },
    totalSalary: { type: Number, required: true },
    workFriday: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wage', wageSchema);