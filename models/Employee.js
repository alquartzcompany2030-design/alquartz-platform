const mongoose = require('mongoose');

/**
 * موديل الموظفين - مشروع أبو حمزة (2025)
 * تم تحديثه ليشمل كافة بيانات السيارة، التأمين، والوضع الاجتماعي
 */
const EmployeeSchema = new mongoose.Schema({
    // ربط الموظف بالنطاق (المؤسسة/الشركة)
    scopeId: { 
        type: String, 
        required: true, 
        index: true // تحسين سرعة البحث بنظام النطاقات
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
    idNumber: { 
        type: String, 
        unique: true, // منع تكرار نفس رقم الهوية في النظام
        sparse: true  // للسماح بحقول فارغة مؤقتاً مع بقاء خاصية التميز
    },
    idExpiry: { type: Date },
    sponsorName: { type: String },
    
    // بيانات الجواز والتأمين الصحي
    passportNumber: { type: String },
    passportExpiry: { type: Date },
    hasHealthInsurance: { 
        type: Boolean, 
        default: false 
    },
    insuranceExpiry: { type: Date },
    healthStatus: { type: String },
    
    // البيانات المالية والوظيفية
    salary: { 
        type: Number, 
        default: 0 
    },
    branch: { type: String }, // الفرع أو المدينة
    address: { type: String }, // عنوان السكن
    
    // بيانات المركبة والرخصة
    hasDrivingLicense: { 
        type: Boolean, 
        default: false 
    },
    hasCarAuthorization: { 
        type: Boolean, 
        default: false 
    },
    carPlate: { type: String }, // رقم اللوحة
    carType: { type: String },  // نوع السيارة (تويوتا، هيونداي...)
    carRegistrationNumber: { type: String }, // رقم الاستمارة
    
    // الوضع الاجتماعي والعائلي
    hasFamilyInKSA: { 
        type: Boolean, 
        default: false 
    },
    familyStatus: { type: String }, // (أعزب، متزوج، عائل)
    sponsorshipTransferDate: { type: Date }, // تاريخ نقل الكفالة

    // حالة الحساب في النظام
    status: { 
        type: String, 
        enum: ['active', 'suspended'], 
        default: 'active' 
    },

    // تاريخ إنشاء السجل
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// إضافة فهرس مركب إذا كنت ستبحث كثيراً بالاسم داخل نطاق محدد
EmployeeSchema.index({ scopeId: 1, fullName: 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);