const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    
    // إحصائيات المواطنين
    saudiWorkers: { type: Number, default: 0 },
    saudiMale: { type: Number, default: 0 },
    saudiFemale: { type: Number, default: 0 },
    
    // إحصائيات المقيمين
    expatWorkers: { type: Number, default: 0 },
    expatMale: { type: Number, default: 0 },
    expatFemale: { type: Number, default: 0 },

    expiredLicenses: { type: Number, default: 0 },
    subscriptionExpiry: { type: Date, required: true },
    linkedManager: { type: String },
    lastAudit: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Organization', OrganizationSchema);