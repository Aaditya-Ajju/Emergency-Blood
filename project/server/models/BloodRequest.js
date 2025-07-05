import mongoose from 'mongoose'

const bloodRequestSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  hospitalName: {
    type: String,
    required: true,
    trim: true
  },
  hospitalAddress: {
    type: String,
    required: true,
    trim: true
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
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  donors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'donated'],
      default: 'pending'
    },
    responseDate: {
      type: Date,
      default: Date.now
    }
  }],
  completedDate: {
    type: Date
  },
  isEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for efficient queries
bloodRequestSchema.index({ city: 1, state: 1, bloodGroup: 1 })
bloodRequestSchema.index({ status: 1, urgency: 1 })
bloodRequestSchema.index({ createdAt: -1 })

// Mark as emergency if urgency is high
bloodRequestSchema.pre('save', function(next) {
  if (this.urgency === 'high') {
    this.isEmergency = true
  }
  next()
})

export default mongoose.model('BloodRequest', bloodRequestSchema)