document.addEventListener('DOMContentLoaded', async () => {
  localStorage.setItem('token', data.token);
  const token = localStorage.getItem('token');
  
  if (!token) {
    window.location.href = '../../login.html';
    return;
  }

  console.log('adminUsers.js carregado corretamente');

  // Modal
  const modal = document.getElementById('userModal');
  const btn = document.getElementById('addUserBtn');
  const span = document.getElementsByClassName('close')[0];

  btn.onclick = () => {
    document.getElementById('modalTitle').textContent = 'Adicionar Usuário';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    modal.style.display = 'block';
  };

  span.onclick = () => modal.style.display = 'none';
  window.onclick = (event) => event.target == modal && (modal.style.display = 'none');

  // Formulário
  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = {
      id: document.getElementById('userId').value,
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      role: document.getElementById('role').value,
      password: document.getElementById('password').value
    };

    try {
      const response = await fetch(user.id ? `/api/users/${user.id}` : '/api/users', {
        method: user.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      if (response.ok) {
        modal.style.display = 'none';
        await loadUsers();
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  });
});

async function loadUsers() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const users = await response.json();
      const tbody = document.querySelector('#usersTable tbody');
      tbody.innerHTML = '';

      users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${user.id}</td>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
            <button class="btn-edit" data-id="${user.id}">Editar</button>
            <button class="btn-delete" data-id="${user.id}">Excluir</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Adicionar eventos aos botões
      document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => editUser(btn.dataset.id));
      });

      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => deleteUser(btn.dataset.id));
      });
    }
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
  }
}

async function editUser(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const user = await response.json();
      const modal = document.getElementById('userModal');
      
      document.getElementById('modalTitle').textContent = 'Editar Usuário';
      document.getElementById('userId').value = user.id;
      document.getElementById('name').value = user.name;
      document.getElementById('email').value = user.email;
      document.getElementById('role').value = user.role;
      document.getElementById('passwordGroup').style.display = 'none';
      
      modal.style.display = 'block';
    }
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
  }
}

async function deleteUser(id) {
  if (!confirm('Deseja realmente excluir este usuário?')) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      await loadUsers();
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
  }
}