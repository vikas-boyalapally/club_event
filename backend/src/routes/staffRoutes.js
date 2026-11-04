const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errors');
const controller = require('../controllers/staffController');

const router = express.Router();
router.use(authenticate, requireRole('staff'));
router.get('/students', asyncHandler(controller.listStudents));
router.get('/od-applications', asyncHandler(controller.listODApplications));
router.patch('/od-applications/:applicationId', asyncHandler(controller.reviewODApplication));

module.exports = router;
