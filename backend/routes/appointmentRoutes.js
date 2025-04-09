const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, appointmentController.create);
router.get('/user', authenticateToken, appointmentController.getUserAppointments);
router.get('/instructor', authenticateToken, appointmentController.getInstructorAppointments);
router.get('/', authenticateToken, appointmentController.getAllAppointments);
router.get('/filter', authenticateToken, appointmentController.getFilteredAppointments);

module.exports = router;