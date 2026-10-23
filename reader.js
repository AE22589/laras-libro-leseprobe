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
const gamesPage = el('games-page');
let songPageOpen = false;
let gamePageOpen = false;
let activeGame = '';

const feminineSpanishVoiceName = /(female|femenina|woman|mujer|helena|elvira|dalia|sabrina|sabina|paulina|m[oó]nica|luc[ií]a|camila|sof[ií]a|isabela|ximena|paloma|carmen|laura|mar[ií]a)/i;
const bookmarkStorageKey = 'laras-libro-bookmark-v1';
const bookmarkMenu = el('bookmark-menu');

function readBookmark() {
  try { return JSON.parse(window.localStorage.getItem(bookmarkStorageKey) || 'null'); }
  catch { return null; }
}

function updateBookmarkMenu() {
  const bookmark = readBookmark();
  const hasBookmark = Boolean(bookmark && bookmark.key);
  el('go-bookmark').disabled = !hasBookmark;
  el('remove-bookmark').hidden = !hasBookmark;
  el('save-bookmark').hidden = songPageOpen || gamePageOpen;
  el('bookmark-status').textContent = hasBookmark
    ? `Marcapáginas: ${bookmark.title || 'tu lectura'}.`
    : 'Aún no hay marcador.';
}

function closeBookmarkMenu() {
  bookmarkMenu.hidden = true;
  el('bookmark-toggle').setAttribute('aria-expanded', 'false');
  el('bookmark-toggle').classList.remove('is-active');
}

function toggleBookmarkMenu() {
  const open = bookmarkMenu.hidden;
  bookmarkMenu.hidden = !open;
  el('bookmark-toggle').setAttribute('aria-expanded', String(open));
  el('bookmark-toggle').classList.toggle('is-active', open);
  updateBookmarkMenu();
}

function stopReading() {
  speechRun++;
  if (speechSupported) window.speechSynthesis.cancel();
  reading = false;
  utterance = null;
  el('speak-label').textContent = 'Escuchar';
  el('speak').setAttribute('aria-label', 'Leer en voz alta');
  el('speak').setAttribute('aria-pressed', 'false');
}

function updateHeaderSelection() {
  const bookActive = !songPageOpen && !gamePageOpen;
  el('home').classList.toggle('is-active', bookActive);
  if (bookActive) el('home').setAttribute('aria-current', 'page');
  else el('home').removeAttribute('aria-current');
  el('home').setAttribute('aria-label', songPageOpen || gamePageOpen
    ? 'Volver al libro'
    : current === 0 ? 'Empezar a leer' : 'Volver a la portada');
  el('open-games').classList.toggle('is-active', gamePageOpen);
  el('open-games').setAttribute('aria-pressed', String(gamePageOpen));
  el('open-songs').classList.toggle('is-active', songPageOpen);
  el('open-songs').setAttribute('aria-pressed', String(songPageOpen));
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
  updateHeaderSelection();
  updateBookmarkMenu();
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
  closeSecretGame();
  songPageOpen = show;
  gamePageOpen = false;
  songsPage.hidden = !show;
  gamesPage.hidden = true;
  readerPage.hidden = show;
  readerPage.style.display = show ? 'none' : 'grid';
  songsPage.style.display = show ? 'grid' : 'none';
  gamesPage.style.display = 'none';
  el('notice').hidden = show;
  updateHeaderSelection();
  updateBookmarkMenu();
  if (show) stopReading();
  else {
    songCards.forEach(card => { card.querySelector('audio').pause(); updateSongCard(card); });
    render();
  }
}

function showGames(show) {
  closeSecretGame();
  songCards.forEach(card => { card.querySelector('audio').pause(); updateSongCard(card); });
  gamePageOpen = show;
  songPageOpen = false;
  gamesPage.hidden = !show;
  songsPage.hidden = true;
  readerPage.hidden = show;
  readerPage.style.display = show ? 'none' : 'grid';
  songsPage.style.display = 'none';
  gamesPage.style.display = show ? 'grid' : 'none';
  el('notice').hidden = show;
  updateHeaderSelection();
  updateBookmarkMenu();
  if (show) {
    stopReading();
    activeGame = '';
    el('game-menu').hidden = false;
    el('game-intro').hidden = true;
    el('syllable-game').hidden = true;
    el('word-game').hidden = true;
    el('lokum-comment').textContent = '¡Elige un juego y jugamos juntas!';
  }
}

el('open-songs').addEventListener('click', () => showSongs(true));
el('open-games').addEventListener('click', () => showGames(true));
el('close-songs').addEventListener('click', () => showSongs(false));
el('close-games').addEventListener('click', () => showGames(false));

