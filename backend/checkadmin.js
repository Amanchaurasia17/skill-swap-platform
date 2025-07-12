const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function checkAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap-platform");
    console.log("Connected to MongoDB");

    const admin = await User.findOne({ email: "admin@skillswap.com" });
    if (admin) {
      console.log("Admin user found:");
      console.log("Email:", admin.email);
      console.log("Name:", admin.name);
      console.log("Password hash exists:", !!admin.password);
      
      // Test some common passwords
      const testPasswords = ['admin123', 'password', 'admin', '123456'];
      for (const pwd of testPasswords) {
        const isMatch = await bcrypt.compare(pwd, admin.password);
        if (isMatch) {
          console.log(`✓ Password is: ${pwd}`);
          break;
        }
      }
    } else {
      console.log("Admin user not found");
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAdminUser();
