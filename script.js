/* ============================================================
   CARVE & CURVE  —  script.js
   ============================================================ */
(function () {
  'use strict';

  document.documentElement.classList.add('js-ready');

  /* ════════════════════════════════════════════════════════
     1. CUSTOM CURSOR
  ════════════════════════════════════════════════════════ */
  var cur  = document.getElementById('cur');
  var ring = document.getElementById('cur-ring');

  if (cur && ring && window.matchMedia('(pointer:fine)').matches) {
    var mouseX = -999, mouseY = -999;
    var ringX  = -999, ringY  = -999;
    var moved  = false;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!moved) {
        moved = true;
        ringX = mouseX;
        ringY = mouseY;
        cur.style.visibility  = 'visible';
        ring.style.visibility = 'visible';
      }
      cur.style.left = mouseX + 'px';
      cur.style.top  = mouseY + 'px';
    });

    document.addEventListener('mouseleave', function () {
      cur.style.visibility  = 'hidden';
      ring.style.visibility = 'hidden';
      moved = false;
    });
    document.addEventListener('mouseenter', function () {
      if (moved) {
        cur.style.visibility  = 'visible';
        ring.style.visibility = 'visible';
      }
    });

    (function animateRing() {
      ringX += (mouseX - ringX) * 0.10;
      ringY += (mouseY - ringY) * 0.10;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();

    function addCursorHover(selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          cur.classList.add('hover');
          ring.classList.add('hover');
        });
        el.addEventListener('mouseleave', function () {
          cur.classList.remove('hover');
          ring.classList.remove('hover');
        });
      });
    }
    addCursorHover(
      'a,button,.channel,.pillar,.p-card,.benefit-card,' +
      '.dim-cell,.bfeat,.va-item,.pill,.ed-panel'
    );
  }

  /* ════════════════════════════════════════════════════════
     2. NAV SCROLL STATE
  ════════════════════════════════════════════════════════ */
  var nav = document.getElementById('nav');
  if (nav) {
    function onScroll() {
      nav.classList.toggle('solid', window.scrollY > 70);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ════════════════════════════════════════════════════════
     3. MOBILE HAMBURGER MENU
  ════════════════════════════════════════════════════════ */
  var ham = document.getElementById('ham');
  var mob = document.getElementById('mobile-menu');
  if (ham && mob) {
    ham.addEventListener('click', function () {
      var isOpen = mob.classList.toggle('open');
      ham.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mob.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        ham.classList.remove('open');
        mob.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ════════════════════════════════════════════════════════
     4. SCROLL REVEAL
  ════════════════════════════════════════════════════════ */
  var revealObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.09, rootMargin: '0px 0px -36px 0px' }
  );

  function observeRevealEls() {
    document.querySelectorAll('.rw:not(.in)').forEach(function (el) {
      revealObs.observe(el);
    });
  }
  observeRevealEls();

  /* Fallback: force-reveal anything still hidden after 2.5s, in case an
     element never intersects (edge-case layouts, extremely tall sections,
     or an observer quirk on some browser). Nothing should stay invisible
     indefinitely. */
  setTimeout(function () {
    document.querySelectorAll('.rw:not(.in)').forEach(function (el) {
      el.classList.add('in');
    });
  }, 2500);

  /* ════════════════════════════════════════════════════════
     5. SMOOTH ANCHOR SCROLL
  ════════════════════════════════════════════════════════ */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });

  /* ════════════════════════════════════════════════════════
     6. DYNAMIC PANEL BUILDER
     Each row lets the client pick:
       System  — Wall Panel / Ceiling Cloud / Corner Bass Trap / Custom
       Edition — Core / Artisan / Signature / Not sure
       Size    — all sizes in ft
       Qty     — number
       Thickness — 2" / 3" / 4" / 5" / 6"
     Multiple rows can be added. Sends to WhatsApp only.
  ════════════════════════════════════════════════════════ */
  var panelBuilder = document.getElementById('panel-builder');
  var addRowBtn    = document.getElementById('add-panel-row');
  var rowCount     = 0;

  var SYSTEMS = [
    'Wall Panel',
    'Ceiling Cloud',
    'Corner Bass Trap',
    'Diffuser',
    'Custom / Other'
  ];

  var EDITIONS = [
    'Core — Frameless, Single-tone',
    'Artisan — Rubberwood Frame, Single-tone',
    'Signature — Rubberwood Frame, Dual-tone',
    'Not sure — need recommendation'
  ];

  /* SIZES replaced by free width/height inputs */

  var THICKNESS = [
    '2 inch',
    '3 inch',
    '4 inch',
    '5 inch',
    '6 inch',
    'Not sure'
  ];

  function makeOption(value, label) {
    return '<option value="' + value + '">' + (label || value) + '</option>';
  }

  function buildSelect(options, placeholder, cls) {
    var html = '<select class="' + cls + '">';
    html += '<option value="">' + placeholder + '</option>';
    options.forEach(function (o) { html += makeOption(o); });
    html += '</select>';
    return html;
  }

  function addPanelRow() {
    rowCount++;
    var row = document.createElement('div');
    row.className = 'panel-row';
    row.dataset.row = rowCount;

    row.innerHTML =
      /* System type */
      '<div>' +
        '<span class="panel-row-label">System</span>' +
        buildSelect(SYSTEMS, 'Select system…', 'pr-system') +
      '</div>' +
      /* Edition */
      '<div>' +
        '<span class="panel-row-label">Edition</span>' +
        buildSelect(EDITIONS, 'Select edition…', 'pr-edition') +
      '</div>' +
      /* Width */
      '<div>' +
        '<span class="panel-row-label">Width (ft)</span>' +
        '<input type="number" class="pr-width" placeholder="e.g. 2.5" min="0.5" max="6" step="0.5">' +
      '</div>' +
      /* Height */
      '<div>' +
        '<span class="panel-row-label">Height (ft)</span>' +
        '<input type="number" class="pr-height" placeholder="e.g. 4" min="1" max="8" step="0.5">' +
      '</div>' +
      /* Thickness */
      '<div>' +
        '<span class="panel-row-label">Thickness</span>' +
        buildSelect(THICKNESS, 'Select thickness…', 'pr-thick') +
      '</div>' +
      /* Quantity */
      '<div class="pr-qty">' +
        '<span class="panel-row-label">Qty</span>' +
        '<input type="number" class="pr-quantity" placeholder="No. of panels" min="1" max="999">' +
      '</div>' +
      /* Remove */
      '<button type="button" class="btn-remove-row" title="Remove this row" aria-label="Remove row">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';

    row.querySelector('.btn-remove-row').addEventListener('click', function () {
      row.remove();
      if (panelBuilder.children.length === 0) showEmpty();
    });

    hideEmpty();
    panelBuilder.appendChild(row);
  }

  function showEmpty() {
    if (!panelBuilder.querySelector('.panel-empty')) {
      var el = document.createElement('div');
      el.className = 'panel-empty';
      el.textContent = 'No systems added yet — click "Add Another System" below';
      panelBuilder.appendChild(el);
    }
  }

  function hideEmpty() {
    var el = panelBuilder.querySelector('.panel-empty');
    if (el) el.remove();
  }

  /* Arriving from the Learning Centre room calculator (?qr=1&...) —
     build rows from its results instead of one blank row. Every
     field this fills in is the same live select/input a visitor
     fills in by hand, so edition, size and quantity all stay fully
     editable here. */
  function prefillFromCalculator() {
    var params;
    try { params = new URLSearchParams(window.location.search); }
    catch (e) { return false; }
    if (params.get('qr') !== '1') return false;

    var EDITION_MAP = {
      core:      'Core — Frameless, Single-tone',
      artisan:   'Artisan — Rubberwood Frame, Single-tone',
      signature: 'Signature — Rubberwood Frame, Dual-tone',
      unsure:    'Not sure — need recommendation'
    };
    var SPACE_MAP = {
      studio:  'Recording / Music Studio',
      theatre: 'Home Theatre / Cinema',
      podcast: 'Podcast / Broadcast Studio',
      office:  'Corporate / Office',
      other:   'Residential / Bedroom'
    };

    var ed  = EDITION_MAP[params.get('ed')] || EDITION_MAP.unsure;
    var th  = (params.get('th') || '3') + ' inch';
    var psz = params.get('psz') || '2';
    var wp  = parseInt(params.get('wp'), 10) || 0;
    var bt  = parseInt(params.get('bt'), 10) || 0;
    var cc  = parseInt(params.get('cc'), 10) || 0;

    if (!wp && !bt && !cc) return false;

    function fillRow(system, width, height, qty) {
      addPanelRow();
      var row = panelBuilder.lastElementChild;
      if (!row) return;
      var sysEl = row.querySelector('.pr-system');
      var edEl  = row.querySelector('.pr-edition');
      var wEl   = row.querySelector('.pr-width');
      var hEl   = row.querySelector('.pr-height');
      var thEl  = row.querySelector('.pr-thick');
      var qEl   = row.querySelector('.pr-quantity');
      if (sysEl) sysEl.value = system;
      if (edEl)  edEl.value  = ed;
      if (wEl && width)  wEl.value  = width;
      if (hEl && height) hEl.value  = height;
      if (thEl) thEl.value = th;
      if (qEl)  qEl.value  = qty;
    }

    if (wp) fillRow('Wall Panel', psz, '4', wp);
    if (bt) fillRow('Corner Bass Trap', '', '', bt);
    if (cc) fillRow('Ceiling Cloud', '2', '6', cc);

    var spaceSel = document.getElementById('f-space');
    var spVal = SPACE_MAP[params.get('sp')];
    if (spaceSel && spVal) spaceSel.value = spVal;

    var msgEl = document.getElementById('f-msg');
    var L = params.get('L'), W = params.get('W');
    if (msgEl && L && W) {
      msgEl.value = 'From the room calculator: ' + L + 'ft x ' + W + 'ft room.';
    }

    var note = document.createElement('p');
    note.className = 'calc-breakdown';
    note.style.margin = '0 0 14px';
    note.textContent = 'Pre-filled from your room calculator — review and change anything below before sending.';
    panelBuilder.parentNode.insertBefore(note, panelBuilder);

    return true;
  }

  if (panelBuilder) {
    if (!prefillFromCalculator()) {
      showEmpty();
      addPanelRow(); /* Start with one row */
    }

    if (addRowBtn) {
      addRowBtn.addEventListener('click', function () {
        addPanelRow();
      });
    }
  }

  /* ════════════════════════════════════════════════════════
     7. FORM SUBMIT — Direct WhatsApp only
     No page reload, no email tab, no redirects.
     Opens wa.me link in new tab/window with pre-filled message.
  ════════════════════════════════════════════════════════ */
  var SB_URL = 'https://YOUR-PROJECT-REF.supabase.co';   /* same Project URL as the Business Suite */
  var SB_KEY = 'YOUR-ANON-PUBLIC-KEY';                   /* anon public key only */
  var WA_FALLBACK = 'https://wa.me/919944024230';
  var form     = document.getElementById('cForm');
  var sbtn     = document.getElementById('sbtn');
  var fName    = document.getElementById('f-name');
  var fPhone   = document.getElementById('f-phone');
  var fSpace   = document.getElementById('f-space');
  var fLocation= document.getElementById('f-location');
  var fMsg     = document.getElementById('f-msg');
  var fEmail   = document.getElementById('f-email');
  var errName  = document.getElementById('err-name');
  var errPhone = document.getElementById('err-phone');

  function clearErrors() {
    if (fName)    fName.classList.remove('invalid');
    if (fPhone)   fPhone.classList.remove('invalid');
    if (errName)  errName.classList.remove('show');
    if (errPhone) errPhone.classList.remove('show');
  }

  function isValidPhone(val) {
    return /^[0-9+\s\-]{7,15}$/.test(val.trim());
  }

  if (form && sbtn && fName && fPhone) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();
      var fn = form.querySelector('.form-note');
      if (fn) { if (fn.dataset.orig === undefined) fn.dataset.orig = fn.innerHTML; else fn.innerHTML = fn.dataset.orig; }

      var name     = fName.value.trim();
      var phone    = fPhone.value.trim();
      var space    = fSpace    ? fSpace.value.trim()    : '';
      var location = fLocation ? fLocation.value.trim() : '';
      var msg      = fMsg      ? fMsg.value.trim()      : '';
      var valid    = true;

      if (!name || name.length < 2) {
        fName.classList.add('invalid');
        if (errName) errName.classList.add('show');
        fName.focus();
        valid = false;
      }
      if (!isValidPhone(phone)) {
        fPhone.classList.add('invalid');
        if (errPhone) errPhone.classList.add('show');
        if (valid) fPhone.focus();
        valid = false;
      }
      var emailVal = fEmail ? fEmail.value.trim() : '';
      if (emailVal && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailVal)) {
        var n0 = form.querySelector('.form-note');
        if (n0) n0.textContent = 'Please enter a valid email address, or leave it blank.';
        fEmail.focus();
        valid = false;
      }
      if (!valid) return;

      /* ── Collect panel rows ── */
      var panelLines = [];
      var panels = [];
      var rows = panelBuilder ? panelBuilder.querySelectorAll('.panel-row') : [];
      rows.forEach(function (row, i) {
        var sys   = row.querySelector('.pr-system')  ? row.querySelector('.pr-system').value  : '';
        var ed    = row.querySelector('.pr-edition') ? row.querySelector('.pr-edition').value : '';
        var wd    = row.querySelector('.pr-width')   ? row.querySelector('.pr-width').value   : '';
        var ht    = row.querySelector('.pr-height')  ? row.querySelector('.pr-height').value  : '';
        var th    = row.querySelector('.pr-thick')   ? row.querySelector('.pr-thick').value   : '';
        var qty   = row.querySelector('.pr-quantity')? row.querySelector('.pr-quantity').value: '';

        var parts = [];
        if (sys) parts.push(sys);
        if (ed)  parts.push(ed);
        if (wd && ht) parts.push(wd + ' ft x ' + ht + ' ft');
          else if (wd) parts.push('Width: ' + wd + ' ft');
          else if (ht) parts.push('Height: ' + ht + ' ft');
        if (th)  parts.push(th + ' thick');
        if (qty) parts.push('Qty: ' + qty);

        if (parts.length) {
          panelLines.push('  ' + (i + 1) + '. ' + parts.join(' | '));
          panels.push({ system: sys, edition: ed, width: wd, height: ht, thickness: th, qty: qty, summary: parts.join(' | ') });
        }
      });

      /* ── Submit to Supabase (no WhatsApp/email window) ── */
      var orig = sbtn.innerHTML;
      sbtn.disabled = true; sbtn.textContent = 'Sending\u2026';
      var hdr = { 'Content-Type': 'application/json', apikey: SB_KEY };
      if (/^eyJ/.test(SB_KEY)) hdr.Authorization = 'Bearer ' + SB_KEY; /* legacy JWT anon key; new publishable keys go in apikey only */
      try {
        var r = await fetch(SB_URL + '/rest/v1/rpc/submit_enquiry', { method: 'POST', headers: hdr,
          body: JSON.stringify({ p_name: name, p_phone: phone, p_email: emailVal,
            p_space: space, p_location: location, p_notes: msg, p_panels: panels }) });
        if (!r.ok) throw new Error(await r.text());
        var enquiryId = await r.json();
        /* fire-and-forget: sends the WhatsApp + email alert to the business */
        fetch(SB_URL + '/functions/v1/notify-enquiry', { method: 'POST', headers: hdr, keepalive: true, body: JSON.stringify({ id: enquiryId }) }).catch(function () {});
        sbtn.textContent = 'Request received \u2014 we\u2019ll reply within 24 hours';
        sbtn.classList.add('sent');
        form.reset();
        if (panelBuilder) { panelBuilder.innerHTML = ''; showEmpty(); addPanelRow(); }
        setTimeout(function () { sbtn.innerHTML = orig; sbtn.classList.remove('sent'); sbtn.disabled = false; }, 6000);
      } catch (err) {
        sbtn.innerHTML = orig; sbtn.disabled = false;
        var note = form.querySelector('.form-note');
        if (note) note.innerHTML = 'Sorry, we couldn\u2019t submit that. Please try again, or <a href="' + WA_FALLBACK + '" target="_blank" rel="noopener">message us on WhatsApp</a>.';
      }
    });

    fName.addEventListener('input', function () {
      fName.classList.remove('invalid');
      if (errName) errName.classList.remove('show');
    });
    fPhone.addEventListener('input', function () {
      fPhone.classList.remove('invalid');
      if (errPhone) errPhone.classList.remove('show');
    });
  }

  /* ════════════════════════════════════════════════════════
     8. IMAGE FALLBACK
  ════════════════════════════════════════════════════════ */
  function attachFallbacks() {
    document.querySelectorAll('.img-zone img').forEach(function (img) {
      function showPh() {
        img.style.display = 'none';
        var zone = img.closest('.img-zone');
        var ph   = zone && zone.querySelector('.ph');
        if (ph) ph.style.display = 'flex';
      }
      img.addEventListener('error', showPh);
      if (img.complete && img.naturalWidth === 0) showPh();
    });
  }
  attachFallbacks();

  /* ════════════════════════════════════════════════════════
     9. EDITIONS PANEL — IMAGE SLIDESHOW ON HOVER
  ════════════════════════════════════════════════════════ */
  function initEditionSlideshow() {
    /* touch devices can't hover — auto-advance on visibility + tap-to-advance instead */
    var isTouch = window.matchMedia('(hover: none)').matches;
    document.querySelectorAll('.ed-panel').forEach(function (panel) {
      var slides = Array.from(panel.querySelectorAll('.ed-slide-img'));
      var dots   = Array.from(panel.querySelectorAll('.ed-dot'));
      if (slides.length === 0) return;

      var current = 0;
      var timer   = null;

      function activate(idx) {
        slides[current].classList.remove('ed-slide-active');
        if (dots[current]) dots[current].classList.remove('ed-dot-active');
        current = (idx + slides.length) % slides.length;
        slides[current].classList.add('ed-slide-active');
        if (dots[current]) dots[current].classList.add('ed-dot-active');
      }

      function startSlide() {
        if (timer) return;
        timer = setInterval(function () { activate(current + 1); }, 1800);
      }
      function stopSlide() {
        clearInterval(timer);
        timer = null;
        activate(0);
      }

      if (!slides[0].classList.contains('ed-slide-active')) {
        slides[0].classList.add('ed-slide-active');
        if (dots[0]) dots[0].classList.add('ed-dot-active');
      }

      panel.addEventListener('mouseenter', startSlide);
      panel.addEventListener('mouseleave', stopSlide);
      panel.addEventListener('focus',      startSlide);
      panel.addEventListener('blur',       stopSlide);

      if (isTouch) {
        panel.addEventListener('click', function () { activate(current + 1); });
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { en.isIntersecting ? startSlide() : stopSlide(); });
        }, { threshold: .5 });
        io.observe(panel);
      }
    });
  }
  initEditionSlideshow();

  /* ════════════════════════════════════════════════════════
     10. SUITE SLIDESHOW
  ════════════════════════════════════════════════════════ */
  /* ════════════════════════════════════════════════════════
     11. VIDEO ACCORDION
  ════════════════════════════════════════════════════════ */
  function initVideoAccordion() {
    document.querySelectorAll('.va-item').forEach(function (item) {
      var video = item.querySelector('video');

      if (video) {
        item.addEventListener('mouseenter', function () {
          video.play().catch(function () {});
        });
        item.addEventListener('mouseleave', function () {
          video.pause();
          video.currentTime = 0;
        });
      }

      var label = item.querySelector('.va-label');
      if (label) {
        label.addEventListener('click', function () {
          var isOpen = item.classList.contains('va-open');
          document.querySelectorAll('.va-item.va-open').forEach(function (el) {
            el.classList.remove('va-open');
            var v = el.querySelector('video');
            if (v) { v.pause(); v.currentTime = 0; }
          });
          if (!isOpen) {
            item.classList.add('va-open');
            if (video) video.play().catch(function () {});
          }
        });
      }
    });
  }
  initVideoAccordion();

  /* ════════════════════════════════════════════════════════
     12. FAQ ACCORDION (site-wide — homepage condensed set,
     /faq/ full set, and contextual Q&As on product/service pages)
  ════════════════════════════════════════════════════════ */
  function initFaqAccordion() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', function () {
        item.classList.toggle('open');
      });
    });
  }
  initFaqAccordion();

  /* ════════════════════════════════════════════════════════
     13. STICKY NAV STATE ON PAGES WITHOUT A DARK HERO
     (#nav already solidifies on scroll via onScroll() above;
     pages whose first section isn't dark start solid immediately)
  ════════════════════════════════════════════════════════ */
  (function () {
    var nav = document.getElementById('nav');
    if (nav && !document.querySelector('.pg-head, #hero')) {
      nav.classList.add('solid');
    }
  })();

  /* ════════════════════════════════════════════════════════
     14. ANIMATED STAT COUNTERS
  ════════════════════════════════════════════════════════ */
  function initStatCounters() {
    var counters = document.querySelectorAll('.stat-n[data-count]');
    if (!counters.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) { obs.unobserve(el); return; }
        var steps = 26, i = 0;
        el.textContent = '0';
        var timer = setInterval(function () {
          i++;
          el.textContent = i >= steps ? target : Math.round((target / steps) * i);
          if (i >= steps) clearInterval(timer);
        }, 26);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { obs.observe(el); });
  }
  initStatCounters();

  /* ════════════════════════════════════════════════════════
     15. SUBTLE PARALLAX — hero image
  ════════════════════════════════════════════════════════ */
  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var target = document.querySelector('.hero-right img');
    if (!target || window.innerWidth <= 1100) return;
    var ticking = false;
    function update() {
      var offset = Math.min(window.scrollY * 0.18, 60);
      target.style.transform = 'translateY(' + offset + 'px) scale(1.08)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
  initParallax();

  /* ════════════════════════════════════════════════════════
     16. MAGNETIC TILT CARDS
  ════════════════════════════════════════════════════════ */
  function initTiltCards() {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.hub-card,.prod-card,.tile,.dim-cell').forEach(function (card) {
      var rect = null;
      card.addEventListener('mouseenter', function () { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotateY = (px - 0.5) * 10;
        var rotateX = (0.5 - py) * 8;
        card.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-5px)';
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        rect = null;
      });
    });
  }
  initTiltCards();

  /* ════════════════════════════════════════════════════════
     17. ROOM / PANEL CALCULATOR (Learning Centre)
  ════════════════════════════════════════════════════════ */
  function initRoomCalculator() {
    var wrap = document.getElementById('panelCalc');
    if (!wrap) return;

    var lenEl       = document.getElementById('calc-length');
    var widEl       = document.getElementById('calc-width');
    var typeEl      = document.getElementById('calc-type');
    var surfEl      = document.getElementById('calc-surface');
    var panelSzEl   = document.getElementById('calc-panelsize');
    var trapCntEl   = document.getElementById('calc-traps');
    var panelsEl    = document.getElementById('calcPanels');
    var trapsEl     = document.getElementById('calcTraps');
    var cloudsEl    = document.getElementById('calcClouds');
    var meterFill   = document.getElementById('calcMeterFill');
    var breakdownEl = document.getElementById('calcBreakdown');
    var wallCovEl   = document.getElementById('calcWallCoverage');
    var ceilCovEl   = document.getElementById('calcCeilingCoverage');
    var editionEl   = document.getElementById('calcEdition');
    var thickEl     = document.getElementById('calcThickness');
    var waBtn       = document.getElementById('calcWhatsapp');
    var quoteLinkEl = document.getElementById('calcQuoteLink');

    var TYPE_DATA = {
      studio:  { label: 'Recording / Music Studio',  mult: 1.15, edition: 'Artisan or Signature', thickness: '4"-5"' },
      theatre: { label: 'Home Theatre / Cinema',      mult: 1.10, edition: 'Signature',            thickness: '4"-6"' },
      podcast: { label: 'Podcast / Broadcast Studio', mult: 0.85, edition: 'Core',                 thickness: '3"-4"' },
      office:  { label: 'Office / Meeting Room',      mult: 0.80, edition: 'Core or Artisan',       thickness: '3"' },
      other:   { label: 'Residential / Other',        mult: 0.90, edition: 'Core',                 thickness: '3"-4"' }
    };
    var SURFACE_MULT = { hard: 1.2, mixed: 1.0, soft: 0.85 };

    /* Fixed, real-world spacing — matches how these are actually installed */
    var TRAP_WIDTH_FT   = 17 / 12;  /* 17" corner bass trap footprint        */
    var CORNER_GAP_FT   = 0.5;      /* 6" clearance between trap & 1st panel */
    var PANEL_GAP_FT    = 0.5;      /* 6" gap between adjacent wall panels   */
    var CLOUD_AREA_SQFT = 12;       /* 2ft x 6ft ceiling cloud panel         */

    function animateNumber(el, to) {
      var from = parseInt(el.textContent, 10) || 0;
      if (from === to) { el.textContent = to; return; }
      var steps = 12, i = 0;
      var stepVal = (to - from) / steps;
      clearInterval(el._calcTimer);
      el._calcTimer = setInterval(function () {
        i++;
        el.textContent = i >= steps ? to : Math.round(from + stepVal * i);
        if (i >= steps) clearInterval(el._calcTimer);
      }, 22);
    }

    /* How many panels fit along one wall run, given how many of its two
       ends sit at a corner that carries a bass trap (0, 1 or 2 ends). */
    function panelsOnWall(wallLengthFt, trapEnds, panelWidthFt) {
      var usable = wallLengthFt - trapEnds * (TRAP_WIDTH_FT + CORNER_GAP_FT);
      if (usable <= 0) return 0;
      var n = Math.floor((usable + PANEL_GAP_FT) / (panelWidthFt + PANEL_GAP_FT));
      return Math.max(0, n);
    }

    function calculate() {
      var L = Math.min(Math.max(parseFloat(lenEl.value) || 10, 4), 80);
      var W = Math.min(Math.max(parseFloat(widEl.value) || 10, 4), 80);
      var type = TYPE_DATA[typeEl.value] || TYPE_DATA.other;
      var surfMult = SURFACE_MULT[surfEl.value] != null ? SURFACE_MULT[surfEl.value] : 1;
      var panelWidthFt = parseFloat(panelSzEl.value) || 2;
      var trapCount = parseInt(trapCntEl.value, 10) || 2;

      /* ── Wall panels: walked per wall, not guessed from total area ──
         Width (W) walls are front/back; Length (L) walls are the two
         sides. At the 2-trap baseline, only the front wall's two ends
         and each side wall's front-facing end sit at a trapped corner;
         at 4 traps every wall is bounded by a trap at both ends. */
      var frontEnds, sideEnds, backEnds;
      if (trapCount >= 4) {
        frontEnds = 2; sideEnds = 2; backEnds = 2;
      } else {
        frontEnds = 2; sideEnds = 1; backEnds = 0;
      }
      var frontPanels = panelsOnWall(W, frontEnds, panelWidthFt);
      var backPanels  = panelsOnWall(W, backEnds, panelWidthFt);
      var side1Panels = panelsOnWall(L, sideEnds, panelWidthFt);
      var side2Panels = panelsOnWall(L, sideEnds, panelWidthFt);
      var panels = Math.max(2, frontPanels + backPanels + side1Panels + side2Panels);

      /* ── Corner bass traps: directly from the selector, not guessed ── */
      var traps = trapCount;

      /* ── Ceiling clouds: % of ceiling area, nudged by type/surface ── */
      var ceilingArea = L * W;
      var cloudCoveragePct = Math.min(0.45, Math.max(0.12, 0.25 * type.mult * surfMult));
      var clouds = Math.max(1, Math.round((ceilingArea * cloudCoveragePct) / CLOUD_AREA_SQFT));

      /* ── Coverage %, shown so the numbers above aren't a black box ── */
      var totalWallLength = 2 * L + 2 * W;
      var coveredWallLength = panels * panelWidthFt + traps * TRAP_WIDTH_FT;
      var wallCoveragePct = Math.min(100, Math.round((coveredWallLength / totalWallLength) * 100));
      var ceilingCoveragePct = Math.round(cloudCoveragePct * 100);

      animateNumber(panelsEl, panels);
      animateNumber(trapsEl, traps);
      animateNumber(cloudsEl, clouds);

      var level = Math.max(12, Math.min(100, wallCoveragePct));
      meterFill.style.width = level + '%';

      editionEl.textContent = type.edition;
      thickEl.textContent = type.thickness;
      if (wallCovEl) wallCovEl.textContent = wallCoveragePct + '%';
      if (ceilCovEl) ceilCovEl.textContent = ceilingCoveragePct + '%';

      if (breakdownEl) {
        breakdownEl.innerHTML =
          '<strong>How we got this:</strong> 4 walls (2×' + L + 'ft, 2×' + W + 'ft) fitted with ' +
          panelWidthFt + 'ft panels, 6&quot; gaps → ' + panels + ' wall panels. ' +
          traps + ' corner bass trap' + (traps === 1 ? '' : 's') + ' (17&quot; each, ' +
          (trapCount >= 4 ? 'all 4 corners' : 'front 2 corners') + '). ' +
          clouds + ' ceiling clouds (2&times;6ft) over about ' + ceilingCoveragePct + '% of the ceiling.';
      }

      if (waBtn) {
        var msg = [
          'Hi Carve & Curve, I used the room calculator and would like a quote.',
          'Room: ' + L + 'ft x ' + W + 'ft (' + type.label + ')',
          'Estimated: ' + panels + ' wall panels (' + panelWidthFt + 'ft size), ' + traps + ' corner bass traps, ' + clouds + ' ceiling cloud panels',
          'Coverage: ~' + wallCoveragePct + '% of wall length, ~' + ceilingCoveragePct + '% of ceiling',
          'Suggested edition: ' + type.edition
        ].join('\n');
        waBtn.href = 'https://wa.me/919944024230?text=' + encodeURIComponent(msg);
      }

      if (quoteLinkEl) {
        var EDITION_KEY = {
          'Core': 'core',
          'Signature': 'signature',
          'Artisan or Signature': 'unsure',
          'Core or Artisan': 'unsure'
        };
        var edKey = EDITION_KEY[type.edition] || 'unsure';
        var thKey = parseInt(type.thickness, 10) || 3;
        var q = 'qr=1&wp=' + panels + '&psz=' + panelWidthFt + '&bt=' + traps + '&cc=' + clouds +
          '&ed=' + edKey + '&th=' + thKey + '&L=' + L + '&W=' + W + '&sp=' + typeEl.value;
        quoteLinkEl.href = 'contact.html?' + q;
      }
    }

    [lenEl, widEl, typeEl, surfEl, panelSzEl, trapCntEl].forEach(function (el) {
      if (el) el.addEventListener('input', calculate);
    });
    calculate();
  }
  initRoomCalculator();

  /* ════════════════════════════════════════════════════════
     18. IMAGE LIGHTBOX — click any content photo to view it
     full-size. Deliberately excludes: the homepage hero photo
     (.hero-media), the Core/Artisan/Signature edition
     slideshow (.ed-slide-img / .ed-panel-bg), every pinned
     page-header photo (.pg-head / .media-pin), and "Our Work"
     project tiles (.work-photo) — those get their own scoped
     mini-gallery instead (section 19), reusing this same
     overlay so there's only ever one lightbox on the page.
  ════════════════════════════════════════════════════════ */
  var lightboxOpen = null; /* assigned once the shared overlay exists */

  function buildLightbox() {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Close">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous image">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<button type="button" class="lightbox-nav lightbox-next" aria-label="Next image">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</button>' +
      '<figure class="lightbox-figure">' +
        '<img class="lightbox-img" alt="">' +
        '<figcaption class="lightbox-caption"></figcaption>' +
      '</figure>';
    document.body.appendChild(overlay);

    var boxImg   = overlay.querySelector('.lightbox-img');
    var boxCap   = overlay.querySelector('.lightbox-caption');
    var closeBtn = overlay.querySelector('.lightbox-close');
    var prevBtn  = overlay.querySelector('.lightbox-prev');
    var nextBtn  = overlay.querySelector('.lightbox-next');
    var list     = [];
    var current  = -1;
    var lastFocused = null;

    function show(index) {
      current = (index + list.length) % list.length;
      boxImg.src = list[current].src;
      boxImg.alt = list[current].alt || '';
      boxCap.textContent = list[current].alt || '';
      var multi = list.length > 1;
      prevBtn.style.display = nextBtn.style.display = multi ? '' : 'none';
    }

    function open(images, index) {
      if (!images || !images.length) return;
      list = images;
      lastFocused = document.activeElement;
      show(index);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      boxImg.src = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft')  show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    return open;
  }

  function initLightbox() {
    var eligible = Array.prototype.slice.call(document.querySelectorAll('img')).filter(function (img) {
      if (img.classList.contains('ed-slide-img')) return false;
      if (img.closest('.hero-media, .pg-head, .ed-panel-bg, .media-pin, .work-photo')) return false;
      return true;
    });
    if (!eligible.length) return;

    eligible.forEach(function (img) { img.classList.add('lightbox-trigger'); });

    /* Mirror the custom-cursor hover state onto these images too,
       the same way other clickable elements get it in section 1. */
    var cur = document.getElementById('cur'), ring = document.getElementById('cur-ring');
    if (cur && ring && window.matchMedia('(pointer:fine)').matches) {
      eligible.forEach(function (img) {
        img.addEventListener('mouseenter', function () { cur.classList.add('hover'); ring.classList.add('hover'); });
        img.addEventListener('mouseleave', function () { cur.classList.remove('hover'); ring.classList.remove('hover'); });
      });
    }

    if (!lightboxOpen) lightboxOpen = buildLightbox();
    var images = eligible.map(function (img) {
      return { src: img.currentSrc || img.src, alt: img.alt || '' };
    });

    eligible.forEach(function (img, i) {
      img.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        lightboxOpen(images, i);
      });
    });
  }
  initLightbox();

  /* ════════════════════════════════════════════════════════
     19. PROJECT GALLERY ("Our Work") — each .work-photo tile
     is one project. It always shows its own <img> as the cover
     photo. To add more photos to that same project, list their
     paths on the tile's opening div:

       <div class="work-photo ..." data-more-images="assets/projects/a.jpg|assets/projects/b.jpg">

     (pipe-separated, as many as needed). A tile with extra
     photos gets a small photo-count badge, and clicking it opens
     the same lightbox as above, scoped to just that project's
     own photos — prev/next never wanders into other projects.
     A tile with no data-more-images works exactly as before.
  ════════════════════════════════════════════════════════ */
  function initProjectGallery() {
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.work-photo'));
    if (!tiles.length) return;
    if (!lightboxOpen) lightboxOpen = buildLightbox();

    var cur = document.getElementById('cur'), ring = document.getElementById('cur-ring');
    var mirrorCursor = !!(cur && ring && window.matchMedia('(pointer:fine)').matches);

    tiles.forEach(function (tile) {
      var cover = tile.querySelector('img');
      if (!cover) return;
      var label = tile.querySelector('.work-photo-label');
      var alt   = cover.alt || (label ? label.textContent : '');

      var images = [{ src: cover.currentSrc || cover.src, alt: alt }];
      (tile.dataset.moreImages || '').split('|')
        .map(function (s) { return s.trim(); })
        .filter(Boolean)
        .forEach(function (src) { images.push({ src: src, alt: alt }); });

      if (images.length > 1) {
        var badge = document.createElement('span');
        badge.className = 'work-photo-count';
        badge.setAttribute('aria-hidden', 'true');
        badge.innerHTML =
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.5-3h5L16 7"/></svg><span>' +
          images.length + '</span>';
        tile.appendChild(badge);
      }

      tile.classList.add('lightbox-trigger');
      if (mirrorCursor) {
        tile.addEventListener('mouseenter', function () { cur.classList.add('hover'); ring.classList.add('hover'); });
        tile.addEventListener('mouseleave', function () { cur.classList.remove('hover'); ring.classList.remove('hover'); });
      }

      tile.addEventListener('click', function (e) {
        e.preventDefault();
        lightboxOpen(images, 0);
      });
    });
  }
  initProjectGallery();

})();
