/* ============================================================
   Renal Bricks — shared utility helpers + progress tracking
   Storage: localStorage key "renalBricks_v1"
   ============================================================ */
window.Game = (function () {
  const STORAGE_KEY = "renalBricks_v1";
  const GAMES_PER_MODULE = 6;
  const TOTAL_MODULES = 55;
  const COLORS = ["#fb7185", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

  /* ---------- progress storage ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { completed: {} }; }
    catch (e) { return { completed: {} }; }
  }
  function save(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function markComplete(module, game) {
    const s = load();
    const k = module + "-" + game;
    if (!s.completed[k]) s.completed[k] = new Date().toISOString();
    save(s);
  }
  function getCompleted() { return load().completed; }
  function moduleProgress(module) {
    const c = getCompleted();
    let done = 0;
    for (let g = 1; g <= GAMES_PER_MODULE; g++) if (c[module + "-" + g]) done++;
    return { done, total: GAMES_PER_MODULE };
  }
  function totalProgress() {
    const c = getCompleted();
    return { done: Object.keys(c).length, total: TOTAL_MODULES * GAMES_PER_MODULE };
  }
  function resetAll() {
    if (confirm("Reset all progress on this device? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }

  /* ---------- page detection ---------- */
  function currentPage() {
    const m = location.pathname.match(/\/modules\/(\d+)\/(?:game(\d+)\.html|index\.html|)?$/);
    if (m) return { module: parseInt(m[1], 10), game: m[2] ? parseInt(m[2], 10) : null };
    return null;
  }

  /* ---------- game helpers ---------- */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function setScore(scoreEl, value, total) {
    if (!scoreEl) return;
    scoreEl.textContent = total != null ? `${value} / ${total}` : value;
  }
  function celebrate(elementId, msg) {
    const banner = document.getElementById(elementId);
    if (banner) {
      if (msg) {
        const p = banner.querySelector("p");
        if (p) p.textContent = msg;
      }
      banner.classList.add("show");
      banner.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    confetti();
    // auto-record completion based on URL
    const pg = currentPage();
    if (pg && pg.game) markComplete(pg.module, pg.game);
  }
  function confetti(count) {
    count = count || 80;
    let layer = document.getElementById("confetti");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "confetti";
      document.body.appendChild(layer);
    }
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetto";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur = 1.6 + Math.random() * 1.8;
      c.style.animationDuration = dur + "s";
      c.style.animationDelay = (Math.random() * 0.4) + "s";
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(c);
      setTimeout(() => c.remove(), (dur + 0.5) * 1000);
    }
  }

  /* ---------- page enhancements ---------- */
  function enhanceModuleHub(module) {
    const c = getCompleted();
    const cards = document.querySelectorAll(".game-card");
    let done = 0;
    cards.forEach((card, idx) => {
      const gameNum = idx + 1;
      if (c[module + "-" + gameNum]) {
        card.classList.add("game-completed");
        if (!card.querySelector(".card-check")) {
          const badge = document.createElement("span");
          badge.className = "card-check";
          badge.textContent = "✓";
          card.appendChild(badge);
        }
        done++;
      }
    });
    // Inject a progress bar at the top of the games grid
    const grid = document.querySelector(".game-grid");
    if (grid && cards.length > 0) {
      const bar = document.createElement("div");
      bar.className = "module-progress-banner";
      const pct = Math.round(done / cards.length * 100);
      bar.innerHTML = `
        <div class="mp-row">
          <strong>${done} of ${cards.length} games complete</strong>
          <span class="mp-pct">${pct}%</span>
        </div>
        <div class="mp-track"><div class="mp-fill" style="width:${pct}%"></div></div>
      `;
      grid.parentNode.insertBefore(bar, grid);
    }
    addResetLink();
  }

  function enhanceMainIndex() {
    // Wait briefly so the inline script that populates the grid(s) can run first.
    function decorate() {
      const cards = document.querySelectorAll(".module-card");
      if (cards.length === 0) { setTimeout(decorate, 30); return; }
      let totalDone = 0;
      cards.forEach(card => {
        // Module number from data attribute (set by main index render). Falls
        // back to DOM order for backward compatibility.
        const modNum = parseInt(card.dataset.moduleNum, 10) || 0;
        if (!modNum) return;
        const prog = moduleProgress(modNum);
        totalDone += prog.done;
        // Always show progress bar (visually indicates "not started" too)
        const bar = document.createElement("div");
        bar.className = "module-mini-progress";
        const pct = Math.round(prog.done / prog.total * 100);
        bar.innerHTML = `
          <div class="mp-track"><div class="mp-fill" style="width:${pct}%"></div></div>
          <span class="mp-text">${prog.done} / ${prog.total} games</span>
        `;
        card.appendChild(bar);
        if (prog.done === prog.total) card.classList.add("module-mastered");
      });
      // Insert overall progress at top of main column
      const total = TOTAL_MODULES * GAMES_PER_MODULE;
      const totPct = Math.round(totalDone / total * 100);
      const main = document.querySelector("main.container");
      if (main && !document.getElementById("totalProgress")) {
        const banner = document.createElement("div");
        banner.id = "totalProgress";
        banner.className = "total-progress-banner";
        banner.innerHTML = `
          <div class="tp-text">
            <strong>Your progress:</strong> ${totalDone} of ${total} games complete
          </div>
          <div class="tp-track"><div class="tp-fill" style="width:${totPct}%"></div></div>
          <div class="tp-pct">${totPct}%</div>
        `;
        main.insertBefore(banner, main.firstChild);
      }
      addResetLink();
    }
    decorate();
  }

  function markGameAlreadyCompleted(module, game) {
    const c = getCompleted();
    if (!c[module + "-" + game]) return;
    const bar = document.querySelector(".score-bar");
    if (!bar) return;
    if (bar.querySelector(".prev-done-badge")) return;
    const badge = document.createElement("span");
    badge.className = "prev-done-badge";
    badge.textContent = "✓ Previously completed";
    bar.appendChild(badge);
  }

  function addResetLink() {
    const footer = document.querySelector("footer");
    if (!footer || footer.querySelector(".reset-link")) return;
    const link = document.createElement("a");
    link.href = "#";
    link.className = "reset-link";
    link.textContent = "Reset progress";
    link.addEventListener("click", e => { e.preventDefault(); resetAll(); });
    footer.appendChild(document.createElement("br"));
    footer.appendChild(link);
  }

  /* ---------- auto-run on page load ---------- */
  function enhance() {
    const pg = currentPage();
    if (pg) {
      if (pg.game) markGameAlreadyCompleted(pg.module, pg.game);
      else enhanceModuleHub(pg.module);
    } else {
      // root index — any page with one or more .module-grid elements
      if (document.querySelector(".module-grid")) enhanceMainIndex();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhance);
  } else {
    enhance();
  }

  return {
    shuffle, setScore, celebrate, confetti,
    markComplete, getCompleted, moduleProgress, totalProgress, resetAll
  };
})();
