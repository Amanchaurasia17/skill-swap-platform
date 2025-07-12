const express = require("express");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Get all users 
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.log("Get users error:", error.message);
    res.status(500).json({ error: "Server error while fetching users" });
  }
});

// Get all public users with search and pagination
router.get("/public", async (req, res) => {
  try {
    const { 
      search, 
      skill, 
      location, 
      page = 1, 
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const query = { profileType: "public", isActive: true };
    
    // Build search query
    if (search) {
      query.$text = { $search: search };
    }
    
    if (skill) {
      query.$or = [
        { skillsOffered: { $regex: skill, $options: "i" } },
        { skillsWanted: { $regex: skill, $options: "i" } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query
    const users = await User.find(query)
      .select("-passwordHash -feedback")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Get public users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Search users by skill
router.get("/search", async (req, res) => {
  try {
    const { q, type = "both" } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }

    let query = { profileType: "public", isActive: true };
    
    switch (type) {
      case "offered":
        query.skillsOffered = { $regex: q, $options: "i" };
        break;
      case "wanted":
        query.skillsWanted = { $regex: q, $options: "i" };
        break;
      default:
        query.$or = [
          { skillsOffered: { $regex: q, $options: "i" } },
          { skillsWanted: { $regex: q, $options: "i" } }
        ];
    }

    const users = await User.find(query)
      .select("-passwordHash -feedback")
      .limit(20);

    res.json(users);

  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash")
      .populate("feedback.from", "name");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only show public profiles or own profile
    if (user.profileType === "private" && (!req.user || req.user._id.toString() !== user._id.toString())) {
      return res.status(403).json({ error: "Profile is private" });
    }

    res.json(user);

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update current user's profile (dedicated profile route)
router.put("/profile", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const allowedUpdates = [
      "name", "location", "profilePhoto", "skillsOffered", 
      "skillsWanted", "availability", "profileType"
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile
router.put("/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Users can only update their own profile
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "You can only update your own profile" });
    }

    const allowedUpdates = [
      "name", "location", "profilePhoto", "skillsOffered", 
      "skillsWanted", "availability", "profileType"
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId, 
      updates, 
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add feedback and rating
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, message } = req.body;
    const targetUserId = req.params.id;
    
    if (!rating || !message) {
      return res.status(400).json({ error: "Rating and message are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (req.user._id.toString() === targetUserId) {
      return res.status(400).json({ error: "You cannot rate yourself" });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already gave feedback
    const existingFeedback = user.feedback.find(
      f => f.from.toString() === req.user._id.toString()
    );

    if (existingFeedback) {
      return res.status(400).json({ error: "You have already provided feedback for this user" });
    }

    // Add feedback
    user.feedback.push({
      from: req.user._id,
      message,
      rating
    });

    // Update rating
    await user.updateRating(rating);

    res.json({
      message: "Feedback added successfully",
      averageRating: user.averageRating
    });

  } catch (error) {
    console.error("Add feedback error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's feedback
router.get("/:id/feedback", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("feedback")
      .populate("feedback.from", "name");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.feedback);

  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user account
router.delete("/:id", auth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Users can only delete their own account
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "You can only delete your own account" });
    }

    // Soft delete - just deactivate the account
    await User.findByIdAndUpdate(userId, { isActive: false });

    res.json({ message: "Account deactivated successfully" });

  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;