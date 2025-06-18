import { validationResult } from 'express-validator';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import { calculateDistance } from '../utils/geoUtils.js';
import Notification from '../models/Notification.js';

export const createBloodRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const bloodRequest = await BloodRequest.create({
      bloodGroup: req.body.bloodGroup,
      urgency: req.body.urgency,
      contact: req.body.contact,
      location: req.body.location,
      notes: req.body.notes,
      unitsNeeded: req.body.units,
      patientName: req.body.patientName || 'Anonymous',
      requester: req.user.id
    });

    await bloodRequest.populate('requester', 'name email phone');

    // Emit socket event for real-time updates
    req.io.emit('newBloodRequest', bloodRequest);

    // Find nearby donors (within 50km radius)
    const nearbyDonors = await User.find({
      location: {
        $near: {
          $geometry: bloodRequest.location,
          $maxDistance: 50000 // 50km in meters
        }
      },
      bloodGroup: bloodRequest.bloodGroup,
      isDonor: true,
      isAvailable: true,
      _id: { $ne: req.user.id }
    });

    // Emit notification to nearby donors
    nearbyDonors.forEach(donor => {
      req.io.to(`user_${donor._id}`).emit('nearbyBloodRequest', {
        request: bloodRequest,
        distance: calculateDistance(donor.location.coordinates, bloodRequest.location.coordinates)
      });
    });

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: bloodRequest,
      nearbyDonorsCount: nearbyDonors.length
    });
  } catch (error) {
    console.error('Create blood request error:', error);
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating blood request',
      error: error.message
    });
  }
};

export const getBloodRequests = async (req, res) => {
  try {
    const {
      status,
      bloodGroup,
      urgency,
      latitude,
      longitude,
      radius = 50000,
      page = 1,
      limit = 20,
      userId,
      search
    } = req.query;

    const query = {};

    // 1. Filter by requester (for "My Requests")
    if (userId) {
      query.requester = userId;
    }

    // 2. Filter by status
    if (status) {
      if (status === 'Active') {
        query.status = 'open'; // Map 'Active' to 'open' for backend
      } else if (['open', 'fulfilled', 'cancelled'].includes(status)) {
        query.status = status;
      }
    } else if (!userId && !status) {
      // If no status is provided AND it's not a 'my requests' query, do not filter by status
      // This allows fetching all requests if no specific status or user filter is applied.
      // If `status` is explicitly undefined, this condition allows `query.status` to not be set.
    } else if (!userId) {
      // This else if block handles the case where no userId is provided, but status might be undefined or 'all'
      // If status is undefined (meaning no explicit status filter from client), we still want to show open/fulfilled for general view
      query.status = { $in: ['open', 'fulfilled'] };
    }

    // 3. Filter by blood group
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    // 4. Filter by urgency
    if (urgency) {
      query.urgency = urgency;
    }

    // 5. Location-based filtering
    if (latitude && longitude) {
      const earthRadiusInMeters = 6378100;
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            parseInt(radius) / earthRadiusInMeters
          ]
        }
      };
    }

    // 6. General search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
      query.$or = [
        { bloodGroup: searchRegex },
        { 'location.address': searchRegex },
        { contact: searchRegex },
        { notes: searchRegex }, // Added notes to search as well
      ];
    }

    console.log('Executing getBloodRequests with query:', JSON.stringify(query));

    const bloodRequests = await BloodRequest.find(query)
      .populate('requester', 'name phone')
      .populate('responses.donor', 'name bloodGroup')
      .populate('fulfilledBy.donor', 'name bloodGroup')
      .sort({ isEmergency: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log(`Found ${bloodRequests.length} blood requests.`);
    if (bloodRequests.length > 0) {
      console.log('First blood request example:', JSON.stringify(bloodRequests[0], null, 2));
    }

    const total = await BloodRequest.countDocuments(query);

    res.json({
      success: true,
      data: bloodRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blood requests'
    });
  }
};

export const getBloodRequestById = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('responses.donor', 'name bloodGroup phone')
      .populate('fulfilledBy.donor', 'name bloodGroup phone');

    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      data: bloodRequest
    });
  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching blood request'
    });
  }
};

export const respondToBloodRequest = async (req, res) => {
  try {
    const { message, canDonate = true } = req.body;
    const requestId = req.params.id;

    const bloodRequest = await BloodRequest.findById(requestId)
      .populate('requester', 'name email phone');
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Prevent requester from responding to their own request
    if (bloodRequest.requester._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot respond to your own blood request.'
      });
    }

    // Accept both 'open' and 'Active' as valid statuses
    if (bloodRequest.status !== 'open' && bloodRequest.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot respond to inactive blood request'
      });
    }

    // Check if user already responded
    const existingResponse = bloodRequest.responses.find(
      response => response.donor.toString() === req.user.id
    );

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this request'
      });
    }

    bloodRequest.responses.push({
      donor: req.user.id,
      message,
      canDonate
    });

    await bloodRequest.save();
    await bloodRequest.populate('responses.donor', 'name bloodGroup phone');

    // Notify requester with responder details and message
    const lastResponse = bloodRequest.responses[bloodRequest.responses.length - 1];
    req.io.to(`user_${bloodRequest.requester._id}`).emit('newResponse', {
      requestId: bloodRequest._id,
      response: {
        donor: lastResponse.donor,
        message: lastResponse.message,
        canDonate: lastResponse.canDonate,
        createdAt: lastResponse.createdAt
      }
    });

    // Create a notification for the requester
    const notification = await Notification.create({
      requester: bloodRequest.requester._id,
      responder: req.user.id,
      bloodRequest: bloodRequest._id
    });

    // Populate responder details for the socket event
    const populatedNotification = await Notification.findById(notification._id)
      .populate('responder', 'name age bloodGroup phone');
    req.io.to(`user_${bloodRequest.requester._id}`).emit('newNotification', populatedNotification);

    res.json({
      success: true,
      message: 'Response submitted successfully',
      data: bloodRequest
    });
  } catch (error) {
    console.error('Respond to blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while responding to blood request'
    });
  }
};

