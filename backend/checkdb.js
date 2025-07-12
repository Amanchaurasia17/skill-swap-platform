const mongoose = require("mongoose");
const SwapRequest = require("./models/SwapRequest");
const User = require("./models/User");
require("dotenv").config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap-platform");
    console.log("Connected to MongoDB");

    // Check users
    const users = await User.find({}).select("name email");
    console.log("\n=== USERS ===");
    users.forEach(user => {
      console.log(`ID: ${user._id}, Name: ${user.name}, Email: ${user.email}`);
    });

    // Check swap requests
    const swaps = await SwapRequest.find({})
      .populate("fromUser", "name email")
      .populate("toUser", "name email");
    
    console.log("\n=== SWAP REQUESTS ===");
    swaps.forEach(swap => {
      console.log(`ID: ${swap._id}`);
      console.log(`From: ${swap.fromUser?.name} (${swap.fromUser?._id})`);
      console.log(`To: ${swap.toUser?.name} (${swap.toUser?._id})`);
      console.log(`Status: ${swap.status}`);
      console.log(`Offered: ${swap.offeredSkill}`);
      console.log(`Wanted: ${swap.wantedSkill}`);
      console.log(`Feedback: ${swap.feedback ? swap.feedback.length : 0} entries`);
      console.log("---");
    });

    // If we have users but no completed swaps, create one
    if (users.length >= 2 && !swaps.some(s => s.status === 'completed')) {
      console.log("\nCreating test completed swap...");
      const testSwap = new SwapRequest({
        fromUser: users[0]._id,
        toUser: users[1]._id,
        offeredSkill: "JavaScript",
        wantedSkill: "Python",
        status: "completed",
        completedAt: new Date(),
        message: "Test swap for feedback system"
      });
      
      await testSwap.save();
      console.log(`Created test swap with ID: ${testSwap._id}`);
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabase();
