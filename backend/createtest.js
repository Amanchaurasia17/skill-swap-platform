const mongoose = require("mongoose");
const SwapRequest = require("./models/SwapRequest");
const User = require("./models/User");
require("dotenv").config();

async function createTestScenarios() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap-platform");
    console.log("Connected to MongoDB");

    // Get users
    const systemAdmin = await User.findOne({ email: "admin@skillswap.com" });
    const amanUser = await User.findOne({ email: "amanchaurasiya92@gmail.com" });
    const aliceUser = await User.findOne({ email: "alice@example.com" });

    if (!systemAdmin || !amanUser || !aliceUser) {
      console.log("Required users not found");
      return;
    }

    console.log("Creating test scenarios...");

    // Scenario 1: System Admin sends request to Alice (should show Cancel button for Admin)
    const adminToAlice = new SwapRequest({
      fromUser: systemAdmin._id,
      toUser: aliceUser._id,
      offeredSkill: "System Administration",
      wantedSkill: "React",
      status: "pending",
      message: "I'd like to learn React from you"
    });
    await adminToAlice.save();
    console.log(`Created: Admin -> Alice request (${adminToAlice._id})`);

    // Scenario 2: Alice sends request to System Admin (should show Accept/Reject for Admin)
    const aliceToAdmin = new SwapRequest({
      fromUser: aliceUser._id,
      toUser: systemAdmin._id,
      offeredSkill: "Frontend Development",
      wantedSkill: "DevOps",
      status: "pending",
      message: "I need help with DevOps"
    });
    await aliceToAdmin.save();
    console.log(`Created: Alice -> Admin request (${aliceToAdmin._id})`);

    console.log("\nTest scenarios created!");
    console.log("Login as System Administrator to test:");
    console.log("- Request to Alice should show 'Cancel Request' button");
    console.log("- Request from Alice should show 'Accept' and 'Reject' buttons");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestScenarios();
