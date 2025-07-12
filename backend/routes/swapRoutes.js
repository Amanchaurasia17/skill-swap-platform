const express = require("express");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Create a new swap request
router.post("/", auth, async (req, res) => {
  try {
    const { toUser, offeredSkill, wantedSkill, message } = req.body;

    // Validation
    if (!toUser || !offeredSkill || !wantedSkill) {
      return res.status(400).json({ error: "Recipient, offered skill, and wanted skill are required" });
    }

    if (req.user._id.toString() === toUser) {
      return res.status(400).json({ error: "You cannot send a swap request to yourself" });
    }

    // Check if recipient exists and has public profile
    const recipient = await User.findById(toUser);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ error: "Recipient not found or inactive" });
    }

    // Check if there's already a pending request between these users for the same skills
    const existingRequest = await SwapRequest.findOne({
      fromUser: req.user._id,
      toUser,
      offeredSkill,
      wantedSkill,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ error: "You already have a pending request for these skills with this user" });
    }

    // Create swap request
    const swap = new SwapRequest({
      fromUser: req.user._id,
      toUser,
      offeredSkill,
      wantedSkill,
      message
    });

    await swap.save();

    // Populate the response
    const populatedSwap = await SwapRequest.findById(swap._id)
      .populate("fromUser", "name email")
      .populate("toUser", "name email");

    res.status(201).json({
      message: "Swap request created successfully",
      swap: populatedSwap
    });

  } catch (error) {
    console.error("Create swap error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's swap requests (sent and received)
router.get("/my", auth, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    const { status, type = "all", page = 1, limit = 10 } = req.query;

    let query = {
      $or: [
        { fromUser: userId },
        { toUser: userId }
      ]
    };

    // Filter by type
    if (type === "sent") {
      query = { fromUser: userId };
    } else if (type === "received") {
      query = { toUser: userId };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const swaps = await SwapRequest.find(query)
      .populate("fromUser", "name email profilePhoto")
      .populate("toUser", "name email profilePhoto")
      .populate("feedback.from", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SwapRequest.countDocuments(query);

    res.json({
      swaps,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Get user swaps error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update swap request status
router.put("/:id", auth, async (req, res) => {
  try {
    const swapId = req.params.id;
    const { status, adminNote } = req.body;

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: "Swap request not found" });
    }

    // Only the recipient can accept/reject, and sender can cancel
    if (status === "accepted" || status === "rejected") {
      if (req.user._id.toString() !== swap.toUser.toString()) {
        return res.status(403).json({ error: "Only the recipient can accept or reject this request" });
      }
    } else if (status === "cancelled") {
      if (req.user._id.toString() !== swap.fromUser.toString()) {
        return res.status(403).json({ error: "Only the sender can cancel this request" });
      }
    } else if (status === "completed") {
      // Both users can mark as completed
      if (req.user._id.toString() !== swap.fromUser.toString() && 
          req.user._id.toString() !== swap.toUser.toString()) {
        return res.status(403).json({ error: "Only participants can mark the swap as completed" });
      }
    }

    // Update status and timestamps
    swap.status = status;
    if (adminNote) swap.adminNote = adminNote;

    switch (status) {
      case "accepted":
        swap.acceptedAt = new Date();
        break;
      case "rejected":
        swap.rejectedAt = new Date();
        break;
      case "completed":
        swap.completedAt = new Date();
        break;
    }

    await swap.save();

    const updatedSwap = await SwapRequest.findById(swapId)
      .populate("fromUser", "name email")
      .populate("toUser", "name email");

    res.json({
      message: `Swap request ${status} successfully`,
      swap: updatedSwap
    });

  } catch (error) {
    console.error("Update swap error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get swap request by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate("fromUser", "name email profilePhoto skillsOffered skillsWanted")
      .populate("toUser", "name email profilePhoto skillsOffered skillsWanted");

    if (!swap) {
      return res.status(404).json({ error: "Swap request not found" });
    }

    // Only participants can view the swap details
    if (req.user._id.toString() !== swap.fromUser._id.toString() && 
        req.user._id.toString() !== swap.toUser._id.toString()) {
      return res.status(403).json({ error: "You can only view your own swap requests" });
    }

    res.json(swap);

  } catch (error) {
    console.error("Get swap error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete swap request (only if pending and by sender)
router.delete("/:id", auth, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    
    if (!swap) {
      return res.status(404).json({ error: "Swap request not found" });
    }

    // Only sender can delete and only if pending
    if (req.user._id.toString() !== swap.fromUser.toString()) {
      return res.status(403).json({ error: "Only the sender can delete this request" });
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ error: "Only pending requests can be deleted" });
    }

    await SwapRequest.findByIdAndDelete(req.params.id);

    res.json({ message: "Swap request deleted successfully" });

  } catch (error) {
    console.error("Delete swap error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get swap statistics for a user
router.get("/stats/:userId", auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Users can only see their own stats
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ error: "You can only view your own statistics" });
    }

    const stats = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { fromUser: req.user._id },
            { toUser: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.json(formattedStats);

  } catch (error) {
    console.error("Get swap stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add feedback for a completed swap request
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const swapId = req.params.id;

    // Validation
    if (!rating) {
      return res.status(400).json({ error: "Rating is required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Find the swap request
    const swap = await SwapRequest.findById(swapId)
      .populate("fromUser", "name email")
      .populate("toUser", "name email");

    if (!swap) {
      return res.status(404).json({ error: "Swap request not found" });
    }

    // Check if user is part of this swap
    const userId = req.user._id.toString();
    if (swap.fromUser._id.toString() !== userId && swap.toUser._id.toString() !== userId) {
      return res.status(403).json({ error: "You can only provide feedback for your own swaps" });
    }

    // Check if swap is completed
    if (swap.status !== "completed") {
      return res.status(400).json({ error: "Can only provide feedback for completed swaps" });
    }

    // Check if feedback already exists from this user
    if (swap.feedback && swap.feedback.some(f => f.from.toString() === userId)) {
      return res.status(400).json({ error: "You have already provided feedback for this swap" });
    }

    // Add feedback
    if (!swap.feedback) {
      swap.feedback = [];
    }

    swap.feedback.push({
      from: userId,
      rating,
      comment: comment || "",
      createdAt: new Date()
    });

    await swap.save();

    // Also add feedback to the other user's profile
    const targetUserId = swap.fromUser._id.toString() === userId ? swap.toUser._id : swap.fromUser._id;
    const targetUser = await User.findById(targetUserId);

    if (targetUser) {
      targetUser.feedback.push({
        from: userId,
        message: comment || `Feedback for ${swap.offeredSkill} <-> ${swap.wantedSkill} swap`,
        rating,
        createdAt: new Date()
      });

      // Update user's rating
      await targetUser.updateRating(rating);
    }

    res.json({
      message: "Feedback submitted successfully",
      feedback: swap.feedback
    });

  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;