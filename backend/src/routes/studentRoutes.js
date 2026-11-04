const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const controller = require('../controllers/studentController');

const router = express.Router();
router.use(authenticate, requireRole('student'));
router.get('/me', asyncHandler(controller.getProfile));
router.patch('/me', asyncHandler(controller.updateProfile));
router.get('/events', asyncHandler(controller.searchEvents));
router.post('/events/:eventId/apply', asyncHandler(controller.applyForEvent));
router.get('/applications', asyncHandler(controller.listApplications));
router.post('/applications/:applicationId/od', asyncHandler(controller.requestOD));
router.get('/od', asyncHandler(controller.listODStatus));
router.post('/applications/:applicationId/report', asyncHandler(controller.submitReport));

module.exports = router;
