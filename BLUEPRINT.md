# Renal Bricks — Game Blueprint (READ FIRST)

This file documents the established patterns for building module pages. **Strictly follow these patterns — do not invent new conventions.**

## File layout
```
site/
├── index.html              ← Main landing (ENABLE your module by setting `ready: true`)
├── css/style.css           ← Shared styles. DO NOT MODIFY.
├── js/shared.js            ← Shared helpers (Game.shuffle, Game.setScore, Game.celebrate). DO NOT MODIFY.
├── BLUEPRINT.md            ← This file.
└── modules/NN/             ← Where NN is zero-padded module number
    ├── index.html          ← Module hub with 6 game cards
    ├── game1.html          ← First themed game
    ├── game2.html
    ├── game3.html
    ├── game4.html
    ├── game5.html
    └── game6.html          ← BOSS round — comprehensive drag-and-drop
```

## Theme system (per page body class)
- `theme-coral`   — pink/coral
- `theme-sun`     — yellow/orange
- `theme-crimson` — red
- `theme-teal`    — turquoise
- `theme-grape`   — purple
- `theme-royal`   — indigo (used for boss + module hub)

**Module 1 used these themes in order: coral, sun, crimson, teal, grape, royal. Use the same ordering — game1=coral, game2=sun, ... game6=royal.**

## Hard rules
1. **Strictly use only content from the brick PDF.** No outside knowledge, no invented facts.
2. **Six games per module.** The boss (game6.html) must cover the whole brick across all sections.
3. **Game 5 must include NEW questions** (not the brick's verbatim review questions). New scenarios that test brick content.
4. **Vary game types across the 5 themed games.** Drag-drop, matching, hotspot, multi-section sorter, quiz, sequencing — pick what fits the content.
5. **Include the brick's clinical correlations and active learning questions as raw material**, but rephrase quiz prompts.
6. **Use `Game.celebrate("winBanner")` on victory** — it shows the banner AND fires confetti.
7. Reference the existing `modules/01/` files as your structural template. Copy the HTML scaffolding.
8. Keep the same prev/next navigation pattern at the bottom of each game page.

## Standard page scaffold (every game page)
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Game N — Module NN</title>
<link rel="stylesheet" href="../../css/style.css">
</head>
<body class="theme-XXX">
<header class="module-header">
  <div class="crumb"><a href="index.html">← Module NN</a></div>
  <h1>Game N — Title</h1>
</header>
<main class="container narrow">
  <div class="game-shell">
    <div class="game-title">
      <div class="icon">EMOJI</div>
      <h2>Game prompt</h2>
    </div>
    <div class="game-instructions"><strong>Goal:</strong> ...</div>
    <div class="score-bar">
      <span>... <span class="score" id="score">0 / N</span></span>
      <button class="btn secondary" id="resetBtn">Reset</button>
    </div>
    <!-- game-specific markup -->
    <div class="feedback" id="feedback"></div>
    <div class="win-banner" id="winBanner">
      <h3>🎉 Victory message</h3>
      <p>Concept reinforcement message.</p>
    </div>
    <div class="btn-row">
      <a class="btn secondary" href="gameN-1.html">← Previous</a>
      <a class="btn secondary" href="index.html">Module hub</a>
      <a class="btn" href="gameN+1.html">Next →</a>
    </div>
  </div>
</main>
<script src="../../js/shared.js"></script>
<script>/* game logic here */</script>
</body>
</html>
```

## Standard CSS classes available (see style.css)
- Layout: `.container`, `.narrow`, `.game-shell`, `.game-title`, `.game-instructions`, `.score-bar`, `.btn-row`
- Buttons: `.btn`, `.btn.secondary`, `.btn.success`
- Feedback: `.feedback` + `.show` + `.correct|.incorrect|.info`
- Drag-drop: `.drag-item`, `.drag-item.placed`, `.drop-zone`, `.drop-zone.drag-over|.correct|.incorrect`
- Pool/buckets: `.lymph-pool`, `.lymph-buckets`, `.lymph-bucket` (use these for any "drag from pool to buckets" game)
- Builder layout: `.builder-wrap`, `.builder-pieces`, `.builder-zones`, `.zone-row`, `.zone-label`
- Match memory: `.match-board`, `.match-card`, `.match-card.flipped|.matched`
- Hotspot: `.hotspot-canvas`, `.hotspot`, `.hotspot.found|.miss`
- Quiz: `.quiz-question`, `.q-text`, `.quiz-options`, `.quiz-option`, `.quiz-option.correct|.incorrect`, `.quiz-explanation`, `.show`
- Master/boss layout: `.master-board`, `.master-section`, `.master-section h3 .pill`
- Win: `.win-banner`, `.win-banner.show`

## JS helpers (window.Game)
- `Game.shuffle(arr)` — Fisher-Yates in place
- `Game.setScore(el, value, total)` — sets `"X / Y"` text
- `Game.celebrate("winBanner")` — shows banner + fires confetti
- `Game.confetti(count)` — confetti only

## Module hub (`modules/NN/index.html`) pattern
Use `body class="theme-royal"` and 6 `.game-card` links with `data-color="coral|sun|crimson|teal|grape|royal"` matching each game's theme. Also include `<script src="../../js/shared.js"></script>` before `</body>` so progress decoration runs.

## ⚠️ HARD-WON LESSONS (failures from week 1 — do NOT repeat)

### Matching games (game3): never use [N] suffix to fake-uniquify duplicates
If multiple causes/items map to the same right-side category (e.g., 3 things → "Hypervolemic", 3 → "Euvolemic"), DO NOT write `b: "Hypervolemic [1]"`, `b: "Hypervolemic [2]"` etc. — that looks ridiculous to the user. Instead:
- Keep `b` values as the clean category name (duplicates are fine in the array)
- In the JS, set `c.dataset.matchKey = it.matchKey` where `matchKey = p.b` (the category text)
- The equality check is `firstPick.dataset.matchKey === card.dataset.matchKey`
- See `modules/18/game3.html` and `modules/20/game3.html` for the working pattern

### Hotspot games (game2 typically): put click zones INSIDE the SVG, not as overlay divs
Do NOT use `<div class="hotspot" style="left:X%;top:Y%">` overlays positioned over an `<svg>`. They drift out of alignment because of how percentages and SVG scaling interact. Instead, wrap each clickable region in `<g class="svg-zone" data-name="X">` inside the SVG and add a `<rect class="zone-bg" ...>` plus any text/labels inside the group. Page-local CSS controls hover/found/miss state on `.svg-zone`. See `modules/18/game2.html` and `modules/19/game2.html` for the working pattern with the local `<style>` block, the `<g class="svg-zone">` markup, and JS that listens on `.svg-zone` clicks.

### Quiz questions (game5 round 2): balance option lengths
The CORRECT answer must NOT be visibly longer than the distractors — that's "longest-answer bias" and lets students game the quiz. All four options should be within ~30% length of each other. Write distractors with comparable clinical specificity / mechanism detail. Plausibly wrong, never obviously wrong.

### Game 5 quiz: NEW questions only
Do NOT copy or paraphrase the brick's own review questions. Write fresh scenarios that test the same concepts from different angles.

## After your modules are done
Update `index.html` (root) to mark your modules as `ready: true` with the right `games` count and a short title (use the brick title without the `Brick Exchange "` prefix).
