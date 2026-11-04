const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true },
  venue: { type: String, required: true, trim: true, maxlength: 180 },
  eventDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
  organizer: { type: String, required: true, trim: true, maxlength: 120 },
  capacity: { type: Number, min: 1, default: null },
  createdByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
}, {
  timestamps: true,
  collection: 'events',
  toJSON: {
    virtuals: true,
    transform(document, result) {
      delete result._id;
      delete result.__v;
      return result;
    }
  }
});

schema.virtual('eventId').get(function getEventId() {
  return this._id.toString();
});

module.exports = mongoose.models.Event || mongoose.model('Event', schema);
