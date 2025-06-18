import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: false,
  },
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name bloodGroup' // Only select name and bloodGroup of the user
  });
  next();
});

export default mongoose.model('Review', reviewSchema); 