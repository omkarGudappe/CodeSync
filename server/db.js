// const mongoose = require('mongoose');
// require('dotenv').config();

// const connectDB = async() => {
//      try{
//         await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser:true,
//             useUnifiedTopology:true,
//         })
//         console.log("✅ MongoDB connceted successfully");
//      }catch(err){
//         console.error("❌ MongoDB connection failed:", err.message);
//         process.exit(1); 
//      }
// }

// module.exports = connectDB;


const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

module.exports = connectDB;