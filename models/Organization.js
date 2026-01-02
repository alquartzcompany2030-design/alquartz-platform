const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    
    // إحصائيات القوى العاملة
    saudiWorkers: { type: Number, default: 0 },
    saudiMale: { type: Number, default: 0 },
    saudiFemale: { type: Number, default: 0 },
    expatWorkers: { type: Number, default: 0 },
    expatMale: { type: Number, default: 0 },
    expatFemale: { type: Number, default: 0 },

    // إحصائيات الرقابة (تحديث)
    expiredLicenses: { type: Number, default: 0 },
    nearExpiryLicenses: { type: Number, default: 0 },
    
    // حقول الشهادات الصحية والرواتب الجديدة (أبو حمزة 2026)
    healthCertsCount: { type: Number, default: 0 },
    expiredHealthCerts: { type: Number, default: 0 },
    nearExpiryHealth: { type: Number, default: 0 },
    totalWages: { type: Number, default: 0 }, 

    subscriptionExpiry: { type: Date, required: true },
    linkedManager: { type: String },
    lastAudit: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', OrganizationSchema);