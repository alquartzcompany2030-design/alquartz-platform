const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Organization = require('../models/Organization'); 

// --- [ أولاً: واجهة الموظف - عرض نموذج التسجيل ] ---
router.get('/register', async (req, res) => {
    try {
        const uniqueId = req.query.scope; 
        const scope = await Organization.findOne({ uniqueId: uniqueId });
        
        if (!scope) {
            return res.status(404).render('404', { message: "عذراً، هذا الرابط غير صالح أو انتهت صلاحيته" });
        }
        
        res.render('employee_form', { scope });
    } catch (err) { 
        res.status(500).send("خطأ في النظام - يرجى المحاولة لاحقاً"); 
    }
});

// --- [ ثانياً: عمليات الـ API للموظف - حفظ التسجيل الجديد ] ---
router.post('/api/register', async (req, res) => {
    try {
        let data = req.body;
        
        // 1. معالجة الحقول المنطقية (Boolean)
        const booleanFields = ['hasHealthInsurance', 'hasFamilyInKSA', 'hasCarAuthorization', 'hasDrivingLicense'];
        booleanFields.forEach(field => {
            if (data[field] !== undefined) {
                data[field] = (data[field] === 'true' || data[field] === true);
            }
        });

        // 2. ذكاء البيانات: تحديد الجنسية تلقائياً من رقم الهوية
        if (data.idNumber && data.idNumber.startsWith('1')) {
            data.nationality = "السعودية";
        }
        
        if (!data.gender) data.gender = 'male';

        // 3. منع تكرار التسجيل برقم الهوية
        const existingEmp = await Employee.findOne({ idNumber: data.idNumber });
        if (existingEmp) {
            return res.status(400).json({ success: false, message: "عذراً، رقم الهوية/الإقامة مسجل لدينا مسبقاً" });
        }

        // 4. إنشاء وحفظ الموظف (تم إضافة dateOfBirth و phoneNumber)
        const newEmployee = new Employee({ 
            ...data, 
            phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : "",
            dateOfBirth: data.dateOfBirth, // هام جداً لنجاح التوثيق اللاحق
            status: 'active',
            createdAt: new Date() 
        });
        
        await newEmployee.save();
        res.status(200).json({ success: true, message: `شكراً لك يا ${data.fullName}، تم استلام بياناتك بنجاح.` });
        
    } catch (err) { 
        console.error("Registration Error:", err);
        res.status(400).json({ success: false, message: "فشل حفظ البيانات، تأكد من إكمال جميع الحقول المطلوبة" }); 
    }
});

// --- [ ثالثاً: عمليات الـ API للمدير - التحكم والتعليق ] ---

// 1. جلب بيانات موظف واحد
router.get('/manager/api/get-employee/:id', async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id);
        if (!emp) return res.status(404).json({ message: "الموظف غير موجود" });
        res.json(emp);
    } catch (err) { res.status(500).json({ message: "خطأ في السيرفر" }); }
});

// 2. جلب جميع موظفي المنشأة
router.get('/manager/api/get-employees/:scopeId', async (req, res) => {
    try {
        const emps = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(emps);
    } catch (err) { res.status(500).json([]); }
});

// 3. تحديث بيانات الموظف (PUT)
router.put('/manager/api/update-employee/:id', async (req, res) => {
    try {
        let updateData = req.body;

        const booleanFields = ['hasHealthInsurance', 'hasCarAuthorization', 'hasDrivingLicense', 'hasFamilyInKSA'];
        booleanFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = (updateData[field] === 'true' || updateData[field] === true);
            }
        });

        // ضمان تحديث تاريخ الميلاد والجوال في حال تم تغييرهم من قبل المدير
        await Employee.findByIdAndUpdate(req.params.id, { $set: updateData });
        res.json({ success: true, message: "تم تحديث ملف الموظف بنجاح" });
    } catch (err) { 
        res.status(400).json({ success: false, message: "فشل تحديث البيانات" }); 
    }
});

// 4. حذف موظف نهائياً
router.delete('/manager/api/delete-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) { res.status(500).json({ success: false, message: "فشل عملية الحذف" }); }
});

// 5. جلب إحصائيات سريعة (محدث لدعم الجنسين والسعودة)
router.get('/manager/api/scope-stats/:scopeId', async (req, res) => {
    try {
        const scopeId = req.params.scopeId;
        const total = await Employee.countDocuments({ scopeId });
        
        const expired = await Employee.countDocuments({ 
            scopeId, 
            idExpiry: { $lt: new Date().toISOString().split('T')[0] } 
        });
        
        const saudi = await Employee.countDocuments({ 
            scopeId, 
            $or: [
                { nationality: 'السعودية' },
                { idNumber: { $regex: '^1' } }
            ]
        });

        const males = await Employee.countDocuments({ scopeId, gender: 'male' });
        const females = await Employee.countDocuments({ scopeId, gender: 'female' });
        
        res.json({ total, expired, saudi, males, females });
    } catch (err) { res.status(500).json({ message: "خطأ في الإحصائيات" }); }
});

module.exports = router;