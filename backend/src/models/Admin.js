const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false }
}, {
  timestamps: true,
  collection: 'admins',
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

schema.virtual('adminId').get(function getAdminId() {
  return this._id.toString();
});

module.exports = mongoose.models.Admin || mongoose.model('Admin', schema);
