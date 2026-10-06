// src/admin/js/tasks.js

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = '/api/tasks';
  let tasks = [];

  const zones = {
    'todo': document.getElementById('zone-todo'),
    'progress': document.getElementById('zone-progress'),
    'done': document.getElementById('zone-done')
  };

  const counts = {
    'todo': document.getElementById('count-todo'),
    'progress': document.getElementById('count-progress'),
    'done': document.getElementById('count-done')
  };

  const modal = document.getElementById('task-modal');
  const btnNew = document.getElementById('btn-new-task');
  const btnClose = document.getElementById('btn-close-modal');
  const form = document.getElementById('task-form');

  // Modal logic
  btnNew.addEventListener('click', () => { modal.classList.add('active'); });
  btnClose.addEventListener('click', () => { modal.classList.remove('active'); });
  modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('active'); });

  // Fetch and render
  async function loadTasks() {
    try {
      const res = await fetch(API_URL);
      if(!res.ok) throw new Error('Failed to load');
      tasks = await res.json();
      renderTasks();
    } catch(e) {
      console.error(e);
    }
  }

  function renderTasks() {
    // Clear zones
    Object.values(zones).forEach(z => z.innerHTML = '');
    
    let c = { 'todo': 0, 'progress': 0, 'done': 0 };

    tasks.forEach(task => {
      const status = task.status || 'todo';
      if(zones[status]) {
        c[status]++;
        const el = document.createElement('div');
        el.className = 'task-card';
        el.draggable = true;
        el.dataset.id = task.id;
        
        let badgeColor = 'badge-medium';
        if(task.priority === 'high') badgeColor = 'badge-high';
        if(task.priority === 'low') badgeColor = 'badge-low';

        el.innerHTML = `
          <div class="task-title">${task.title}</div>
          ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
          <div class="task-footer">
            <span class="task-badge ${badgeColor}">${task.priority}</span>
            <div class="task-actions">
              <button class="task-btn delete-btn" data-id="${task.id}"><i data-lucide="trash-2" style="width:14px;"></i></button>
            </div>
          </div>
        `;
        zones[status].appendChild(el);
      }
    });

    counts['todo'].textContent = c['todo'];
    counts['progress'].textContent = c['progress'];
    counts['done'].textContent = c['done'];

    lucide.createIcons();
    setupDragAndDrop();
    setupDeleteButtons();
  }

  // Create Task
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;
    const prio = document.getElementById('task-priority').value;
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, priority: prio, status: 'todo' })
      });
      if(res.ok) {
        modal.classList.remove('active');
        form.reset();
        loadTasks();
      }
    } catch(e) {
      console.error(e);
    }
  });

  // Delete Task
  function setupDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if(confirm('Delete this task?')) {
          try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadTasks();
          } catch(e) { console.error(e); }
        }
      });
    });
  }

  // Drag and Drop Logic
  let draggedCard = null;

  function setupDragAndDrop() {
    const cards = document.querySelectorAll('.task-card');
    const dropzones = document.querySelectorAll('.kanban-dropzone');

    cards.forEach(card => {
      card.addEventListener('dragstart', () => {
        draggedCard = card;
        setTimeout(() => card.style.opacity = '0.5', 0);
      });
      card.addEventListener('dragend', () => {
        setTimeout(() => card.style.opacity = '1', 0);
        draggedCard = null;
      });
    });

    dropzones.forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.style.background = 'rgba(0,0,0,0.02)';
      });
      zone.addEventListener('dragleave', () => {
        zone.style.background = 'transparent';
      });
      zone.addEventListener('drop', async e => {
        e.preventDefault();
        zone.style.background = 'transparent';
        if(draggedCard) {
          const status = zone.parentElement.dataset.status;
          const id = draggedCard.dataset.id;
          
          // Optimistic UI update
          zone.appendChild(draggedCard);
          
          try {
            await fetch(`${API_URL}/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });
            loadTasks(); // refresh to update counts
          } catch(err) {
            console.error('Failed to update status', err);
            loadTasks(); // revert on fail
          }
        }
      });
    });
  }

  // Initial load
  loadTasks();
});
