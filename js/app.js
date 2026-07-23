(() => {
  'use strict';

  const STORAGE_KEY = 'orchidaceae.phase4';
  const LEGACY_KEY = 'orchidaceae.phase3';
  const DAY = 86_400_000;
  const $ = selector => document.querySelector(selector);
  const defaults = { theme: 'light', name: '', journal: '', mood: 'Calm', water: 4, lastPeriod: '', cycleLength: 28, periodLength: 5 };
  let calendarMonth = new Date();

  // A damaged localStorage value should never prevent the app from opening.
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      return { ...defaults, ...(stored ? JSON.parse(stored) : {}) };
    } catch {
      return { ...defaults };
    }
  }

  let state = loadState();
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Keep the session usable if storage is unavailable. */ }
  }

  const atMidnight = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const parseDate = value => { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); };
  const differenceInDays = (a, b) => Math.round((atMidnight(a) - atMidnight(b)) / DAY);
  const addDays = (date, amount) => { const copy = new Date(date); copy.setDate(copy.getDate() + amount); return copy; };
  const formatDate = date => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);

  // Calendar estimates are informational only; they are not medical or contraceptive guidance.
  function getCycleAt(date) {
    if (!state.lastPeriod) return null;
    const start = parseDate(state.lastPeriod);
    if (Number.isNaN(start.getTime())) return null;
    const cycleLength = Number(state.cycleLength);
    const position = ((differenceInDays(date, start) % cycleLength) + cycleLength) % cycleLength;
    const cycleStart = addDays(date, -position);
    const ovulationDay = cycleLength - 14;
    return {
      position,
      cycleStart,
      period: position < Number(state.periodLength),
      fertile: position >= ovulationDay - 5 && position <= ovulationDay,
      ovulation: position === ovulationDay,
      nextPeriod: addDays(cycleStart, cycleLength)
    };
  }

  function applyTheme() {
    document.body.dataset.theme = state.theme;
    $('#theme-select').value = state.theme;
  }

  function renderHome() {
    const cycle = getCycleAt(new Date());
    $('#display-name').textContent = state.name || 'beautiful';
    $('#name-input').value = state.name;
    $('#journal-note').value = state.journal;
    $('#mood-value').textContent = state.mood;
    $('#water-value').textContent = state.water;
    $('#today-label').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

    if (!cycle) {
      $('#journey-cycle').textContent = '—';
      $('#cycle-day').textContent = 'Begin here';
      $('#cycle-subtitle').textContent = 'Add your last period to begin your private forecast.';
      $('#next-period').textContent = 'Set your date';
      $('#fertile-window').textContent = 'Set your date';
      $('#days-left').textContent = '—';
      return;
    }

    const fertileStart = addDays(cycle.cycleStart, Number(state.cycleLength) - 19);
    const fertileEnd = addDays(cycle.cycleStart, Number(state.cycleLength) - 14);
    const daysLeft = Math.max(0, differenceInDays(cycle.nextPeriod, new Date()));
    $('#journey-cycle').textContent = `Day ${cycle.position + 1}`;
    $('#cycle-day').textContent = `Cycle day ${cycle.position + 1}`;
    $('#cycle-subtitle').textContent = cycle.period ? 'A gentle period day. Rest in your own way.' : cycle.fertile ? 'Your orchid is entering a blooming season.' : 'Your body is moving through its own rhythm.';
    $('#orchid-message').textContent = cycle.fertile ? 'Your orchid is beginning its blooming season.' : 'Your garden is quietly growing with you.';
    $('#next-period').textContent = formatDate(cycle.nextPeriod);
    $('#period-detail').textContent = `In about ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
    $('#fertile-window').textContent = `${formatDate(fertileStart)} – ${formatDate(fertileEnd)}`;
    $('#fertile-detail').textContent = 'Estimated fertile window';
    $('#days-left').textContent = daysLeft;
    const ring = $('#ring-progress');
    const circumference = 2 * Math.PI * 49;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference * (1 - (cycle.position + 1) / Number(state.cycleLength));
  }

  function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const grid = $('#calendar-grid');
    $('#calendar-title').textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(firstDay);
    grid.replaceChildren();
    for (let blank = 0; blank < firstDay.getDay(); blank += 1) grid.append(document.createElement('span'));
    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const date = new Date(year, month, day);
      const button = document.createElement('button');
      const cycle = getCycleAt(date);
      button.type = 'button';
      button.className = 'calendar-day';
      button.textContent = day;
      if (cycle?.period) button.classList.add('period');
      if (cycle?.fertile) button.classList.add('fertile');
      if (cycle?.ovulation) button.classList.add('ovulation');
      if (differenceInDays(date, new Date()) === 0) button.classList.add('today');
      grid.append(button);
    }
  }

  function render() { applyTheme(); renderHome(); renderCalendar(); }

  document.querySelectorAll('[data-nav]').forEach(button => {
    button.addEventListener('click', () => {
      const pageId = button.dataset.nav;
      document.querySelectorAll('.page').forEach(page => page.classList.toggle('active', page.dataset.page === pageId));
      document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.nav === pageId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  $('.theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'light' ? 'dark' : 'light'; saveState(); render(); });
  $('#theme-select').addEventListener('change', event => { state.theme = event.target.value; saveState(); render(); });
  $('#name-input').addEventListener('input', event => { state.name = event.target.value; saveState(); $('#display-name').textContent = state.name || 'beautiful'; });
  $('#journal-note').addEventListener('input', event => { state.journal = event.target.value; saveState(); });
  $('#water-card').addEventListener('click', () => { state.water = state.water >= 8 ? 0 : state.water + 1; saveState(); $('#water-value').textContent = state.water; });

  const checkIn = $('#checkin');
  document.querySelectorAll('[data-open="checkin"]').forEach(button => button.addEventListener('click', () => checkIn.showModal()));
  document.querySelectorAll('.mood-options button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.mood-options button').forEach(option => option.classList.remove('selected'));
    button.classList.add('selected');
    state.mood = button.value;
  }));
  $('#save-checkin').addEventListener('click', () => { saveState(); $('#mood-value').textContent = state.mood; });

  const cycleDialog = $('#cycle-settings');
  document.querySelectorAll('[data-open="cycle-settings"]').forEach(button => button.addEventListener('click', () => cycleDialog.showModal()));
  $('#last-period').value = state.lastPeriod;
  $('#cycle-length').value = state.cycleLength;
  $('#period-length').value = state.periodLength;
  const renderRangeLabels = () => { $('#cycle-length-output').textContent = `${$('#cycle-length').value} days`; $('#period-length-output').textContent = `${$('#period-length').value} days`; };
  renderRangeLabels();
  $('#cycle-length').addEventListener('input', renderRangeLabels);
  $('#period-length').addEventListener('input', renderRangeLabels);
  $('#save-cycle').addEventListener('click', () => {
    state.lastPeriod = $('#last-period').value;
    state.cycleLength = Number($('#cycle-length').value);
    state.periodLength = Number($('#period-length').value);
    saveState();
    render();
  });
  $('#previous-month').addEventListener('click', () => { calendarMonth.setMonth(calendarMonth.getMonth() - 1); renderCalendar(); });
  $('#next-month').addEventListener('click', () => { calendarMonth.setMonth(calendarMonth.getMonth() + 1); renderCalendar(); });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  render();
})();

/* ==========================================================
   Orchidaceae Splash Screen
   Build 002
========================================================== */

window.addEventListener("load", () => {

    const splash = document.getElementById("orchid-splash");

    if (!splash) return;

    // Allow the UI to settle before fading out
    setTimeout(() => {

        splash.classList.add("hide");

    }, 2200);

});
