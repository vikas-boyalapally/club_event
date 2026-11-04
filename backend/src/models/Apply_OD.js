const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApplyOD = sequelize.define('Apply_OD', {
  applicationId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'application_id' },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
  eventId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'event_id' },
  applicationStatus: {
    type: DataTypes.ENUM('applied', 'cancelled'),
    allowNull: false,
    defaultValue: 'applied',
    field: 'application_status'
  },
  odStatus: {
    type: DataTypes.ENUM('not_requested', 'pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'not_requested',
    field: 'od_status'
  },
  odReason: { type: DataTypes.TEXT, allowNull: true, field: 'od_reason' },
  reviewedByStaffId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'reviewed_by_staff_id' },
  reviewedAt: { type: DataTypes.DATE, allowNull: true, field: 'reviewed_at' },
  reportText: { type: DataTypes.TEXT, allowNull: true, field: 'report_text' },
  reportSubmittedAt: { type: DataTypes.DATE, allowNull: true, field: 'report_submitted_at' }
}, {
  indexes: [{ unique: true, fields: ['student_id', 'event_id'] }]
});

module.exports = ApplyOD;
