/**
 * نظام السحابة الذهبية - الإدارة المالية
 * المطور: أبو حمزة
 * ملف التحكم في الواجهات (JS)
 */

// 1. التحكم في النوافذ المنبثقة (Modals)
function openModal(type) {
    const modal = document.getElementById('transModal');
    const typeInput = document.getElementById('transType');
    const title = document.getElementById('modalTitle');

    if (modal && typeInput && title) {
        typeInput.value = type;
        title.innerText = (type === 'قبض') ? 'إنشاء سند قبض (إيراد)' : 'إنشاء سند صرف (مصروف)';
        
        // تغيير لون زر الحفظ بناءً على النوع
        const submitBtn = modal.querySelector('button[type="submit"]');
        if(type === 'قبض') {
            submitBtn.style.backgroundColor = '#27ae60';
        } else {
            submitBtn.style.backgroundColor = '#e74c3c';
        }

        modal.style.display = 'block';
    }
}

function closeModal() {
    const modal = document.getElementById('transModal');
    if (modal) {
        modal.style.display = 'none';
        // إعادة تعيين النموذج بعد الإغلاق
        modal.querySelector('form').reset();
    }
}

// 2. إغلاق النافذة عند النقر خارجها
window.onclick = function(event) {
    const modal = document.getElementById('transModal');
    if (event.target === modal) {
        closeModal();
    }
};

// 3. وظيفة البحث السريع في الجداول (للعملاء والموردين)
function searchTable() {
    const input = document.getElementById("tableSearch");
    if (!input) return;
    
    const filter = input.value.toLowerCase();
    const table = document.querySelector("table");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let textContent = tr[i].textContent.toLowerCase();
        tr[i].style.display = textContent.includes(filter) ? "" : "none";
    }
}

// 4. تنسيق الأرقام تلقائياً (إضافة فاصلة الآلاف أثناء الكتابة)
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('blur', function() {
        if(this.value) {
            console.log("تم تسجيل مبلغ: " + parseFloat(this.value).toLocaleString());
        }
    });
});