import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    trim: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'critical'],
    default: 'normal'
  },
  contact: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  notes: {
    type: String,
    trim: true
  },
  unitsNeeded: {
    type: Number,
    required: true,
    min: 1
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled', 'cancelled'],
    default: 'open'
  },
  fulfilledAt: {
    type: Date
  },
  fulfilledBy: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    unitsProvided: {
      type: Number,
      default: 1
    },
    fulfilledAt: {
      type: Date,
      default: Date.now
    }
  }],
  responses: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String
    },
    canDonate: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
bloodRequestSchema.index({ location: '2dsphere' });

// Create compound index for filtering
bloodRequestSchema.index({ bloodGroup: 1, urgency: 1, status: 1 });

export default mongoose.model('BloodRequest', bloodRequestSchema);