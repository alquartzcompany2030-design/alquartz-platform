const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    scopeId: { type: String, required: true }, // يربط المدير بمعرف الشركة (uniqueId)
    role: { type: String, default: 'manager' },
    lastLogin: { type: String, default: 'لم يتم الدخول بعد' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Manager', managerSchema);