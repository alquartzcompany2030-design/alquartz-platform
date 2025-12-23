const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Scope = require('../models/Scope');

// --- [ أولاً: واجهة الموظف - عرض نموذج التسجيل ] ---
router.get('/register', async (req, res) => {
    try {
        const uniqueId = req.query.scope; // التقطنا الـ ID من الرابط ?scope=SC-XXXX
        const scope = await Scope.findOne({ uniqueId: uniqueId });
        
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
        const data = req.body;
        
        // تحويل الحقول المنطقية لضمان تخزينها كـ Boolean في MongoDB
        const booleanFields = ['hasHealthInsurance', 'hasFamilyInKSA', 'hasCarAuthorization', 'hasDrivingLicense'];
        booleanFields.forEach(field => {
            if (data[field] !== undefined) {
                data[field] = (data[field] === 'true' || data[field] === true);
            }
        });

        // منع تكرار التسجيل برقم الهوية
        const existingEmp = await Employee.findOne({ idNumber: data.idNumber });
        if (existingEmp) {
            return res.status(400).json({ success: false, message: "عذراً، رقم الهوية/الإقامة مسجل لدينا مسبقاً" });
        }

        const newEmployee = new Employee({ 
            ...data, 
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

// 1. جلب بيانات موظف واحد (لعرضها في الـ Modal)
router.get('/manager/api/get-employee/:id', async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id);
        if (!emp) return res.status(404).json({ message: "الموظف غير موجود" });
        res.json(emp);
    } catch (err) { res.status(500).json({ message: "خطأ في السيرفر" }); }
});

// 2. جلب جميع موظفي المنشأة (للعرض في الجدول الرئيسي)
router.get('/manager/api/get-employees/:scopeId', async (req, res) => {
    try {
        const emps = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(emps);
    } catch (err) { res.status(500).json([]); }
});

// 3. تحديث بيانات الموظف (PUT)
router.put('/manager/api/update-employee/:id', async (req, res) => {
    try {
        const updateData = req.body;
        // معالجة البيانات المنطقية في التحديث أيضاً
        const booleanFields = ['hasHealthInsurance', 'hasCarAuthorization'];
        booleanFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateData[field] = (updateData[field] === 'true' || updateData[field] === true);
            }
        });

        await Employee.findByIdAndUpdate(req.params.id, { $set: updateData });
        res.json({ success: true, message: "تم تحديث ملف الموظف بنجاح" });
    } catch (err) { 
        res.status(400).json({ success: false, message: "فشل تحديث البيانات" }); 
    }
});

// 4. حذف موظف نهائياً
router.delete('/manager/api/delete-employee/:id', async (req, res) => {
    try {
        // يمكنك إضافة شرط هنا يا أبو حمزة: إذا كان المستخدم أدمن فقط
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (err) { res.status(500).json({ success: false, message: "فشل عملية الحذف" }); }
});

// 5. جلب إحصائيات سريعة للمنشأة (جديد لخدمة الـ Stat Cards)
router.get('/manager/api/scope-stats/:scopeId', async (req, res) => {
    try {
        const scopeId = req.params.scopeId;
        const total = await Employee.countDocuments({ scopeId });
        const expired = await Employee.countDocuments({ scopeId, idExpiry: { $lt: new Date() } });
        const saudi = await Employee.countDocuments({ scopeId, nationality: 'السعودية' });
        
        res.json({ total, expired, saudi });
    } catch (err) { res.status(500).json({ message: "خطأ في الإحصائيات" }); }
});

module.exports = router;