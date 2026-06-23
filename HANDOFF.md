# L484 × ArcTec — Investor Pitch Deck
## Community Handoff

This document is the full operating context for the deck. If you are working with an AI assistant, share this file as your first message. It contains everything needed to understand the project, run it locally, present it, and make edits.

---

## What This Is

An investor pitch deck for **Labs 484** and **ArcTec Center** (formerly Sapien Center). It runs in the browser — no PowerPoint, no PDF. The deck is a single HTML file powered by a custom web component called `deck-stage`, extended with a 2D navigation layer called `nav2d`.

The person giving the presentation uses keyboard arrows or the on-screen button panel to move through slides.

---

## Running the Deck

```bash
# From the repo root
bash serve.sh
```

Opens at **http://localhost:4002**

Requires Python 3 (pre-installed on macOS). No build step, no dependencies to install.

---

## Navigation

### On-screen buttons (bottom-right corner)
Four glass buttons in a vertical column:

| Button | Action |
|--------|--------|
| ↑ | Previous main slide |
| → | Open leave-behind (detail slide) — glows cyan when available |
| ← | Return to main slide from leave-behind |
| ↓ | Next main slide |

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `↓` / `Space` / `PgDn` | Next main slide |
| `↑` / `PgUp` | Previous main slide |
| `→` | Open leave-behind for current slide |
| `←` | Return to main slide |
| `1`–`9`, `0` | Jump directly to that slide number |
| `Home` / `R` | Return to cover |
| `End` | Jump to last slide |

### The 2D structure

There are **10 main slides** (the presentation) and **10 leave-behind slides** (one per main slide, for when you hand the deck to a reader).

- **Up / Down** moves between the 10 main slides. You always land on the main version.
- **Right** opens the leave-behind for the current slide — more text-dense, for readers not audience.
- **Down from a leave-behind** always goes to the next main slide (col 0), not the next leave-behind.

This means you can present top-to-bottom with ↓, and the audience never sees the leave-behinds unless you navigate right to show them.

---

## Slide Map

| # | Main Slide | Leave-Behind |
|---|-----------|--------------|
| 1 | Cover — "Back from the Arctic" | About ArcTec Center |
| 2 | Where Builders Get Resourced | Developer Ecosystem Deep Dive |
| 3 | Open Source Dev Center | Why the Physical Layer Matters |
| 4 | The ArcTec Circle | How the Circle Operates |
| 5 | Lab 484 | The New Internet Thesis |
| 6 | Noderunners Store | Hardware Sovereignty Stack |
| 7 | Radius Grocery | Food Sovereignty at the Campus Layer |
| 8 | Kitchen 484 | Operations + Revenue Model |
| 9 | Current Revenue ⚠️ | Revenue Breakdown ⚠️ |
| 10 | Investment Opportunity ⚠️ | Full Deal Terms ⚠️ |

**⚠️ Slides 9 & 10 are placeholders.** They show current revenue ($19k/month) and the investment ask ($2.5M over 5 years) but all detailed breakdowns show "forthcoming" badges. These will be filled in when the financial model is complete.

---

## Repo Structure

```
l484-pitch-deck/
├── L484 — Pitch Deck.html   ← All 20 slides. Edit this for content changes.
├── styles.css                ← ArcTec design system (tokens, components, layout)
├── nav2d.js                  ← 2D keyboard + button navigation layer
├── deck-stage.js             ← DO NOT EDIT. Core slide engine (1920×1080 canvas, auto-scaling)
├── serve.sh                  ← Local preview server (port 4002)
├── index.html                ← Redirect shim → loads the main HTML file
└── assets/
    ├── logo-arctic.jpg       ← "The Arctic" crystalline diamond logo (cover slide)
    ├── render-campus-plan.jpg
    ├── render-interior-day.jpg
    ├── render-interior-night.jpg  ← Used as cover background
    ├── render-interior-sky.jpg
    ├── render-interior-stars.jpg
    ├── render-garden-day.jpg
    └── render-garden-night.jpg    ← Used on ArcTec Circle slide
```

**Do not modify `deck-stage.js`.** It is the slide engine and is intentionally kept untouched. All customization lives in the HTML, CSS, and nav2d.js.

---

## Making Content Edits

All slide content is in **`L484 — Pitch Deck.html`**.

Each slide is a `<section>` element. The 2D position is set with two attributes:

```html
<section class="s arctic" data-row="0" data-col="0" data-label="Cover">
  <!-- main slide for row 0 -->
</section>

<section class="s detail" data-row="0" data-col="1" data-label="About ArcTec">
  <!-- leave-behind for row 0 -->
</section>
```

- `data-row` = which slide number (0–9)
- `data-col="0"` = main presentation slide
- `data-col="1"` = leave-behind
- Slides are interleaved in the HTML: row 0 main → row 0 leave-behind → row 1 main → row 1 leave-behind → …

### CSS classes to know

| Class | Use |
|-------|-----|
| `.s.arctic` | Main presentation slide (dark, subtle aurora glow) |
| `.s.detail` | Leave-behind slide (cyan left-edge stripe) |
| `.frame` | Full-bleed content wrapper with standard padding |
| `.glass` | Glassmorphism card |
| `.glass.crest` | Glass card with aurora top stripe — use sparingly, one per slide |
| `.display` | Techbit pixel font — cover title only |
| `.h1` | 72px heading — main slide title |
| `.h2` | 52px heading — leave-behind title |
| `.lead` | 27px body copy |
| `.label` | Small uppercase mono label (cyan) |
| `.stat` | 120px number — hero stat |
| `.stat-sm` | 80px number — secondary stat |
| `.aurora` | Gradient text (cyan → purple → pink) |
| `.pill.cyan` | Pill badge with cyan border |
| `.forthcoming` | Purple "forthcoming" badge for placeholders |
| `.grid-2` | Two-column grid |
| `.grid-3` | Three-column grid |
| `.anim` `.d1`–`.d5` | Entrance animation (staggered fade-up) |

---

## Pending Items

These are known gaps. When the information is ready, edit the relevant sections in `L484 — Pitch Deck.html` and remove the `.forthcoming` badges.

**Slide 9 — Current Revenue (main + leave-behind)**
- Revenue breakdown by stream (membership, hardware, grocery, food service, sublease)
- Growth path from $19k/month to $150k/month with timeline

**Slide 10 — Investment Opportunity (main + leave-behind)**
- Revenue share percentage
- Use of funds breakdown
- Full deal structure and reporting cadence

**Assets forthcoming**
- SVG version of the logo (`assets/logo-arctic.svg`) — replace the JPEG on the cover when available
- Background animation / additional render assets — drop into `assets/` and reference in the HTML

---

## Design System Notes

The deck uses the **ArcTec Arctic palette**:

| Token | Value | Role |
|-------|-------|------|
| `--void` | `#05080F` | Deepest background |
| `--cyan` | `#00CFFF` | Primary accent |
| `--purple` | `#7B44D9` | Secondary accent |
| `--grad-aurora` | cyan → purple → pink | Brand gradient (diagonal) |
| `--font-display` | Techbit (pixel) | Cover title only |
| `--font-sans` | Plus Jakarta Sans | Headings and body |
| `--font-mono` | Space Mono | Labels and data |

Fonts load from CDN (cdnfonts.com + Google Fonts). Requires internet to render correctly. For offline use, fonts fall back to Courier New / system-ui / monospace.

---

## GitHub

```
github.com/kyleisuncool/l484-pitch-deck
```

Branch: `main`