export const fulfillBloodRequest = async (req, res) => {
  try {
    const { donorId, unitsProvided } = req.body;
    const requestId = req.params.id;

    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Only requester or admin can fulfill
    if (bloodRequest.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to fulfill this request'
      });
    }

    const donor = await User.findById(donorId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    // Add to fulfilled list
    bloodRequest.fulfilledBy.push({
      donor: donorId,
      unitsProvided
    });

    // Update donor stats
    donor.donationCount += 1;
    donor.lastDonation = new Date();
    donor.updateBadges();
    await donor.save();

    // Check if request is fully fulfilled
    const totalUnitsFulfilled = bloodRequest.fulfilledBy.reduce(
      (sum, fulfillment) => sum + fulfillment.unitsProvided, 0
    );

    if (totalUnitsFulfilled >= bloodRequest.unitsNeeded) {
      bloodRequest.status = 'Fulfilled';
    }

    await bloodRequest.save();
    await bloodRequest.populate('fulfilledBy.donor', 'name bloodGroup');

    // Emit socket events
    req.io.emit('bloodRequestUpdated', bloodRequest);
    req.io.to(`user_${donorId}`).emit('donationConfirmed', {
      request: bloodRequest,
      newBadges: donor.badges
    });

    res.json({
      success: true,
      message: 'Blood request fulfilled successfully',
      data: bloodRequest
    });
  } catch (error) {
    console.error('Fulfill blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fulfilling blood request'
    });
  }
};

export const updateBloodRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Only requester or admin can update status
    if (bloodRequest.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this request'
      });
    }

    bloodRequest.status = status;
    await bloodRequest.save();

    // Emit socket event
    req.io.emit('bloodRequestUpdated', bloodRequest);

    res.json({
      success: true,
      message: 'Blood request status updated successfully',
      data: bloodRequest
    });
  } catch (error) {
    console.error('Update blood request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating blood request status'
    });
  }
};

export const getMyBloodRequests = async (req, res) => {
  try {
    const bloodRequests = await BloodRequest.find({ requester: req.user.id })
      .populate('responses.donor', 'name bloodGroup phone')
      .populate('fulfilledBy.donor', 'name bloodGroup phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bloodRequests
    });
  } catch (error) {
    console.error('Get my blood requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your blood requests'
    });
  }
};

// Create a new blood request
export const createRequest = async (req, res) => {
  try {
    const request = await BloodRequest.create({
      bloodGroup: req.body.bloodGroup,
      urgency: req.body.urgency,
      contact: req.body.contact,
      location: req.body.location,
      notes: req.body.notes,
      unitsNeeded: req.body.units,
      patientName: req.body.patientName || 'Anonymous',
      requester: req.user.id
    });

    await request.populate('requester', 'name email phone');

    // Notify nearby donors (implement with Socket.IO)
    // TODO: Implement notification logic

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blood request',
      error: error.message
    });
  }
};

// Get all blood requests with filters
export const getRequests = async (req, res) => {
  try {
    const { bloodGroup, urgency, radius } = req.query;
    const query = { status: 'open' };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (urgency) {
      query.urgency = urgency;
    }

    let requests = await BloodRequest.find(query)
      .populate('requester', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter by radius if user's location is provided
    if (radius && req.user.location) {
      requests = requests.filter(request => {
        const distance = calculateDistance(
          req.user.location.coordinates,
          request.location.coordinates
        );
        return distance <= radius;
      });
    }

    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood requests',
      error: error.message
    });
  }
};

// Get a single blood request
export const getRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone')
      .populate('responses.donor', 'name bloodGroup phone')
      .populate('fulfilledBy.donor', 'name bloodGroup phone');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blood request',
      error: error.message
    });
  }
};

// Update a blood request
export const updateRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check if user is the requester
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['urgency', 'contact', 'notes', 'status'];
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('requester', 'name email phone');

    res.json({
      success: true,
      message: 'Blood request updated successfully',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blood request',
      error: error.message
    });
  }
};

// Fulfill a blood request
export const fulfillRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    if (request.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been fulfilled or cancelled'
      });
    }

    // Update request status
    request.status = 'fulfilled';
    request.fulfilledBy = req.user.id;
    request.fulfilledAt = Date.now();
    await request.save();

    // Update donor's donation count and badges
    const donor = await User.findById(req.user.id);
    donor.donationCount += 1;
    donor.lastDonation = Date.now();
    donor.updateBadges();
    await donor.save();

    res.json({
      success: true,
      message: 'Blood request fulfilled successfully',
      request
    });
  } catch (error) {
    console.error('Fulfill request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fulfilling blood request',
      error: error.message
    });
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const requestId = req.params.id;
    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }
    // Only requester can mark as completed
    if (bloodRequest.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this request'
      });
    }
    bloodRequest.status = 'fulfilled';
    bloodRequest.fulfilledAt = new Date();
    await bloodRequest.save();
    await bloodRequest.populate('requester', 'name email phone');
    res.json({
      success: true,
      message: 'Request marked as completed',
      data: bloodRequest
    });
  } catch (error) {
    console.error('Mark as completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking as completed'
    });
  }
};