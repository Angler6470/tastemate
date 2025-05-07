// script.js — Clickable Peppers with Tiered Glow Effect

let currentLanguage = localStorage.getItem('language') || 'en';
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  const toggleBtn = document.getElementById('sound-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('sound-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  }

  document.querySelectorAll('.pepper').forEach(p => {
    p.addEventListener('click', () => {
      const level = parseInt(p.dataset.level);
      const slider = document.getElementById('spiciness-slider');
      slider.value = level;
      slider.dispatchEvent(new Event('input'));
    });
  });
});

const tickSound = new Audio('sounds/button_hover.mp3');
tickSound.volume = 0.08;

const translations = {
  en: {
    flavorShortcuts: 'Flavor Shortcuts',
    howSpicy: 'How Spicy?',
    sendPlaceholder: "Tell me what you're craving...",
    botGreeting: "👋 Hello! I'm TasteMate — your Flavor Companion! Tell me what you're craving.",
    hotkeys: ['Sweet', 'Savory', 'Spicy', 'Tangy', 'Creamy', 'Smoky', 'Fresh', 'Vegetarian', 'Cheesy', 'Crunchy']
  },
  es: {
    flavorShortcuts: 'Atajos de Sabor',
    howSpicy: '¿Qué tan picante?',
    sendPlaceholder: 'Dime qué se te antoja...',
    botGreeting: "👋 ¡Hola! Soy TasteMate — tu Compañero de Sabor. Dime qué se te antoja.",
    hotkeys: ['Dulce', 'Salado', 'Picante', 'Ácido', 'Cremoso', 'Ahumado', 'Fresco', 'Vegetariano', 'Con Queso', 'Crujiente']
  }
};

function applyTranslations() {
  const t = translations[currentLanguage];
  document.querySelector('.shortcuts .label').innerText = t.flavorShortcuts;
  document.querySelector('label[for="spiciness-slider"]').innerText = t.howSpicy;
  document.querySelector('#chat-input').placeholder = t.sendPlaceholder;
  document.querySelectorAll('.hotkey').forEach((btn, i) => {
    if (t.hotkeys[i]) btn.innerText = t.hotkeys[i];
  });
  const greeting = document.querySelector('.chat-area .message.bot');
  if (greeting) greeting.innerText = t.botGreeting;
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  applyTranslations();
}

document.addEventListener('DOMContentLoaded', () => {
  const chatDisplay = document.getElementById('chat-display');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const hotkeys = document.querySelectorAll('.hotkey');
  const spicinessSlider = document.getElementById('spiciness-slider');
  const pepperDisplay = document.getElementById('pepper-display');
  const carousel = document.getElementById('promo-carousel');

  applyTranslations();

  function addMessage(text, type = 'bot') {
    const div = document.createElement('div');
    div.className = type === 'bot' ? 'bot-message' : 'user-message';
    div.textContent = text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  function updateSpiceIcons(level) {
    const peppers = pepperDisplay.querySelectorAll('.pepper');
    peppers.forEach((p, i) => {
      p.classList.remove('glow1', 'glow2', 'glow3', 'glow4', 'glow5');
      if (i === 0) return; // ❄️ stays plain
      if (i <= level) p.classList.add(`glow${i}`);
    });

    spicinessSlider.classList.toggle('burnt', level === 5);

    if (soundEnabled) {
      tickSound.currentTime = 0;
      tickSound.play().catch(() => {});
    }
  }

  async function sendToTasteBot(message) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, spiciness: Number(spicinessSlider?.value || 1) }),
      });
      const data = await res.json();
      addMessage(data?.reply || "Hmm... I didn't catch that. Try again?", 'bot');
    } catch (err) {
      addMessage("⚠️ TasteBot had a hiccup. Try again soon!", 'bot');
    }
  }

  sendBtn?.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    addMessage(msg, 'user');
    chatInput.value = '';
    sendToTasteBot(msg);
  });

  chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendBtn.click();
  });

  hotkeys?.forEach(btn => {
    btn.addEventListener('click', () => {
      const flavor = btn.textContent.trim();
      addMessage(flavor, 'user');
      sendToTasteBot(flavor);
      if (soundEnabled) {
        tickSound.currentTime = 0;
        tickSound.play().catch(() => {});
      }
    });
  });

  spicinessSlider?.addEventListener('input', () => {
    updateSpiceIcons(Number(spicinessSlider.value));
  });

  updateSpiceIcons(Number(spicinessSlider?.value || 0));

  let currentSlide = 0;
  const slides = document.querySelectorAll('.promo-slide-wrapper');
  function showSlide(index) {
    carousel.style.transform = `translateX(-${index * 100}%)`;
  }
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 4000);

  let touchStartX = 0;
  carousel?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });
  carousel?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 50) {
      currentSlide = (currentSlide + 1) % slides.length;
    } else if (touchEndX > touchStartX + 50) {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    }
    showSlide(currentSlide);
  });
});

window.toggleSound = toggleSound;
window.setLanguage = setLanguage;
