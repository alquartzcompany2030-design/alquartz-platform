const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const License = require('../models/License');
const Scope = require('../models/Scope');

// --- [ أولاً: واجهات العرض UI ] ---

// 1. لوحة التحكم الرئيسية
router.get('/dashboard', (req, res) => {
    res.render('manager_dashboard'); 
});

// 2. واجهة السجلات والرخص
router.get('/licenses', (req, res) => {
    res.render('manager_licenses'); 
});

// --- [ ثانياً: العمليات المشتركة API ] ---

// 1. جلب اسم المنشأة (لإزالة كلمة جاري التحميل)
router.get('/api/get-scope-info/:scopeId', async (req, res) => {
    try {
        const scope = await Scope.findOne({ uniqueId: req.params.scopeId });
        if (scope) return res.json(scope);
        const manager = await Manager.findOne({ scopeId: req.params.scopeId });
        res.json({ name: manager ? manager.name : "منشأة غير معروفة" });
    } catch (err) { res.status(500).json({ name: "خطأ في السيرفر" }); }
});

// --- [ ثالثاً: إدارة الموظفين API ] ---

// 1. جلب كل موظفي المنشأة (مع دعم فرز الجنسية)
router.get('/api/get-employees/:scopeId', async (req, res) => {
    try {
        const emps = await Employee.find({ scopeId: req.params.scopeId }).sort({ createdAt: -1 });
        res.json(emps);
    } catch (err) { res.status(500).json([]); }
});

// 2. جلب بيانات موظف واحد (للتعديل)
router.get('/api/employee/:id', async (req, res) => {
    try {
        const emp = await Employee.findById(req.params.id);
        res.json(emp);
    } catch (err) { res.status(500).json(null); }
});

// 3. تحديث بيانات الموظف (PUT) - محدث لدعم تعديل الجنسية
router.put('/api/update-employee/:id', async (req, res) => {
    try {
        const updateData = req.body;
        
        // منطق إضافي لضمان صحة الجنسية عند التعديل
        if (updateData.idNumber) {
            if (updateData.idNumber.startsWith('1')) {
                updateData.nationality = "السعودية";
            }
        }

        await Employee.findByIdAndUpdate(req.params.id, { $set: updateData });
        res.json({ success: true, message: "تم تحديث بيانات الموظف بنجاح" });
    } catch (err) { 
        console.error("Update Error:", err);
        res.status(500).json({ success: false, message: "فشل في تحديث البيانات" }); 
    }
});

// 4. حذف موظف نهائياً
router.delete('/api/delete-employee/:id', async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- [ رابعاً: إدارة السجلات والرخص API ] ---

// 1. جلب سجلات المنشأة
router.get('/licenses/api/all/:scopeId', async (req, res) => {
    try {
        const lics = await License.find({ scopeId: req.params.scopeId }).sort({ expiryDate: 1 });
        res.json(lics);
    } catch (err) { res.status(500).json([]); }
});

// 2. حفظ أو تحديث سجل (سجل تجاري، بلدي، إلخ)
router.post('/licenses/api/save', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        if (id && id !== "") {
            await License.findByIdAndUpdate(id, data);
        } else {
            await new License(data).save();
        }
        res.json({ success: true });
    } catch (err) { res.status(400).json({ success: false }); }
});

// 3. حذف سجل
router.delete('/licenses/api/delete/:id', async (req, res) => {
    try {
        await License.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 4. تغيير حالة السجل (نشط/موقوف)
router.post('/licenses/api/status', async (req, res) => {
    try {
        const { id, status } = req.body;
        await License.findByIdAndUpdate(id, { status });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = router;