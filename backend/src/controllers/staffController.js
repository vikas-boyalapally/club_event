const { Op } = require('sequelize');
const { Student, Event, ApplyOD, Staff } = require('../models');

async function listStudents(req, res) {
  const where = {};
  if (req.query.search) {
    const term = `%${String(req.query.search).trim()}%`;
    where[Op.or] = [
      { fullName: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { department: { [Op.like]: term } }
    ];
  }
  const students = await Student.findAll({ where, order: [['fullName', 'ASC']] });
  res.json({ students });
}

async function listODApplications(req, res) {
  const validStatuses = ['pending', 'approved', 'rejected'];
  const status = req.query.status || 'pending';
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}.` });
  }
  const applications = await ApplyOD.findAll({
    where: { odStatus: status, applicationStatus: 'applied' },
    include: [
      { model: Student, as: 'student' },
      { model: Event, as: 'event' },
      { model: Staff, as: 'reviewedBy' }
    ],
    order: [['createdAt', 'ASC']]
  });
  res.json({ applications });
}

async function reviewODApplication(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved or rejected.' });
  }
  const application = await ApplyOD.findByPk(req.params.applicationId);
  if (!application || application.applicationStatus !== 'applied') {
    return res.status(404).json({ error: 'Event application not found.' });
  }
  if (application.odStatus !== 'pending') {
    return res.status(409).json({ error: 'Only pending OD applications can be reviewed.' });
  }
  await application.update({
    odStatus: status,
    reviewedByStaffId: req.user.id,
    reviewedAt: new Date()
  });
  res.json({ application });
}

module.exports = { listStudents, listODApplications, reviewODApplication };
