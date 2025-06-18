import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 