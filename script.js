const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const toast = document.querySelector("[data-toast]");

const setHeaderState = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  document.body.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.innerHTML = open
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
});

nav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === tab);
    });
  });
});

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1600);
};

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      showToast("Comando copiado");
    } catch {
      showToast(value);
    }
  });
});

document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 5, 4) * 45}ms`;
  revealObserver.observe(element);
});

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count || "0");
    const start = performance.now();
    const duration = 900;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      element.textContent = String(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.5 });

document.querySelectorAll("[data-count]").forEach((element) => counterObserver.observe(element));

const canvas = document.getElementById("arenaCanvas");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let scale = 1;
let rafId = 0;

const resizeCanvas = () => {
  scale = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
};

const drawBlock = (x, y, w, h, top, side) => {
  ctx.fillStyle = side;
  ctx.fillRect(x, y + h * 0.24, w, h * 0.76);
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, h * 0.32);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
};

const drawHero = (time) => {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 0, width, height);

  const horizon = height * 0.56;
  ctx.fillStyle = "#0c1e36";
  ctx.fillRect(0, horizon, width, height - horizon);

  ctx.fillStyle = "rgba(102,183,255,0.18)";
  for (let i = 0; i < 32; i += 1) {
    const x = ((i * 137 + time * 0.015) % (width + 220)) - 110;
    const y = 70 + (i % 8) * 28;
    const w = 52 + (i % 4) * 34;
    ctx.fillRect(x, y, w, 12);
    ctx.fillRect(x + 18, y - 10, w * 0.45, 10);
  }

  const centerX = width * 0.72;
  const baseY = height * 0.78;
  const arenaW = Math.min(width * 0.78, 900);
  const arenaH = Math.min(height * 0.34, 260);

  ctx.save();
  ctx.translate(centerX, baseY);
  ctx.scale(1, 0.36);
  ctx.strokeStyle = "rgba(102,183,255,0.45)";
  ctx.lineWidth = 8;
  for (let r = 0; r < 5; r += 1) {
    ctx.beginPath();
    ctx.ellipse(0, 0, arenaW * (0.34 + r * 0.055), arenaH * (0.34 + r * 0.055), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const floorY = height * 0.74;
  for (let i = 0; i < 44; i += 1) {
    const x = (i * 72 - (time * 0.018 % 72));
    const y = floorY + (i % 4) * 16;
    drawBlock(x, y, 60, 46, i % 5 === 0 ? "#314f77" : "#1f385c", "#10233d");
  }

  const playerBase = Math.max(width * 0.56, 360);
  const bob = Math.sin(time * 0.003) * 8;
  const players = [
    { x: playerBase, y: height * 0.5 + bob, color: "#2f8cff", tag: "D1" },
    { x: playerBase + 110, y: height * 0.45 - bob, color: "#ff4d6d", tag: "D2" },
    { x: playerBase + 220, y: height * 0.53 + bob * 0.5, color: "#3ee67a", tag: "D3" }
  ];

  players.forEach((player) => {
    ctx.fillStyle = "rgba(0,0,0,0.26)";
    ctx.beginPath();
    ctx.ellipse(player.x + 16, player.y + 92, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    drawBlock(player.x, player.y + 22, 34, 54, player.color, "#12243c");
    drawBlock(player.x + 7, player.y, 20, 22, "#d49b72", "#8b5a3e");
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 12px Inter, sans-serif";
    ctx.fillText(player.tag, player.x + 4, player.y - 8);
  });

  const chestX = width * 0.78;
  const chestY = height * 0.36;
  ctx.fillStyle = "rgba(79,216,255,0.26)";
  ctx.fillRect(chestX + 22, 0, 8, chestY + 12);
  drawBlock(chestX, chestY, 54, 40, "#a96a2b", "#5e351a");
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(chestX + 24, chestY + 17, 8, 8);

  rafId = requestAnimationFrame(drawHero);
};

const startCanvas = () => {
  cancelAnimationFrame(rafId);
  resizeCanvas();
  rafId = requestAnimationFrame(drawHero);
};

window.addEventListener("resize", resizeCanvas, { passive: true });
startCanvas();
