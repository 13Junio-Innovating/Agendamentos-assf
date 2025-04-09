const API_BASE_URL = 'http://localhost:3000/api/auth';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          
          // Decodificar o token para verificar o tipo de usuário
          const userData = JSON.parse(atob(data.token.split('.')[1]));
          
          // Redirecionar conforme o tipo de usuário
          // No arquivo auth.js, altere o redirecionamento para:
        if (userData.role === 'admin') {
          window.location.href = 'admin/dashboard.html';  
        } else {
          window.location.href = 'user/dashboard.html';  
        }
        } else {
          alert(data.error || 'Erro ao fazer login');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;

      try {
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Registro realizado com sucesso! Faça login.');
          window.location.href = 'login.html';
        } else {
          alert(data.error || 'Erro ao registrar');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
      }
    });
  }
});