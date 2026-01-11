const mongoose = require('mongoose');

const ClearanceSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true }, 
    companyName: { type: String, default: "منشأة مسجلة" },
    signatureData: { type: String, required: true }, 
    faceImage: { type: String, required: true },     
    authIp: { type: String },                        
    deviceInfo: { type: String },                    
    scopeId: { type: String, required: true },
    lang: { type: String, default: 'ar' },
    createdAt: { type: Date, default: Date.now } // نستخدم createdAt ليتوافق مع كود الأرشيف
});

// تأكد من تصديره باسم Clearance
module.exports = mongoose.model('Clearance', ClearanceSchema);