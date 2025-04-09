const { pool } = require('../config/db'); // Certifique-se que está importando o pool corretamente

const appointmentController = {
  async create(req, res) {
    try {
      const { userId, instructorId, date, time } = req.body;
      
      // Validações básicas
      if (!userId || !instructorId || !date || !time) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const { rows } = await pool.query(
        'INSERT INTO appointments (user_id, instructor_id, date, time) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, instructorId, date, time]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  },

  async getUserAppointments(req, res) {
    try {
      const userId = req.user.id; // Assume que o user ID vem do token JWT
      const { rows } = await pool.query(
        `SELECT a.*, u.name as instructor_name 
         FROM appointments a
         JOIN users u ON a.instructor_id = u.id
         WHERE a.user_id = $1`,
        [userId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar agendamentos do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
  },

  async getInstructorAppointments(req, res) {
    try {
      const instructorId = req.user.id; // Assume que o instructor ID vem do token JWT
      const { rows } = await pool.query(
        `SELECT a.*, u.name as user_name 
         FROM appointments a
         JOIN users u ON a.user_id = u.id
         WHERE a.instructor_id = $1`,
        [instructorId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar agendamentos do instrutor:', error);
      res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
  },

  async getAllAppointments(req, res) {
    try {
      const { rows } = await pool.query(
        `SELECT a.*, u1.name as user_name, u2.name as instructor_name 
         FROM appointments a
         JOIN users u1 ON a.user_id = u1.id
         JOIN users u2 ON a.instructor_id = u2.id`
      );
      res.json(rows);
    } catch (error) {
      console.error('Erro ao buscar todos agendamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
  },

  async getFilteredAppointments(req, res) {
    try {
      const { date, instructor_id, status } = req.query;
      
      let query = `
        SELECT a.*, u1.name as user_name, u2.name as instructor_name 
        FROM appointments a
        JOIN users u1 ON a.user_id = u1.id
        JOIN users u2 ON a.instructor_id = u2.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (date) {
        query += ` AND a.date = $${params.length + 1}`;
        params.push(date);
      }
      
      if (instructor_id) {
        query += ` AND a.instructor_id = $${params.length + 1}`;
        params.push(instructor_id);
      }
      
      if (status) {
        query += ` AND a.status = $${params.length + 1}`;
        params.push(status);
      }
      
      query += ` ORDER BY a.date, a.time`;
      
      const { rows } = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Erro ao filtrar agendamentos:', error);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }
};

module.exports = appointmentController;