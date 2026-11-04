const { Op } = require('sequelize');
const { Student, Event, ApplyOD } = require('../models');

async function getProfile(req, res) {
  res.json({ user: req.user.record });
}

async function updateProfile(req, res) {
  const allowed = ['fullName', 'department', 'year', 'phone'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );
  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: `Provide at least one of: ${allowed.join(', ')}.` });
  }
  await req.user.record.update(updates);
  res.json({ user: req.user.record });
}

async function searchEvents(req, res) {
  const where = {};
  if (req.query.search) {
    const term = `%${String(req.query.search).trim()}%`;
    where[Op.or] = [
      { title: { [Op.like]: term } },
      { description: { [Op.like]: term } },
      { venue: { [Op.like]: term } },
      { organizer: { [Op.like]: term } }
    ];
  }
  if (req.query.date) where.eventDate = req.query.date;
  const events = await Event.findAll({ where, order: [['eventDate', 'ASC']] });
  res.json({ events });
}

async function applyForEvent(req, res) {
  const event = await Event.findByPk(req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  const existing = await ApplyOD.findOne({
    where: { studentId: req.user.id, eventId: event.eventId }
  });
  if (existing && existing.applicationStatus === 'applied') {
    return res.status(409).json({ error: 'You have already applied for this event.' });
  }
  const application = existing
    ? await existing.update({ applicationStatus: 'applied' })
    : await ApplyOD.create({ studentId: req.user.id, eventId: event.eventId });
  res.status(201).json({ application });
}

async function listApplications(req, res) {
  const applications = await ApplyOD.findAll({
    where: { studentId: req.user.id, applicationStatus: 'applied' },
    include: [{ model: Event, as: 'event' }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ applications });
}

async function requestOD(req, res) {
  const { reason } = req.body;
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'A reason for the OD request is required.' });
  }
  const application = await ApplyOD.findOne({
    where: { applicationId: req.params.applicationId, studentId: req.user.id }
  });
  if (!application || application.applicationStatus !== 'applied') {
    return res.status(404).json({ error: 'Active event application not found.' });
  }
  if (application.odStatus === 'pending' || application.odStatus === 'approved') {
    return res.status(409).json({ error: 'An active or approved OD request already exists.' });
  }
  await application.update({
    odReason: String(reason).trim(),
    odStatus: 'pending',
    reviewedByStaffId: null,
    reviewedAt: null
  });
  res.status(201).json({ application });
}

async function listODStatus(req, res) {
  const applications = await ApplyOD.findAll({
    where: { studentId: req.user.id, odStatus: { [Op.ne]: 'not_requested' } },
    include: [{ model: Event, as: 'event' }],
    order: [['createdAt', 'DESC']]
  });
  res.json({ applications });
}

async function submitReport(req, res) {
  const { reportText } = req.body;
  if (!reportText || !String(reportText).trim()) {
    return res.status(400).json({ error: 'reportText is required.' });
  }
  const application = await ApplyOD.findOne({
    where: { applicationId: req.params.applicationId, studentId: req.user.id }
  });
  if (!application || application.applicationStatus !== 'applied') {
    return res.status(404).json({ error: 'Active event application not found.' });
  }
  await application.update({
    reportText: String(reportText).trim(),
    reportSubmittedAt: new Date()
  });
  res.status(201).json({ application });
}

module.exports = {
  getProfile,
  updateProfile,
  searchEvents,
  applyForEvent,
  listApplications,
  requestOD,
  listODStatus,
  submitReport
};
