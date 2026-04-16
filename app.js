/* ============================================================
   BALD DEV CRM — app.js
   ============================================================ */

// ── State ──────────────────────────────────────────────────
const STATE = {
  projects: [],
  tasks: [],
  time: [],
  transactions: [],
  invoices: [],
  goals: [],
  nextId: 1,
};

const DEFAULTS = {
  projects: [
    { id: 1, name: 'Bald Platform v2', client: 'Internal', status: 'active', priority: 'high', budget: 5000, spent: 2100, due: '2025-06-30', tags: ['React', 'Node'] },
    { id: 2, name: 'Client Portal', client: 'TechCorp', status: 'active', priority: 'medium', budget: 3200, spent: 800, due: '2025-05-15', tags: ['Vue', 'API'] },
    { id: 3, name: 'Mobile App MVP', client: 'StartupX', status: 'planning', priority: 'low', budget: 8000, spent: 0, due: '2025-08-01', tags: ['React Native'] },
  ],
  tasks: [
    { id: 2, title: 'Fix auth bug in dashboard', project: 1, priority: 'high', status: 'todo', due: '2025-04-18', est: 2 },
    { id: 3, title: 'Design component library', project: 1, priority: 'medium', status: 'inprogress', due: '2025-04-20', est: 8 },
    { id: 4, title: 'API integration tests', project: 2, priority: 'high', status: 'todo', due: '2025-04-17', est: 4 },
    { id: 5, title: 'Write project spec', project: 3, priority: 'low', status: 'done', due: '2025-04-16', est: 3 },
    { id: 6, title: 'Deploy staging environment', project: 2, priority: 'medium', status: 'todo', due: '2025-04-21', est: 2 },
  ],
  time: [
    { id: 7, project: 1, hours: 3, date: '2025-04-15', notes: 'Fixed routing issues' },
    { id: 8, project: 2, hours: 2, date: '2025-04-15', notes: 'API planning' },
    { id: 9, project: 1, hours: 4, date: '2025-04-14', notes: 'Component work' },
    { id: 10, project: 1, hours: 2.5, date: '2025-04-16', notes: 'Auth debugging' },
  ],
  transactions: [
    { id: 11, desc: 'TechCorp Invoice #001', amount: 3200, type: 'income', category: 'Freelance', date: '2025-04-10' },
    { id: 12, desc: 'GitHub Copilot', amount: -10, type: 'expense', category: 'Software', date: '2025-04-01' },
    { id: 13, desc: 'Cloud Hosting', amount: -45, type: 'expense', category: 'Infrastructure', date: '2025-04-05' },
    { id: 14, desc: 'Figma Pro', amount: -15, type: 'expense', category: 'Software', date: '2025-04-01' },
    { id: 15, desc: 'StartupX Advance', amount: 2000, type: 'income', category: 'Contract', date: '2025-04-12' },
  ],
  invoices: [
    { id: 'INV-001', client: 'TechCorp', amount: 3200, due: '2025-04-30', status: 'sent', items: [{ desc: 'Client Portal Development', qty: 16, rate: 200 }] },
    { id: 'INV-002', client: 'StartupX', amount: 2000, due: '2025-05-15', status: 'draft', items: [{ desc: 'Mobile App Consulting', qty: 10, rate: 200 }] },
  ],
  goals: [
    { id: 16, title: 'Ship Bald Platform v2', category: 'Career', target: 100, current: 42, deadline: '2025-06-30', notes: 'Core feature development phase' },
    { id: 17, title: 'Learn Rust', category: 'Skills', target: 100, current: 20, deadline: '2025-12-31', notes: 'Build one project in Rust' },
    { id: 18, title: 'Reach $10k MRR', category: 'Finance', target: 10000, current: 5200, deadline: '2025-12-31', notes: 'Through freelance + products' },
    { id: 19, title: '500 GitHub contributions', category: 'Career', target: 500, current: 187, deadline: '2025-12-31', notes: 'Daily commit habit' },
  ],
  nextId: 100,
};

// ── Persistence ────────────────────────────────────────────
function saveState() {
  try { localStorage.setItem('baldcrm_state', JSON.stringify(STATE)); } catch(e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('baldcrm_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(STATE, parsed);
    } else {
      Object.assign(STATE, JSON.parse(JSON.stringify(DEFAULTS)));
      saveState();
    }
  } catch(e) {
    Object.assign(STATE, JSON.parse(JSON.stringify(DEFAULTS)));
  }
}

