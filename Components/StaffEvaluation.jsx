import React, { useState } from 'react';

const StaffEvaluation = ({ employeeName, employeeId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // هنا يتم إرسال البيانات لسيرفرك المملوك لضمان خصوصية التقييمات
    console.log("تم إرسال التقييم:", { employeeId, rating, comment });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#28a745' }}>
        <h3>شكراً لك!</h3>
        <p>تم استلام تقييمك بنجاح، ملاحظاتك تساعدنا على تطوير خدمتنا.</p>
      </div>
    );
  }

  return (
    <div className="evaluation-card" style={{
      direction: 'rtl',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      maxWidth: '400px',
      margin: '20px auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>تقييم جودة الخدمة</h2>
      <p style={{ textAlign: 'center', color: '#666' }}>الموظف: <strong>{employeeName || "خدمة العملاء"}</strong></p>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '35px',
              color: (hover || rating) >= star ? '#FFD700' : '#ccc'
            }}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(rating)}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="هل لديك أي ملاحظات إضافية؟"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{
          width: '100%',
          height: '100px',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '15px',
          boxSizing: 'border-box'
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: rating === 0 ? '#ccc' : '#0056b3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        إرسال التقييم
      </button>
    </div>
  );
};

export default StaffEvaluation;