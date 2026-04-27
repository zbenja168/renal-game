/* shared utility helpers used across games */
window.Game = (function () {
  const COLORS = ["#fb7185", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

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
  }

  function confetti(count = 80) {
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
  return { celebrate, shuffle, setScore, confetti };
})();