el('bookmark-toggle').addEventListener('click', toggleBookmarkMenu);
el('save-bookmark').addEventListener('click', () => {
  if (songPageOpen || gamePageOpen || !scenes[current]) return;
  const scene = scenes[current];
  const key = scene.id || (current === 0 ? '__cover__' : `view:${current}`);
  try {
    window.localStorage.setItem(bookmarkStorageKey, JSON.stringify({ key, index: current, title: scene.title || scene.chapter || `Página ${current + 1}` }));
    updateBookmarkMenu();
  } catch {
    el('bookmark-status').textContent = 'No se pudo guardar el marcador en este dispositivo.';
  }
});
el('go-bookmark').addEventListener('click', () => {
  const bookmark = readBookmark();
  if (!bookmark) return;
  let target = bookmark.key === '__cover__' ? 0 : scenes.findIndex(scene => scene.id === bookmark.key);
  if (target < 0 && Number.isInteger(bookmark.index) && scenes[bookmark.index]) target = bookmark.index;
  if (target < 0) {
    el('bookmark-status').textContent = 'Esta página no está disponible en la vista previa actual.';
    return;
  }
  if (songPageOpen) showSongs(false);
  if (gamePageOpen) showGames(false);
  current = target;
  closeBookmarkMenu();
  render();
});
el('remove-bookmark').addEventListener('click', () => {
  try { window.localStorage.removeItem(bookmarkStorageKey); } catch { /* Storage may be disabled. */ }
  updateBookmarkMenu();
});
document.addEventListener('click', event => {
  if (!bookmarkMenu.hidden && !event.target.closest('.masthead-actions')) closeBookmarkMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !bookmarkMenu.hidden) {
    closeBookmarkMenu();
    el('bookmark-toggle').focus();
  }
});

const syllableWordSources = `
CA-SA ME-SA SI-LLA CA-MA MA-NO PA-TO GA-TO PE-LO LU-NA NU-BE FO-CA LO-RO O-SO MO-NO RA-NA VA-CA PE-RRO PE-RRA CA-BRA LO-BO VI-NO MO-TO RO-PA PA-LA RA-MA RO-CA NI-ÑO CU-NA TA-PA TI-ZA ZA-PA-TO PE-LO-TA CA-MI-SA VEN-TA-NA CO-CI-NA MÚ-SI-CA BO-TE-LLA MAR-TES A-MI-GO A-MI-GA O-RE-JA CA-BE-ZA CO-RA-ZÓN ES-TRE-LLA NA-RAN-JA MAN-ZA-NA BA-NA-NA PLÁ-TA-NO FRE-SA PE-RA U-VA LI-MÓN ME-LÓN SO-PA QUE-SO LE-CHE HUE-VO A-RROZ TOR-TA GA-LLE-TA HE-LA-DO YO-GUR A-GUA FUE-GO TIE-RRA VIEN-TO LLU-VIA NIE-VE HO-JA ÁR-BOL CIE-LO RÍ-O DÍ-A NO-CHE TAR-DE VE-RA-NO O-TO-ÑO BAI-LAR CAN-TAR JU-GAR SAL-TAR CO-RRER CO-MER DOR-MIR LE-ER ES-CUE-LA LI-BRO LÁ-PIZ GO-MA RE-GLA PLU-MA PA-PEL MUN-DO A-MOR FE-LIZ BO-NI-TO BO-NI-TA A-LE-GRE DUL-CE FUER-TE RO-JO A-ZUL VER-DE NE-GRO BLAN-CO NA-RIZ BO-CA PIER-NA CA-RA O-JOS BRA-ZO DE-DOS CA-MI-NO A-MI-GOS MÚ-SI-CO CAN-CIÓN SO-NI-DO PA-LA-BRA LE-TRAS SÍ-LA-BA SON-RI-SA RE-GA-LO FIES-TA
`.trim().split(/\s+/);
const syllableChallenges = syllableWordSources.map(source => {
  const syllables = source.split('-');
  return { syllables, word: syllables.join('') };
});
const syllableBank = [...new Set(syllableChallenges.flatMap(challenge => challenge.syllables))];
let challengeIndex = 0;
let challengeSolved = false;
let missingSyllableIndex = 0;
const syllablePraise = [
  '¡Excelente! Has encontrado la sílaba.',
  '¡Muy bien! Cada vez lees mejor.',
  '¡Genial! Esa sílaba era la correcta.',
  '¡Lo lograste! ¡Qué buen oído!',
  '¡Fantástico! Has completado la palabra.',
  '¡Bravo! Tu lectura suena genial.',
  '¡Qué bien! Has unido las sílabas.',
  '¡Estupendo! Sigue así, pequeña estrella.'
];
let lastSyllablePraise = -1;

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function showGameIntro(type) {
  closeSecretGame();
  stopReading();
  activeGame = type;
  el('game-menu').hidden = true;
  el('syllable-game').hidden = true;
  el('word-game').hidden = true;
  el('game-intro').hidden = false;
  if (type === 'secret') {
    el('game-intro-title').textContent = 'Palabras secretas';
    el('game-intro-text').textContent = 'Lee o escucha mi pista y descubre la palabra. Arrastra cada letra hasta su casilla: si aciertas, brilla en verde; si no, brilla en rojo y vuelve a su sitio. También puedes tocar una letra y después su casilla. Usa «Una pista» si necesitas ayuda. Hay tres niveles y no hay reloj.';
    el('lokum-comment').textContent = '¡Vamos a descubrir 100 palabras! Yo te doy una pista y tú ordenas las letras.';
  } else if (type === 'syllable') {
    el('game-intro-title').textContent = 'La sílaba perdida';
    el('game-intro-text').textContent = 'Elige la sílaba que falta para completar cada palabra. Hay más de 100 palabras para practicar y puedes volver a intentarlo.';
    el('lokum-comment').textContent = '¡Vamos a practicar más de 100 palabras, una sílaba a la vez!';
  } else {
    el('game-intro-title').textContent = 'Completa la melodía';
    el('game-intro-text').textContent = 'Elige letras para descubrir una palabra secreta. Tienes diez notas: cada error apaga una. ¡Puedes volver a jugar cuando quieras!';
    el('lokum-comment').textContent = '¡Adivina la palabra letra por letra! Tienes diez notas.';
  }
}

