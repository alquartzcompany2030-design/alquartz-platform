const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    scopeId: { type: String, required: true }, // كود المنشأة
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['قبض', 'صرف'], required: true },
    amount: { type: Number, required: true },
    
    // الإضافات الجديدة المتقدمة
    partyType: { type: String, enum: ['عميل', 'مورد', 'عام'], default: 'عام' },
    partyName: { type: String }, // اسم العميل أو المورد
    accountType: { type: String, enum: ['كاش', 'بنك', 'عهدة'], default: 'كاش' }, // الصناديق
    
    category: { type: String, required: true }, // مبيعات، مشتريات، رواتب، الخ
    description: String,
    referenceNumber: String // رقم فاتورة أو مرجع
});

module.exports = mongoose.model('Transaction', TransactionSchema);