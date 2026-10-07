// --- DOM Elements ---
const opening = document.getElementById('opening');
const openingVideo = document.getElementById('openingVideo');
const sealButton = document.getElementById('sealButton');
const tapText = document.getElementById('tapText');
const invitation = document.getElementById('invitation');
const bgm = document.getElementById('bgm');
const floatingDecor = document.querySelector('.floating-decor');
const musicToggle = document.getElementById('musicToggle');
const musicLabel = document.getElementById('musicLabel');

// --- Audio Controller ---
let musicOn = true;

function updateMusicControl() {
  if (!musicToggle) return;
  musicToggle.classList.toggle('off', !musicOn);
  musicToggle.setAttribute('aria-pressed', String(musicOn));
  musicToggle.setAttribute('aria-label', musicOn ? 'Turn music off' : 'Turn music on');
  if (musicLabel) musicLabel.textContent = musicOn ? 'Music On' : 'Music Off';
}

musicToggle?.addEventListener('click', async () => {
  if (musicOn) {
    bgm.pause();
    musicOn = false;
  } else {
    musicOn = true;
    try { await bgm.play(); } catch (e) { musicOn = false; }
  }
  updateMusicControl();
});
updateMusicControl();

// --- Invitation Opening Flow ---
function enterInvitation() {
  opening.classList.add('hide');
  invitation.classList.add('show');
  invitation.setAttribute('aria-hidden', 'false');
  floatingDecor.classList.add('active');
  if (musicToggle) musicToggle.classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

sealButton?.addEventListener('click', () => {
  sealButton.disabled = true;
  tapText.style.opacity = '0';

  try {
    bgm.loop = true;
    bgm.currentTime = 0;
    bgm.volume = 0.55;
    if (musicOn) bgm.play().catch(() => {});
  } catch (e) {}

  openingVideo.currentTime = 0;
  try { openingVideo.play().catch(() => {}); } catch (e) {}
});

openingVideo?.addEventListener('ended', enterInvitation);

// --- Tap-to-Reveal Date Cards ---
const revealCards = document.querySelectorAll('[data-reveal]');
const burst = document.getElementById('celebrationBurst');
let burstShown = false;

function celebrateDateReveal() {
  if (burstShown || !burst) return;
  burstShown = true;
  burst.classList.add('show');

  const pieces = ['✦', '✧', '•', '❋', '✺', '▪', '✹', '✷', '✸', '❈', '✼', '✧', '○', '●', '◦', '·', '✦'];
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 180; i++) {
    const piece = document.createElement('span');
    piece.className = 'burst-piece';
    piece.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    piece.style.left = `${50 + (Math.random() * 10 - 5)}%`;
    piece.style.top = `${36 + (Math.random() * 8 - 4)}%`;
    piece.style.setProperty('--x', `${(Math.random() * 2 - 1) * 58}vw`);
    piece.style.setProperty('--y', `${32 + Math.random() * 72}vh`);
    piece.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    piece.style.setProperty('--d', `${2.2 + Math.random() * 2.8}s`);
    piece.style.setProperty('--delay', `${Math.random() * 0.75}s`);
    fragment.appendChild(piece);
  }

  burst.appendChild(fragment);

  setTimeout(() => burst.classList.remove('show'), 4300);
  setTimeout(() => { burst.innerHTML = ''; }, 4800);
}

revealCards.forEach(card => {
  card.addEventListener('click', () => {
    if (!card.classList.contains('revealed')) {
      card.classList.add('revealed');
      const allRevealed = Array.from(revealCards).every(c => c.classList.contains('revealed'));
      if (allRevealed) {
        setTimeout(celebrateDateReveal, 260);
      }
    }
  });
});

// --- Wedding Countdown Timer ---
const weddingDate = new Date('2027-04-25T10:30:00+05:30').getTime();
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minsEl = document.getElementById('mins');
const secsEl = document.getElementById('secs');

function tick() {
  const diff = Math.max(0, weddingDate - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
  if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
  if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
  if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
}
tick();
setInterval(tick, 1000);

// --- Story Carousel ---
const track = document.getElementById('storyTrack');
const frame = document.querySelector('.story-frame');
const storyCount = document.getElementById('storyCount');
const prevBtn = document.getElementById('storyPrev');
const nextBtn = document.getElementById('storyNext');

if (track && frame && storyCount && prevBtn && nextBtn) {
  const totalStories = track.querySelectorAll('img').length;
  let storyIndex = 0, startX = 0, deltaX = 0, dragging = false;

  function updateStory() {
    track.style.transform = `translateX(-${storyIndex * 100}%)`;
    storyCount.textContent = `${String(storyIndex + 1).padStart(2, '0')} / ${String(totalStories).padStart(2, '0')}`;
    prevBtn.disabled = storyIndex === 0;
    nextBtn.disabled = storyIndex === totalStories - 1;
    prevBtn.style.opacity = storyIndex === 0 ? '.45' : '1';
    nextBtn.style.opacity = storyIndex === totalStories - 1 ? '.45' : '1';
  }

  function goStory(step) {
    storyIndex = Math.max(0, Math.min(totalStories - 1, storyIndex + step));
    updateStory();
  }

  prevBtn.addEventListener('click', () => goStory(-1));
  nextBtn.addEventListener('click', () => goStory(1));

  frame.addEventListener('pointerdown', e => {
    dragging = true;
    startX = e.clientX;
    deltaX = 0;
    frame.setPointerCapture(e.pointerId);
  });

  frame.addEventListener('pointermove', e => {
    if (dragging) deltaX = e.clientX - startX;
  });

  const finishDrag = e => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(deltaX) > 45) goStory(deltaX < 0 ? 1 : -1);
    try { frame.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  frame.addEventListener('pointerup', finishDrag);
  frame.addEventListener('pointercancel', finishDrag);

  updateStory();
}

// --- Scroll Reveal Animations ---
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
