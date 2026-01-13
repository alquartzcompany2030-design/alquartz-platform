const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    scopeId: { type: String, required: true }, 
    licenseType: { type: String, required: true }, 
    orgName: { type: String, required: true },
    unifiedNumber: { type: String }, 
    licenseNumber: { type: String, required: true },
    managerId: { type: String },
    managerPhone: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date, required: true },
    address: { type: String },
    // إضافة حقول الإحداثيات للخريطة
    lat: { type: Number },
    lng: { type: Number },
    status: { type: String, default: 'active' }, 
}, { timestamps: true });

module.exports = mongoose.model('License', LicenseSchema);