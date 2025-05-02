// script.js — Pepper glow increases per level (5 = hottest on right)

// Get the stored language preference or default to English
let currentLanguage = localStorage.getItem('language') || 'en';
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // default ON

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  document.getElementById('sound-toggle').textContent = soundEnabled ? '🔊' : '🔇';
}

// Set icon when page loads
window.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('sound-toggle');
  if (toggleBtn) {
    toggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  }
});

// Define translations for supported UI elements in English and Spanish
const translations = {
  en: {
    flavorShortcuts: 'Flavor Shortcuts',
    howSpicy: 'How Spicy?',
    sendPlaceholder: "Tell me what you're craving...",
    botGreeting: "👋 Hello! I'm TasteMate — your Flavor Companion! Tell me what you're craving.",
    hotkeys: ['Sweet', 'Savory', 'Spicy', 'Tangy', 'Creamy']
  },
  es: {
    flavorShortcuts: 'Atajos de Sabor',
    howSpicy: '¿Qué tan picante?',
    sendPlaceholder: 'Dime qué se te antoja...',
    botGreeting: "👋 ¡Hola! Soy TasteMate — tu Compañero de Sabor. Dime qué se te antoja.",
    hotkeys: ['Dulce', 'Salado', 'Picante', 'Ácido', 'Cremoso']
  }
};

// Load tick sound for spiciness changes and hotkey interactions
const tickSound = new Audio('sounds/button_hover.mp3');
tickSound.volume = 0.08;

// Apply translations to visible elements based on selected language
function applyTranslations() {
  const t = translations[currentLanguage];
  document.querySelector('.shortcuts .label').innerText = t.flavorShortcuts;
  document.querySelector('label[for="spiciness-slider"]').innerText = t.howSpicy;
  document.querySelector('#chat-input').placeholder = t.sendPlaceholder;

  // Update hotkey button text
  const hotkeyButtons = document.querySelectorAll('.hotkey');
  hotkeyButtons.forEach((btn, index) => {
    if (t.hotkeys[index]) btn.innerText = t.hotkeys[index];
  });

  // Update greeting message
  const chatDisplay = document.getElementById('chat-display');
  if (chatDisplay) {
    const firstMessage = chatDisplay.querySelector('.message.bot');
    if (firstMessage) {
      firstMessage.textContent = t.botGreeting;
    }
  }
}

// Set the language and persist it in localStorage
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  applyTranslations();
}

