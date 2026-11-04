const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  studentId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, field: 'student_id' },
  fullName: { type: DataTypes.STRING(120), allowNull: false, field: 'full_name' },
  email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  department: { type: DataTypes.STRING(120), allowNull: false },
  year: { type: DataTypes.STRING(20), allowNull: false },
  phone: { type: DataTypes.STRING(30), allowNull: true }
}, {
  defaultScope: { attributes: { exclude: ['passwordHash'] } },
  scopes: { withPassword: { attributes: { include: ['passwordHash'] } } }
});

module.exports = Student;
