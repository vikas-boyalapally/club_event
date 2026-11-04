const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  applicationStatus: { type: String, enum: ['applied', 'cancelled'], default: 'applied', required: true },
  odStatus: {
    type: String,
    enum: ['not_requested', 'pending', 'approved', 'rejected'],
    default: 'not_requested',
    required: true
  },
  odReason: { type: String, trim: true, default: null },
  reviewedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  reviewedAt: { type: Date, default: null },
  reportText: { type: String, trim: true, default: null },
  reportSubmittedAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'apply_ods',
  toJSON: {
    virtuals: true,
    transform(document, result) {
      delete result._id;
      delete result.__v;
      return result;
    }
  }
});

schema.index({ studentId: 1, eventId: 1 }, { unique: true });
schema.virtual('applicationId').get(function getApplicationId() {
  return this._id.toString();
});
schema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});
schema.virtual('event', {
  ref: 'Event',
  localField: 'eventId',
  foreignField: '_id',
  justOne: true
});
schema.virtual('reviewedBy', {
  ref: 'Staff',
  localField: 'reviewedByStaffId',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.models.Apply_OD || mongoose.model('Apply_OD', schema);
