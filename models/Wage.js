const mongoose = require('mongoose');

const wageSchema = new mongoose.Schema({
    scopeId: { type: String, required: true }, 
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    absherPhone: { type: String, required: true },
    iban: { type: String, required: true },
    totalSalary: { type: Number, required: true }, 
    
    // الحقول المحسوبة
    basicSalary: { type: Number, default: 400 },   
    housingTransportAllowance: { type: Number, default: 50 }, 
    overtimePay: { type: Number, default: 0 },    
    fridayPay: { type: Number, default: 0 },      
    otherAllowances: { type: Number, default: 0 }, 
    
    // حقول الخصم المطورة
    deduction: { type: Number, default: 0 },      
    deductionReason: { type: String, default: "" }, // الحقل الجديد لسبب الخصم
    
    workFriday: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// دالة تقسيم الراتب تلقائياً بمعادلة التوزيع (70:30)
wageSchema.pre('save', function(next) {
    const total = this.totalSalary;
    this.basicSalary = 400; 
    this.housingTransportAllowance = 50; 

    // حساب المبلغ المتبقي بعد الخصم الظاهري (450 ريال)
    const remaining = total - (this.basicSalary + this.housingTransportAllowance);

    if (this.workFriday) {
        // توزيع 30% لبدل الجمعة و 70% للإضافي حسب طلبك يا أبا حمزة
        this.fridayPay = Math.round(remaining * 0.30);
        this.overtimePay = Math.round(remaining * 0.70);
        this.otherAllowances = 0; // تصفير البدلات الأخرى لأن التوزيع غطى كامل الراتب
    } else {
        // إذا كان لا يعمل الجمعة، يوضع كامل الباقي في الإضافي
        this.fridayPay = 0;
        this.overtimePay = remaining;
        this.otherAllowances = 0;
    }

    // التأكد من أن المجموع النهائي لا يحيد عن الإجمالي بسبب التقريب
    const currentTotal = this.basicSalary + this.housingTransportAllowance + this.fridayPay + this.overtimePay;
    if (currentTotal !== total) {
        this.overtimePay += (total - currentTotal);
    }
    
    next();
});

module.exports = mongoose.model('Wage', wageSchema);