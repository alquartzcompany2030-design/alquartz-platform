const mongoose = require('mongoose');

const HealthCertificateSchema = new mongoose.Schema({
    scopeId: String,
    name: String,
    idNum: String,
    phone: String,
    baladyNum: String,
    unifiedNum: String,
    issueDate: String,
    expiryDate: String,
    eduExpiry: String,
    photo: String, // تخزين الصورة كـ Base64
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthCertificate', HealthCertificateSchema);