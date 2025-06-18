const features = [
  {
    icon: 'heart',
    title: 'Real-time Blood Requests',
    description: 'Post and find blood donation requests instantly with live updates.',
    color: 'text-red-600 bg-red-50'
  },
  {
    icon: 'map-pin',
    title: 'Location-based Matching',
    description: 'Find nearby donors and requests using our interactive map.',
    color: 'text-blue-600 bg-blue-50'
  },
  {
    icon: 'clock',
    title: 'Emergency Alerts',
    description: 'Get instant notifications for critical blood needs in your area.',
    color: 'text-orange-600 bg-orange-50'
  },
  {
    icon: 'shield',
    title: 'Secure & Verified',
    description: 'All users are verified to ensure safe and reliable donations.',
    color: 'text-green-600 bg-green-50'
  },
  {
    icon: 'users',
    title: 'Community Driven',
    description: 'Join a network of life-savers making a difference every day.',
    color: 'text-purple-600 bg-purple-50'
  },
  {
    icon: 'zap',
    title: 'Instant Connection',
    description: 'Connect donors and recipients in seconds, not hours.',
    color: 'text-yellow-600 bg-yellow-50'
  }
];

const stats = [
  { number: '10,000+', label: 'Lives Saved', icon: 'heart' },
  { number: '25,000+', label: 'Active Donors', icon: 'users' },
  { number: '500+', label: 'Partner Hospitals', icon: 'map-pin' },
  { number: '99.9%', label: 'Response Rate', icon: 'clock' }
];

// @desc    Get application features
// @route   GET /api/app-config/features
// @access  Public
export const getAppFeatures = (req, res) => {
  res.status(200).json({
    success: true,
    features,
  });
};

// @desc    Get application statistics
// @route   GET /api/app-config/stats
// @access  Public
export const getAppStats = (req, res) => {
  res.status(200).json({
    success: true,
    stats,
  });
}; 