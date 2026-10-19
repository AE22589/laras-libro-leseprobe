'use strict';
let scenes = [];
const el=id=>document.getElementById(id);
let current=0,reading=false,utterance=null,speechRun=0;
const speechSupported='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
function stopReading(){speechRun++;if(speechSupported)window.speechSynthesis.cancel();reading=false;utterance=null;el('speak-label').textContent='Escuchar';el('speak').setAttribute('aria-pressed','false');}
function render(){stopReading();const scene=scenes[current];el('cover').src=scene.image;el('cover').alt=scene.alt;el('scene-title').textContent=scene.title;el('story-text').textContent=scene.text;el('chapter').textContent=scene.chapter;el('counter').textContent=`${current+1} / ${scenes.length}`;el('previous').disabled=current===0;el('next').disabled=current===scenes.length-1;document.querySelectorAll('.dots i').forEach((dot,i)=>dot.classList.toggle('active',i===current));el('audio-status').textContent=speechSupported?'Pulsa Escuchar para oír el texto.':'Este navegador no permite leer en voz alta.';}
function move(delta){const target=current+delta;if(target<0||target>=scenes.length)return;current=target;render();}
el('previous').addEventListener('click',()=>move(-1));el('next').addEventListener('click',()=>move(1));
el('home').addEventListener('click',event=>{event.preventDefault();current=0;render();});
el('size').addEventListener('click',()=>{const large=document.querySelector('.reader').classList.toggle('large');el('size').setAttribute('aria-pressed',String(large));el('size').setAttribute('aria-label',large?'Usar el tamaño normal del texto':'Aumentar el tamaño del texto');});
el('speak').addEventListener('click',()=>{if(!speechSupported)return;if(reading){stopReading();el('audio-status').textContent='Lectura detenida.';return;}stopReading();const run=speechRun;const voices=window.speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.toLowerCase().startsWith('es-es'))||voices.find(v=>v.lang.toLowerCase().startsWith('es'));if(voices.length&&!voice){el('audio-status').textContent='Activa una voz en español en tu dispositivo.';return;}utterance=new SpeechSynthesisUtterance(`${scenes[current].title}. ${scenes[current].text}`);utterance.lang='es-ES';utterance.rate=.85;if(voice)utterance.voice=voice;utterance.onend=()=>{if(run!==speechRun)return;stopReading();el('audio-status').textContent='Puedes volver a escucharlo.';};utterance.onerror=()=>{if(run!==speechRun)return;stopReading();el('audio-status').textContent='No se pudo iniciar la lectura. Inténtalo de nuevo.';};reading=true;el('speak-label').textContent='Detener';el('speak').setAttribute('aria-pressed','true');el('audio-status').textContent='Leyendo en voz alta…';window.speechSynthesis.speak(utterance);});
window.addEventListener('pagehide',stopReading);document.addEventListener('visibilitychange',()=>{if(document.hidden){stopReading();el('audio-status').textContent='Lectura detenida. Pulsa Escuchar para continuar.';}});
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='ArrowRight'){event.preventDefault();move(1);}if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}});
if(!speechSupported)el('speak').disabled=true;fetch('book-content.json?v=20261019-3').then(response=>{if(!response.ok)throw new Error('No se pudo cargar el contenido.');return response.json();}).then(data=>{scenes=data.views;render();}).catch(()=>{el('audio-status').textContent='No se pudo cargar esta vista previa. Inténtalo de nuevo.';});




