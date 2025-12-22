const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Scope = require('../models/Scope');

// --- [ واجهة الموظف - عرض نموذج التسجيل ] ---
router.get('/register/:uniqueId', async (req, res) => {
    try {
        const scope = await Scope.findOne({ uniqueId: req.params.uniqueId });
        if (!scope) return res.status(404).render('404', { message: "النطاق غير موجود" });
        
        // عرض صفحة التسجيل وإرسال بيانات المنشأة لها
        res.render('employee_form', { scope });
    } catch (err) { 
        res.status(500).send("خطأ في النظام - يرجى المحاولة لاحقاً"); 
    }
});

// --- [ عمليات الـ API للموظف - حفظ التسجيل الجديد ] ---
router.post('/api/register', async (req, res) => {
    try {
        const data = req.body;

        // 1. تحويل القيم النصية الآتية من الفورم (Checkbox/Select) إلى Boolean لضمان صحة البيانات في DB
        const booleanFields = ['hasHealthInsurance', 'hasFamilyInKSA', 'hasCarAuthorization', 'hasDrivingLicense'];
        booleanFields.forEach(field => {
            if (data[field] !== undefined) {
                data[field] = (data[field] === 'true' || data[field] === true);
            }
        });

        // 2. التحقق من عدم تكرار رقم الهوية/الإقامة في نفس النظام (اختياري ولكن مفيد)
        const existingEmp = await Employee.findOne({ idNumber: data.idNumber });
        if (existingEmp) {
            return res.status(400).json({ success: false, message: "رقم الهوية مسجل مسبقاً" });
        }

        // 3. إنشاء السجل الجديد
        const newEmployee = new Employee({
            ...data,
            status: 'active' // الحالة الافتراضية عند التسجيل
        });

        await newEmployee.save();
        res.status(200).json({ success: true, message: "تم تسجيل بياناتك بنجاح يا " + data.fullName });
        
    } catch (err) { 
        console.error("Register Error:", err);
        res.status(400).json({ success: false, message: "فشل حفظ البيانات، تأكد من تعبئة جميع الحقول" }); 
    }
});

// --- [ عمليات الـ API للمدير - التحكم والتعليق ] ---

// 1. جلب بيانات موظف واحد للتعديل
router.get('/manager/api/employee/:id', async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id);
        if (!emp) return res.status(404).json({ message: "الموظف غير موجود" });
        res.json(emp);
    } catch (err) { res.status(500).json({ message: "خطأ في جلب البيانات" }); }
});

// 2. تحديث بيانات الموظف (التعديل اليدوي من قبل أبو حمزة أو المدير)
router.post('/manager/api/update-employee', async (req, res) => {
    try {
        const { empId, ...updateData } = req.body;
        
        // تحديث السجل مع تفعيل التحقق من البيانات (runValidators)
        const result = await Employee.findByIdAndUpdate(empId, updateData, { new: true, runValidators: true });
        
        if (!result) return res.status(404).json({ success: false, message: "الموظف غير موجود" });
        res.json({ success: true, message: "تم التحديث بنجاح" });
    } catch (err) { 
        console.error("Update Error:", err);
        res.status(400).json({ success: false, message: "خطأ في تحديث البيانات" }); 
    }
});

// 3. تغيير الحالة (تنشيط / تعليق)
router.post('/manager/api/update-status', async (req, res) => {
    try {
        const { empId, status } = req.body;
        await Employee.findByIdAndUpdate(empId, { status: status });
        res.json({ success: true, message: "تم تغيير الحالة بنجاح" });
    } catch (err) { res.status(400).json({ success: false }); }
});

// 4. جلب جميع موظفي النطاق (للوحة التحكم والمصفوفة)
router.get('/manager/api/get-employees/:scopeId', async (req, res) => {
    try {
        // ترتيب الموظفين: الأحدث تسجيلاً يظهر أولاً
        const emps = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(emps);
    } catch (err) { 
        res.status(500).json([]); 
    }
});

module.exports = router;