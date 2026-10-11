const toggle = document.getElementById('toggle');
const status = document.getElementById('status');

function render(on) {
  toggle.checked = on;
  status.textContent = on ? 'Protection enabled' : 'Protection disabled';
}

chrome.storage.local.get('enabled', (res) => render(res.enabled !== false));

toggle.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  render(toggle.checked);
});
