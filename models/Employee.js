const mongoose = require('mongoose');

/**
 * موديل الموظفين المطور - نسخة أبو حمزة النهائية
 * تم إضافة: حقل الجنس، وتحسين أنواع البيانات لضمان دقة إحصائيات اللوحة
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
    
    // --- [ التعديل 1: إضافة حقل الجنس لدعم إحصائيات اللوحة ] ---
    gender: { 
        type: String, 
        enum: ['male', 'female', 'غير محدد'], 
        default: 'غير محدد' 
    },

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
    // تم التغيير لـ String ليتوافق مع input type="date"
    idExpiry: { type: String }, 
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

// تحسين الأداء للبحث السريع
EmployeeSchema.index({ scopeId: 1, fullName: 1 });
EmployeeSchema.index({ idNumber: 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);