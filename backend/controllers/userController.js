// backend/controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
    return rows[0];
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users');
    return rows;
  }

  static async getByRole(role) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE role = $1',
      [role]
    );
    return rows;
  }

  static async update(id, { name, email, role, password }) {
    let query = 'UPDATE users SET name = $1, email = $2, role = $3';
    const params = [name, email, role, id];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $5 WHERE id = $4 RETURNING id, name, email, role';
      params.push(hashedPassword);
    } else {
      query += ' WHERE id = $4 RETURNING id, name, email, role';
    }
    
    const { rows } = await pool.query(query, params);
    return rows[0];
  }

  static async delete(id) {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

const userController = {
  async getAllUsers(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  },

  async getInstructors(req, res) {
    try {
      const instructors = await User.getByRole('instrutor');
      res.json(instructors);
    } catch (error) {
      console.error('Erro ao buscar instrutores:', error);
      res.status(500).json({ error: 'Erro ao buscar instrutores' });
    }
  },

  async getStudents(req, res) {
    try {
      const students = await User.getByRole('aluno');
      res.json(students);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
  },

  async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;
      
      // Validação básica
      if (!['admin', 'instrutor', 'aluno'].includes(role)) {
        return res.status(400).json({ error: 'Função inválida' });
      }

      // Verificar se email já existe
      const userExists = await User.findByEmail(email);
      if (userExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const user = await User.create({ name, email, password, role });
      res.status(201).json(user);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;

      // Verificar se usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const updatedUser = await User.update(id, { name, email, role, password });
      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se usuário existe
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const deleted = await User.delete(id);
      if (deleted) {
        res.json({ message: 'Usuário excluído com sucesso' });
      } else {
        res.status(500).json({ error: 'Erro ao excluir usuário' });
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }
};

module.exports = userController;