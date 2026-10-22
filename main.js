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

    var diamond = null;
    try {
      diamond = window.confetti.shapeFromPath({ path: 'M 10 0 L 20 10 L 10 20 L 0 10 Z' });
    } catch(e) {}
    var shapes = diamond ? ['square', 'circle', 'star', diamond] : ['square', 'circle', 'star'];

    // Romantic rose, ruby red, luxury gold, champagne, and ivory celebration colors
    var colors = ['#D4AF37', '#F2DC9B', '#B8860B', '#C82346', '#8E1A35', '#E84A6F', '#F4ECD2', '#FFF8EC', '#FFFFFF'];

    var base = {
      colors: colors,
      shapes: shapes,
      ticks: 60,          // 1.0 second flutter lifetime (reduced from 2.5s)
      gravity: 1.15,      // realistic gravity
      decay: 0.91,        // air drag
      scalar: 1.05,
      zIndex: 9999,
      disableForReducedMotion: true
    };

    // Festive multi-angle sequence alternating every 0.5 seconds:
    // 1. Grand 3-cannon celebratory salvo (left, center, right)
    // 2. Left cannon shooting up and diagonally inward
    // 3. Right cannon shooting up and diagonally inward
    // 4. Center fountain blasting straight up
    // 5. Dual-cannon criss-cross
    var salvos = [
      function() { // 1. Grand 3-cannon celebratory salvo (left, center, right)
        window.confetti(Object.assign({}, base, { particleCount: 35, angle: 60, spread: 55, startVelocity: 55, origin: { x: 0.1, y: 0.75 } }));
        window.confetti(Object.assign({}, base, { particleCount: 45, angle: 90, spread: 80, startVelocity: 62, origin: { x: 0.5, y: 0.75 } }));
        window.confetti(Object.assign({}, base, { particleCount: 35, angle: 120, spread: 55, startVelocity: 55, origin: { x: 0.9, y: 0.75 } }));
      },
      function() { // 2. Left cannon shooting up and diagonally inward
        window.confetti(Object.assign({}, base, { particleCount: 50, angle: 55, spread: 60, startVelocity: 60, origin: { x: 0.05, y: 0.72 } }));
      },
      function() { // 3. Right cannon shooting up and diagonally inward
        window.confetti(Object.assign({}, base, { particleCount: 50, angle: 125, spread: 60, startVelocity: 60, origin: { x: 0.95, y: 0.72 } }));
      },
      function() { // 4. Center fountain blasting straight up
        window.confetti(Object.assign({}, base, { particleCount: 60, angle: 90, spread: 85, startVelocity: 65, origin: { x: 0.5, y: 0.78 } }));
      },
      function() { // 5. Dual-cannon criss-cross
        window.confetti(Object.assign({}, base, { particleCount: 40, angle: 48, spread: 50, startVelocity: 62, origin: { x: 0.05, y: 0.7 } }));
        window.confetti(Object.assign({}, base, { particleCount: 40, angle: 132, spread: 50, startVelocity: 62, origin: { x: 0.95, y: 0.7 } }));
      }
    ];

    var step = 0;
    var totalSalvos = 6;
    salvos[0]();
    step++;

    var intervalId = setInterval(function() {
      if (step >= totalSalvos) {
        clearInterval(intervalId);
        return;
      }
      salvos[step % salvos.length]();
      step++;
    }, 500);
  }

  var launchConfetti = triggerDualPartyPoppers;

  /* Expose for other modules (e.g. RSVP celebration) */
  window.weddingConfetti = triggerDualPartyPoppers;

})();


/* ══════════════════════════════════════════════════════════
   RSVP FORM  –  guest counter · validation · Google Sheet log
   ──────────────────────────────────────────────────────────
   Every response is recorded in the couple's Google Sheet via
   the Apps Script web app URL configured below.
   ══════════════════════════════════════════════════════════ */
