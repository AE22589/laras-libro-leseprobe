'use strict';
const scenes = [
  {title:'Hallo, du!',chapter:'Mit Lokum starten',text:'Hier kannst du jedes Bild in Ruhe anschauen. Möchtest du dir den Text vorlesen lassen?'},
  {title:'Ein Bild nach dem anderen.',chapter:'In deinem Tempo',text:'Mit dem Pfeil geht es weiter. Du kannst jederzeit zurückgehen. Mit dem Schriftknopf wird der Text noch größer.'},
  {title:'Zusammen macht es Spaß.',chapter:'Bis zum nächsten Abenteuer',text:'Du bist am Ende der kleinen Leseprobe. Mit dem Pfeil zurück kannst du alles noch einmal anschauen.'}
];
const el = id => document.getElementById(id);
let current=0, reading=false, utterance=null, speechRun=0;
const speechSupported='speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
function stopReading(){speechRun++;if(speechSupported)window.speechSynthesis.cancel();reading=false;utterance=null;el('speak-label').textContent='Vorlesen';el('speak').setAttribute('aria-pressed','false');}
function render(){stopReading();const scene=scenes[current];el('scene-title').textContent=scene.title;el('story-text').textContent=scene.text;el('chapter').textContent=scene.chapter;el('counter').textContent=`${current+1} / ${scenes.length}`;el('previous').disabled=current===0;el('next').disabled=current===scenes.length-1;document.querySelectorAll('.dots i').forEach((dot,i)=>dot.classList.toggle('active',i===current));el('audio-status').textContent=speechSupported?'Vorlesen startet erst, wenn du den Knopf drückst.':'Dieser Browser bietet keine Vorlesefunktion. Du kannst den Text weiterhin lesen.';}
function move(delta){const target=current+delta;if(target<0||target>=scenes.length)return;current=target;render();}
el('previous').addEventListener('click',()=>move(-1));
el('next').addEventListener('click',()=>move(1));
el('home').addEventListener('click',event=>{event.preventDefault();current=0;render();});
el('size').addEventListener('click',()=>{const large=document.querySelector('.reader').classList.toggle('large');el('size').setAttribute('aria-pressed',String(large));el('size').setAttribute('aria-label',large?'Normale Schrift einschalten':'Größere Schrift einschalten');});
el('speak').addEventListener('click',()=>{if(!speechSupported)return;if(reading){stopReading();el('audio-status').textContent='Vorlesen gestoppt.';return;}stopReading();const run=speechRun;utterance=new SpeechSynthesisUtterance(`${scenes[current].title} ${scenes[current].text}`);utterance.lang='de-DE';utterance.rate=.88;const voice=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('de'));if(voice)utterance.voice=voice;utterance.onend=()=>{if(run!==speechRun)return;stopReading();el('audio-status').textContent='Fertig vorgelesen. Du kannst noch einmal hören.';};utterance.onerror=()=>{if(run!==speechRun)return;stopReading();el('audio-status').textContent='Vorlesen ist gerade nicht verfügbar. Bitte versuche es erneut.';};reading=true;el('speak-label').textContent='Stoppen';el('speak').setAttribute('aria-pressed','true');el('audio-status').textContent='Der Text wird vorgelesen …';window.speechSynthesis.speak(utterance);});
window.addEventListener('pagehide',stopReading);
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopReading();el('audio-status').textContent='Vorlesen pausiert. Zum Fortsetzen erneut auf Vorlesen tippen.';}});
document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='ArrowRight')move(1);if(event.key==='ArrowLeft')move(-1);});
if(!speechSupported)el('speak').disabled=true;
render();
