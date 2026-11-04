const Student = require('./Student');
const Staff = require('./Staff');
const Admin = require('./Admin');
const ApplyOD = require('./Apply_OD');
const Event = require('./Event');

Student.hasMany(ApplyOD, { foreignKey: 'studentId', as: 'applications' });
ApplyOD.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Event.hasMany(ApplyOD, { foreignKey: 'eventId', as: 'applications' });
ApplyOD.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
Staff.hasMany(ApplyOD, { foreignKey: 'reviewedByStaffId', as: 'reviewedApplications' });
ApplyOD.belongsTo(Staff, { foreignKey: 'reviewedByStaffId', as: 'reviewedBy' });
Admin.hasMany(Event, { foreignKey: 'createdByAdminId', as: 'events' });
Event.belongsTo(Admin, { foreignKey: 'createdByAdminId', as: 'createdBy' });

module.exports = { Student, Staff, Admin, ApplyOD, Event };