(function () {
  /* 
   * Paste your Google Apps Script Web App URL here:
   * (e.g. 'https://script.google.com/macros/s/.../exec')
   */
  var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztMDLWdljwP3trlozzuPiLYuSMhqK2xV43zcT2vK-UIjKGVP8ZD-r_7hLC2gF00ebj/exec';

  var MIN_GUESTS = 1;
  var MAX_GUESTS = 12;

  var form = document.getElementById('rsvp-form');
  if (!form) return;

  var success = document.getElementById('rsvp-success');
  var successMsg = document.getElementById('rsvp-success-msg');
  var summary = document.getElementById('rsvp-summary');
  var countOut = document.getElementById('rsvp-count');
  var countInput = document.getElementById('rsvp-guests');
  var choicesWrap = document.getElementById('rsvp-choices');
  var submitText = document.getElementById('rsvp-submit-text');
  var resetBtn = document.getElementById('rsvp-reset');

  var nameInput = document.getElementById('rsvp-name');
  var phoneInput = document.getElementById('rsvp-phone');
  var noteInput = document.getElementById('rsvp-note');

  var count = MIN_GUESTS;

  /* ── Guest counter ── */
  var minusBtn = form.querySelector('.rsvp-step[data-count="-1"]');
  var plusBtn = form.querySelector('.rsvp-step[data-count="1"]');

  function renderCount() {
    countOut.textContent = count;
    countInput.value = count;
    if (minusBtn) minusBtn.disabled = count <= MIN_GUESTS;
    if (plusBtn) plusBtn.disabled = count >= MAX_GUESTS;
  }

  function bump(delta) {
    count = Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, count + delta));
    renderCount();
  }

  if (minusBtn) minusBtn.addEventListener('click', function () { bump(-1); });
  if (plusBtn) plusBtn.addEventListener('click', function () { bump(1); });
  renderCount();

  /* ── Validation helpers ── */
  function setError(input, errorEl, message) {
    if (input) input.classList.toggle('invalid', !!message);
    if (errorEl) errorEl.textContent = message || '';
    return !message;
  }

  function clearErrors() {
    [nameInput, phoneInput].forEach(function (el) {
      if (el) el.classList.remove('invalid');
    });
    ['rsvp-name-error', 'rsvp-phone-error', 'rsvp-attending-error', 'rsvp-guests-error'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = '';
    });
    if (choicesWrap) choicesWrap.classList.remove('invalid');
  }

  nameInput.addEventListener('input', function () {
    setError(nameInput, document.getElementById('rsvp-name-error'), '');
  });

  phoneInput.addEventListener('input', function () {
    setError(phoneInput, document.getElementById('rsvp-phone-error'), '');
  });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'attending') {
      setError(null, document.getElementById('rsvp-attending-error'), '');
      if (choicesWrap) choicesWrap.classList.remove('invalid');
    }
  });

  /* ── Celebration ── */
  function celebrate() {
    if (typeof window.weddingConfetti === 'function') {
      window.weddingConfetti();
      return;
    }
    if (typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 70,
        angle: 90,
        spread: 75,
        startVelocity: 60,
        origin: { x: 0.5, y: 0.65 },
        colors: ['#D4AF37', '#F2DC9B', '#B8860B', '#C82346', '#FFF8EC', '#FFFFFF'],
        shapes: ['square', 'circle', 'star'],
        zIndex: 9999,
        disableForReducedMotion: true
      });
    }
  }

  /* ── Summary rows ── */
  function addRow(label, value) {
    var row = document.createElement('div');
    row.className = 'rsvp-summary-row';

    var dt = document.createElement('dt');
    dt.textContent = label;

    var dd = document.createElement('dd');
    dd.textContent = value;

    row.appendChild(dt);
    row.appendChild(dd);
    summary.appendChild(row);
  }

  /* ── Submit ── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    var name = nameInput.value.trim();
    var phone = phoneInput.value.trim();
    var note = noteInput.value.trim();
    var attending = form.querySelector('input[name="attending"]:checked');
    var firstInvalid = null;

    if (name.length < 2) {
      setError(nameInput, document.getElementById('rsvp-name-error'), 'Please tell us your name');
      firstInvalid = firstInvalid || nameInput;
    }

    if (phone && phone.replace(/\D/g, '').length < 7) {
      setError(phoneInput, document.getElementById('rsvp-phone-error'), 'Please enter a valid number');
      firstInvalid = firstInvalid || phoneInput;
    }

    if (!attending) {
      setError(null, document.getElementById('rsvp-attending-error'), 'Please let us know if you can attend');
      if (choicesWrap) choicesWrap.classList.add('invalid');
      firstInvalid = firstInvalid || choicesWrap;
    }

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof firstInvalid.focus === 'function') firstInvalid.focus({ preventScroll: true });
      return;
    }

    var data = {
      name: name,
      phone: phone,
      guests: count,
      attending: attending.value,
      note: note
    };

    /* Send data to Google Sheets via Apps Script Webhook */
    if (GOOGLE_SCRIPT_URL) {
      try {
        fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).catch(function (err) {
          console.warn('Google Sheet submission notice:', err);
        });
      } catch (e) {
        console.warn('Google Sheet fetch error:', e);
      }
    }

    /* Swap the form for the confirmation panel */
    form.hidden = true;
    success.hidden = false;

    summary.innerHTML = '';
    addRow('Name', data.name);
    addRow('Guests', String(data.guests));
    addRow('Attending', data.attending === 'yes' ? 'Joyfully Accept' : 'Regretfully Decline');
    if (data.phone) addRow('Phone', data.phone);

    successMsg.textContent = data.attending === 'yes'
      ? 'We look forward to celebrating with you, Insha Allah.'
      : 'Thank you for your kind wishes from afar.';

    celebrate();
  });

  /* ── Edit response ── */
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      success.hidden = true;
      form.hidden = false;
      summary.innerHTML = '';
      clearErrors();
      nameInput.focus();
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /* ── Submit button label ── */
  if (submitText) {
    submitText.textContent = 'Send My RSVP';
  }
})();
