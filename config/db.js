const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`------------------------------------------`);
        console.log(`✅ السحابة متصلة: ${conn.connection.host}`);
        console.log(`📁 قاعدة البيانات: AlQuartzDB`);
        console.log(`------------------------------------------`);
    } catch (error) {
        console.error(`❌ فشل الاتصال بالسحابة: ${error.message}`);
        process.exit(1); // إيقاف السيرفر في حال فشل الاتصال
    }
};

module.exports = connectDB;