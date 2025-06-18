import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';

// Get authenticated user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user data', error: error.message });
  }
};

// Get user's donation history
export const getDonations = async (req, res) => {
  try {
    // Find blood requests where the current user has fulfilled the request
    const donations = await BloodRequest.find({
      'fulfilledBy.donor': req.user.id,
      status: 'fulfilled'
    })
      .populate('requester', 'name bloodGroup') // Populate requester's name and blood group
      .sort({ 'fulfilledBy.fulfilledAt': -1 }); // Sort by fulfilled date descending

    res.json({
      success: true,
      donations: donations
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation history',
      error: error.message
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'location', 'isAvailable'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get nearby available donors (simplified for now, can be enhanced with geospatial search)
export const getNearbyDonors = async (req, res) => {
  const { latitude, longitude, radius } = req.query; // radius in meters

  if (!latitude || !longitude || !radius) {
    return res.status(400).json({ message: 'Latitude, longitude, and radius are required query parameters.' });
  }

  try {
    const nearbyDonors = await User.find({
      isDonor: true,
      isAvailable: true,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) // Radius in meters
        }
      }
    }).select('-password'); // Exclude password from the results

    res.status(200).json({ success: true, count: nearbyDonors.length, data: nearbyDonors });
  } catch (error) {
    console.error('Error fetching nearby donors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 