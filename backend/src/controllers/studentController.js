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
  req.user.record.set(updates);
  await req.user.record.save();
  res.json({ user: req.user.record });
}

async function searchEvents(req, res) {
  const filter = {};
  if (req.query.search) {
    const term = String(req.query.search).trim();
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = new RegExp(safeTerm, 'i');
    filter.$or = [
      { title: match },
      { description: match },
      { venue: match },
      { organizer: match }
    ];
  }
  if (req.query.date) filter.eventDate = req.query.date;
  const events = await Event.find(filter).sort({ eventDate: 1 });
  res.json({ events });
}

async function applyForEvent(req, res) {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  const existing = await ApplyOD.findOne({ studentId: req.user.id, eventId: event._id });
  if (existing && existing.applicationStatus === 'applied') {
    return res.status(409).json({ error: 'You have already applied for this event.' });
  }
  const application = existing
    ? await existing.set({ applicationStatus: 'applied' }).save()
    : await ApplyOD.create({ studentId: req.user.id, eventId: event._id });
  res.status(201).json({ application });
}

async function listApplications(req, res) {
  const applications = await ApplyOD.find({ studentId: req.user.id, applicationStatus: 'applied' })
    .populate('event')
    .sort({ createdAt: -1 });
  res.json({ applications });
}

async function requestOD(req, res) {
  const { reason } = req.body;
  if (!reason || !String(reason).trim()) {
    return res.status(400).json({ error: 'A reason for the OD request is required.' });
  }
  const application = await ApplyOD.findOne({ _id: req.params.applicationId, studentId: req.user.id });
  if (!application || application.applicationStatus !== 'applied') {
    return res.status(404).json({ error: 'Active event application not found.' });
  }
  if (application.odStatus === 'pending' || application.odStatus === 'approved') {
    return res.status(409).json({ error: 'An active or approved OD request already exists.' });
  }
  application.set({
    odReason: String(reason).trim(),
    odStatus: 'pending',
    reviewedByStaffId: null,
    reviewedAt: null
  });
  await application.save();
  res.status(201).json({ application });
}

async function listODStatus(req, res) {
  const applications = await ApplyOD.find({
    studentId: req.user.id,
    odStatus: { $ne: 'not_requested' }
  }).populate('event').sort({ createdAt: -1 });
  res.json({ applications });
}

async function submitReport(req, res) {
  const { reportText } = req.body;
  if (!reportText || !String(reportText).trim()) {
    return res.status(400).json({ error: 'reportText is required.' });
  }
  const application = await ApplyOD.findOne({ _id: req.params.applicationId, studentId: req.user.id });
  if (!application || application.applicationStatus !== 'applied') {
    return res.status(404).json({ error: 'Active event application not found.' });
  }
  application.set({
    reportText: String(reportText).trim(),
    reportSubmittedAt: new Date()
  });
  await application.save();
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
