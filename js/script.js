/* =========================================================
   TO-DO LIST LIFE DASHBOARD - script.js
   Semua logika: greeting, timer, todo list, quick links,
   dark mode, dan penyimpanan ke Local Storage.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ================= GREETING & CLOCK ================= */
  const greetingEl = document.getElementById('greeting');
  const dateTimeEl = document.getElementById('dateTime');
  const nameInput = document.getElementById('nameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');

  function getGreetingWord(hour) {
    if (hour < 5) return 'Selamat malam';
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }

  function updateClock() {
    const now = new Date();
    const hour = now.getHours();
    const name = localStorage.getItem('dashboard_userName');

    const greetingWord = getGreetingWord(hour);
    greetingEl.textContent = name
      ? `${greetingWord}, ${name}! 👋`
      : `${greetingWord}! 👋`;

    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('id-ID');
    dateTimeEl.textContent = `${dateStr} • ${timeStr}`;
  }

  // Isi input nama jika sudah tersimpan
  const savedName = localStorage.getItem('dashboard_userName');
  if (savedName) nameInput.value = savedName;

  saveNameBtn.addEventListener('click', () => {
    const value = nameInput.value.trim();
    if (value) {
      localStorage.setItem('dashboard_userName', value);
    } else {
      localStorage.removeItem('dashboard_userName');
    }
    updateClock();
  });

  updateClock();
  setInterval(updateClock, 1000);

  /* ================= DARK / LIGHT MODE ================= */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('dashboard_theme') || 'light';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      document.body.removeAttribute('data-theme');
      themeToggle.textContent = '🌙';
    }
  }

  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dashboard_theme', next);
    applyTheme(next);
  });

  /* ================= FOCUS TIMER ================= */
  const timerDisplay = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');
  const durationInput = document.getElementById('durationInput');
  const applyDurationBtn = document.getElementById('applyDurationBtn');
  const timerView = document.getElementById('timerView');
  const congratsView = document.getElementById('congratsView');
  const dismissBtn = document.getElementById('dismissBtn');
  const newFocusBtn = document.getElementById('newFocusBtn');

  let totalSeconds = (parseInt(localStorage.getItem('dashboard_timerDuration')) || 25) * 60;
  let remainingSeconds = totalSeconds;
  let timerInterval = null;

  durationInput.value = totalSeconds / 60;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function renderTimer() {
    timerDisplay.textContent = formatTime(remainingSeconds);
  }

  function showCongratulations() {
    timerView.style.display = 'none';
    congratsView.style.display = 'block';
  }

  function hideCongratulations() {
    timerView.style.display = 'block';
    congratsView.style.display = 'none';
  }

  function startTimer() {
    if (timerInterval) return; // sudah berjalan
    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        renderTimer();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        showCongratulations();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function resetTimer() {
    stopTimer();
    remainingSeconds = totalSeconds;
    renderTimer();
  }

  applyDurationBtn.addEventListener('click', () => {
    let mins = parseInt(durationInput.value);
    if (isNaN(mins) || mins <= 0) mins = 25;
    if (mins > 180) mins = 180;
    durationInput.value = mins;
    totalSeconds = mins * 60;
    localStorage.setItem('dashboard_timerDuration', mins);
    resetTimer();
  });

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);

  dismissBtn.addEventListener('click', () => {
    hideCongratulations();
    resetTimer();
  });

  newFocusBtn.addEventListener('click', () => {
    hideCongratulations();
    resetTimer();
    startTimer();
  });

  renderTimer();

  /* ================= QUICK LINKS ================= */
  const linksList = document.getElementById('linksList');
  const linkForm = document.getElementById('linkForm');
  const linkNameInput = document.getElementById('linkName');
  const linkUrlInput = document.getElementById('linkUrl');

  function getLinks() {
    return JSON.parse(localStorage.getItem('dashboard_links') || '[]');
  }

  function saveLinks(links) {
    localStorage.setItem('dashboard_links', JSON.stringify(links));
  }

  function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  }

  function renderLinks() {
    const links = getLinks();
    linksList.innerHTML = '';

    if (links.length === 0) {
      linksList.innerHTML = '<p class="empty-msg" style="display:block;">Belum ada quick link.</p>';
      return;
    }

    links.forEach((link, index) => {
      const chip = document.createElement('div');
      chip.className = 'link-chip';

      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link.name;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-link';
      removeBtn.textContent = '✕';
      removeBtn.title = 'Hapus link';
      removeBtn.addEventListener('click', () => {
        const updated = getLinks();
        updated.splice(index, 1);
        saveLinks(updated);
        renderLinks();
      });

      chip.appendChild(anchor);
      chip.appendChild(removeBtn);
      linksList.appendChild(chip);
    });
  }

  linkForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    const url = normalizeUrl(linkUrlInput.value.trim());

    if (!name || !url) return;

    const links = getLinks();
    links.push({ name, url });
    saveLinks(links);
    renderLinks();

    linkForm.reset();
  });

  renderLinks();

  /* ================= TO-DO LIST ================= */
  const todoForm = document.getElementById('todoForm');
  const todoInput = document.getElementById('todoInput');
  const todoListEl = document.getElementById('todoList');
  const todoEmpty = document.getElementById('todoEmpty');
  const sortSelect = document.getElementById('sortSelect');

  function getTodos() {
    return JSON.parse(localStorage.getItem('dashboard_todos') || '[]');
  }

  function saveTodos(todos) {
    localStorage.setItem('dashboard_todos', JSON.stringify(todos));
  }

  function getSortedTodos() {
    const todos = getTodos();
    const mode = sortSelect.value;

    const copy = [...todos];

    if (mode === 'az') {
      copy.sort((a, b) => a.text.localeCompare(b.text));
    } else if (mode === 'za') {
      copy.sort((a, b) => b.text.localeCompare(a.text));
    } else if (mode === 'done') {
      copy.sort((a, b) => Number(a.done) - Number(b.done));
    }
    // 'default' -> tetap urutan asli (sesuai index array asli)

    return copy;
  }

  function renderTodos() {
    const todos = getSortedTodos();
    todoListEl.innerHTML = '';

    todoEmpty.style.display = todos.length === 0 ? 'block' : 'none';

    todos.forEach((todo) => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (todo.done ? ' done' : '');
      li.dataset.id = todo.id;

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.done;
      checkbox.addEventListener('change', () => toggleDone(todo.id));

      // Text
      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = todo.text;

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn edit-btn';
      editBtn.textContent = '✏️';
      editBtn.title = 'Edit tugas';
      editBtn.addEventListener('click', () => startEdit(li, todo));

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'icon-btn delete-btn';
      deleteBtn.textContent = '🗑️';
      deleteBtn.title = 'Hapus tugas';
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);

      todoListEl.appendChild(li);
    });
  }

  function toggleDone(id) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
    saveTodos(todos);
    renderTodos();
  }

  function deleteTodo(id) {
    let todos = getTodos();
    todos = todos.filter(t => t.id !== id);
    saveTodos(todos);
    renderTodos();
  }

  function startEdit(li, todo) {
    li.innerHTML = '';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = todo.text;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'icon-btn';
    saveBtn.textContent = '💾';
    saveBtn.title = 'Simpan';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'icon-btn';
    cancelBtn.textContent = '✖️';
    cancelBtn.title = 'Batal';

    function commitEdit() {
      const newText = input.value.trim();
      if (!newText) {
        renderTodos();
        return;
      }
      const todos = getTodos();

      // Cegah duplikat (kecuali dengan dirinya sendiri)
      const isDuplicate = todos.some(
        t => t.id !== todo.id && t.text.toLowerCase() === newText.toLowerCase()
      );
      if (isDuplicate) {
        alert('Tugas dengan nama itu sudah ada!');
        return;
      }

      const target = todos.find(t => t.id === todo.id);
      if (target) target.text = newText;
      saveTodos(todos);
      renderTodos();
    }

    saveBtn.addEventListener('click', commitEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') renderTodos();
    });
    cancelBtn.addEventListener('click', renderTodos);

    li.appendChild(input);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);

    input.focus();
    input.select();
  }

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    const todos = getTodos();

    // Cegah tugas duplikat (case-insensitive)
    const isDuplicate = todos.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
      alert('Tugas ini sudah ada di daftar!');
      return;
    }

    todos.push({
      id: Date.now().toString(),
      text,
      done: false
    });

    saveTodos(todos);
    renderTodos();
    todoForm.reset();
  });

  sortSelect.addEventListener('change', renderTodos);

  renderTodos();

});