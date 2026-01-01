const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
    scopeId: { type: String, required: true }, // لربط السجل بنطاق مدير معين
    licenseType: { type: String, required: true }, // سجل تجاري، بلدي، إلخ
    orgName: { type: String, required: true },
    unifiedNumber: { type: String }, // الرقم الموحد 700
    licenseNumber: { type: String, required: true },
    managerId: { type: String },
    managerPhone: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date, required: true },
    address: { type: String },
    status: { type: String, default: 'active' }, // active or suspended
}, { timestamps: true });

module.exports = mongoose.model('License', LicenseSchema);