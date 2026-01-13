const mongoose = require('mongoose');

const panelSchema = new mongoose.Schema({
    scopeId: { type: String, required: true },
    lastUpdate: { type: Date, default: Date.now },
    quickNotes: String, // ملاحظات سريعة تظهر للمدير في اللوحة الأم
    systemStatus: { type: String, default: 'نشط' }
});

module.exports = mongoose.model('Panel', panelSchema);