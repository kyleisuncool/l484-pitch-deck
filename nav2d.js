// nav2d.js — 2D grid navigation for deck-stage
// Intercepts keyboard in capture phase (before deck-stage sees it).
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

  function init() {
    const stage = document.querySelector('deck-stage');
    if (!stage) return;

    // Build grid: array of rows, each row is array of {slide, linearIdx}
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

    function goTo(r, c) {
      r = Math.max(0, Math.min(grid.length - 1, r));
      const rowCols = grid[r] || [];
      c = Math.max(0, Math.min(rowCols.length - 1, c));
      row = r;
      col = c;

      const entry = rowCols[c];
      if (entry) stage.goTo(entry.linearIdx);

      try { history.replaceState(null, '', '#' + r + (c > 0 ? '-' + c : '')); } catch (_) {}

      // Overwrite deck-stage's linear count with row-based count
      requestAnimationFrame(() => {
        const sr = stage.shadowRoot;
        if (!sr) return;
        const cur = sr.querySelector('.count .current');
        const tot = sr.querySelector('.count .total');
        if (cur) cur.textContent = String(row + 1);
        if (tot) tot.textContent = String(grid.length);
        updateHints();
      });
    }

    // Direction hint chevrons — positioned at left/right center edges
    const hintsEl = document.createElement('div');
    hintsEl.id = 'nav2d-hints';
    hintsEl.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147482000;';
    document.body.appendChild(hintsEl);

    function updateHints() {
      const hasRight = col < (grid[row] || []).length - 1;
      const hasLeft = col > 0;

      const chevronStyle = [
        'position:absolute',
        'top:50%',
        'transform:translateY(-50%)',
        'font-size:32px',
        'line-height:1',
        'color:rgba(0,207,255,0.45)',
        'font-family:system-ui,sans-serif',
        'font-weight:300',
        'letter-spacing:-2px',
        'transition:opacity 0.3s',
        'padding:12px 8px',
      ].join(';');

      hintsEl.innerHTML = [
        hasRight ? `<div style="${chevronStyle};right:16px;" title="Detail (→)">›</div>` : '',
        hasLeft  ? `<div style="${chevronStyle};left:16px;"  title="Back (←)">‹</div>` : '',
      ].join('');
    }

    // Restore from hash
    const m = HASH_RE.exec(location.hash || '');
    if (m) {
      goTo(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0);
    } else {
      updateHints();
    }

    // Keyboard: capture phase runs before deck-stage's bubble-phase handler
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
    }, true); // capture = true → runs before deck-stage's bubble handler
  }

  // Wait for deck-stage custom element to be defined
  if (typeof customElements !== 'undefined') {
    customElements.whenDefined('deck-stage').then(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
