const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const controller = require('../controllers/adminController');

const router = express.Router();
router.use(authenticate, requireRole('admin'));
router.get('/records', asyncHandler(controller.listAllRecords));
router.post('/events', asyncHandler(controller.createEvent));
router.patch('/events/:eventId', asyncHandler(controller.updateEvent));
router.delete('/events/:eventId', asyncHandler(controller.deleteEvent));

module.exports = router;
