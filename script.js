'use strict';

/* =========================================================
   Amr Hossam Mostafa | Portfolio
   1. CONFIG        (edit your contact details here)
   2. Core site     (theme, nav, scroll spy, contact form)
   3. Projects      (card data; each project opens in a new tab)
   Standalone projects live in /projects (task-manager, todo-list)
   ========================================================= */

/* ---------------------------------------------------------
   1. CONFIG: fill these in. Empty values are hidden/handled.
   --------------------------------------------------------- */
const CONFIG = {
  email: '',     // e.g. 'name@example.com'  (used by the contact form and Email link)
  github: '',    // e.g. 'https://github.com/your-username'
  linkedin: ''   // e.g. 'https://www.linkedin.com/in/your-profile'
};

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;

const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: demo still works in memory */ }
  }
};

/* ---------------------------------------------------------
   2. Core site
   --------------------------------------------------------- */

/* Theme toggle */
(function initTheme() {
  const root = document.documentElement;
  const btn = $('#theme-toggle');
  const sync = () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#0a0f24' : '#f4f6ff');
  };
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('amr-theme', next); } catch { /* ignore */ }
    sync();
  });
  sync();
})();

/* Mobile menu */
(function initMenu() {
  const toggle = $('#menu-toggle');
  const links = $('#nav-links');
  const setOpen = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (links.classList.contains('open') && !e.target.closest('.nav')) setOpen(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', () => setOpen(false));
})();

/* Active section highlighting */
(function initScrollSpy() {
  const navLinks = $$('.nav-link');
  const sections = navLinks.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  const setActive = () => {
    const y = window.scrollY + 140;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= y) current = s; });
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) current = sections[sections.length - 1];
    navLinks.forEach((l) => {
      const on = l.getAttribute('href') === '#' + current.id;
      l.classList.toggle('active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { setActive(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', setActive);
  setActive();
})();

/* Footer year */
$('#year').textContent = new Date().getFullYear();

/* Contact links + form */
(function initContact() {
  const list = $('#contact-links');
  const items = [];
  if (CONFIG.email) items.push({ href: 'mailto:' + CONFIG.email, label: CONFIG.email, ic: 'mail' });
  if (CONFIG.github) items.push({ href: CONFIG.github, label: 'GitHub', ic: 'github', ext: true });
  if (CONFIG.linkedin) items.push({ href: CONFIG.linkedin, label: 'LinkedIn', ic: 'linkedin', ext: true });

  list.innerHTML = items.length
    ? items.map((i) => `<li><a href="${esc(i.href)}"${i.ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(i.ic)}<span>${esc(i.label)}</span></a></li>`).join('')
    : `<li class="contact-empty">Contact links will appear here once they are added in the CONFIG block at the top of script.js.</li>`;

  const form = $('#contact-form');
  const status = $('#form-status');
  const setErr = (id, msg) => { $('#err-' + id).textContent = msg; };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    let valid = true;

    setErr('name', ''); setErr('email', ''); setErr('message', '');
    status.className = 'form-status'; status.textContent = '';

    if (!name) { setErr('name', 'Enter your name.'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'Enter a valid email address.'); valid = false; }
    if (message.length < 10) { setErr('message', 'Write a message of at least 10 characters.'); valid = false; }
    if (!valid) { const first = $('.err:not(:empty)', form); if (first) first.previousElementSibling.focus(); return; }

    if (!CONFIG.email) {
      status.className = 'form-status bad';
      status.textContent = 'This form is not connected yet. Add your email to CONFIG in script.js to enable it.';
      return;
    }
    const subject = encodeURIComponent('Portfolio message from ' + name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' (' + email + ')');
    window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    status.className = 'form-status ok';
    status.textContent = 'Your email app should open with the message ready to send.';
    form.reset();
  });
})();

/* ---------------------------------------------------------
   3. Projects: card data, opens each project in a new tab
   --------------------------------------------------------- */
const PROJECTS = [
  {
    title: 'Task Manager', href: 'projects/task-manager/index.html', ic: 'check', c1: '#6d3ee0', c2: '#3358d8',
    desc: 'A colorful task board with drag and drop, checklists, due-date filters and an agenda view, color-coded categories, a progress ring, a focus timer, and JSON export and import.',
    tech: ['HTML', 'CSS', 'JavaScript', 'localStorage'],
    future: 'ASP.NET Core Web API, authentication, SQL Server persistence'
  },
  {
    title: 'To-Do List', href: 'projects/todo-list/index.html', ic: 'check', c1: '#2f5fe0', c2: '#8b5cf6',
    desc: 'A clean, simple to-do list: add, edit, complete, and delete items, drag to reorder, filter by status, undo deletes, and track your progress.',
    tech: ['HTML', 'CSS', 'JavaScript', 'localStorage'],
    future: 'ASP.NET Core Web API with SQL Server persistence'
  }
];

/* Each project opens in a new tab so the portfolio stays open */
(function initProjects() {
  const grid = $('#projects-grid');
  grid.innerHTML = PROJECTS.map((p) => `
    <article class="card proj-card">
      <div class="proj-visual" style="--c1:${p.c1};--c2:${p.c2}" aria-hidden="true">
        ${icon(p.ic)}
        <span class="proj-mini"><span></span><span></span><span></span></span>
      </div>
      <div class="proj-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
        <ul class="tech-badges" aria-label="Technologies used">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <p class="proj-future"><strong>Future extension:</strong> ${esc(p.future)}</p>
        <a class="btn btn-primary btn-sm" href="${esc(p.href)}" target="_blank" rel="noopener">${icon('play')} Open project<span class="sr-only"> (opens in a new tab)</span></a>
      </div>
    </article>`).join('');
})();
