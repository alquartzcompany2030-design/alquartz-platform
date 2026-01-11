const mongoose = require('mongoose');

const clearanceSchema = new mongoose.Schema({
    fullName: String,
    idNumber: String,
    companyName: String, // تم إضافة الحقل هنا لتخزين اسم المنشأة التي كتبها الموظف
    scopeId: String,
    signatureData: String, // التوقيع (Base64)
    faceImage: String,     // الصورة (Base64)
    userIp: String,
    survey: Object,        // لتخزين رقم الجوال واللغة
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClearanceCertificate', clearanceSchema);