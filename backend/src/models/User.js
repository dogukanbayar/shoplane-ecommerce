const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6,
    default: null,
    select: false
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', "seller"],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  // Social Login Providers
  socialProviders: {
    google: {
      uid: String,
      email: String,
      avatar: String,
      connected: { type: Boolean, default: false }
    },
    facebook: {
      uid: String,
      email: String,
      avatar: String,
      connected: { type: Boolean, default: false }
    },
    apple: {
      uid: String,
      email: String,
      avatar: String,
      connected: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // GAMİFİKASYON - YENİ
  gamification: {
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    badges: [{
      id: String,
      name: String,
      description: String,
      icon: String,
      earnedAt: Date
    }],
    dailySpinAvailable: {
      type: Boolean,
      default: true
    },
    lastSpinDate: {
      type: Date,
      default: null
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Email preferences - YENİ
  emailSubscribed: {
    type: Boolean,
    default: true
  },
  notifications: {
    orderUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    priceDrops: {
      type: Boolean,
      default: false
    },
    stockAlerts: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    reviews: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
})

// Hash password (only if password exists and is modified)
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password)
}

// Generate Auth Token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken')
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  })
}

// Puan hesaplama
userSchema.methods.calculateLevel = function() {
  const points = this.gamification.points
  // Her 1000 puan = 1 level
  this.gamification.level = Math.floor(points / 1000) + 1
}

// Puan ekle
userSchema.methods.addPoints = function(points, reason) {
  this.gamification.points += points
  this.calculateLevel()
  return this.save()
}

// Rozet ekle
userSchema.methods.addBadge = function(badge) {
  const exists = this.gamification.badges.find(b => b.id === badge.id)
  if (!exists) {
    this.gamification.badges.push({
      ...badge,
      earnedAt: new Date()
    })
    return this.save()
  }
  return Promise.resolve(this)
}

module.exports = mongoose.model('User', userSchema)