const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
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
}

module.exports = User;