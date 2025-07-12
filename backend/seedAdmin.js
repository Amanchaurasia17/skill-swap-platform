const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const dotenv = require("dotenv");

dotenv.config();

const createAdminUser = async () => {
  try {
  
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap-platform");
    console.log("Connected to MongoDB");

  
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return;
    }

    const adminPassword = "admin123456"; 
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const adminUser = new User({
      name: "System Administrator",
      email: "admin@skillswap.com",
      passwordHash,
      role: "admin",
      profileType: "private",
      skillsOffered: ["Platform Management", "System Administration"],
      skillsWanted: [],
      availability: "flexible",
      isActive: true
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@skillswap.com");
    console.log("Password: admin123456");
    console.log("⚠️  IMPORTANT: Change the admin password in production!");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

createAdminUser();
