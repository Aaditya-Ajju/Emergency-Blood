import Notification from '../models/Notification.js';

// Get notifications for the logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ requester: req.user.id })
      .populate('responder', 'name age bloodGroup phone')
      .populate('bloodRequest');
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// Mark a notification as completed
export const markNotificationCompleted = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, requester: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    notification.isCompleted = true;
    await notification.save();
    res.json({ success: true, message: 'Notification marked as completed', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification', error: error.message });
  }
}; 