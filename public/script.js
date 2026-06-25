const chat = document.getElementById('chat');
const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const travelBtn = document.getElementById('travelBtn');
const staycationBtn = document.getElementById('staycationBtn');
const startBtn = document.getElementById('startBtn');
const hintBtn = document.getElementById('hintBtn');
const micBtn = document.getElementById('micBtn');
const stopVoiceBtn = document.getElementById('stopVoiceBtn');
const voiceStatus = document.getElementById('voiceStatus');
const speakReplies = document.getElementById('speakReplies');

let scenario = 'travel';
let messages = [];
let recognition = null;
let isListening = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function addMessage(role, content) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = content;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function speak(text) {
  function speak(text) {
  alert("Speak function called");

  if (!speakReplies.checked || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
}

function setStatus(text) {
  voiceStatus.textContent = text;
}

function setScenario(next) {
  scenario = next;
  messages = [];
  chat.innerHTML = '';
  travelBtn.classList.toggle('active', scenario === 'travel');
  staycationBtn.classList.toggle('active', scenario === 'staycation');
  const msg = scenario === 'travel'
    ? 'Scenario 1 selected. Click Start / Restart.'
    : 'Scenario 2 selected. Click Start / Restart.';
  addMessage('assistant', msg);
  speak(msg);
}

async function sendMessage(content) {
  messages.push({ role: 'user', content });
  addMessage('user', content);

  const loading = document.createElement('div');
  loading.className = 'message assistant loading';
  loading.textContent = 'Daisy is thinking...';
  chat.appendChild(loading);
  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, messages })
    });

    const data = await res.json();
    loading.remove();

    if (!res.ok) throw new Error(data.error || 'Server error');

    messages.push({ role: 'assistant', content: data.reply });
    addMessage('assistant', data.reply);
    speak(data.reply);
  } catch (err) {
    loading.remove();
    const msg = 'Sorry, something went wrong. Please ask your teacher.';
    addMessage('assistant', msg);
    speak(msg);
    console.error(err);
  }
}

function setupRecognition() {
  if (!SpeechRecognition) {
    micBtn.disabled = true;
    setStatus('Speech recognition is not supported on this browser. Try Chrome on Android, or type your answer.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('listening');
    micBtn.textContent = '🔴 Listening...';
    setStatus('Listening... Speak in English.');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    input.value = transcript;
  };

  recognition.onerror = (event) => {
    setStatus(`Mic error: ${event.error}. You can type your answer instead.`);
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('listening');
    micBtn.textContent = '🎤 Speak';
    const text = input.value.trim();
    if (text) {
      input.value = '';
      sendMessage(text);
    } else {
      setStatus('No speech detected. Tap 🎤 Speak and try again.');
    }
  };
}

micBtn.addEventListener('click', () => {
  window.speechSynthesis?.cancel();
  if (!recognition) return;
  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

stopVoiceBtn.addEventListener('click', () => {
  window.speechSynthesis?.cancel();
  if (recognition && isListening) recognition.stop();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  sendMessage(text);
});

travelBtn.addEventListener('click', () => setScenario('travel'));
staycationBtn.addEventListener('click', () => setScenario('staycation'));

startBtn.addEventListener('click', () => {
  messages = [];
  chat.innerHTML = '';
  const startText = scenario === 'travel'
    ? 'Start Scenario 1. Please greet me first.'
    : 'Start Scenario 2. Please greet me first.';
  sendMessage(startText);
});

hintBtn.addEventListener('click', () => {
  sendMessage('I need a hint.');
});

setupRecognition();
setScenario('travel');
