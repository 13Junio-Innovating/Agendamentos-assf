document.addEventListener('DOMContentLoaded', async () => {
  localStorage.setItem('token', data.token);
    const token = localStorage.getItem('token');
    
    if (!token) {
      window.location.href = '../../login.html';
      return;
    }
  
    // Verificar se é admin
    const userData = JSON.parse(atob(token.split('.')[1]));
    if (userData.role !== 'admin') {
      window.location.href = '../../user/dashboard.html';
      return;
    }
  
    // Elementos da página
    const appointmentsTable = document.getElementById('appointmentsTable').querySelector('tbody');
    const filterDate = document.getElementById('filterDate');
    const filterStatus = document.getElementById('filterStatus');
    const filterInstructor = document.getElementById('filterInstructor');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const newAppointmentBtn = document.getElementById('newAppointmentBtn');
    const modal = document.getElementById('appointmentModal');
    const closeModal = document.querySelector('.close');
  
    // Configuração inicial
    flatpickr("#filterDate", {
      dateFormat: "Y-m-d",
      allowInput: true
    });
  
    flatpickr("#modalDate", {
      dateFormat: "Y-m-d",
      minDate: "today"
    });
  
    // Carregar dados iniciais
    await loadInstructorsForFilter();
    await loadStudentsForModal();
    await loadAppointments();
  
    // Event Listeners
    applyFiltersBtn.addEventListener('click', loadAppointments);
    resetFiltersBtn.addEventListener('click', resetFilters);
    newAppointmentBtn.addEventListener('click', openNewAppointmentModal);
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointmentSubmit);
  
    // Funções principais
    async function loadAppointments() {
      try {
        const params = new URLSearchParams();
        if (filterDate.value) params.append('date', filterDate.value);
        if (filterStatus.value) params.append('status', filterStatus.value);
        if (filterInstructor.value) params.append('instructor_id', filterInstructor.value);
  
        const response = await fetch(`/api/appointments/filter?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          const appointments = await response.json();
          renderAppointments(appointments);
        }
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      }
    }
  
    function renderAppointments(appointments) {
      appointmentsTable.innerHTML = '';
      
      appointments.forEach(app => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${app.id}</td>
          <td>${new Date(app.date).toLocaleDateString('pt-BR')}</td>
          <td>${app.time.substring(0, 5)}</td>
          <td>${app.user_name}</td>
          <td>${app.instructor_name}</td>
          <td><span class="status-badge ${app.status}">${app.status}</span></td>
          <td>
            <button class="btn-edit" data-id="${app.id}">Editar</button>
            <button class="btn-delete" data-id="${app.id}">Excluir</button>
          </td>
        `;
        appointmentsTable.appendChild(tr);
      });
  
      // Adicionar eventos aos botões
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editAppointment(btn.dataset.id));
      });
  
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteAppointment(btn.dataset.id));
      });
    }
  
    async function loadInstructorsForFilter() {
      try {
        const response = await fetch('/api/users/instructors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          const instructors = await response.json();
          const select = document.getElementById('filterInstructor');
          
          instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = instructor.name;
            select.appendChild(option);
          });
  
          // Também preenche o select do modal
          const modalSelect = document.getElementById('modalInstructor');
          instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = instructor.name;
            modalSelect.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Erro ao carregar instrutores:', error);
      }
    }
  
    async function loadStudentsForModal() {
      try {
        const response = await fetch('/api/users/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
  
        if (response.ok) {
          const students = await response.json();
          const select = document.getElementById('modalStudent');
          
          students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            select.appendChild(option);
          });
        }
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      }
    }
  
    function resetFilters() {
      filterDate.value = '';
      filterStatus.value = '';
      filterInstructor.value = '';
      loadAppointments();
    }
  
    function openNewAppointmentModal() {
      document.getElementById('modalTitle').textContent = 'Novo Agendamento';
      document.getElementById('appointmentForm').reset();
      document.getElementById('appointmentId').value = '';
      modal.style.display = 'block';
    }
  
    async function editAppointment(id) {
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        if (response.ok) {
          const appointment = await response.json();
          
          document.getElementById('modalTitle').textContent = 'Editar Agendamento';
          document.getElementById('appointmentId').value = appointment.id;
          document.getElementById('modalStudent').value = appointment.user_id;
          document.getElementById('modalInstructor').value = appointment.instructor_id;
          document.getElementById('modalDate').value = appointment.date;
          document.getElementById('modalTime').value = appointment.time;
          document.getElementById('modalStatus').value = appointment.status;
          
          modal.style.display = 'block';
        }
      } catch (error) {
        console.error('Erro ao carregar agendamento:', error);
      }
    }
  
    async function handleAppointmentSubmit(e) {
      e.preventDefault();
      
      const appointment = {
        id: document.getElementById('appointmentId').value,
        user_id: document.getElementById('modalStudent').value,
        instructor_id: document.getElementById('modalInstructor').value,
        date: document.getElementById('modalDate').value,
        time: document.getElementById('modalTime').value,
        status: document.getElementById('modalStatus').value
      };
  
      try {
        const url = appointment.id ? `/api/appointments/${appointment.id}` : '/api/appointments';
        const method = appointment.id ? 'PUT' : 'POST';
  
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        
          body: JSON.stringify(appointment)
        });
  
        if (response.ok) {
          modal.style.display = 'none';
          await loadAppointments();
        }
      } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
      }
    }
  
    async function deleteAppointment(id) {
      if (!confirm('Deseja realmente excluir este agendamento?')) return;
      
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
  
        if (response.ok) {
          await loadAppointments();
        }
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
      }
    }
  });