const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  department: { type: String, required: true, trim: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 30 }
}, {
  timestamps: true,
  collection: 'staff',
  toJSON: {
    virtuals: true,
    transform(document, result) {
      delete result._id;
      delete result.__v;
      delete result.passwordHash;
      return result;
    }
  }
});

schema.virtual('staffId').get(function getStaffId() {
  return this._id.toString();
});

module.exports = mongoose.models.Staff || mongoose.model('Staff', schema);
