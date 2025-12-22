const mongoose = require('mongoose');
const companySchema = new mongoose.Schema({
    name: String,
    domain: { type: String, unique: true }, // النطاق الخاص بالشركة
    workerLimit: Number,
    licenseExpiry: Date, // تاريخ انتهاء رخصة البلدية/السجل
    status: { type: String, default: 'active' }
});
module.exports = mongoose.model('Company', companySchema);