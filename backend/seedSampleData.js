const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const SwapRequest = require("./models/SwapRequest");
const dotenv = require("dotenv");

dotenv.config();

const sampleUsers = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    location: "New York, NY",
    skillsOffered: ["JavaScript", "React", "Node.js"],
    skillsWanted: ["Python", "Machine Learning", "Data Science"],
    availability: "evenings",
    profileType: "public"
  },
  {
    name: "Bob Smith",
    email: "bob@example.com", 
    password: "password123",
    location: "San Francisco, CA",
    skillsOffered: ["Python", "Django", "Machine Learning"],
    skillsWanted: ["JavaScript", "React", "Frontend Development"],
    availability: "weekends",
    profileType: "public"
  },
  {
    name: "Carol Davis",
    email: "carol@example.com",
    password: "password123", 
    location: "Austin, TX",
    skillsOffered: ["UI/UX Design", "Figma", "Adobe Creative Suite"],
    skillsWanted: ["JavaScript", "Web Development", "CSS"],
    availability: "flexible",
    profileType: "public"
  },
  {
    name: "David Wilson",
    email: "david@example.com",
    password: "password123",
    location: "Seattle, WA", 
    skillsOffered: ["DevOps", "AWS", "Docker", "Kubernetes"],
    skillsWanted: ["Go", "Rust", "System Programming"],
    availability: "weekdays",
    profileType: "public"
  },
  {
    name: "Eva Martinez",
    email: "eva@example.com",
    password: "password123",
    location: "Miami, FL",
    skillsOffered: ["Digital Marketing", "SEO", "Social Media"],
    skillsWanted: ["Data Analytics", "Google Analytics", "Excel"],
    availability: "evenings",
    profileType: "public"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap-platform");
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({ role: { $ne: "admin" } });
    await SwapRequest.deleteMany({});
    console.log("Cleared existing sample data");

    // Create sample users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        passwordHash,
        password: undefined // Remove password field
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Create sample swap requests
    const sampleSwaps = [
      {
        fromUser: createdUsers[0]._id, // Alice
        toUser: createdUsers[1]._id,   // Bob
        offeredSkill: "React",
        wantedSkill: "Python",
        message: "Hi Bob! I'd love to learn Python from you and can teach React in return.",
        status: "pending"
      },
      {
        fromUser: createdUsers[1]._id, // Bob
        toUser: createdUsers[2]._id,   // Carol
        offeredSkill: "Machine Learning",
        wantedSkill: "UI/UX Design",
        message: "Hey Carol, interested in trading ML knowledge for design skills?",
        status: "accepted"
      },
      {
        fromUser: createdUsers[2]._id, // Carol
        toUser: createdUsers[0]._id,   // Alice
        offeredSkill: "Figma",
        wantedSkill: "JavaScript",
        message: "Alice, I can help you with Figma if you can teach me JavaScript!",
        status: "completed"
      },
      {
        fromUser: createdUsers[3]._id, // David
        toUser: createdUsers[4]._id,   // Eva
        offeredSkill: "AWS",
        wantedSkill: "Digital Marketing",
        message: "Eva, would you be interested in learning AWS in exchange for marketing knowledge?",
        status: "rejected"
      }
    ];

    for (const swapData of sampleSwaps) {
      const swap = new SwapRequest(swapData);
      await swap.save();
      console.log(`Created swap request: ${swapData.offeredSkill} for ${swapData.wantedSkill}`);
    }

    // Add some feedback to users
    const alice = createdUsers[0];
    const bob = createdUsers[1];
    const carol = createdUsers[2];

    // Add feedback for Bob
    bob.feedback.push({
      from: alice._id,
      message: "Bob is an excellent teacher! His Python explanations were clear and helpful.",
      rating: 5
    });
    await bob.updateRating(5);

    // Add feedback for Carol  
    carol.feedback.push({
      from: alice._id,
      message: "Carol's design skills are amazing. She really helped improve my UI.",
      rating: 5
    });
    await carol.updateRating(5);

    // Add feedback for Alice
    alice.feedback.push({
      from: carol._id,
      message: "Alice is a great JavaScript teacher. Very patient and knowledgeable.",
      rating: 4
    });
    await alice.updateRating(4);

    console.log("\n✅ Sample data created successfully!");
    console.log("\n👥 Sample Users:");
    sampleUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Skills: ${user.skillsOffered.join(", ")}`);
    });

    console.log("\n🔄 Sample Swap Requests:");
    sampleSwaps.forEach(swap => {
      console.log(`  - ${swap.offeredSkill} ↔ ${swap.wantedSkill} (${swap.status})`);
    });

    console.log("\n🚀 You can now test the API with these sample users!");
    console.log("   Login credentials: email + 'password123'");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  }
};

// Run the seed function
seedDatabase();