document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM references
  const chatDisplay = document.getElementById('chat-display');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const hotkeys = document.querySelectorAll('.hotkey');
  const spicinessSlider = document.getElementById('spiciness-slider');
  const pepperDisplay = document.getElementById('pepper-display');
  const carousel = document.getElementById('promo-carousel');

  // Apply translations on page load
  applyTranslations();

  // Append a message to the chat area
  function addMessage(text, type = 'bot') {
    if (!chatDisplay) return;
    const div = document.createElement('div');
    div.className = type === 'bot' ? 'bot-message' : 'user-message';
    div.textContent = text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  // Update pepper icons based on spice level
  function updateSpiceIcons(level) {
    let output = '';
    for (let i = 0; i < 5; i++) {
      const active = i < level;
      output += `<span class="pepper ${active ? 'glow' : ''}" style="${active ? 'animation: none' : ''}">🌶️</span>`;
    }
    pepperDisplay.innerHTML = output;

    // Restart animation to show pepper wiggle
    const peppers = pepperDisplay.querySelectorAll('.pepper.glow');
    peppers.forEach((pepper) => {
      pepper.style.animation = 'none';
      void pepper.offsetWidth; // Force reflow
      pepper.style.animation = 'pepperWiggle 0.4s ease';
    });

    // Apply burn animation if level is maxed out
    if (level === 5) {
      spicinessSlider.classList.add('burnt');
    } else {
      spicinessSlider.classList.remove('burnt');
    }

    // Play tick sound on slider interaction (safely)
    tickSound.currentTime = 0;
    tickSound.play().catch(() => {});
  }

  // Send user input to the backend API and display the bot response
  async function sendToTasteBot(message) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          spiciness: Number(spicinessSlider?.value || 1)
        }),
      });

      const data = await response.json();
      addMessage(data?.reply || "Hmm... I didn't catch that. Try again?", 'bot');
    } catch (err) {
      console.error('Error talking to GPT backend:', err);
      addMessage("⚠️ TasteBot had a hiccup. Try again soon!", 'bot');
    }
  }

  // Handle sending message on button click or pressing Enter
  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => {
      const msg = chatInput.value.trim();
      if (!msg) return;
      addMessage(msg, 'user');
      chatInput.value = '';
      sendToTasteBot(msg);
    });

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendBtn.click();
    });
  }

  // Hotkey button click listeners (with tick sound)
  hotkeys?.forEach(btn => {
    btn.addEventListener('click', () => {
      const flavor = btn.textContent.trim();
      addMessage(flavor, 'user');
      sendToTasteBot(flavor);
      tickSound.currentTime = 0;
      tickSound.play().catch(() => {});
    });
  });

  // Update peppers when slider changes
  if (spicinessSlider) {
    spicinessSlider.addEventListener('input', () => {
      updateSpiceIcons(Number(spicinessSlider.value));
    });
    updateSpiceIcons(Number(spicinessSlider.value)); // Initialize on load
  }

  // --- Promo Carousel Logic ---
  let currentSlide = 0;
  const slides = document.querySelectorAll('.promo-slide-wrapper');

  // Move carousel to the specified slide
  function showSlide(index) {
    if (carousel) {
      carousel.style.transform = `translateX(-${index * 100}%)`;
    }
  }

  // Automatically cycle to the next slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  setInterval(nextSlide, 4000); // Slide every 4 seconds

  // Touch swipe support for carousel
  let touchStartX = 0;

  carousel?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });

  carousel?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 50) {
      nextSlide(); // Swipe left
    } else if (touchEndX > touchStartX + 50) {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide); // Swipe right
    }
  });
});
// script.js — Pepper glow increases per level (5 = hottest on right)

// Get the stored language preference or default to English
let currentLanguage = localStorage.getItem('language') || 'en';

// Define translations for supported UI elements in English and Spanish
const translations = {
  en: {
    flavorShortcuts: 'Flavor Shortcuts',
    howSpicy: 'How Spicy?',
    sendPlaceholder: "Tell me what you're craving...",
    botGreeting: "👋 Hello! I'm TasteMate — your Flavor Companion! Tell me what you're craving.",
    hotkeys: ['Sweet', 'Savory', 'Spicy', 'Tangy', 'Creamy']
  },
  es: {
    flavorShortcuts: 'Atajos de Sabor',
    howSpicy: '¿Qué tan picante?',
    sendPlaceholder: 'Dime qué se te antoja...',
    botGreeting: "👋 ¡Hola! Soy TasteMate — tu Compañero de Sabor. Dime qué se te antoja.",
    hotkeys: ['Dulce', 'Salado', 'Picante', 'Ácido', 'Cremoso']
  }
};

// Load tick sound for spiciness changes and hotkey interactions
const tickSound = new Audio('sounds/button_hover.mp3');
tickSound.volume = 0.2;

// Apply translations to visible elements based on selected language
function applyTranslations() {
  const t = translations[currentLanguage];
  document.querySelector('.shortcuts .label').innerText = t.flavorShortcuts;
  document.querySelector('label[for="spiciness-slider"]').innerText = t.howSpicy;
  document.querySelector('#chat-input').placeholder = t.sendPlaceholder;

  // Update hotkey button text
  const hotkeyButtons = document.querySelectorAll('.hotkey');
  hotkeyButtons.forEach((btn, index) => {
    if (t.hotkeys[index]) btn.innerText = t.hotkeys[index];
  });

  // Update greeting message
  const chatDisplay = document.getElementById('chat-display');
  if (chatDisplay) {
    const firstMessage = chatDisplay.querySelector('.message.bot');
    if (firstMessage) {
      firstMessage.textContent = t.botGreeting;
    }
  }
}

