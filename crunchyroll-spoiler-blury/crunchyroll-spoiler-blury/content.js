(() => {
  'use strict';

  const WATCH_SEL = 'a[href*="/watch/"]';

  let enabled = true;
  let scheduled = false;

  function seriesId() {
    const m = location.pathname.match(/\/series\/([^/]+)/);
    return m ? m[1] : null;
  }

  function findThumb(anchor) {
    let best = null, bestW = 0;
    for (const img of anchor.querySelectorAll('img')) {
      const w = img.getBoundingClientRect().width;
      if (w > 0 && w < 80) continue; // avatares / iconos
      if (w >= bestW) { best = img; bestW = w; }
    }
    return best;
  }

  function scan() {
    scheduled = false;
    document.documentElement.dataset.ssOn = enabled ? '1' : '0';

    const sid = seriesId();
    if (!sid) return;

    for (const el of document.querySelectorAll(WATCH_SEL)) {
      const img = findThumb(el);
      if (!img) continue;
      const box = (img.closest('picture') || img).parentElement;
      if (!box) continue;
      img.classList.add('cr-ss-thumb');
      box.classList.add('cr-ss-box');
      if (getComputedStyle(box).position === 'static') box.classList.add('cr-ss-rel');
      box.dataset.ssHidden = '1';
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(scan, 150);
  }

  const observer = new MutationObserver((muts) => {
    // Ignorar cambios provocados por nuestros propios elementos
    for (const m of muts) {
      const t = m.target;
      if (t.nodeType === 1 && (t.classList.contains('cr-ss-box'))) continue;
      schedule();
      return;
    }
  });

  chrome.storage.local.get('enabled', (res) => {
    enabled = res.enabled !== false;
    scan();
    observer.observe(document.body, { childList: true, subtree: true });
  });

  chrome.storage.onChanged.addListener((ch, area) => {
    if (area !== 'local') return;
    if (ch.enabled) { enabled = ch.enabled.newValue !== false; schedule(); }
  });

  // Navegación interna (SPA) y scroll con carga perezosa
  window.addEventListener('popstate', schedule);
  window.addEventListener('scroll', schedule, { passive: true });
  let lastUrl = location.href;
  setInterval(() => { if (location.href !== lastUrl) { lastUrl = location.href; schedule(); } }, 500);
})();
