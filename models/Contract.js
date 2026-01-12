const mongoose = require('mongoose');

const propertyLeaseSchema = new mongoose.Schema({
    // قمنا بتغيير النوع هنا من ObjectId إلى String ليتوافق مع SC-57A2E5
    scopeId: { type: String, required: true }, 
    propertyName: { type: String, required: true },
    propertyType: { type: String, required: true },
    ownerName: { type: String },
    annualRent: { type: Number },
    startDate: { type: Date }, // جعلناه اختيارياً
    endDate: { type: Date, required: true },
    contractNumber: { type: String },
    location: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    attachmentUrl: { type: String },
    status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('PropertyLease', propertyLeaseSchema);