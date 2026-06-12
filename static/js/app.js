(function () {
  'use strict';

  const DEMO = {
    editor: { password: 'edit123', role: 'editor', displayName: 'Editor User' },
    viewer: { password: 'view123', role: 'viewer', displayName: 'Viewer User' },
  };

  let user = JSON.parse(sessionStorage.getItem('orbit-user') || 'null');
  let retroData = JSON.parse(localStorage.getItem('orbit-retro-data') || 'null') || JSON.parse(JSON.stringify(ORBIT_INITIAL_RETRO));
  let planningData = JSON.parse(localStorage.getItem('orbit-planning-data') || 'null') || JSON.parse(JSON.stringify(ORBIT_INITIAL_PLANNING));
  let retroOrder = [...ORBIT_WIDGET_ORDER];
  let planningOrder = [...ORBIT_WIDGET_ORDER];
  let dragId = null;

  const app = document.getElementById('app');

  function isEditor() { return user && user.role === 'editor'; }

  function saveData() {
    localStorage.setItem('orbit-retro-data', JSON.stringify(retroData));
    localStorage.setItem('orbit-planning-data', JSON.stringify(planningData));
  }

  function fireStarRain() {
    const container = document.getElementById('star-rain');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('div');
      const isStreak = Math.random() > 0.65;
      s.className = isStreak ? 'star-particle streak' : 'star-particle';
      s.style.left = Math.random() * 100 + '%';
      const size = isStreak ? (2 + Math.random() * 3) : (1 + Math.random() * 3);
      s.style.width = size + 'px';
      s.style.height = isStreak ? (size * 8) + 'px' : size + 'px';
      s.style.animationDelay = Math.random() * 1.2 + 's';
      s.style.animationDuration = (1.2 + Math.random() * 2.5) + 's';
      s.style.opacity = (0.4 + Math.random() * 0.6).toString();
      container.appendChild(s);
    }
    setTimeout(() => { container.innerHTML = ''; }, 5000);
  }

  function route() {
    const hash = location.hash.slice(1) || 'login';
    if (!user && hash !== 'login') { location.hash = 'login'; return; }
    if (user && hash === 'login') { location.hash = 'retro'; return; }

    if (hash === 'login') renderLogin();
    else if (hash === 'retro') { fireStarRain(); renderDashboard('retro'); }
    else if (hash === 'planning') { fireStarRain(); renderDashboard('planning'); }
    else location.hash = user ? 'retro' : 'login';
  }

  function renderLogin() {
    app.innerHTML = `<div class="login-page"><div class="login-card"><div class="login-logo"><h1>ORBIT</h1></div>
      <p class="login-subtitle">Operations, Risk, and Backlog Intelligence Tracker</p>
      <form class="login-form" id="login-form">
        <div class="form-group"><label for="username">Username</label><input id="username" type="text" placeholder="editor or viewer" autocomplete="username" /></div>
        <div class="form-group"><label for="password">Password</label><input id="password" type="password" placeholder="Enter password" autocomplete="current-password" /></div>
        <div class="form-group"><label>Access Level</label>
          <div class="role-selector">
            <button type="button" class="role-option" data-role="editor" data-user="editor"><span class="role-title">Editor</span><span class="role-desc">Edit values & rearrange widgets</span></button>
            <button type="button" class="role-option selected" data-role="viewer" data-user="viewer"><span class="role-title">Viewer</span><span class="role-desc">View only & rearrange widgets</span></button>
          </div>
        </div>
        <p class="login-error" id="login-error" hidden></p>
        <button type="submit" class="btn-primary">Launch ORBIT</button>
      </form>
      <div class="login-hint">Demo credentials:<br>Editor — <strong>editor</strong> / <strong>edit123</strong><br>Viewer — <strong>viewer</strong> / <strong>view123</strong></div>
    </div></div>`;

    let selectedRole = 'viewer';
    document.querySelectorAll('.role-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.role-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedRole = btn.dataset.role;
        document.getElementById('username').value = btn.dataset.user;
      });
    });

    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      let matched = null;
      if (username === 'editor' && password === DEMO.editor.password) matched = DEMO.editor;
      else if (username === 'viewer' && password === DEMO.viewer.password) matched = DEMO.viewer;
      if (matched) {
        user = { username, role: matched.role, displayName: matched.displayName };
        sessionStorage.setItem('orbit-user', JSON.stringify(user));
        fireStarRain();
        location.hash = 'retro';
      } else {
        const err = document.getElementById('login-error');
        err.hidden = false;
        err.textContent = 'Invalid credentials. Use editor/edit123 or viewer/view123';
      }
    });
  }

  function renderNav(active) {
    const roleCls = isEditor() ? 'editor' : 'viewer';
    return `<nav class="nav-bar"><div class="nav-logo">ORBIT</div>
      <ul class="nav-links"><li><a href="#retro" class="${active==='retro'?'active':''}">Retrospective</a></li>
      <li><a href="#planning" class="${active==='planning'?'active':''}">Planning</a></li></ul>
      <div class="nav-user"><span>${esc(user.displayName)}</span>
      <span class="role-badge ${roleCls}">${isEditor()?'Editor':'Viewer'}</span>
      <button class="btn-logout" id="logout-btn">Logout</button></div></nav><div class="gradient-line"></div>`;
  }

  function renderDashboard(page) {
    const isRetro = page === 'retro';
    const data = isRetro ? retroData : planningData;
    const order = isRetro ? retroOrder : planningOrder;
    const renderFn = isRetro ? renderRetroWidget : renderPlanningWidget;

    let widgetsHtml = order.map((id, idx) => {
      const content = renderFn(id, data, isEditor());
      return `<div class="widget-wrapper" draggable="true" data-widget-id="${id}" data-order="${idx + 1}">
        <div class="widget-chrome">
          <span class="widget-order-badge">${idx + 1}</span>
          <button type="button" class="widget-info-btn" title="Widget spec" aria-label="Show widget specification">i</button>
          <span class="widget-drag-handle" title="Drag to reorder">⠿</span>
        </div>
        <div class="widget-body">${content}</div>
      </div>`;
    }).join('');

    app.innerHTML = renderNav(page) + `<div class="page-content" id="dashboard">${widgetsHtml}</div>`;

    document.body.classList.toggle('editor-mode', isEditor());

    document.getElementById('logout-btn').addEventListener('click', () => {
      user = null;
      sessionStorage.removeItem('orbit-user');
      location.hash = 'login';
    });

    document.querySelectorAll('.nav-links a').forEach(a => {
      a.addEventListener('click', () => fireStarRain());
    });

    bindWidgetInteractions();
    bindDragDrop(page);
    if (isEditor()) bindEditable(page);
  }

  function bindWidgetInteractions(page) {
    const flyout = document.getElementById('widget-spec-flyout');
    const metaMap = page === 'retro' ? ORBIT_RETRO_META : ORBIT_PLANNING_META;
    let activeWidget = null;

    const hideFlyout = () => {
      if (flyout) flyout.hidden = true;
      document.querySelectorAll('.widget-wrapper').forEach(el => el.classList.remove('widget-active'));
      document.querySelectorAll('.widget-info-btn').forEach(btn => btn.classList.remove('active'));
      activeWidget = null;
    };

    const showFlyout = (widgetId, widgetEl, btn) => {
      const meta = metaMap[widgetId];
      if (!flyout || !meta) return;
      document.querySelectorAll('.widget-info-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.widget-wrapper').forEach(el => el.classList.remove('widget-active'));
      flyout.innerHTML = renderTooltip(meta);
      flyout.hidden = false;
      if (widgetEl) widgetEl.classList.add('widget-active');
      if (btn) btn.classList.add('active');
      activeWidget = widgetEl;
    };

    document.querySelectorAll('.widget-wrapper').forEach(w => {
      const btn = w.querySelector('.widget-info-btn');
      if (!btn) return;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = activeWidget === w && !flyout.hidden;
        if (isOpen) hideFlyout();
        else showFlyout(w.dataset.widgetId, w, btn);
      });
    });

    document.addEventListener('click', e => {
      if (!flyout || flyout.hidden) return;
      if (flyout.contains(e.target)) return;
      if (e.target.closest('.widget-info-btn')) return;
      hideFlyout();
    });

    if (flyout) {
      flyout.addEventListener('click', e => e.stopPropagation());
    }
  }

  function bindDragDrop(page) {
    const container = document.getElementById('dashboard');
    container.querySelectorAll('.widget-wrapper').forEach(el => {
      el.addEventListener('dragstart', e => {
        dragId = el.dataset.widgetId;
        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        dragId = null;
      });
      el.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      el.addEventListener('drop', e => {
        e.preventDefault();
        const targetId = el.dataset.widgetId;
        if (!dragId || dragId === targetId) return;
        const order = page === 'retro' ? [...retroOrder] : [...planningOrder];
        const from = order.indexOf(dragId);
        const to = order.indexOf(targetId);
        order.splice(from, 1);
        order.splice(to, 0, dragId);
        if (page === 'retro') { retroOrder = order; }
        else { planningOrder = order; }
        renderDashboard(page);
      });
    });
  }

  function bindEditable(page) {
    const data = page === 'retro' ? retroData : planningData;

    const ai = document.querySelector('[data-field="aiInsight"]');
    if (ai) ai.addEventListener('blur', () => { data.aiInsight = ai.textContent.trim(); saveData(); });

    const name = document.querySelector('[data-field="sprintName"]');
    if (name) name.addEventListener('blur', () => { data.identity.sprintName = name.textContent.trim(); saveData(); });

    document.querySelectorAll('.stat-card').forEach((card, i) => {
      const val = card.querySelector('[data-stat="value"]');
      const lbl = card.querySelector('[data-stat="label"]');
      if (val) val.addEventListener('blur', () => { data.headlineStats[i].value = val.textContent.trim(); saveData(); });
      if (lbl) lbl.addEventListener('blur', () => { data.headlineStats[i].label = lbl.textContent.trim(); saveData(); });
    });
  }

  function initScrollAmbience() {
    const nebula1 = document.querySelector('.nebula-1');
    const nebula2 = document.querySelector('.nebula-2');
    const nebula3 = document.querySelector('.nebula-3');
    const starsTwinkle = document.querySelector('.stars-twinkle');
    const starsDeep = document.querySelector('.stars-deep');
    const driftContainer = document.getElementById('stars-drift');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (nebula1) nebula1.style.transform = `translate3d(0, ${y * 0.06}px, 0)`;
        if (nebula2) nebula2.style.transform = `translate3d(0, ${y * -0.04}px, 0)`;
        if (nebula3) nebula3.style.transform = `translate3d(0, ${y * 0.02}px, 0)`;
        if (starsTwinkle) starsTwinkle.style.transform = `translate3d(0, ${y * 0.025}px, 0)`;
        if (starsDeep) starsDeep.style.transform = `translate3d(0, ${y * 0.015}px, 0)`;
        ticking = false;
      });
    }, { passive: true });

    function spawnDriftStar() {
      if (!driftContainer) return;
      const s = document.createElement('div');
      s.className = 'drift-star';
      s.style.left = (5 + Math.random() * 90) + '%';
      s.style.top = (window.scrollY + Math.random() * window.innerHeight) + 'px';
      s.style.animationDuration = (2 + Math.random() * 3) + 's';
      s.style.opacity = (0.3 + Math.random() * 0.5).toString();
      driftContainer.appendChild(s);
      setTimeout(() => s.remove(), 4000);
    }

    setInterval(spawnDriftStar, 600);
    document.addEventListener('scroll', () => {
      if (Math.random() > 0.7) spawnDriftStar();
    }, { passive: true });
  }

  window.addEventListener('hashchange', route);
  initScrollAmbience();
  route();
})();
