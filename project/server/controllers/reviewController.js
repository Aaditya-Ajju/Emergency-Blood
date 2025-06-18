import Review from '../models/Review.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Users only)
export const createReview = async (req, res) => {
  const { rating, comment, request, responder } = req.body;

  try {
    const review = await Review.create({
      user: req.user.id,
      rating,
      comment,
      request,
      responder,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
};

// @desc    Get all APPROVED reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 }); // Only fetch approved reviews

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
}; 