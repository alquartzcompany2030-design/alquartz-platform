const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    scopeId: { type: String, required: true }, // ربط الموظف بالنطاق (أبو حمزة)
    fullName: { type: String, required: true }, // الاسم الكامل
    phoneNumber: { type: String },              // *** إضافة حقل الجوال المفقود ***
    idNumber: String,                           // رقم الإقامة
    idExpiry: Date,                             // انتهاء الإقامة
    sponsorName: String,                        // اسم المنشأة الكفيلة
    
    // بيانات الجواز والتأمين
    passportNumber: String,
    passportExpiry: Date,
    hasHealthInsurance: { type: Boolean, default: false },
    insuranceExpiry: Date,
    healthStatus: String,
    
    // البيانات المالية والوظيفية
    salary: { type: Number, default: 0 },
    branch: String,
    address: String,
    
    // السيارة والرخصة
    hasDrivingLicense: { type: Boolean, default: false },
    hasCarAuthorization: { type: Boolean, default: false },
    carPlate: String,
    carType: String,
    carRegistrationNumber: String,
    
    // العائلة والوضع الاجتماعي
    hasFamilyInKSA: { type: Boolean, default: false },
    familyStatus: String,
    sponsorshipTransferDate: Date,

    // حالة الحساب (نشط أو معلق)
    status: { 
        type: String, 
        enum: ['active', 'suspended'], 
        default: 'active' 
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', EmployeeSchema);