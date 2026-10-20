'use strict';

let scenes = [];
const el = id => document.getElementById(id);
let current = 0;
let reading = false;
let utterance = null;
let speechRun = 0;
const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const readerPage = document.querySelector('.reader[aria-label="Lector de cómic"]');
const songsPage = el('songs-page');
let songPageOpen = false;

const feminineSpanishVoiceName = /(female|femenina|woman|mujer|helena|elvira|dalia|sabrina|sabina|paulina|m[oó]nica|luc[ií]a|camila|sof[ií]a|isabela|ximena|paloma|carmen|laura|mar[ií]a)/i;

function stopReading() {
  speechRun++;
  if (speechSupported) window.speechSynthesis.cancel();
  reading = false;
  utterance = null;
  el('speak-label').textContent = 'Escuchar';
  el('speak').setAttribute('aria-label', 'Leer en voz alta');
  el('speak').setAttribute('aria-pressed', 'false');
}

function render() {
  stopReading();
  const scene = scenes[current];
  readerPage.classList.toggle('cover-home', current === 0);
  el('cover').src = scene.image;
  preloadImage(current + 1);
  el('cover').alt = scene.alt;
  el('scene-title').textContent = scene.title;
  el('scene-title').hidden = Boolean(scene.id);
  el('story-text').textContent = scene.text;
  el('cover-actions').hidden = current !== 0;
  el('chapter').textContent = scene.chapter;
  el('scene-title').hidden = Boolean(scene.id);
  el('chapter').hidden = Boolean(scene.id);
  el('chapter').hidden = Boolean(scene.id);
  el('counter').textContent = `${current + 1} / ${scenes.length}`;
  el('previous').disabled = current === 0;
  el('next').disabled = current === scenes.length - 1;
  el('audio-status').textContent = speechSupported
    ? 'Pulsa Escuchar. Se prioriza una voz femenina en español si está instalada.'
    : 'Este navegador no permite leer en voz alta.';
}

function preloadImage(index) {
  if (index < 0 || index >= scenes.length) return;
  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = 'low';
  image.src = scenes[index].image;
}

function chooseSpanishVoice() {
  // iOS Safari may return an empty list until its voices finish loading.
  // In that case let the system choose from the utterance's es-ES language.
  const voices = window.speechSynthesis.getVoices() || [];
  const spanishVoices = voices.filter(voice => (voice.lang || '').toLowerCase().startsWith('es'));
  const femaleVoice = spanishVoices.find(voice => feminineSpanishVoiceName.test(voice.name));
  const voice = femaleVoice
    || spanishVoices.find(candidate => candidate.lang.toLowerCase().startsWith('es-es'))
    || spanishVoices[0]
    || null;
  return { voice, femaleVoice, hasVoices: voices.length > 0 };
}

function move(delta) {
  const target = current + delta;
  if (target < 0 || target >= scenes.length) return;
  current = target;
  render();
}

function showSongs(show) {
  songPageOpen = show;
  songsPage.hidden = !show;
  readerPage.hidden = show;
  readerPage.style.display = show ? 'none' : 'grid';
  songsPage.style.display = show ? 'grid' : 'none';
  el('notice').hidden = show;
  el('open-songs').hidden = show;
  el('open-songs').setAttribute('aria-pressed', String(show));
  if (show) stopReading();
  else {
    songCards.forEach(card => { card.querySelector('audio').pause(); updateSongCard(card); });
    render();
  }
}

el('open-songs').addEventListener('click', () => showSongs(true));
el('cover-open-songs').addEventListener('click', () => showSongs(true));
el('close-songs').addEventListener('click', () => showSongs(false));
el('begin-reading').addEventListener('click', () => move(1));

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

const songCards = [...document.querySelectorAll('.song-card[data-track]')];
function updateSongCard(card) {
  const audio = card.querySelector('audio');
  const button = card.querySelector('.song-play');
  const range = card.querySelector('.song-progress');
  const time = card.querySelector('.song-time');
  const active = !audio.paused && !audio.ended;
  button.textContent = active ? 'Ⅱ' : '▶';
  button.setAttribute('aria-label', `${active ? 'Pausar' : 'Reproducir'} ${card.querySelector('h2').textContent}`);
  range.value = audio.duration ? String(Math.round(audio.currentTime / audio.duration * 1000)) : '0';
  time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
}

