const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function findUsersWithPasswords() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap-platform");
    console.log("Connected to MongoDB");

    const users = await User.find({}).select("name email password");
    
    console.log("=== ALL USERS ===");
    for (const user of users) {
      console.log(`${user.name} (${user.email}): ${user.password ? 'Has password' : 'No password'}`);
      
      if (user.password && user.email === 'amanchaurasiya92@gmail.com') {
        // Test common passwords for this user
        const testPasswords = ['password', '123456', 'test123'];
        for (const pwd of testPasswords) {
          try {
            const isMatch = await bcrypt.compare(pwd, user.password);
            if (isMatch) {
              console.log(`  ✓ Password is: ${pwd}`);
              break;
            }
          } catch (e) {
            // continue
          }
        }
      }
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

findUsersWithPasswords();
