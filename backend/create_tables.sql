-- Conecta ao banco recém-criado
\c agendamento_assf

-- Cria a tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'instrutor', 'aluno', 'berola')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria a tabela de agendamentos
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  instructor_id INTEGER REFERENCES users(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'agendado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria índice para melhorar consultas por data
CREATE INDEX idx_appointments_date ON appointments(date);

-- Adiciona comentários às tabelas (opcional)
COMMENT ON TABLE users IS 'Armazena informações dos usuários do sistema';
COMMENT ON TABLE appointments IS 'Registra os agendamentos de aulas';