function renderChallenge() {
  const challenge = syllableChallenges[challengeIndex];
  challengeSolved = false;
  el('say-word').hidden = true;
  el('game-round-label').textContent = `Reto ${challengeIndex + 1} de ${syllableChallenges.length}`;
  missingSyllableIndex = Math.floor(Math.random() * challenge.syllables.length);
  const answer = challenge.syllables[missingSyllableIndex];
  el('word-puzzle').replaceChildren();
  for (let i = 0; i < challenge.syllables.length; i++) {
    const tile = document.createElement('span');
    tile.textContent = i === missingSyllableIndex ? '' : challenge.syllables[i];
    if (i === missingSyllableIndex) {
      tile.setAttribute('role', 'img');
      tile.setAttribute('aria-label', 'Sílaba que falta');
    }
    el('word-puzzle').append(tile);
  }
  const shuffledOptions = [answer, ...shuffle(syllableBank.filter(part => part !== answer)).slice(0, 2)];
  const options = shuffle(shuffledOptions);
  el('syllable-options').replaceChildren();
  for (const option of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'syllable-option';
    button.textContent = option;
    button.addEventListener('click', () => {
      if (challengeSolved) return;
      if (option === answer) {
        challengeSolved = true;
        el('game-feedback').textContent = `¡Muy bien! ${challenge.word}.`;
        let praiseIndex = Math.floor(Math.random() * syllablePraise.length);
        if (syllablePraise.length > 1 && praiseIndex === lastSyllablePraise) {
          praiseIndex = (praiseIndex + 1 + Math.floor(Math.random() * (syllablePraise.length - 1))) % syllablePraise.length;
        }
        lastSyllablePraise = praiseIndex;
        el('lokum-comment').textContent = syllablePraise[praiseIndex];
        el('word-puzzle').children[missingSyllableIndex].textContent = option;
        el('word-puzzle').classList.add('word-correct');
        el('syllable-options').querySelectorAll('button').forEach(item => { item.disabled = true; });
        el('next-challenge').hidden = false;
        el('say-word').hidden = false;
      } else {
        el('game-feedback').textContent = 'Casi. ¡Prueba otra vez!';
        el('lokum-comment').textContent = '¡Casi! ¡Tú puedes!';
      }
    });
    el('syllable-options').append(button);
  }
  el('word-puzzle').classList.remove('word-correct');
  el('game-feedback').textContent = 'Toca una sílaba para completar la palabra.';
  el('next-challenge').hidden = true;
  el('next-challenge').textContent = challengeIndex === syllableChallenges.length - 1 ? 'Jugar otra vez ↻' : 'Siguiente →';
}

