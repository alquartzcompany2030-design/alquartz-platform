const mongoose = require('mongoose');

const scopeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true }, // المعرف الموحد مثل SC-A1B2
    expiry: { type: Date, required: true }, // تاريخ انتهاء الاشتراك
    status: { type: String, default: 'active' }, // نشط أو معلق
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scope', scopeSchema);