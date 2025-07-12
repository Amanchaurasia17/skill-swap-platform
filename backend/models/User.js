const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String,
    trim: true,
    maxlength: 100
  },
  profilePhoto: String,
  skillsOffered: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  skillsWanted: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  availability: {
    type: String,
    enum: ["weekends", "evenings", "weekdays", "flexible"],
    default: "flexible"
  },
  profileType: { 
    type: String, 
    enum: ["public", "private"], 
    default: "public" 
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  feedback: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ 
  name: "text", 
  skillsOffered: "text", 
  skillsWanted: "text", 
  location: "text" 
});

// Virtual for average rating calculation
userSchema.virtual('averageRating').get(function() {
  if (this.ratingCount === 0) return 0;
  return this.rating / this.ratingCount;
});

// Method to update rating
userSchema.methods.updateRating = function(newRating) {
  this.rating = ((this.rating * this.ratingCount) + newRating) / (this.ratingCount + 1);
  this.ratingCount += 1;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);