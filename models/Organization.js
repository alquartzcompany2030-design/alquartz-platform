const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true }, // اسم المنشأة
    uniqueId: { type: String, required: true, unique: true }, // المعرف الرقمي
    saudiWorkers: { type: Number, default: 0 }, // عمالة مواطنون
    expatWorkers: { type: Number, default: 0 }, // عمالة مقيمون
    expiredLicenses: { type: Number, default: 0 }, // عدد الرخص المنتهية
    subscriptionExpiry: { type: Date, required: true }, // تاريخ انتهاء الاشتراك
    linkedManager: { type: String }, // المدير المرتبط
    lastAudit: { type: Date, default: Date.now } // آخر تحديث
});

module.exports = mongoose.model('Organization', OrganizationSchema);