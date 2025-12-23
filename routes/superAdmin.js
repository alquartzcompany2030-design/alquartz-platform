// ✅ مسار تفعيل النطاق فوراً المحدث
router.post('/activate-scope-now', async (req, res) => {
    try {
        const { name, months } = req.body;
        
        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, message: "يرجى إدخال اسم الشركة" });
        }

        // توليد كود فريد
        const uniqueId = "SC-" + crypto.randomBytes(3).toString('hex').toUpperCase();
        
        // حساب تاريخ الانتهاء
        const expiryDate = new Date();
        let m = (months === "اشتراك سنة كاملة" || months === "12") ? 12 : parseInt(months) || 12;
        expiryDate.setMonth(expiryDate.getMonth() + m);

        // حفظ في موديل Organization (الموحد) لضمان ظهوره في المصفوفة
        const newOrg = new Organization({ 
            name: name.trim(), 
            uniqueId: uniqueId, 
            subscriptionExpiry: expiryDate, 
            status: 'active',
            saudiMale: 0, saudiFemale: 0,
            expatMale: 0, expatFemale: 0,
            totalWorkers: 0
        });

        await newOrg.save();
        console.log(`✅ تم تفعيل النطاق: ${name} بكود: ${uniqueId}`);
        
        res.status(200).json({ success: true, message: "تم التفعيل بنجاح", uniqueId });
    } catch (err) {
        console.error("❌ خطأ التفعيل:", err);
        res.status(500).json({ success: false, message: "فشل تفعيل النطاق في السيرفر" });
    }
});