// ── API Key ────────────────────────────────────────────────
function getApiKey() { return localStorage.getItem('baldcrm_apikey') || ''; }
function saveApiKey() {
  const key = document.getElementById('apikey-input').value.trim();
  if (key) { localStorage.setItem('baldcrm_apikey', key); }
  closeApiKeyModal();
  checkApiKey();
}
function clearApiKey() {
  localStorage.removeItem('baldcrm_apikey');
  document.getElementById('apikey-input').value = '';
  closeApiKeyModal();
  checkApiKey();
}
function openApiKeyModal() {
  document.getElementById('apikey-input').value = getApiKey();
  document.getElementById('apikey-backdrop').classList.add('open');
}
function closeApiKeyModal() { document.getElementById('apikey-backdrop').classList.remove('open'); }
function checkApiKey() {
  const warn = document.getElementById('no-key-warning');
  if (warn) warn.style.display = getApiKey() ? 'none' : 'block';
  const btn = document.getElementById('api-key-btn');
  if (btn) btn.style.borderColor = getApiKey() ? 'var(--acc)' : 'var(--warn)';
}

// ── Helpers ────────────────────────────────────────────────
function gid(id) { return document.getElementById(id); }
function getProject(id) { return STATE.projects.find(p => p.id === id); }

function statusBadge(s) {
  const m = { active:'badge-green', planning:'badge-amber', done:'badge-teal', archived:'badge-gray', sent:'badge-blue', draft:'badge-gray', paid:'badge-green', overdue:'badge-red' };
  return `<span class="badge ${m[s]||'badge-gray'}">${s}</span>`;
}
function priorityBadge(p) {
  const m = { high:'badge-red', medium:'badge-amber', low:'badge-gray' };
  return `<span class="badge ${m[p]||'badge-gray'}">${p}</span>`;
}

function today() { return new Date().toISOString().slice(0,10); }

// ── Tab Switching ──────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  gid('panel-' + name).classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(t => {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').includes("'" + name + "'")) {
      t.classList.add('active');
    }
  });
  renderAll();
  if (name === 'ai') checkApiKey();
}

