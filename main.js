/* ══════════════════════════════════════════════════════════
   COVER → VIDEO → HERO  flow
══════════════════════════════════════════════════════════ */
(function () {
  var cover = document.getElementById('cover');
  var overlay = document.getElementById('video-overlay');
  var video = document.getElementById('reveal-video');
  var skipBtn = document.getElementById('skip-btn');
  var fadeMask = document.getElementById('video-fade-mask');
  var openBtn = document.getElementById('open-btn');
  var hero = document.getElementById('hero');

  var skipTimer = null;
  var dismissed = false;

  /* ── Background music ── */
  var bgAudio = new Audio('hulm-al-takhruj.mp3');
  bgAudio.loop = true;
  bgAudio.volume = 0.75;

  function playAudio() {
    bgAudio.play().catch(function () { /* autoplay policy – silently ignore */ });
  }

  function stopAudio() {
    bgAudio.pause();
    bgAudio.currentTime = 0;
  }

  /* Stop when tab is hidden or closed */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAudio(); else playAudio();
  });
  window.addEventListener('pagehide', stopAudio);
  window.addEventListener('beforeunload', stopAudio);

  /* ── Step 2: video ends or skip → crossfade into hero ── */
  function goToHero() {
    if (dismissed) return;
    dismissed = true;

    clearTimeout(skipTimer);
    skipBtn.style.display = 'none';

    // 1) Scroll hero into position instantly (no animation yet, it's hidden behind overlay)
    hero.scrollIntoView({ behavior: 'instant' });

    // 2) Fade the white mask over the video (0 → 1 over 600 ms)
    if (fadeMask) {
      fadeMask.style.transition = 'opacity 0.6s ease';
      fadeMask.classList.add('active');
    }

    // 3) After white mask covers video, fade the whole overlay out → reveals hero underneath
    setTimeout(function () {
      overlay.style.transition = 'opacity 0.7s ease';
      overlay.style.opacity = '0';

      // 4) After overlay gone, clean up DOM
      setTimeout(function () {
        overlay.style.display = 'none';
        cover.remove();
        overlay.remove();
      }, 720);
    }, 580);
  }

  /* ── Step 1: button click → hide cover, show & play video ── */
  function startVideo() {
    openBtn.disabled = true;

    // Start background music
    playAudio();

    // Instantly hide the cover
    cover.style.transition = 'opacity 0.35s ease';
    cover.style.opacity = '0';
    cover.style.pointerEvents = 'none';

    // Show video overlay on top (z-index 1001)
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    overlay.classList.add('active');

    // Play
    video.play().catch(function () {
      // Autoplay blocked – show native controls as fallback
      video.controls = true;
    });

    // Show skip button after 2 s
    skipTimer = setTimeout(function () {
      skipBtn.classList.add('visible');
    }, 2000);
  }

  /* ── Wire events ── */
  openBtn.addEventListener('click', startVideo);
  skipBtn.addEventListener('click', goToHero);
  video.addEventListener('ended', goToHero);

  // ESC / Space skips when video is playing
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === ' ') && overlay.classList.contains('active')) {
      e.preventDefault();
      goToHero();
    }
  });
})();


/* ══════════════════════════════════════════════════════════
   LIVE COUNTDOWN  –  16 Nov 2026 (Monday) · Walima
   Time is a placeholder — update when confirmed.
══════════════════════════════════════════════════════════ */
(function () {
  var WEDDING_TARGET = '2026-11-16T19:00:00+05:30'; // update time when confirmed
  if (!WEDDING_TARGET) return;

  var target = new Date(WEDDING_TARGET).getTime();
  if (isNaN(target)) return;

  var grid = document.getElementById('countdown-grid');
  if (grid) grid.hidden = false;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);

    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl = document.getElementById('cd-minutes');
    var secsEl = document.getElementById('cd-seconds');

    if (daysEl) daysEl.textContent = pad(d);
    if (hoursEl) hoursEl.textContent = pad(h);
    if (minsEl) minsEl.textContent = pad(m);
    if (secsEl) secsEl.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();


/* ══════════════════════════════════════════════════════════
   SCROLL FADE-IN  (IntersectionObserver)
══════════════════════════════════════════════════════════ */
(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach(function (el) {
    observer.observe(el);
  });
})();


