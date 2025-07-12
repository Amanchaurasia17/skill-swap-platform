const mongoose = require("mongoose");
const SwapRequest = require("./models/SwapRequest");
const User = require("./models/User");
require("dotenv").config();

async function testAPIResponse() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap-platform");
    console.log("Connected to MongoDB");

    // Test getting swap requests for System Administrator (the logged-in user)
    const systemAdminUser = await User.findOne({ email: "admin@skillswap.com" });
    if (!systemAdminUser) {
      console.log("System Administrator user not found");
      return;
    }

    console.log(`\n=== TESTING API FOR USER: ${systemAdminUser.name} (${systemAdminUser._id}) ===`);

    // Simulate the API call that the frontend makes
    const userId = systemAdminUser._id.toString();
    
    let query = {
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    };

    const swaps = await SwapRequest.find(query)
      .populate("fromUser", "name email profilePhoto")
      .populate("toUser", "name email profilePhoto")
      .populate("feedback.from", "name email")
      .sort({ createdAt: -1 });

    console.log(`\nFound ${swaps.length} swap requests for this user:`);
    
    let pendingCount = 0;
    let acceptedCount = 0;
    let completedCount = 0;
    let rejectedCount = 0;

    swaps.forEach((swap, index) => {
      console.log(`\n${index + 1}. Swap ID: ${swap._id}`);
      console.log(`   From: ${swap.fromUser?.name} (${swap.fromUser?._id})`);
      console.log(`   To: ${swap.toUser?.name} (${swap.toUser?._id})`);
      console.log(`   Status: ${swap.status}`);
      console.log(`   Offered: ${swap.offeredSkill}`);
      console.log(`   Wanted: ${swap.wantedSkill}`);
      console.log(`   Feedback: ${swap.feedback ? swap.feedback.length : 0} entries`);
      console.log(`   Created: ${swap.createdAt}`);

      // Count statuses
      switch(swap.status) {
        case 'pending': pendingCount++; break;
        case 'accepted': acceptedCount++; break;
        case 'completed': completedCount++; break;
        case 'rejected': rejectedCount++; break;
      }
    });

    console.log(`\n=== STATISTICS ===`);
    console.log(`Pending: ${pendingCount}`);
    console.log(`Accepted (Active): ${acceptedCount}`);
    console.log(`Completed: ${completedCount}`);
    console.log(`Rejected: ${rejectedCount}`);

    // Test the API response format
    const apiResponse = {
      swaps,
      pagination: {
        current: 1,
        pages: Math.ceil(swaps.length / 10),
        total: swaps.length,
        limit: 10
      }
    };

    console.log(`\n=== API RESPONSE FORMAT ===`);
    console.log(`Response structure: { swaps: Array(${apiResponse.swaps.length}), pagination: {...} }`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
  }
}

testAPIResponse();
