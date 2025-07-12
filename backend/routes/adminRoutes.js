const express = require("express");
const User = require("../models/User");
const SwapRequest = require("../models/SwapRequest");
const { auth, adminAuth } = require("../middleware/auth");
const router = express.Router();

// Get all users (admin only)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "all", search } = req.query;
    
    let query = {};
    
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
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
    console.error("Admin get users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Ban/unban user
router.put("/users/:id/status", adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ error: "Cannot modify admin user status" });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: { id: user._id, name: user.name, isActive: user.isActive }
    });

  } catch (error) {
    console.error("Admin update user status error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all swap requests (admin only)
router.get("/swaps", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "all" } = req.query;
    
    let query = {};
    if (status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const swaps = await SwapRequest.find(query)
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
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
    console.error("Admin get swaps error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin can cancel/reject inappropriate swap requests
router.put("/swaps/:id/moderate", adminAuth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const swapId = req.params.id;

    if (!["rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Admin can only reject or cancel swap requests" });
    }

    const swap = await SwapRequest.findById(swapId);
    if (!swap) {
      return res.status(404).json({ error: "Swap request not found" });
    }

    swap.status = status;
    swap.adminNote = adminNote || "Moderated by admin";
    
    if (status === "rejected") {
      swap.rejectedAt = new Date();
    }

    await swap.save();

    const updatedSwap = await SwapRequest.findById(swapId)
      .populate("fromUser", "name email")
      .populate("toUser", "name email");

    res.json({
      message: `Swap request ${status} by admin`,
      swap: updatedSwap
    });

  } catch (error) {
    console.error("Admin moderate swap error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get platform statistics
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSwaps = await SwapRequest.countDocuments();
    
    const swapStats = await SwapRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentSwaps = await SwapRequest.find()
      .populate("fromUser", "name")
      .populate("toUser", "name")
      .select("fromUser toUser status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const formattedSwapStats = {
      pending: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    };

    swapStats.forEach(stat => {
      formattedSwapStats[stat._id] = stat.count;
    });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      swaps: {
        total: totalSwaps,
        byStatus: formattedSwapStats
      },
      recent: {
        users: recentUsers,
        swaps: recentSwaps
      }
    });

  } catch (error) {
    console.error("Admin get stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Send platform-wide message/notification
router.post("/message", adminAuth, async (req, res) => {
  try {
    const { title, message, type = "info" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // In a real application, you would implement a notification system
    // For now, we'll just return success
    res.json({
      message: "Platform-wide message sent successfully",
      notification: {
        title,
        message,
        type,
        sentAt: new Date(),
        sentBy: req.user.name
      }
    });

  } catch (error) {
    console.error("Admin send message error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete inappropriate content
router.delete("/content/:type/:id", adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;

    let result;
    
    if (type === "user") {
      result = await User.findByIdAndUpdate(
        id, 
        { isActive: false }, 
        { new: true }
      );
    } else if (type === "swap") {
      result = await SwapRequest.findByIdAndUpdate(
        id,
        { 
          status: "cancelled",
          adminNote: reason || "Removed for violating platform policies"
        },
        { new: true }
      );
    } else {
      return res.status(400).json({ error: "Invalid content type" });
    }

    if (!result) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json({
      message: `${type} content moderated successfully`,
      reason: reason || "Policy violation"
    });

  } catch (error) {
    console.error("Admin delete content error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Generate reports
router.get("/reports/:type", adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let report;

    if (type === "users") {
      report = await User.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: ["$isActive", 1, 0] }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
    } else if (type === "swaps") {
      report = await SwapRequest.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              status: "$status",
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
    } else {
      return res.status(400).json({ error: "Invalid report type" });
    }

    res.json({
      type,
      period: { startDate, endDate },
      data: report,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error("Admin generate report error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