// ── Dashboard ──────────────────────────────────────────────
function renderDashboard() {
  const income = STATE.transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const openTasks = STATE.tasks.filter(t => t.status !== 'done').length;
  const activeProjects = STATE.projects.filter(p => p.status === 'active').length;
  const totalHours = STATE.time.reduce((s,t) => s + t.hours, 0);

  gid('dash-metrics').innerHTML = `
    <div class="metric-card"><div class="metric-label">Revenue</div><div class="metric-val">$${income.toLocaleString()}</div><div class="metric-sub metric-up">↑ this month</div></div>
    <div class="metric-card"><div class="metric-label">Open Tasks</div><div class="metric-val">${openTasks}</div><div class="metric-sub">${STATE.tasks.filter(t=>t.status==='inprogress').length} in progress</div></div>
    <div class="metric-card"><div class="metric-label">Active Projects</div><div class="metric-val">${activeProjects}</div><div class="metric-sub">${STATE.projects.length} total</div></div>
    <div class="metric-card"><div class="metric-label">Hours Logged</div><div class="metric-val">${totalHours}h</div><div class="metric-sub">all time</div></div>
  `;

  gid('dash-projects').innerHTML = STATE.projects.slice(0,3).map(p => {
    const pct = p.budget > 0 ? Math.round((p.spent/p.budget)*100) : 0;
    return `<div class="list-item">
      <div class="avatar avatar-acc">${p.name.charAt(0)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
        <div style="font-size:11px;color:var(--t2)">${p.client} · Due ${p.due}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      ${statusBadge(p.status)}
    </div>`;
  }).join('') || '<div style="color:var(--t2);font-size:13px;padding:8px 0">No projects yet.</div>';

  const focusTasks = STATE.tasks.filter(t => t.status !== 'done').slice(0,4);
  gid('dash-tasks').innerHTML = focusTasks.map(t => {
    const p = getProject(t.project);
    return `<div class="list-item">
      <div class="task-checkbox ${t.status==='done'?'done':''}" onclick="toggleTask(${t.id})">${t.status==='done'?'✓':''}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;${t.status==='done'?'text-decoration:line-through;color:var(--t3)':''};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</div>
        <div style="font-size:11px;color:var(--t2)">${p?p.name:'?'} · ${t.est}h est.</div>
      </div>
      ${priorityBadge(t.priority)}
    </div>`;
  }).join('') || '<div style="color:var(--t2);font-size:13px;padding:8px 0">All done! 🎉</div>';

  const months = ['Nov','Dec','Jan','Feb','Mar','Apr'];
  const vals = [1200, 2800, 1800, 3500, 4100, income];
  const max = Math.max(...vals, 1);
  gid('dash-chart').innerHTML = months.map((m,i) => `
    <div class="bar-row">
      <div class="bar-label">${m}</div>
      <div class="bar-outer"><div class="bar-inner" style="width:${Math.round((vals[i]/max)*100)}%"></div></div>
      <div class="bar-val">$${vals[i].toLocaleString()}</div>
    </div>`).join('');

  gid('dash-goals').innerHTML = STATE.goals.slice(0,4).map(g => {
    const pct = Math.min(100, Math.round((g.current/g.target)*100));
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
        <span style="font-size:13px;font-weight:500">${g.title}</span>
        <span style="font-size:11px;font-family:'DM Mono',monospace;color:var(--t2)">${pct}%</span>
      </div>
      <div style="font-size:11px;color:var(--t2);margin-bottom:4px">${g.category} · ${g.deadline}</div>
      <div class="progress-bar" style="height:6px"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join('') || '<div style="color:var(--t2);font-size:13px">No goals yet.</div>';
}

// ── Projects ───────────────────────────────────────────────
function renderProjects() {
  gid('project-list').innerHTML = STATE.projects.map(p => {
    const pct = p.budget > 0 ? Math.round((p.spent/p.budget)*100) : 0;
    const projectTasks = STATE.tasks.filter(t => t.project === p.id);
    const doneTasks = projectTasks.filter(t => t.status === 'done').length;
    return `<div class="card card-sm">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div style="min-width:0;flex:1;margin-right:8px">
          <div style="font-size:14px;font-weight:600;margin-bottom:3px">${p.name}</div>
          <div style="font-size:11px;color:var(--t2)">${p.client}</div>
        </div>
        <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
          ${statusBadge(p.status)}
          ${priorityBadge(p.priority)}
        </div>
      </div>
      <div class="pill-row" style="margin-top:0;margin-bottom:10px">
        ${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}
      </div>
      <div class="divider"></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--t2);margin-bottom:8px;margin-top:8px">
        <span>Budget: <b style="color:var(--t1)">$${p.budget.toLocaleString()}</b></span>
        <span>Due: <b style="color:var(--t1)">${p.due}</b></span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--t2);margin-bottom:4px">
        <span>$${p.spent.toLocaleString()} spent · ${doneTasks}/${projectTasks.length} tasks done</span>
        <span>${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
        <button class="btn btn-sm btn-ghost" onclick="aiQuick('Give me a project plan and risk assessment for: ${p.name.replace(/'/g,"\\'")}. Budget $${p.budget}, due ${p.due}, tech stack: ${p.tags.join(", ")}')">✦ AI Plan</button>
        <button class="btn btn-sm btn-ghost" onclick="openEditProject(${p.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProject(${p.id})">Delete</button>
      </div>
    </div>`;
  }).join('') || '<div class="card" style="color:var(--t2);font-size:13px;text-align:center;padding:32px">No projects yet. Create your first one!</div>';
}

function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  STATE.projects = STATE.projects.filter(p => p.id !== id);
  saveState(); renderProjects(); renderDashboard();
}

function openEditProject(id) {
  const p = STATE.projects.find(pr => pr.id === id);
  if (!p) return;
  const content = gid('modal-content');
  content.innerHTML = `
    <div class="modal-title">Edit Project</div>
    <div class="form-row"><label>Project Name</label><input type="text" id="m-pname" value="${p.name}"></div>
    <div class="form-2">
      <div class="form-row"><label>Client</label><input type="text" id="m-client" value="${p.client}"></div>
      <div class="form-row"><label>Status</label>
        <select id="m-status">
          ${['active','planning','archived'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-2">
      <div class="form-row"><label>Budget ($)</label><input type="number" id="m-budget" value="${p.budget}"></div>
      <div class="form-row"><label>Spent ($)</label><input type="number" id="m-spent" value="${p.spent}"></div>
    </div>
    <div class="form-2">
      <div class="form-row"><label>Due Date</label><input type="date" id="m-due" value="${p.due}"></div>
      <div class="form-row"><label>Priority</label>
        <select id="m-priority">
          ${['high','medium','low'].map(s=>`<option ${p.priority===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row"><label>Tags (comma separated)</label><input type="text" id="m-tags" value="${p.tags.join(', ')}"></div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn btn-primary" style="flex:1" onclick="updateProject(${id})">Save Changes</button>
      <button class="btn" onclick="closeModal()">Cancel</button>
    </div>`;
  gid('modal-backdrop').classList.add('open');
}

function updateProject(id) {
  const p = STATE.projects.find(pr => pr.id === id);
  if (!p) return;
  p.name = gid('m-pname').value || p.name;
  p.client = gid('m-client').value || p.client;
  p.status = gid('m-status').value;
  p.priority = gid('m-priority').value;
  p.budget = parseFloat(gid('m-budget').value) || 0;
  p.spent = parseFloat(gid('m-spent').value) || 0;
  p.due = gid('m-due').value || p.due;
  p.tags = gid('m-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  saveState(); closeModal(); renderProjects(); renderDashboard();
}

// ── Tasks ──────────────────────────────────────────────────
function renderTasks() {
  const filterEl = gid('task-filter');
  if (filterEl) {
    const current = filterEl.value;
    filterEl.innerHTML = '<option value="">All projects</option>' +
      STATE.projects.map(p => `<option value="${p.id}" ${current==p.id?'selected':''}>${p.name}</option>`).join('');
  }

  const filterVal = filterEl ? parseInt(filterEl.value) : 0;
  let tasks = filterVal ? STATE.tasks.filter(t => t.project === filterVal) : STATE.tasks;

  const groups = [['todo','To Do'],['inprogress','In Progress'],['done','Done']];
  let html = '';
  for (const [key, label] of groups) {
    const group = tasks.filter(t => t.status === key);
    if (!group.length) continue;
    html += `<div style="margin-bottom:12px">
      <div style="font-size:11px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:0.5px;padding:6px 0;border-bottom:0.5px solid var(--bd);margin-bottom:6px">${label} (${group.length})</div>`;
    html += group.map(t => {
      const p = getProject(t.project);
      return `<div class="list-item">
        <div class="task-checkbox ${t.status==='done'?'done':''}" onclick="toggleTask(${t.id})">${t.status==='done'?'✓':''}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;${t.status==='done'?'text-decoration:line-through;color:var(--t3)':''};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</div>
          <div style="font-size:11px;color:var(--t2)">${p?p.name:'?'} · ${t.est}h · Due ${t.due}</div>
        </div>
        <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
          ${priorityBadge(t.priority)}
          <button class="btn btn-sm btn-ghost" onclick="deleteTask(${t.id})" style="padding:3px 6px;font-size:12px">✕</button>
        </div>
      </div>`;
    }).join('');
    html += '</div>';
  }
  gid('task-list').innerHTML = html || '<div style="color:var(--t2);font-size:13px;padding:16px;text-align:center">No tasks yet.</div>';
}

function toggleTask(id) {
  const t = STATE.tasks.find(t => t.id === id);
  if (!t) return;
  const cycle = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
  t.status = cycle[t.status] || 'todo';
  saveState(); renderTasks(); renderDashboard();
}

function deleteTask(id) {
  STATE.tasks = STATE.tasks.filter(t => t.id !== id);
  saveState(); renderTasks(); renderDashboard();
}

// ── Time ───────────────────────────────────────────────────
function renderTime() {
  const todayStr = today();
  const todayH = STATE.time.filter(t => t.date === todayStr).reduce((s,t) => s+t.hours, 0);
  const weekH = STATE.time.reduce((s,t) => s+t.hours, 0);
  gid('time-today').textContent = todayH + 'h';
  gid('time-week').textContent = weekH + 'h';
  gid('time-bill').textContent = '$' + Math.round(weekH * 150).toLocaleString();

  const sel = gid('te-project');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = '<option value="">Select project</option>' +
      STATE.projects.map(p => `<option value="${p.id}" ${cur==p.id?'selected':''}>${p.name}</option>`).join('');
  }

  gid('time-entries').innerHTML = STATE.time.slice().reverse().map(t => {
    const p = getProject(parseInt(t.project));
    return `<div class="list-item">
      <div class="timeline-dot"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:500">${t.notes || 'No notes'}</div>
        <div style="font-size:11px;color:var(--t2)">${p?p.name:'?'} · ${t.date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        <div style="font-family:'DM Mono',monospace;font-size:12px;font-weight:500">${t.hours}h</div>
        <button class="btn btn-sm btn-ghost" onclick="deleteTimeEntry(${t.id})" style="padding:2px 6px">✕</button>
      </div>
    </div>`;
  }).join('') || '<div style="color:var(--t2);font-size:13px;padding:8px 0">No time logged yet.</div>';

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayH = [6, 7.5, 5, 4.5, todayH, 1, 0];
  const maxH = Math.max(...dayH, 1);
  gid('time-chart').innerHTML = days.map((d,i) => `
    <div class="bar-row">
      <div class="bar-label">${d}</div>
      <div class="bar-outer"><div class="bar-inner" style="width:${Math.round((dayH[i]/maxH)*100)}%"></div></div>
      <div class="bar-val">${dayH[i]}h</div>
    </div>`).join('');
}

function logTime() {
  const proj = gid('te-project').value;
  const hours = parseFloat(gid('te-hours').value);
  const date = gid('te-date').value || today();
  const notes = gid('te-notes').value.trim();
  if (!proj || !hours || hours <= 0) { alert('Please select a project and enter valid hours.'); return; }
  STATE.time.push({ id: STATE.nextId++, project: parseInt(proj), hours, date, notes });
  gid('te-hours').value = '';
  gid('te-notes').value = '';
  saveState(); renderTime();
}

function deleteTimeEntry(id) {
  STATE.time = STATE.time.filter(t => t.id !== id);
  saveState(); renderTime();
}

// ── Finance ────────────────────────────────────────────────
function renderFinance() {
  const income = STATE.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
  const expenses = Math.abs(STATE.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0));
  const net = income - expenses;
  const invoicedTotal = STATE.invoices.reduce((s,i)=>s+i.amount,0);

  gid('finance-metrics').innerHTML = `
    <div class="metric-card"><div class="metric-label">Income</div><div class="metric-val metric-up">$${income.toLocaleString()}</div></div>
    <div class="metric-card"><div class="metric-label">Expenses</div><div class="metric-val metric-down">$${expenses.toLocaleString()}</div></div>
    <div class="metric-card"><div class="metric-label">Net</div><div class="metric-val">$${net.toLocaleString()}</div></div>
    <div class="metric-card"><div class="metric-label">Invoiced</div><div class="metric-val">$${invoicedTotal.toLocaleString()}</div></div>
  `;

  gid('txn-list').innerHTML = STATE.transactions.slice().reverse().map(t => {
    const isIncome = t.type === 'income';
    return `<div class="list-item">
      <div class="avatar" style="${isIncome ? 'background:#EAF3DE;color:#3B6D11' : 'background:#FCEBEB;color:#A32D2D'}">${isIncome?'↑':'↓'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.desc}</div>
        <div style="font-size:11px;color:var(--t2)">${t.category} · ${t.date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        <div style="font-family:'DM Mono',monospace;font-size:13px;font-weight:600;color:${isIncome?'#3B6D11':'#A32D2D'}">${isIncome?'+':'-'}$${Math.abs(t.amount).toLocaleString()}</div>
        <button class="btn btn-sm btn-ghost" onclick="deleteTxn(${t.id})" style="padding:2px 6px">✕</button>
      </div>
    </div>`;
  }).join('') || '<div style="color:var(--t2);font-size:13px;padding:8px 0">No transactions yet.</div>';

  const cats = {};
  STATE.transactions.filter(t=>t.type==='expense').forEach(t => {
    cats[t.category] = (cats[t.category]||0) + Math.abs(t.amount);
  });
  const maxCat = Math.max(...Object.values(cats), 1);
  gid('finance-chart').innerHTML = Object.entries(cats).map(([cat,val]) => `
    <div class="bar-row">
      <div class="bar-label">${cat}</div>
      <div class="bar-outer"><div class="bar-inner" style="width:${Math.round((val/maxCat)*100)}%;background:var(--warn)"></div></div>
      <div class="bar-val">$${val}</div>
    </div>`).join('') || '<div style="color:var(--t2);font-size:13px">No expenses yet.</div>';
}

function deleteTxn(id) {
  STATE.transactions = STATE.transactions.filter(t => t.id !== id);
  saveState(); renderFinance();
}

// ── Invoices ───────────────────────────────────────────────
function renderInvoices() {
  gid('invoice-list').innerHTML = STATE.invoices.map(inv => `
    <div class="list-item" onclick="previewInvoice('${inv.id}')" style="cursor:pointer">
      <div class="avatar avatar-acc">${inv.client.charAt(0)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600">${inv.id} · ${inv.client}</div>
        <div style="font-size:11px;color:var(--t2)">Due ${inv.due}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-family:'DM Mono',monospace;font-size:13px;font-weight:700">$${inv.amount.toLocaleString()}</div>
        ${statusBadge(inv.status)}
      </div>
    </div>`).join('') || '<div style="color:var(--t2);font-size:13px;padding:16px">No invoices yet.</div>';

  if (STATE.invoices.length > 0) previewInvoice(STATE.invoices[0].id);
}

function previewInvoice(invId) {
  const inv = STATE.invoices.find(i => i.id === invId);
  if (!inv) return;
  gid('invoice-preview').innerHTML = `
    <div class="invoice-preview" id="print-area">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div>
          <div style="font-size:22px;font-weight:800;font-family:'Syne',sans-serif;color:var(--acc)">BALD DEV</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px">developer@bald.dev</div>
          <div style="font-size:11px;color:var(--t2)">bald.dev</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:20px;font-weight:700;font-family:'Syne',sans-serif">${inv.id}</div>
          ${statusBadge(inv.status)}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;font-size:12px">
        <div><div style="color:var(--t2);margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px">Bill to</div><div style="font-weight:600;font-size:14px">${inv.client}</div></div>
        <div style="text-align:right"><div style="color:var(--t2);margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px">Due date</div><div style="font-weight:600;font-size:14px">${inv.due}</div></div>
      </div>
      <div class="divider"></div>
      <div style="font-size:10px;font-weight:600;color:var(--t2);display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:8px;padding:8px 0;text-transform:uppercase;letter-spacing:0.5px">
        <span>Description</span><span style="text-align:right">Qty / Hrs</span><span style="text-align:right">Rate</span><span style="text-align:right">Total</span>
      </div>
      ${inv.items.map(item => `
        <div style="font-size:12px;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:8px;padding:8px 0;border-top:0.5px solid var(--bd)">
          <span>${item.desc}</span>
          <span style="text-align:right;font-family:'DM Mono',monospace">${item.qty}</span>
          <span style="text-align:right;font-family:'DM Mono',monospace">$${item.rate}</span>
          <span style="text-align:right;font-weight:600;font-family:'DM Mono',monospace">$${(item.qty*item.rate).toLocaleString()}</span>
        </div>`).join('')}
      <div class="divider"></div>
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:16px">
        <span style="font-size:13px;color:var(--t2)">Total</span>
        <span style="font-size:20px;font-weight:800;font-family:'Syne',sans-serif">$${inv.amount.toLocaleString()}</span>
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:0.5px solid var(--bd);font-size:11px;color:var(--t2)">
        Thank you for your business. Payment due within 30 days.
      </div>
    </div>`;
}

function printInvoice() { window.print(); }

// ── Goals ──────────────────────────────────────────────────
function renderGoals() {
  const catColors = { Career:'badge-teal', Skills:'badge-blue', Finance:'badge-green', Health:'badge-amber', Personal:'badge-gray' };
  gid('goal-list').innerHTML = STATE.goals.map(g => {
    const pct = Math.min(100, Math.round((g.current/g.target)*100));
    return `<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="font-size:14px;font-weight:600;flex:1;margin-right:8px">${g.title}</div>
        <span class="badge ${catColors[g.category]||'badge-gray'}">${g.category}</span>
      </div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:10px;line-height:1.5">${g.notes}</div>
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
        <span style="color:var(--t2)">Progress</span>
        <span style="font-family:'DM Mono',monospace;font-weight:600">${g.current.toLocaleString()} / ${g.target.toLocaleString()}</span>
      </div>
      <div class="progress-bar" style="height:8px;margin-bottom:10px"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:11px;color:var(--t2)">Deadline: ${g.deadline}</span>
        <span style="font-size:20px;font-weight:800;color:${pct>=100?'var(--acc)':'var(--t1)'}">${pct}%</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-sm btn-ghost" onclick="updateGoalProgress(${g.id})">Update Progress</button>
        <button class="btn btn-sm btn-ghost" onclick="aiQuick('Give me 5 actionable steps to achieve this developer goal: ${g.title.replace(/'/g,"\\'")}. Current progress: ${g.current}/${g.target}, deadline: ${g.deadline}')">✦ AI Tips</button>
        <button class="btn btn-sm btn-danger" onclick="deleteGoal(${g.id})">Delete</button>
      </div>
    </div>`;
  }).join('') || '<div class="card" style="color:var(--t2);font-size:13px;text-align:center;padding:32px">No goals yet. Set your first goal!</div>';
}

function updateGoalProgress(id) {
  const g = STATE.goals.find(g => g.id === id);
  if (!g) return;
  const val = prompt(`Update progress for "${g.title}"\nCurrent: ${g.current} / ${g.target}`, g.current);
  if (val !== null && !isNaN(parseFloat(val))) {
    g.current = Math.max(0, parseFloat(val));
    saveState(); renderGoals(); renderDashboard();
  }
}

function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  STATE.goals = STATE.goals.filter(g => g.id !== id);
  saveState(); renderGoals(); renderDashboard();
}

// ── Modals ─────────────────────────────────────────────────
let invoiceLineCount = 1;

function openModal(type) {
  const content = gid('modal-content');
  if (type === 'project') {
    content.innerHTML = `
      <div class="modal-title">New Project</div>
      <div class="form-row"><label>Project Name</label><input type="text" id="m-pname" placeholder="My awesome project"></div>
      <div class="form-2">
        <div class="form-row"><label>Client</label><input type="text" id="m-client" placeholder="Client name"></div>
        <div class="form-row"><label>Status</label><select id="m-status"><option>active</option><option>planning</option><option>archived</option></select></div>
      </div>
      <div class="form-2">
        <div class="form-row"><label>Budget ($)</label><input type="number" id="m-budget" placeholder="5000"></div>
        <div class="form-row"><label>Due Date</label><input type="date" id="m-due"></div>
      </div>
      <div class="form-row"><label>Priority</label><select id="m-priority"><option>high</option><option>medium</option><option>low</option></select></div>
      <div class="form-row"><label>Tags (comma separated)</label><input type="text" id="m-tags" placeholder="React, Node, API"></div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn btn-primary" style="flex:1" onclick="saveProject()">Create Project</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>`;
  } else if (type === 'task') {
    content.innerHTML = `
      <div class="modal-title">New Task</div>
      <div class="form-row"><label>Task Title</label><input type="text" id="m-ttitle" placeholder="What needs to be done?"></div>
      <div class="form-row"><label>Project</label><select id="m-tproject">${STATE.projects.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
      <div class="form-2">
        <div class="form-row"><label>Priority</label><select id="m-tpriority"><option>high</option><option>medium</option><option>low</option></select></div>
        <div class="form-row"><label>Estimate (hours)</label><input type="number" id="m-test" placeholder="2" step="0.5"></div>
      </div>
      <div class="form-row"><label>Due Date</label><input type="date" id="m-tdue"></div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn btn-primary" style="flex:1" onclick="saveTask()">Create Task</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>`;
  } else if (type === 'txn') {
    content.innerHTML = `
      <div class="modal-title">Add Transaction</div>
      <div class="form-row"><label>Description</label><input type="text" id="m-tdesc" placeholder="Invoice #003, Hosting bill..."></div>
      <div class="form-2">
        <div class="form-row"><label>Amount ($)</label><input type="number" id="m-tamount" placeholder="500"></div>
        <div class="form-row"><label>Type</label><select id="m-ttype"><option value="income">Income</option><option value="expense">Expense</option></select></div>
      </div>
      <div class="form-2">
        <div class="form-row"><label>Category</label><input type="text" id="m-tcat" placeholder="Freelance, Software..."></div>
        <div class="form-row"><label>Date</label><input type="date" id="m-tdate"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn btn-primary" style="flex:1" onclick="saveTxn()">Add Transaction</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>`;
  } else if (type === 'invoice') {
    invoiceLineCount = 1;
    content.innerHTML = `
      <div class="modal-title">New Invoice</div>
      <div class="form-2">
        <div class="form-row"><label>Client Name</label><input type="text" id="m-iclient" placeholder="Acme Corp"></div>
        <div class="form-row"><label>Due Date</label><input type="date" id="m-idue"></div>
      </div>
      <div style="font-size:11px;font-weight:600;color:var(--t2);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Line Items</div>
      <div id="m-items">
        <div class="invoice-line">
          <input type="text" placeholder="Description of work" id="item-desc-0">
          <input type="number" placeholder="Qty" id="item-qty-0" class="w1" value="1">
          <input type="number" placeholder="Rate $" id="item-rate-0" class="w1" value="200">
        </div>
      </div>
      <button class="btn btn-sm btn-ghost" onclick="addInvoiceLine()" style="margin-bottom:12px;margin-top:4px">+ Add line</button>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" style="flex:1" onclick="saveInvoice()">Generate Invoice</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>`;
  } else if (type === 'goal') {
    content.innerHTML = `
      <div class="modal-title">New Goal</div>
      <div class="form-row"><label>Goal Title</label><input type="text" id="m-gtitle" placeholder="Ship product, learn skill..."></div>
      <div class="form-2">
        <div class="form-row"><label>Category</label><select id="m-gcat"><option>Career</option><option>Skills</option><option>Finance</option><option>Health</option><option>Personal</option></select></div>
        <div class="form-row"><label>Deadline</label><input type="date" id="m-gdeadline"></div>
      </div>
      <div class="form-2">
        <div class="form-row"><label>Target Value</label><input type="number" id="m-gtarget" placeholder="100"></div>
        <div class="form-row"><label>Current Value</label><input type="number" id="m-gcurrent" placeholder="0"></div>
      </div>
      <div class="form-row"><label>Notes</label><textarea id="m-gnotes" placeholder="Description or milestone notes..."></textarea></div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn btn-primary" style="flex:1" onclick="saveGoal()">Add Goal</button>
        <button class="btn" onclick="closeModal()">Cancel</button>
      </div>`;
  }
  gid('modal-backdrop').classList.add('open');
}

function addInvoiceLine() {
  const container = gid('m-items');
  const div = document.createElement('div');
  div.className = 'invoice-line';
  div.innerHTML = `
    <input type="text" placeholder="Description of work" id="item-desc-${invoiceLineCount}">
    <input type="number" placeholder="Qty" id="item-qty-${invoiceLineCount}" class="w1" value="1">
    <input type="number" placeholder="Rate $" id="item-rate-${invoiceLineCount}" class="w1" value="200">`;
  container.appendChild(div);
  invoiceLineCount++;
}

function closeModal() { gid('modal-backdrop').classList.remove('open'); invoiceLineCount = 1; }

function saveProject() {
  const name = gid('m-pname').value.trim();
  if (!name) { alert('Please enter a project name.'); return; }
  STATE.projects.push({
    id: STATE.nextId++,
    name,
    client: gid('m-client').value.trim() || 'Unknown',
    status: gid('m-status').value,
    priority: gid('m-priority').value,
    budget: parseFloat(gid('m-budget').value)||0,
    spent: 0,
    due: gid('m-due').value || '2025-12-31',
    tags: gid('m-tags').value.split(',').map(t=>t.trim()).filter(Boolean),
  });
  saveState(); closeModal(); renderProjects(); renderDashboard();
}

function saveTask() {
  const title = gid('m-ttitle').value.trim();
  if (!title) { alert('Please enter a task title.'); return; }
  if (!STATE.projects.length) { alert('Create a project first!'); return; }
  STATE.tasks.push({
    id: STATE.nextId++,
    title,
    project: parseInt(gid('m-tproject').value),
    priority: gid('m-tpriority').value,
    status: 'todo',
    due: gid('m-tdue').value || '2025-12-31',
    est: parseFloat(gid('m-test').value)||1,
  });
  saveState(); closeModal(); renderTasks(); renderDashboard();
}

function saveTxn() {
  const desc = gid('m-tdesc').value.trim();
  if (!desc) { alert('Please enter a description.'); return; }
  const type = gid('m-ttype').value;
  const amount = parseFloat(gid('m-tamount').value)||0;
  STATE.transactions.push({
    id: STATE.nextId++,
    desc,
    amount: type === 'expense' ? -amount : amount,
    type,
    category: gid('m-tcat').value.trim() || 'Other',
    date: gid('m-tdate').value || today(),
  });
  saveState(); closeModal(); renderFinance();
}

function saveInvoice() {
  const client = gid('m-iclient').value.trim();
  if (!client) { alert('Please enter a client name.'); return; }
  const items = [];
  let total = 0;
  for (let i = 0; i < invoiceLineCount; i++) {
    const descEl = gid('item-desc-' + i);
    const qtyEl = gid('item-qty-' + i);
    const rateEl = gid('item-rate-' + i);
    if (descEl && descEl.value.trim()) {
      const qty = parseFloat(qtyEl?.value)||0;
      const rate = parseFloat(rateEl?.value)||0;
      items.push({ desc: descEl.value.trim(), qty, rate });
      total += qty * rate;
    }
  }
  if (!items.length) { alert('Add at least one line item.'); return; }
  const num = STATE.invoices.length + 1;
  const invId = 'INV-' + String(num).padStart(3,'0');
  STATE.invoices.push({ id: invId, client, amount: total, due: gid('m-idue').value || '2025-12-31', status: 'draft', items });
  saveState(); closeModal(); renderInvoices(); switchTab('invoice');
}

function saveGoal() {
  const title = gid('m-gtitle').value.trim();
  if (!title) { alert('Please enter a goal title.'); return; }
  STATE.goals.push({
    id: STATE.nextId++,
    title,
    category: gid('m-gcat').value,
    target: parseFloat(gid('m-gtarget').value)||100,
    current: parseFloat(gid('m-gcurrent').value)||0,
    deadline: gid('m-gdeadline').value || '2025-12-31',
    notes: gid('m-gnotes').value.trim() || '',
  });
  saveState(); closeModal(); renderGoals(); renderDashboard();
}

// ── AI Assistant ───────────────────────────────────────────
function switchToAI(prompt) { switchTab('ai'); if (prompt) aiQuick(prompt); }
function openAiQuick() { switchTab('ai'); }

async function askAI() {
  const input = gid('ai-main-input');
  const question = input.value.trim();
  if (!question) return;
  await callAI(question);
  input.value = '';
}

async function aiQuick(prompt) {
  switchTab('ai');
  setTimeout(async () => {
    gid('ai-main-input').value = prompt;
    await callAI(prompt);
  }, 100);
}

async function callAI(userMsg) {
  const apiKey = getApiKey();
  const thinking = gid('ai-thinking');
  const response = gid('ai-response');

  if (!apiKey) {
    thinking.style.display = 'none';
    response.style.display = 'block';
    response.textContent = '⚠️ Please set your Anthropic API key using the 🔑 button in the top right corner.';
    return;
  }

  thinking.style.display = 'block';
  response.style.display = 'none';
  response.textContent = '';

  const context = `You are an AI assistant for a developer who works at Bald. You have access to their CRM data:

PROJECTS: ${JSON.stringify(STATE.projects.map(p=>({name:p.name,client:p.client,status:p.status,priority:p.priority,budget:'$'+p.budget,spent:'$'+p.spent,due:p.due,tags:p.tags})))}

OPEN TASKS: ${JSON.stringify(STATE.tasks.filter(t=>t.status!=='done').map(t=>({title:t.title,project:getProject(t.project)?.name||'?',priority:t.priority,estimate:t.est+'h',due:t.due,status:t.status})))}

GOALS: ${JSON.stringify(STATE.goals.map(g=>({title:g.title,category:g.category,progress:g.current+'/'+g.target+' ('+Math.round((g.current/g.target)*100)+'%)',deadline:g.deadline})))}

TIME LOGGED: ${STATE.time.reduce((s,t)=>s+t.hours,0)} total hours across ${STATE.time.length} entries

FINANCES: Income $${STATE.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0).toLocaleString()}, Expenses $${Math.abs(STATE.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)).toLocaleString()}, Invoiced $${STATE.invoices.reduce((s,i)=>s+i.amount,0).toLocaleString()}

Give practical, specific, actionable advice. Be concise but thorough. You know their real data — reference it specifically. Speak like a smart senior developer / tech lead. Use plain text, no markdown formatting.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: context,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({error:{message:'Unknown error'}}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    thinking.style.display = 'none';
    response.style.display = 'block';
    const text = data.content?.map(b => b.text || '').join('') || 'No response.';
    response.textContent = text;
  } catch (e) {
    thinking.style.display = 'none';
    response.style.display = 'block';
    response.textContent = 'Error: ' + e.message + '\n\nMake sure your API key is correct and has sufficient credits.';
  }
}

// ── Event Listeners ────────────────────────────────────────
document.getElementById('modal-backdrop').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('apikey-backdrop').addEventListener('click', function(e) {
  if (e.target === this) closeApiKeyModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeModal(); closeApiKeyModal(); }
});
document.getElementById('ai-main-input')?.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') askAI();
});

// ── Render All ─────────────────────────────────────────────
function renderAll() {
  renderDashboard();
  renderProjects();
  renderTasks();
  renderTime();
  renderFinance();
  renderInvoices();
  renderGoals();
}

// ── Init ───────────────────────────────────────────────────
(function init() {
  loadState();
  const teDate = document.getElementById('te-date');
  if (teDate) teDate.value = today();
  checkApiKey();
  renderAll();
})();
