const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      
      // Lista de roles permitidas (incluindo 'admin')
      const allowedRoles = ['admin', 'instrutor', 'aluno', 'berola'];
      
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Role inválida. Use: ' + allowedRoles.join(', ') });
      }
  
      const userExists = await User.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
  
      const user = await User.create({ name, email, password, role });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findByEmail(email);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
  
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name  
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = authController;