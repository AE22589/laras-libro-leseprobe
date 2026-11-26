/* Release: midnight in Madrid, 7 December 2026 (CET, UTC+1). */
(() => {
  'use strict';
  const releaseAt = Date.parse('2026-12-07T00:00:00+01:00');
  const gate = document.getElementById('book-countdown');
  const status = document.getElementById('countdown-status');
  const fields = ['days', 'hours', 'minutes', 'seconds'].map(
    name => document.getElementById('countdown-' + name)
  );
  const content = Array.from(document.body.children).filter(
    element => element !== gate && element.tagName !== 'SCRIPT'
  );
  content.forEach(element => { element.inert = true; });
  let opened = false;
  let timer;
  const unlockKey = 'larasLibroCountdownUnlocked';
  let clickCount = 0;
  gate.addEventListener('click', () => {
    if (++clickCount < 5) return;
    clickCount = 0;
    const password = window.prompt('Contraseña de administrador:');
    if (password === '13371337') {
      try { localStorage.setItem(unlockKey, '1'); } catch (_) { /* Open for this visit. */ }
      openBook(true);
    } else if (password !== null) {
      window.alert('Contraseña incorrecta.');
    }
  });
  function openBook(animate) {
    if (opened) return;
    opened = true;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', update);
    window.removeEventListener('pageshow', update);
    status.textContent = '¡Tu aventura comienza ahora!';
    const reveal = () => {
      gate.remove();
      document.body.classList.remove('awaiting-book');
      content.forEach(element => { element.inert = false; });
      const script = document.createElement('script');
      script.src = 'reader.js?v=20261106-return-to-start-v1';
      document.head.appendChild(script);
      document.getElementById('home')?.focus({ preventScroll: true });
    };
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gate.classList.add('is-opening');
      window.setTimeout(reveal, 1200);
    } else {
      reveal();
    }
  }
  function update() {
    const remaining = releaseAt - Date.now();
    if (remaining <= 0) {
      openBook(true);
      return;
    }
    const seconds = Math.ceil(remaining / 1000);
    const values = [
      Math.floor(seconds / 86400),
      Math.floor(seconds % 86400 / 3600),
      Math.floor(seconds % 3600 / 60),
      seconds % 60
    ];
    fields.forEach((field, i) => { field.textContent = String(values[i]).padStart(2, '0'); });
  }
  let unlocked = false;
  try { unlocked = localStorage.getItem(unlockKey) === '1'; } catch (_) { /* Storage may be unavailable. */ }
  if (unlocked || Date.now() >= releaseAt) {
    openBook(false);
  } else {
    update();
    timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    window.addEventListener('pageshow', update);
  }
})();
