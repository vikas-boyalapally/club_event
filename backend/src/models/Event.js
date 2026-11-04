const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Event = sequelize.define('Event', {
  eventId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'event_id' },
  title: { type: DataTypes.STRING(180), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  venue: { type: DataTypes.STRING(180), allowNull: false },
  eventDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'event_date' },
  startTime: { type: DataTypes.TIME, allowNull: true, field: 'start_time' },
  endTime: { type: DataTypes.TIME, allowNull: true, field: 'end_time' },
  organizer: { type: DataTypes.STRING(120), allowNull: false },
  capacity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
  createdByAdminId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'created_by_admin_id' }
});

module.exports = Event;
