document.addEventListener('DOMContentLoaded', () => {
  localStorage.setItem('token', data.token);
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '../../login.html';
    return;
  }

  // Verificar se a role corresponde à página
  const userData = JSON.parse(atob(token.split('.')[1]));
  
  // Se estiver na página admin mas não for admin
  if (window.location.pathname.includes('admin') && userData.role !== 'admin') {
    window.location.href = '../../user/dashboard.html';
    return;
  }
  // Configurar datepicker
  flatpickr("#datePicker", {
    dateFormat: "Y-m-d",
    allowInput: true
  });

  // Configurar logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../login.html';
  });

  // Carregar estatísticas
  loadStats();
});

async function filterAppointments() {
  const date = document.getElementById('datePicker').value;
  const instructorId = document.getElementById('instructorFilter').value;
  
  try {
    const token = localStorage.getItem('token');
    let url = '/api/appointments/filter?';
    const params = [];
    
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    if (instructorId) params.push(`instructor_id=${encodeURIComponent(instructorId)}`);
    
    // Se não houver filtros, busca todos os agendamentos
    if (params.length === 0) {
      url = '/api/appointments';
    } else {
      url += params.join('&');
    }
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const appointments = await response.json();
      renderAppointments(appointments);
    }
  } catch (error) {
    console.error('Erro ao filtrar:', error);
    alert('Erro ao aplicar filtros');
  }

    async function loadInstructorsForFilter() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/instructors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
    
        if (response.ok) {
          const instructors = await response.json();
          const select = document.getElementById('instructorFilter');
          
          // Limpa opções existentes (exceto a primeira)
          while (select.options.length > 1) {
            select.remove(1);
          }
          
          // Adiciona novos options
          instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = instructor.name;
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Erro ao carregar instrutores:', error);
      }
    }
  };

function renderAppointments(appointments) {
  const tbody = document.querySelector('#appointmentsTable tbody');
  tbody.innerHTML = '';
  
  appointments.forEach(app => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(app.date).toLocaleDateString('pt-BR')}</td>
      <td>${app.time.substring(0, 5)}</td>
      <td>${app.user_name}</td>
      <td>${app.instructor_name}</td>
      <td>${app.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadStats() {
  try {
    const [usersRes, instructorsRes, studentsRes] = await Promise.all([
      fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }),
      fetch('/api/users/instructors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }),
      fetch('/api/users/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
    ]);

    if (usersRes.status === 401 || instructorsRes.status === 401 || studentsRes.status === 401) {
      window.location.href = '../login.html';
      return;
    }

    const users = await usersRes.json();
    const instructors = await instructorsRes.json();
    const students = await studentsRes.json();

    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalInstructors').textContent = instructors.length;
    document.getElementById('totalStudents').textContent = students.length;
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
  }
}