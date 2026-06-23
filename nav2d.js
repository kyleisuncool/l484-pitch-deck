// nav2d.js — 2D grid navigation for deck-stage
//
// Slide authoring: add data-row and data-col to each <section>.
//   data-row = which main slide (0-indexed)
//   data-col = 0 for main presentation, 1 for leave-behind
//
// Navigation:
//   Up / Down / Space / PgUp / PgDn  →  move rows, always land on col 0
//   Right                             →  open leave-behind (col 1) if available
//   Left                              →  return to main (col 0)
//   Home / R                          →  go to row 0, col 0
//   End                               →  go to last row, col 0
//   1–9, 0                            →  jump to that row, col 0

(function () {
  'use strict';

  const HASH_RE = /^#(\d+)(?:-(\d+))?$/;

  // SVG chevrons — 20×20, stroke-only, matching present.l484.com style
  const SVG = {
    up:    '<polyline points="18 15 12 9 6 15"></polyline>',
    down:  '<polyline points="6 9 12 15 18 9"></polyline>',
    left:  '<polyline points="15 18 9 12 15 6"></polyline>',
    right: '<polyline points="9 18 15 12 9 6"></polyline>',
  };

  function chevron(dir) {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVG[dir]}</svg>`;
  }

  function init() {
    const stage = document.querySelector('deck-stage');
    if (!stage) return;

    function buildGrid() {
      const slides = Array.from(stage.children).filter(el => {
        const t = el.tagName;
        return t !== 'TEMPLATE' && t !== 'SCRIPT' && t !== 'STYLE';
      });
      const rowMap = new Map();
      slides.forEach((slide, i) => {
        const row = parseInt(slide.getAttribute('data-row') ?? String(i), 10);
        const col = parseInt(slide.getAttribute('data-col') ?? '0', 10);
        if (!rowMap.has(row)) rowMap.set(row, new Map());
        rowMap.get(row).set(col, { slide, linearIdx: i });
      });
      const grid = [];
      Array.from(rowMap.keys()).sort((a, b) => a - b).forEach(r => {
        const colMap = rowMap.get(r);
        const cols = Array.from(colMap.keys()).sort((a, b) => a - b);
        grid.push(cols.map(c => colMap.get(c)));
      });
      return grid;
    }

    const grid = buildGrid();
    let row = 0;
    let col = 0;

    // ── Nav button panel ────────────────────────────────────────────────
    // Mirrors present.l484.com: fixed bottom-right, flex-col, glass buttons
    const panel = document.createElement('div');
    panel.id = 'nav2d-panel';
    panel.style.cssText = [
      'position:fixed',
      'bottom:32px',
      'right:32px',
      'display:flex',
      'flex-direction:column',
      'gap:12px',
      'z-index:2147482000',
      'isolation:isolate',
    ].join(';');

    const BTN_BASE = [
      'width:48px',
      'height:48px',
      'border-radius:12px',
      'background:rgba(255,255,255,0.10)',
      'backdrop-filter:blur(20px)',
      '-webkit-backdrop-filter:blur(20px)',
      'border:1px solid rgba(255,255,255,0.20)',
      'color:#fff',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'cursor:pointer',
      'transition:background 0.3s,border-color 0.3s,transform 0.2s,box-shadow 0.3s,opacity 0.3s',
      'box-shadow:0 4px 12px rgba(0,0,0,0.20)',
      'padding:0',
      'outline:none',
    ].join(';');

    function makeBtn(dir, label) {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', label);
      btn.style.cssText = BTN_BASE;
      btn.innerHTML = chevron(dir);

      btn.addEventListener('mouseenter', () => {
        if (!btn.disabled) {
          btn.style.background = 'rgba(255,255,255,0.20)';
          btn.style.borderColor = 'rgba(255,255,255,0.40)';
          btn.style.transform = 'scale(1.05)';
          btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
        }
      });
      btn.addEventListener('mouseleave', () => {
        if (!btn.disabled) {
          btn.style.background = btn._baseBg || 'rgba(255,255,255,0.10)';
          btn.style.borderColor = btn._baseBorder || 'rgba(255,255,255,0.20)';
          btn.style.transform = '';
          btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.20)';
        }
      });
      btn.addEventListener('mousedown', () => { if (!btn.disabled) btn.style.transform = 'scale(0.95)'; });
      btn.addEventListener('mouseup',   () => { if (!btn.disabled) btn.style.transform = 'scale(1.05)'; });
      return btn;
    }

    const btnUp    = makeBtn('up',    'Previous slide');
    const btnRight = makeBtn('right', 'Open leave-behind');
    const btnLeft  = makeBtn('left',  'Back to main');
    const btnDown  = makeBtn('down',  'Next slide');

    btnUp.addEventListener('click',    () => goTo(row - 1, 0));
    btnRight.addEventListener('click', () => goTo(row, col + 1));
    btnLeft.addEventListener('click',  () => goTo(row, col - 1));
    btnDown.addEventListener('click',  () => goTo(row + 1, 0));

    panel.appendChild(btnUp);
    panel.appendChild(btnRight);
    panel.appendChild(btnLeft);
    panel.appendChild(btnDown);
    document.body.appendChild(panel);

    // ── State → button appearance ────────────────────────────────────────
    function updateButtons() {
      const rowCols = grid[row] || [];
      const canUp    = row > 0;
      const canDown  = row < grid.length - 1;
      const canRight = col < rowCols.length - 1;
      const canLeft  = col > 0;

      setBtn(btnUp,    canUp);
      setBtn(btnDown,  canDown);
      setBtn(btnLeft,  canLeft);
      // Right gets cyan tint when a leave-behind is available
      setBtn(btnRight, canRight, canRight);
    }

    function setBtn(btn, enabled, cyanTint) {
      btn.disabled = !enabled;
      if (!enabled) {
        btn.style.opacity = '0.30';
        btn.style.cursor = 'default';
        btn.style.transform = '';
        btn._baseBg     = 'rgba(255,255,255,0.10)';
        btn._baseBorder = 'rgba(255,255,255,0.20)';
        btn.style.background   = btn._baseBg;
        btn.style.borderColor  = btn._baseBorder;
      } else if (cyanTint) {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn._baseBg     = 'rgba(0,207,255,0.14)';
        btn._baseBorder = 'rgba(0,207,255,0.35)';
        btn.style.background  = btn._baseBg;
        btn.style.borderColor = btn._baseBorder;
      } else {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn._baseBg     = 'rgba(255,255,255,0.10)';
        btn._baseBorder = 'rgba(255,255,255,0.20)';
        btn.style.background  = btn._baseBg;
        btn.style.borderColor = btn._baseBorder;
      }
    }

    // ── Navigation ───────────────────────────────────────────────────────
    function goTo(r, c) {
      r = Math.max(0, Math.min(grid.length - 1, r));
      const rowCols = grid[r] || [];
      c = Math.max(0, Math.min(rowCols.length - 1, c));
      row = r;
      col = c;

      const entry = rowCols[c];
      if (entry) stage.goTo(entry.linearIdx);

      try { history.replaceState(null, '', '#' + r + (c > 0 ? '-' + c : '')); } catch (_) {}

      requestAnimationFrame(() => {
        const sr = stage.shadowRoot;
        if (sr) {
          const cur = sr.querySelector('.count .current');
          const tot = sr.querySelector('.count .total');
          if (cur) cur.textContent = String(row + 1);
          if (tot) tot.textContent = String(grid.length);
        }
        updateButtons();
      });
    }

    // Restore from hash
    const m = HASH_RE.exec(location.hash || '');
    if (m) {
      goTo(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0);
    } else {
      updateButtons();
    }

    // Keyboard: capture phase runs before deck-stage's bubble handler
    window.addEventListener('keydown', (e) => {
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;
      let handled = true;

      if      (key === 'ArrowDown'  || key === 'PageDown') { goTo(row + 1, 0); }
      else if (key === 'ArrowUp'    || key === 'PageUp')   { goTo(row - 1, 0); }
      else if (key === ' ' || key === 'Spacebar')          { goTo(row + 1, 0); }
      else if (key === 'ArrowRight')                       { goTo(row, col + 1); }
      else if (key === 'ArrowLeft')                        { goTo(row, col - 1); }
      else if (key === 'Home')                             { goTo(0, 0); }
      else if (key === 'End')                              { goTo(grid.length - 1, 0); }
      else if (key === 'r' || key === 'R')                 { goTo(0, 0); }
      else if (/^[0-9]$/.test(key)) {
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        goTo(n, 0);
      } else { handled = false; }

      if (handled) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }

  if (typeof customElements !== 'undefined') {
    customElements.whenDefined('deck-stage').then(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
