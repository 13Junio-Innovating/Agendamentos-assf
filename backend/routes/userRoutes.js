const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

// Rotas de usuário
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/instructors', authenticateToken, userController.getInstructors);
router.get('/students', authenticateToken, userController.getStudents);
router.post('/', authenticateToken, userController.createUser);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);

// router.get('/', authenticateToken, userController.getAllUsers);
// router.get('/instructors', authenticateToken, userController.getInstructors);
// router.get('/students', authenticateToken, userController.getStudents);
// router.post('/', authenticateToken, userController.createUser);
// router.put('/:id', authenticateToken, userController.updateUser);
// router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;