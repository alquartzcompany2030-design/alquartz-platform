const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    scopeId: { type: String, required: true, index: true }, 
    fullName: { type: String, required: true, trim: true }, 
    phoneNumber: { type: String, trim: true }, // الحقل الحالي كما هو
    
    // --- [ الإضافة المطلوبة للتوثيق ] ---
    dateOfBirth: { type: String }, // تاريخ الميلاد (يضاف هنا للمطابقة)
    tempOTP: { type: String },     // رمز التحقق المؤقت
    otpExpiry: { type: Date },     // صلاحية الرمز
    signingIP: { type: String },   // عنوان IP الموظف عند التوقيع
    // -----------------------------------

    gender: { 
        type: String, 
        enum: ['male', 'female', 'غير محدد'], 
        default: 'غير محدد' 
    },
    nationality: { type: String, default: "غير محدد", trim: true },
    idNumber: { type: String, unique: true, sparse: true },
    idExpiry: { type: String }, 
    sponsorName: { type: String },
    passportNumber: { type: String },
    passportExpiry: { type: String },
    hasHealthInsurance: { type: Boolean, default: false },
    insuranceExpiry: { type: String },
    healthStatus: { type: String },
    salary: { type: Number, default: 0 },
    branch: { type: String }, 
    address: { type: String }, 
    hasDrivingLicense: { type: Boolean, default: false },
    hasCarAuthorization: { type: Boolean, default: false },
    carPlate: { type: String }, 
    carType: { type: String },  
    carRegistrationNumber: { type: String }, 
    hasFamilyInKSA: { type: Boolean, default: false },
    familyStatus: { type: String }, 
    sponsorshipTransferDate: { type: String }, 
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

// إضافة حقول التوثيق القانوني (كما طلبت لإرتباطها باللوحة)
EmployeeSchema.add({
    legalSigned: { type: Boolean, default: false },
    legalSignDate: { type: String }
});

EmployeeSchema.index({ scopeId: 1, fullName: 1 });

module.exports = mongoose.model('Employee', EmployeeSchema);