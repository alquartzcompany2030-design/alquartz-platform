const mongoose = require('mongoose');

const wageSchema = new mongoose.Schema({
    scopeId: { type: String, required: true },
    fullName: { type: String, required: true },
    jobTitle: { type: String, default: "غير محددة" }, // الحقل الجديد للمهنة
    idNumber: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    iban: { type: String, required: true },
    totalSalary: { type: Number, required: true },
    workFriday: { type: Boolean, default: false }, // التأكد من أنه Boolean
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Wage', wageSchema);