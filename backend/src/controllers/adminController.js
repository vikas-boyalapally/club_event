const { Student, Staff, Admin, ApplyOD, Event } = require('../models');

async function listAllRecords(req, res) {
  const [students, staff, admins, applications, events] = await Promise.all([
    Student.find(),
    Staff.find(),
    Admin.find(),
    ApplyOD.find().populate('student').populate('event'),
    Event.find()
  ]);
  res.json({ students, staff, admins, applications, events });
}

async function createEvent(req, res) {
  const { title, description, venue, eventDate, organizer } = req.body;
  const missing = ['title', 'description', 'venue', 'eventDate', 'organizer']
    .filter((field) => !req.body[field]);
  if (missing.length) {
    return res.status(400).json({ error: `Required fields: ${missing.join(', ')}.` });
  }
  const event = await Event.create({
    title,
    description,
    venue,
    eventDate,
    startTime: req.body.startTime || null,
    endTime: req.body.endTime || null,
    organizer,
    capacity: req.body.capacity || null,
    createdByAdminId: req.user.id
  });
  res.status(201).json({ event });
}

async function updateEvent(req, res) {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  const allowed = [
    'title', 'description', 'venue', 'eventDate',
    'startTime', 'endTime', 'organizer', 'capacity'
  ];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );
  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: `Provide at least one of: ${allowed.join(', ')}.` });
  }
  event.set(updates);
  await event.save();
  res.json({ event });
}

async function deleteEvent(req, res) {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  await ApplyOD.deleteMany({ eventId: event._id });
  await event.deleteOne();
  res.status(204).end();
}

module.exports = { listAllRecords, createEvent, updateEvent, deleteEvent };
