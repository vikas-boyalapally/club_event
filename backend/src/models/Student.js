const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  department: { type: String, required: true, trim: true, maxlength: 120 },
  year: { type: String, required: true, trim: true, maxlength: 20 },
  phone: { type: String, trim: true, maxlength: 30 }
}, {
  timestamps: true,
  collection: 'students',
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

schema.virtual('studentId').get(function getStudentId() {
  return this._id.toString();
});

module.exports = mongoose.models.Student || mongoose.model('Student', schema);
