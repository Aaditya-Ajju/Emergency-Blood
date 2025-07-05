import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

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
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 65
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['donor', 'receiver', 'admin'],
    default: 'donor'
  },
  profileImage: {
    type: String,
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastDonation: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Check if donor is eligible (56 days since last donation)
userSchema.methods.isEligibleToDonate = function() {
  if (!this.lastDonation) return true
  
  const daysSinceLastDonation = Math.floor((Date.now() - this.lastDonation) / (1000 * 60 * 60 * 24))
  return daysSinceLastDonation >= 56
}

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  delete user.resetPasswordToken
  delete user.resetPasswordExpires
  return user
}

export default mongoose.model('User', userSchema)