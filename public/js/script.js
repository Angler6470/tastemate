// script.js — Pepper glow increases per level (5 = hottest on right)

document.addEventListener('DOMContentLoaded', () => {
  const chatDisplay = document.getElementById('chat-display');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const hotkeys = document.querySelectorAll('.hotkey');
  const spicinessSlider = document.getElementById('spiciness-slider');
  const pepperDisplay = document.getElementById('pepper-display');
  const carousel = document.getElementById('promo-carousel');

  function addMessage(text, type = 'bot') {
    if (!chatDisplay) return;
    const div = document.createElement('div');
    div.className = type === 'bot' ? 'bot-message' : 'user-message';
    div.textContent = text;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
  }

  function updateSpiceIcons(level) {
    let output = '';
    for (let i = 0; i < 5; i++) {
      const reverseIndex = 4 - i;
      const active = i < level;
      output += `<span class="pepper ${active ? 'glow' : ''}" style="${active ? 'animation: none' : ''}">🌶️</span>`;
    }
    pepperDisplay.innerHTML = output;

    const peppers = pepperDisplay.querySelectorAll('.pepper.glow');
    peppers.forEach((pepper) => {
      pepper.style.animation = 'none';
      void pepper.offsetWidth;
      pepper.style.animation = 'pepperWiggle 0.4s ease';
    });

    if (level === 5) {
      spicinessSlider.classList.add('burnt');
    } else {
      spicinessSlider.classList.remove('burnt');
    }
  }

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

  hotkeys?.forEach(btn => {
    btn.addEventListener('click', () => {
      const flavor = btn.textContent.trim();
      addMessage(flavor, 'user');
      sendToTasteBot(flavor);
    });
  });

  if (spicinessSlider) {
    spicinessSlider.addEventListener('input', () => {
      updateSpiceIcons(Number(spicinessSlider.value));
    });
    updateSpiceIcons(Number(spicinessSlider.value));
  }

  // Promo Carousel Logic
  let currentSlide = 0;
  const slides = document.querySelectorAll('.promo-slide-wrapper');

  function showSlide(index) {
    if (carousel) {
      carousel.style.transform = `translateX(-${index * 100}%)`;
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  setInterval(nextSlide, 4000);

  let touchStartX = 0;
  carousel?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });

  carousel?.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchEndX < touchStartX - 50) {
      nextSlide();
    } else if (touchEndX > touchStartX + 50) {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }
  });
});
