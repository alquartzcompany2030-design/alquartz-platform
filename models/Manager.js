const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    scopeId: { type: String, required: true }, 
    role: { type: String, default: 'manager' },
    
    // --- [ إضافة نظام الصلاحيات والموديولات ] ---
    // هذه المصفوفة ستخزن الأقسام التي دفعت الشركة قيمتها أو ترغب في تفعيلها
    allowedModules: { 
        type: [String], 
        default: ['hr'], // الموارد البشرية مفعله للجميع كحد أدنى
        enum: ['hr', 'finance', 'store', 'clearance', 'health', 'contracts'] 
    },

    // حالة الحساب (نشط / معلق) - مفيد عند انتهاء الاشتراك
    status: { type: String, default: 'active', enum: ['active', 'suspended'] },

    lastLogin: { type: String, default: 'لم يتم الدخول بعد' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Manager', managerSchema);