el('start-syllable-game').addEventListener('click', () => {
  showGameIntro('syllable');
});
el('next-challenge').addEventListener('click', () => {
  challengeIndex = challengeIndex === syllableChallenges.length - 1 ? 0 : challengeIndex + 1;
  renderChallenge();
});
el('say-word').addEventListener('click', () => {
  if (!speechSupported) {
    el('game-feedback').textContent = 'La voz no está disponible en este dispositivo.';
    return;
  }
  window.speechSynthesis.cancel();
  const { voice } = chooseSpanishVoice();
  const spoken = new SpeechSynthesisUtterance(syllableChallenges[challengeIndex].word);
  spoken.lang = 'es-ES';
  spoken.rate = 0.8;
  if (voice) spoken.voice = voice;
  window.speechSynthesis.speak(spoken);
});

const wordCategories = [
  { hint: 'La naturaleza', words: 'SOL LUNA NUBE MAR RÍO OLA ISLA FLOR ÁRBOL HOJA RAMA ROCA NIEVE LLUVIA VIENTO FUEGO AGUA TIERRA SOMBRA NOCHE DÍA CAMPO BOSQUE CIELO ESTRELLA' },
  { hint: 'Un animal', words: 'GATO GATA PERRO PATO PEZ RANA SAPO OSO LOBO VACA MONO LEÓN TIGRE CEBRA MULA BURRO RATÓN CONEJO POLLO GALLO OVEJA CABRA CERDO FOCA LORO' },
  { hint: 'La casa y la escuela', words: 'CASA MESA SILLA CAMA PUERTA TECHO PISO SALA SOFÁ VASO TAZA PLATO SOPA PAN LECHE LIBRO LÁPIZ GOMA REGLA MAPA RELOJ LLAVE CAJA ROPA MANTA' },
  { hint: 'La música y Sonoria', words: 'NOTA RITMO BAILE MÚSICA CANTO VOZ CORO PIANO DISCO RADIO LUZ MAGIA BRILLO PORTAL REINA VIAJE MUNDO SUEÑO PASO AMIGA EQUIPO JUEGO SONORIA SONIDO CUENTO' },
  { hint: 'Una acción', words: 'BAILAR CANTAR LEER JUGAR SALTAR MIRAR HABLAR SOÑAR AYUDAR REÍR CORRER COMER DORMIR ABRIR CERRAR SUBIR BAJAR SABER HACER TOCAR OÍR AMAR CUIDAR BRINCAR REPOSAR' },
  { hint: 'Una palabra que describe algo', words: 'ROJO AZUL VERDE NEGRO BLANCO ALTO BAJO GRANDE CHICO FELIZ TRISTE LINDO SUAVE FUERTE RÁPIDO DULCE NUEVO VIEJO LIMPIO BUENO MALO CÁLIDO PEQUEÑO CORTO LARGO' }
];
const wordPool = wordCategories.flatMap(category => category.words.split(/\s+/).map(word => ({ word, hint: category.hint })));
let wordDeck = [];
let mysteryWord = '';
let mysteryHint = '';
const maximumMisses = 10;
let guessedLetters = new Set();
let wrongGuesses = 0;
let wordGameFinished = false;

function remainingNotesText(remaining) {
  return remaining === 1 ? 'Te queda una nota' : `Te quedan ${remaining} notas`;
}