// Set the language and persist it in localStorage
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  applyTranslations();
}

document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM references
  const chatDisplay = document.getElementById('chat-display');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const hotkeys = document.querySelectorAll('.hotkey');
  const spicinessSlider = document.getElementById('spiciness-slider');
  const pepperDisplay = document.getElementById('pepper-display');
  const carousel = document.getElementById('promo-carousel');

  // Apply translations on page load
  applyTranslations();

  // Append a message to the chat area
  function addMessage(text, type = 'bot') {
    if (!chatDisplay) return;
    const div = document.createElement('div');
    div.className = type === 'bot' ? 'bot-message' : 'user-message';
    div.textContent = text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  // Update pepper icons based on spice level
  function updateSpiceIcons(level) {
    let output = '';
    for (let i = 0; i < 5; i++) {
      const active = i < level;
      output += `<span class="pepper ${active ? 'glow' : ''}" style="${active ? 'animation: none' : ''}">🌶️</span>`;
    }
    pepperDisplay.innerHTML = output;

    // Restart animation to show pepper wiggle
    const peppers = pepperDisplay.querySelectorAll('.pepper.glow');
    peppers.forEach((pepper) => {
      pepper.style.animation = 'none';
      void pepper.offsetWidth; // Force reflow
      pepper.style.animation = 'pepperWiggle 0.4s ease';
    });

    // Apply burn animation if level is maxed out
    if (level === 5) {
      spicinessSlider.classList.add('burnt');
    } else {
      spicinessSlider.classList.remove('burnt');
    }

    // Play tick sound on slider interaction (safely)
    tickSound.currentTime = 0;
    tickSound.play().catch(() => {});
  }

  // Send user input to the backend API and display the bot response
  async function sendToTasteBot(message) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          spiciness: Number(spicinessSlider?.value || 1)
        }),
      });

      const data = await response.json();
      addMessage(data?.reply || "Hmm... I didn't catch that. Try again?", 'bot');
    } catch (err) {
      console.error('Error talking to GPT backend:', err);
      addMessage("⚠️ TasteBot had a hiccup. Try again soon!", 'bot');
    }
  }

  // Handle sending message on button click or pressing Enter
  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => {
      const msg = chatInput.value.trim();
      if (!msg) return;
      addMessage(msg, 'user');
      chatInput.value = '';
      sendToTasteBot(msg);
    });

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendBtn.click();
    });
  }

  // Hotkey button click listeners (with tick sound)
  hotkeys?.forEach(btn => {
    btn.addEventListener('click', () => {
      const flavor = btn.textContent.trim();
      addMessage(flavor, 'user');
      sendToTasteBot(flavor);
      tickSound.currentTime = 0;
      tickSound.play().catch(() => {});
    });
  });

  // Update peppers when slider changes
  if (spicinessSlider) {
    spicinessSlider.addEventListener('input', () => {
      updateSpiceIcons(Number(spicinessSlider.value));
    });
    updateSpiceIcons(Number(spicinessSlider.value)); // Initialize on load
  }

  // --- Promo Carousel Logic ---
  let currentSlide = 0;
  const slides = document.querySelectorAll('.promo-slide-wrapper');

  // Move carousel to the specified slide
  function showSlide(index) {
    if (carousel) {
      carousel.style.transform = `translateX(-${index * 100}%)`;
    }
  }

  // Automatically cycle to the next slide
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  setInterval(nextSlide, 4000); // Slide every 4 seconds

  // Touch swipe support for carousel
  let touchStartX = 0;

  carousel?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });

  carousel?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 50) {
      nextSlide(); // Swipe left
    } else if (touchEndX > touchStartX + 50) {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide); // Swipe right
    }
  });
});
// Make toggleSound globally accessible so HTML onclick can call it
window.toggleSound = toggleSound;
