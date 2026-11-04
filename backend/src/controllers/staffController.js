const { Student, Event, ApplyOD, Staff } = require('../models');

async function listStudents(req, res) {
  const filter = {};
  if (req.query.search) {
    const term = String(req.query.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(term, 'i');
    filter.$or = [
      { fullName: match },
      { email: match },
      { department: match }
    ];
  }
  const students = await Student.find(filter).sort({ fullName: 1 });
  res.json({ students });
}

async function listODApplications(req, res) {
  const validStatuses = ['pending', 'approved', 'rejected'];
  const status = req.query.status || 'pending';
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}.` });
  }
  const applications = await ApplyOD.find({ odStatus: status, applicationStatus: 'applied' })
    .populate('student')
    .populate('event')
    .populate('reviewedBy', 'fullName email')
    .sort({ createdAt: 1 });
  res.json({ applications });
}

async function reviewODApplication(req, res) {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved or rejected.' });
  }
  const application = await ApplyOD.findById(req.params.applicationId);
  if (!application || application.applicationStatus !== 'applied') {
    return res.status(404).json({ error: 'Event application not found.' });
  }
  if (application.odStatus !== 'pending') {
    return res.status(409).json({ error: 'Only pending OD applications can be reviewed.' });
  }
  application.set({
    odStatus: status,
    reviewedByStaffId: req.user.id,
    reviewedAt: new Date()
  });
  await application.save();
  res.json({ application });
}

module.exports = { listStudents, listODApplications, reviewODApplication };
