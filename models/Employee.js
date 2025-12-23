const mongoose = require('mongoose');

/**
 * موديل الموظفين - مشروع أبو حمزة المطور (2025)
 * تم إضافة حقل الجنسية وإصلاح توافق البيانات
 */
const EmployeeSchema = new mongoose.Schema({
    // ربط الموظف بالنطاق (المؤسسة/الشركة)
    scopeId: { 
        type: String, 
        required: true, 
        index: true 
    }, 
    
    // البيانات الشخصية الأساسية
    fullName: { 
        type: String, 
        required: true,
        trim: true 
    }, 
    phoneNumber: { 
        type: String,
        trim: true
    },
    // --- [ الحقل المفقود الذي تسبب في المشكلة ] ---
    nationality: { 
        type: String, 
        default: "غير محدد",
        trim: true 
    },
    idNumber: { 
        type: String, 
        unique: true, 
        sparse: true  
    },
    idExpiry: { type: String }, // تم التغيير لـ String ليتناسب مع مدخلات HTML Date بسهولة
    sponsorName: { type: String },
    
    // بيانات الجواز والتأمين الصحي
    passportNumber: { type: String },
    passportExpiry: { type: String },
    hasHealthInsurance: { 
        type: Boolean, 
        default: false 
    },
    insuranceExpiry: { type: String },
    healthStatus: { type: String },
    
    // البيانات المالية والوظيفية
    salary: { 
        type: Number, 
        default: 0 
    },
    branch: { type: String }, 
    address: { type: String }, 
    
    // بيانات المركبة والرخصة
    hasDrivingLicense: { 
        type: Boolean, 
        default: false 
    },
    hasCarAuthorization: { 
        type: Boolean, 
        default: false 
    },
    carPlate: { type: String }, 
    carType: { type: String },  
    carRegistrationNumber: { type: String }, 
    
    // الوضع الاجتماعي والعائلي
    hasFamilyInKSA: { 
        type: Boolean, 
        default: false 
    },
    familyStatus: { type: String }, 
    sponsorshipTransferDate: { type: String }, 

    // حالة الحساب في النظام
    status: { 
        type: String, 
        enum: ['active', 'suspended'], 
        default: 'active' 
    },

    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

EmployeeSchema.index({ scopeId: 1, fullName: 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);