function renderWordGame() {
  const solved = wordGameFinished && [...mysteryWord].every(letter => guessedLetters.has(normalizeLetter(letter)));
  el('word-hint').textContent = `Pista: ${mysteryHint}`;
  el('word-letters').replaceChildren();
  for (const letter of mysteryWord) {
    const tile = document.createElement('span');
    tile.textContent = guessedLetters.has(normalizeLetter(letter)) || wordGameFinished ? letter : '＿';
    el('word-letters').append(tile);
  }
  el('note-attempts').replaceChildren();
  for (let i = 0; i < maximumMisses; i++) {
    const note = document.createElement('span');
    note.className = i < maximumMisses - wrongGuesses ? 'note-lit' : 'note-dim';
    note.textContent = '♫';
    note.setAttribute('aria-hidden', 'true');
    el('note-attempts').append(note);
  }
  el('note-attempts').setAttribute('aria-label', `${maximumMisses - wrongGuesses} de ${maximumMisses} notas disponibles`);
  el('say-hidden-word').hidden = !wordGameFinished;
  el('letter-keyboard').replaceChildren();
  for (const letter of 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ') {
    const key = document.createElement('button');
    key.type = 'button';
    key.className = 'letter-key';
    key.textContent = letter;
    key.setAttribute('aria-label', `Letra ${letter}`);
    key.disabled = guessedLetters.has(letter) || wordGameFinished;
    key.addEventListener('click', () => {
      if (wordGameFinished || guessedLetters.has(letter)) return;
      guessedLetters.add(letter);
      if (![...mysteryWord].some(item => normalizeLetter(item) === letter)) {
        wrongGuesses++;
        el('lokum-comment').textContent = wrongGuesses >= maximumMisses
          ? `La palabra era ${mysteryWord}. ¡Intentémoslo otra vez!`
          : `¡Casi! ${remainingNotesText(maximumMisses - wrongGuesses)}.`;
      } else {
        el('lokum-comment').textContent = [...mysteryWord].every(item => guessedLetters.has(normalizeLetter(item)))
          ? `¡Lo lograste! ¡${mysteryWord}!`
          : '¡Muy bien! Esa letra sí está.';
      }
      const won = [...mysteryWord].every(item => guessedLetters.has(normalizeLetter(item)));
      if (won) {
        wordGameFinished = true;
        el('word-feedback').textContent = `¡Muy bien! La palabra es ${mysteryWord}.`;
      } else if (wrongGuesses >= maximumMisses) {
        wordGameFinished = true;
        el('word-feedback').textContent = `La palabra era ${mysteryWord}. ¡Juguemos otra vez!`;
      } else {
        el('word-feedback').textContent = wrongGuesses
          ? `${remainingNotesText(maximumMisses - wrongGuesses)}. ¡Prueba otra letra!`
          : '¡Bien! Elige otra letra.';
      }
      el('retry-word-game').hidden = !wordGameFinished;
      renderWordGame();
    });
    el('letter-keyboard').append(key);
  }
  el('retry-word-game').hidden = !wordGameFinished;
  if (wordGameFinished && solved) el('word-feedback').textContent = `¡Muy bien! La palabra es ${mysteryWord}.`;
}

function startWordGame() {
  guessedLetters = new Set();
  wrongGuesses = 0;
  wordGameFinished = false;
  el('game-menu').hidden = true;
  el('game-intro').hidden = true;
  el('syllable-game').hidden = true;
  el('word-game').hidden = false;
  el('word-feedback').textContent = 'Tienes diez notas para adivinar.';
  if (wordDeck.length === 0) {
    wordDeck = [...wordPool];
    for (let i = wordDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordDeck[i], wordDeck[j]] = [wordDeck[j], wordDeck[i]];
    }
  }
  const selected = wordDeck.pop();
  mysteryWord = selected.word;
  mysteryHint = selected.hint;
  el('lokum-comment').textContent = '¡Cada nota te da una oportunidad!';
  renderWordGame();
}

function normalizeLetter(letter) {
  const upper = letter.toLocaleUpperCase('es');
  return ({ Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ü: 'U' })[upper] || upper;
}

el('start-word-game').addEventListener('click', () => showGameIntro('word'));
el('start-game-activity').addEventListener('click', () => {
  el('game-intro').hidden = true;
  if (activeGame === 'syllable') {
    challengeIndex = 0;
    el('syllable-game').hidden = false;
    el('word-game').hidden = true;
    el('lokum-comment').textContent = '¡Vamos! Yo te acompaño.';
    renderChallenge();
  } else if (activeGame === 'word') startWordGame();
  else if (activeGame === 'secret') {
    el('secret-game').hidden = false;
    gamesPage.classList.add('secret-active');
    el('secret-game-frame').src = 'palabras-secretas/?embedded=1&v=20261023-3';
  }
});
el('retry-word-game').addEventListener('click', startWordGame);
el('say-hidden-word').addEventListener('click', () => {
  if (!speechSupported) {
    el('word-feedback').textContent = 'La voz no está disponible en este dispositivo.';
    return;
  }
  window.speechSynthesis.cancel();
  const { voice } = chooseSpanishVoice();
  const spoken = new SpeechSynthesisUtterance(mysteryWord);
  spoken.lang = 'es-ES';
  spoken.rate = 0.8;
  if (voice) spoken.voice = voice;
  window.speechSynthesis.speak(spoken);
});

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
  const wasCover = current === 0 && !songPageOpen && !gamePageOpen;
  if (songPageOpen) showSongs(false);
  if (gamePageOpen) showGames(false);
  current = wasCover ? Math.min(1, scenes.length - 1) : 0;
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
fetch('book-content.json', { cache: 'no-cache' })
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

if(location.hash === '#juegos') showGames(true);

function closeSecretGame() {
  const frame = el('secret-game-frame');
  if (frame.getAttribute('src') !== 'about:blank') frame.src = 'about:blank';
  el('secret-game').hidden = true;
  gamesPage.classList.remove('secret-active');
}
el('start-secret-game').addEventListener('click', () => showGameIntro('secret'));

if (location.hash === '#palabras-secretas') { showGames(true); showGameIntro('secret'); }
