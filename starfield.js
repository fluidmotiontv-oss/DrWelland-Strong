/* ============================================================
   DR. WELLAND-STRONG — PIMP PACK
   Starfield background + splash control + service worker.
   Drop-in, no rebuild required.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Splash screen ---------- */
  function hideSplash() {
    var s = document.getElementById("dws-splash");
    if (s && !s.classList.contains("dws-done")) s.classList.add("dws-done");
  }
  window.addEventListener("load", function () {
    setTimeout(hideSplash, 500);
  });
  setTimeout(hideSplash, 2800); // hard cap, never trap the user

  /* ---------- Service worker (PWA install + offline) ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }

  /* ---------- Starfield ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.id = "dws-stars";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  var ctx = canvas.getContext("2d");
  var stars = [];
  var shooting = null;
  var W = 0, H = 0, dpr = 1;
  var running = true;
  var t = 0;

  var TINTS = [
    [255, 255, 255],   // white
    [103, 232, 249],   // cyan
    [103, 232, 249],
    [196, 181, 253],   // violet
    [134, 239, 172]    // faint green
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    var count = Math.min(180, Math.floor((W * H) / 9000));
    stars = [];
    for (var i = 0; i < count; i++) {
      var tint = TINTS[Math.floor(Math.random() * TINTS.length)];
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.4 + Math.random() * 1.4,
        vy: 0.02 + Math.random() * 0.08,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        tint: tint
      });
    }
  }

  function spawnShooting() {
    if (reduceMotion) return;
    shooting = {
      x: Math.random() * W * 0.7 + W * 0.15,
      y: Math.random() * H * 0.35,
      vx: 5 + Math.random() * 4,
      vy: 2 + Math.random() * 2,
      life: 0,
      max: 40 + Math.random() * 20
    };
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "rgb(" + s.tint[0] + "," + s.tint[1] + "," + s.tint[2] + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame() {
    if (!running) return;
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += s.vy;
      if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }

      var tw = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
      ctx.globalAlpha = tw;
      ctx.fillStyle = "rgb(" + s.tint[0] + "," + s.tint[1] + "," + s.tint[2] + ")";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // occasional shooting star
    if (!shooting && Math.random() < 0.004) spawnShooting();
    if (shooting) {
      shooting.life++;
      shooting.x += shooting.vx;
      shooting.y += shooting.vy;
      var fade = 1 - shooting.life / shooting.max;
      if (fade <= 0) {
        shooting = null;
      } else {
        var g = ctx.createLinearGradient(
          shooting.x, shooting.y,
          shooting.x - shooting.vx * 9, shooting.y - shooting.vy * 9
        );
        g.addColorStop(0, "rgba(103,232,249," + (0.9 * fade).toFixed(3) + ")");
        g.addColorStop(1, "rgba(103,232,249,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(shooting.x - shooting.vx * 9, shooting.y - shooting.vy * 9);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running && !reduceMotion) requestAnimationFrame(frame);
  });

  resize();
  if (reduceMotion) {
    drawStatic();
  } else {
    requestAnimationFrame(frame);
  }
})();