/* ══════════════════════════════════════════════════════════
   SCRATCH-TO-REVEAL HEART  +  CONFETTI POPPERS
══════════════════════════════════════════════════════════ */
(function () {
  var canvas = document.getElementById('scratchCanvas');
  var hint = document.getElementById('scratchHint');
  var subText = document.getElementById('scratchSub');
  var confCanvas = document.getElementById('confettiCanvas');

  if (!canvas || !confCanvas) return;

  /* ── Size canvas to container ── */
  var W = 360, H = 330;
  canvas.width = W;
  canvas.height = H;
  confCanvas.width = window.innerWidth;
  confCanvas.height = window.innerHeight;

  window.addEventListener('resize', function () {
    confCanvas.width = window.innerWidth;
    confCanvas.height = window.innerHeight;
  });

  var ctx = canvas.getContext('2d');

  /* ── Paint scratch surface (solid gold, full fill) ── */
  function paintScratchSurface() {
    ctx.clearRect(0, 0, W, H);

    // Solid opaque gold fill — covers 100% of the heart
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#F2DC9B');
    bg.addColorStop(0.3, '#D4AF37');
    bg.addColorStop(0.65, '#B8960C');
    bg.addColorStop(1, '#8C7208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle luxury diagonal highlight
    var shine = ctx.createLinearGradient(W * 0.15, H * 0.05, W * 0.65, H * 0.6);
    shine.addColorStop(0, 'rgba(255,255,240,0)');
    shine.addColorStop(0.45, 'rgba(255,255,240,0.18)');
    shine.addColorStop(1, 'rgba(255,255,240,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, W, H);

    // "✦ SCRATCH TO REVEAL ✦" label
    ctx.fillStyle = 'rgba(60, 38, 4, 0.90)';
    ctx.font = '600 13px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  SCRATCH TO REVEAL  ✦', W / 2, H * 0.42);

    // Heart ♡ hint
    ctx.fillStyle = 'rgba(60, 38, 4, 0.45)';
    ctx.font = '32px serif';
    ctx.fillText('♡', W / 2, H * 0.58);
  }

  paintScratchSurface();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (!started && !revealed) paintScratchSurface();
    });
  }

  var isDrawing = false;
  var brushR = 42;
  var revealed = false;
  var started = false;

  function getPos(e, el) {
    var r = el.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    var scaleX = W / r.width;
    var scaleY = H / r.height;
    return {
      x: (t.clientX - r.left) * scaleX,
      y: (t.clientY - r.top) * scaleY
    };
  }

  var scratchReveal = document.getElementById('scratchReveal');

  function scratch(e) {
    if (!isDrawing) return;
    if (scratchReveal && !scratchReveal.classList.contains('revealing')) {
      scratchReveal.classList.add('revealing');
    }
    var p = getPos(e, canvas);

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(p.x, p.y, brushR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!started) {
      started = true;
      if (hint) hint.classList.add('hidden');
    }

    checkReveal();
  }

  function checkReveal() {
    if (revealed) return;
    var data = ctx.getImageData(0, 0, W, H).data;
    var total = 0, transparent = 0;
    for (var i = 3; i < data.length; i += 4) {
      total++;
      if (data[i] < 128) transparent++;
    }
    if (transparent / total > 0.48) {
      revealed = true;
      if (scratchReveal) scratchReveal.classList.add('revealed');
      // Wipe remaining canvas smoothly
      setTimeout(function () {
        ctx.clearRect(0, 0, W, H);
      }, 250);

      if (subText) {
        setTimeout(function () {
          subText.textContent = '✦ You\'re Invited! Insha Allah ✦';
          subText.classList.add('revealed');
        }, 500);
      }

      // Fire confetti!
      setTimeout(launchConfetti, 350);
    }
  }

  canvas.addEventListener('mousedown', function (e) { isDrawing = true; scratch(e); });
  canvas.addEventListener('mousemove', function (e) { scratch(e); });
  canvas.addEventListener('mouseup', function () { isDrawing = false; });
  canvas.addEventListener('mouseleave', function () { isDrawing = false; });
  canvas.addEventListener('touchstart', function (e) { e.preventDefault(); isDrawing = true; scratch(e); }, { passive: false });
  canvas.addEventListener('touchmove', function (e) { e.preventDefault(); scratch(e); }, { passive: false });
  canvas.addEventListener('touchend', function () { isDrawing = false; });


  /* ══════════════════════════════════════════════════════════
     PARTY POPPER CONFETTI FROM BOTH SIDES (sini-suvin style)
  ══════════════════════════════════════════════════════════ */
  function triggerDualPartyPoppers() {
    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var duration = 1000; // 1.0 second burst duration (reduced from 2.5s)
    var end = Date.now() + duration;
    // Romantic rose, ruby red, luxury gold, and ivory celebration colors
    var colors = ['#C82346', '#E84A6F', '#D4516E', '#D4AF37', '#B8860B', '#FFF8EC', '#FFFFFF'];

    function frame() {
      if (typeof window.confetti === 'function') {
        var leftCount = Math.floor(Math.random() * 2) + 3; // 3-4 particles
        var rightCount = Math.floor(Math.random() * 2) + 3;

        // Left side: fire from origin { x: 0, y: 0.65 } at angle 60
        window.confetti({
          particleCount: leftCount,
          angle: 60,
          spread: 55,
          startVelocity: 55,
          gravity: 0.9,
          ticks: 200,
          origin: { x: 0, y: 0.65 },
          colors: colors,
          shapes: ['square', 'circle'],
          scalar: Math.random() * 0.4 + 0.8,
          zIndex: 9999,
          disableForReducedMotion: true
        });

        // Right side: fire from origin { x: 1, y: 0.65 } at angle 120
        window.confetti({
          particleCount: rightCount,
          angle: 120,
          spread: 55,
          startVelocity: 55,
          gravity: 0.9,
          ticks: 200,
          origin: { x: 1, y: 0.65 },
          colors: colors,
          shapes: ['square', 'circle'],
          scalar: Math.random() * 0.4 + 0.8,
          zIndex: 9999,
          disableForReducedMotion: true
        });
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    frame();
  }

  var launchConfetti = triggerDualPartyPoppers;

})();
