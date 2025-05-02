// 🎧 Sound effect elements
const sendSound = new Audio('sounds/send_bloop.mp3');
sendSound.volume = 0.080;

const sizzleSound = new Audio('sounds/spicy_sizzle.mp3');
sizzleSound.volume = 0.080;

const hoverSound = new Audio('sounds/button_hover.mp3');
hoverSound.volume = 0.080;

const secretSound = new Audio('sounds/admin_secret.mp3');
secretSound.volume = 0.4;

// ✅ PLAY SOUND HELPERS
function playSound(sound) {
  const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
  if (soundEnabled && sound && sound.play) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// 📨 Send Button Click
const sendBtn = document.querySelector('#send-btn');
sendBtn?.addEventListener('click', () => {
  playSound(sendSound);
});

// 🌶️ Spiciness Meter Change
let previousSpice = null;
const spiceSlider = document.querySelector('#spice-slider');
if (spiceSlider) {
  spiceSlider.addEventListener('input', () => {
    const currentSpice = spiceSlider.value;
    if (currentSpice !== previousSpice) {
      playSound(sizzleSound);
      previousSpice = currentSpice;
    }
  });
}

// ✨ Hover Over Any Button (except send button)
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  if (button.id !== 'send-btn') {
    button.addEventListener('mouseenter', () => playSound(hoverSound));
  }
});

// ⚙️ Admin Gear Tap Counter Logic (sound only)
let gearTapCount = 0;
const gearForSound = document.querySelector('#invisible-gear');
gearForSound?.addEventListener('click', () => {
  gearTapCount++;
  if (gearTapCount === 5) {
    playSound(secretSound);
    gearTapCount = 0;
  }
});
