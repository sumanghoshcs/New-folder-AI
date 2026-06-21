let mode = 'countdown';
let totalSeconds = 0;
let remainingSeconds = 0;
let isRunning = false;
let interval = null;

const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const presetBtns = document.querySelectorAll('.preset-btn');
const setBtn = document.getElementById('setBtn');
const customMinutes = document.getElementById('customMinutes');
const customSeconds = document.getElementById('customSeconds');

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateDisplay() {
  display.textContent = formatTime(mode === 'countdown' ? remainingSeconds : totalSeconds);

  if (mode === 'countdown') {
    if (remainingSeconds <= 5 && remainingSeconds > 0) {
      display.className = 'display danger';
    } else if (remainingSeconds <= 15) {
      display.className = 'display warning';
    } else {
      display.className = 'display';
    }
  } else {
    display.className = 'display';
  }
}

function tick() {
  if (mode === 'countdown') {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    }
    if (remainingSeconds === 0) {
      stop();
      updateDisplay();
    }
  } else {
    totalSeconds++;
    updateDisplay();
  }
}

function start() {
  if (mode === 'countdown' && remainingSeconds === 0) return;
  if (isRunning) { stop(); return; }
  isRunning = true;
  startBtn.textContent = 'Pause';
  startBtn.classList.add('running');
  interval = setInterval(tick, 1000);
}

function stop() {
  isRunning = false;
  startBtn.textContent = 'Start';
  startBtn.classList.remove('running');
  clearInterval(interval);
  interval = null;
}

function reset() {
  stop();
  if (mode === 'countdown') {
    remainingSeconds = totalSeconds;
  } else {
    totalSeconds = 0;
  }
  updateDisplay();
}

function setCountdown(secs) {
  stop();
  mode = 'countdown';
  totalSeconds = secs;
  remainingSeconds = secs;
  updateDisplay();
  updateModeButtons();
}

function updateModeButtons() {
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
}

startBtn.addEventListener('click', start);

resetBtn.addEventListener('click', reset);

modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    stop();
    mode = btn.dataset.mode;
    if (mode === 'countdown') {
      remainingSeconds = totalSeconds;
    } else {
      totalSeconds = 0;
    }
    updateDisplay();
    updateModeButtons();
  });
});

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => setCountdown(Number(btn.dataset.seconds)));
});

setBtn.addEventListener('click', () => {
  const m = parseInt(customMinutes.value) || 0;
  const s = parseInt(customSeconds.value) || 0;
  const total = m * 60 + s;
  if (total > 0) setCountdown(total);
});

customMinutes.addEventListener('keydown', e => {
  if (e.key === 'Enter') customSeconds.focus();
});

customSeconds.addEventListener('keydown', e => {
  if (e.key === 'Enter') setBtn.click();
});
