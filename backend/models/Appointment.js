const pool = require('../config/db');

class Appointment {
  static async create({ userId, instructorId, date, time }) {
    const { rows } = await pool.query(
      'INSERT INTO appointments (user_id, instructor_id, date, time) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, instructorId, date, time]
    );
    return rows[0];
  }

  static async getByUser(userId) {
    const { rows } = await pool.query(
      `SELECT a.*, u.name as instructor_name 
       FROM appointments a
       JOIN users u ON a.instructor_id = u.id
       WHERE a.user_id = $1`,
      [userId]
    );
    return rows;
  }

  static async getByInstructor(instructorId) {
    const { rows } = await pool.query(
      `SELECT a.*, u.name as user_name 
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       WHERE a.instructor_id = $1`,
      [instructorId]
    );
    return rows;
  }

  static async getAll() {
    const { rows } = await pool.query(
      `SELECT a.*, 
       u1.name as user_name, 
       u2.name as instructor_name 
       FROM appointments a
       JOIN users u1 ON a.user_id = u1.id
       JOIN users u2 ON a.instructor_id = u2.id`
    );
    return rows;
  }

  static async getByDate(date) {
    const { rows } = await pool.query(
      `SELECT a.*, 
      u1.name as user_name, 
      u2.name as instructor_name 
      FROM appointments a
      JOIN users u1 ON a.user_id = u1.id
      JOIN users u2 ON a.instructor_id = u2.id
      WHERE a.date = $1
      ORDER BY a.date, a.time`,
      [date]
    );
    return rows;
  }
}

module.exports = Appointment;