songCards.forEach(card => {
  const audio = card.querySelector('audio');
  const button = card.querySelector('.song-play');
  const range = card.querySelector('.song-progress');
  button.addEventListener('click', async () => {
    for (const other of songCards) {
      const otherAudio = other.querySelector('audio');
      if (otherAudio !== audio) { otherAudio.pause(); updateSongCard(other); }
    }
    if (audio.paused) {
      try { await audio.play(); }
      catch { el('audio-status').textContent = 'No se pudo reproducir esta canción. Inténtalo de nuevo.'; }
    } else audio.pause();
    updateSongCard(card);
  });
  range.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = Number(range.value) / 1000 * audio.duration;
  });
  ['timeupdate', 'loadedmetadata', 'play', 'pause', 'ended'].forEach(eventName => audio.addEventListener(eventName, () => updateSongCard(card)));
  updateSongCard(card);
});

el('previous').addEventListener('click', () => move(-1));
el('next').addEventListener('click', () => move(1));

let touchStart = null;
const swipeArea = document.querySelector('.art');
swipeArea.addEventListener('touchstart', event => {
  if (event.touches.length !== 1) {
    touchStart = null;
    return;
  }
  const touch = event.touches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
swipeArea.addEventListener('touchend', event => {
  if (!touchStart || event.changedTouches.length !== 1) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) move(dx < 0 ? 1 : -1);
}, { passive: true });
swipeArea.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });

el('home').addEventListener('click', event => {
  event.preventDefault();
  if (songPageOpen) showSongs(false);
  current = 0;
  render();
});

el('size').addEventListener('click', () => {
  const large = document.querySelector('.reader').classList.toggle('large');
  el('size').setAttribute('aria-pressed', String(large));
  el('size').setAttribute('aria-label', large ? 'Usar el tamaño normal del texto' : 'Aumentar el tamaño del texto');
});

el('speak').addEventListener('click', () => {
  if (!speechSupported || !scenes[current]) return;
  if (reading) {
    stopReading();
    el('audio-status').textContent = 'Lectura detenida.';
    return;
  }

  // Do not call cancel() here: on iOS Safari cancel-then-speak in the same
  // tap can swallow the new utterance. Speak directly inside the user gesture.
  speechRun++;
  const run = speechRun;
  const { voice, femaleVoice, hasVoices } = chooseSpanishVoice();
  const spokenText = scenes[current].id
    ? scenes[current].text
    : `${scenes[current].title}. ${scenes[current].text}`;
  utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = 'es-ES';
  utterance.rate = 0.85;
  if (voice) utterance.voice = voice;
  utterance.onend = () => {
    if (run !== speechRun) return;
    reading = false;
    utterance = null;
    el('speak-label').textContent = 'Escuchar';
    el('speak').setAttribute('aria-label', 'Leer en voz alta');
    el('speak').setAttribute('aria-pressed', 'false');
    el('audio-status').textContent = 'Puedes volver a escucharlo.';
  };
  utterance.onerror = event => {
    if (run !== speechRun) return;
    reading = false;
    utterance = null;
    el('speak-label').textContent = 'Escuchar';
    el('speak').setAttribute('aria-label', 'Leer en voz alta');
    el('speak').setAttribute('aria-pressed', 'false');
    el('audio-status').textContent = `No se pudo iniciar la lectura (${event.error || 'error de voz'}). Inténtalo de nuevo.`;
  };

  reading = true;
  el('speak-label').textContent = 'Detener';
  el('speak').setAttribute('aria-label', 'Detener lectura');
  el('speak').setAttribute('aria-pressed', 'true');
  el('audio-status').textContent = femaleVoice
    ? `Leyendo con voz femenina: ${femaleVoice.name}`
    : voice
      ? `Leyendo con ${voice.name}; no se pudo identificar una voz femenina.`
      : hasVoices
        ? 'No se encontró voz en español; se usa la voz predeterminada del dispositivo.'
        : 'Leyendo con la voz predeterminada del dispositivo en español.';

  try {
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    reading = false;
    utterance = null;
    el('speak-label').textContent = 'Escuchar';
    el('speak').setAttribute('aria-label', 'Leer en voz alta');
    el('speak').setAttribute('aria-pressed', 'false');
    el('audio-status').textContent = 'No se pudo iniciar la lectura. Inténtalo de nuevo.';
  }
});

window.addEventListener('pagehide', stopReading);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopReading();
    el('audio-status').textContent = 'Lectura detenida. Pulsa Escuchar para continuar.';
  }
});
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
});

if (!speechSupported) el('speak').disabled = true;
fetch('book-content.json?v=20261020-11')
  .then(response => {
    if (!response.ok) throw new Error('No se pudo cargar el contenido.');
    return response.json();
  })
  .then(data => {
    scenes = data.views;
    render();
  })
  .catch(() => {
    el('audio-status').textContent = 'No se pudo cargar esta vista previa. Inténtalo de nuevo.';
  });
