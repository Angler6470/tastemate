// admin-panel.js — Hidden gear-triggered admin panel

let tapCount = 0;
let tapTimer = null;

const invisibleGear = document.createElement('div');
invisibleGear.style.position = 'absolute';
invisibleGear.style.bottom = '8px';
invisibleGear.style.left = '8px';
invisibleGear.style.width = '30px';
invisibleGear.style.height = '30px';
invisibleGear.style.opacity = '0';
invisibleGear.style.zIndex = '1000';
document.body.appendChild(invisibleGear);

invisibleGear.addEventListener('click', () => {
  tapCount++;
  clearTimeout(tapTimer);

  if (tapCount >= 5) {
    tapCount = 0;
    showAdminPanel();
  } else {
    tapTimer = setTimeout(() => tapCount = 0, 600);
  }
});

function showAdminPanel() {
  const panel = document.createElement('div');
  panel.style.position = 'fixed';
  panel.style.top = '5%';
  panel.style.left = '5%';
  panel.style.width = '90%';
  panel.style.height = '90%';
  panel.style.background = 'white';
  panel.style.border = '2px solid #333';
  panel.style.borderRadius = '12px';
  panel.style.boxShadow = '0 0 20px rgba(0,0,0,0.2)';
  panel.style.overflow = 'auto';
  panel.style.padding = '20px';
  panel.style.zIndex = '1001';

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.float = 'right';
  close.onclick = () => panel.remove();

  panel.appendChild(close);

  const logs = JSON.parse(localStorage.getItem('tastebot-logs') || '[]');

  const messages = logs.filter(l => l.type === 'message');
  const hotkeys = logs.filter(l => l.type === 'hotkey');
  const spice = logs.filter(l => l.type === 'spice');

  const summary = document.createElement('div');
  summary.innerHTML = `
    <h2>Admin Stats (last 7 days)</h2>
    <h3>Prompts & Answers</h3>
    <p>Total: ${messages.length}</p>
    <ul>
      ${messages.map(m => `<li><b>${m.timestamp}:</b> ${m.content}</li>`).join('')}
    </ul>

    <h3>Hotkey Usage</h3>
    <p>Total: ${hotkeys.length}</p>
    <ul>
      ${countAndList(hotkeys.map(h => h.content))}
    </ul>

    <h3>Spiciness Levels</h3>
    <p>Total: ${spice.length}</p>
    <ul>
      ${countAndList(spice.map(s => s.content))}
    </ul>
  `;

  panel.appendChild(summary);
  document.body.appendChild(panel);
}

function countAndList(items) {
  const counts = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.map(([k, v]) => `<li>${k}: ${v}</li>`).join('');
}
