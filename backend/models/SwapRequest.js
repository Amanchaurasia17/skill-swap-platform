const mongoose = require("mongoose");

const swapRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  offeredSkill: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  wantedSkill: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"], 
    default: "pending" 
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  adminNote: {
    type: String,
    maxlength: 500
  },
  completedAt: Date,
  rejectedAt: Date,
  acceptedAt: Date,
  feedback: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
swapRequestSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Indexes for better query performance
swapRequestSchema.index({ fromUser: 1, status: 1 });
swapRequestSchema.index({ toUser: 1, status: 1 });
swapRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SwapRequest", swapRequestSchema);