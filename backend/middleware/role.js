const jwt = require('jsonwebtoken');

// Middleware para verificar se o usuário tem uma role específica
function checkRole(requiredRole) {
  return (req, res, next) => {
    // Primeiro verifica se o token está presente
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Verifica o token e a role do usuário
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }

      // Verifica se o usuário tem a role necessária
      if (decoded.role !== requiredRole) {
        return res.status(403).json({ 
          error: `Acesso negado. Requerido: ${requiredRole}` 
        });
      }

      // Se tudo estiver ok, adiciona o usuário à requisição e continua
      req.user = decoded;
      next();
    });
  };
}

// Middleware para verificar múltiplas roles
function checkRoles(requiredRoles) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }

      if (!requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          error: `Acesso negado. Roles permitidas: ${requiredRoles.join(', ')}` 
        });
      }

      req.user = decoded;
      next();
    });
  };
}

module.exports = {
  checkRole,
  checkRoles
};