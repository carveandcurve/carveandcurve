/* ============================================================
   CARVE & CURVE  —  script.js
   ============================================================ */
(function () {
  'use strict';

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
      '.suite-comp,.dim-cell,.bfeat,.testi-card,.va-item,' +
      '.pill,.ed-panel,.client-card,.suite-dot,.clients-cta,.suite-result'
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
    'Artisan — Pine Frame, Single-tone',
    'Signature — Pine Frame, Dual-tone',
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

  if (panelBuilder) {
    showEmpty();
    addPanelRow(); /* Start with one row */

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
  var form     = document.getElementById('cForm');
  var sbtn     = document.getElementById('sbtn');
  var fName    = document.getElementById('f-name');
  var fPhone   = document.getElementById('f-phone');
  var fSpace   = document.getElementById('f-space');
  var fLocation= document.getElementById('f-location');
  var fMsg     = document.getElementById('f-msg');
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
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

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
      if (!valid) return;

      /* ── Collect panel rows ── */
      var panelLines = [];
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
        }
      });

      /* ── Build WhatsApp message ── */
      var lines = [
        '*New Enquiry \u2014 Carve & Curve*',
        ''
      ];
      lines.push('*Name:* ' + name);
      lines.push('*Phone:* ' + phone);
      if (space)    lines.push('*Space Type:* ' + space);
      if (location) lines.push('*Location:* ' + location);
      if (panelLines.length) {
        lines.push('');
        lines.push('*Panel Requirements:*');
        panelLines.forEach(function (l) { lines.push(l); });
      }
      if (msg) {
        lines.push('');
        lines.push('*Additional Notes:* ' + msg);
      }

      var waText = lines.join('\n');
      var waURL  = 'https://wa.me/918778459236?text=' + encodeURIComponent(waText);

      /* ── Open WhatsApp directly — no email, no redirect ── */
      window.open(waURL, '_blank');

      /* ── Update button ── */
      sbtn.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px"><polyline points="20 6 9 17 4 12"/></svg>' +
        'Sent! Opening WhatsApp\u2026';
      sbtn.classList.add('sent');
      sbtn.disabled = true;

      /* Reset after 5 seconds */
      setTimeout(function () {
        sbtn.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>' +
          'Send on WhatsApp';
        sbtn.classList.remove('sent');
        sbtn.disabled = false;
        form.reset();
        /* Reset panel builder */
        if (panelBuilder) {
          panelBuilder.innerHTML = '';
          showEmpty();
          addPanelRow();
        }
      }, 5000);
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
    });
  }
  initEditionSlideshow();

  /* ════════════════════════════════════════════════════════
     10. SUITE SLIDESHOW
  ════════════════════════════════════════════════════════ */
  function initSuiteSlideshow() {
    var suiteEl = document.querySelector('.suite-slideshow');
    if (!suiteEl) return;

    var slides = Array.from(suiteEl.querySelectorAll('.suite-slide'));
    var dots   = Array.from(suiteEl.querySelectorAll('.suite-dot'));
    if (slides.length === 0) return;

    var current = 0;
    var timer   = null;

    function goTo(idx) {
      slides[current].classList.remove('suite-slide-active');
      if (dots[current]) dots[current].classList.remove('suite-dot-active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('suite-slide-active');
      if (dots[current]) dots[current].classList.add('suite-dot-active');
    }

    function startAuto() {
      if (timer) return;
      timer = setInterval(function () { goTo(current + 1); }, 2000);
    }
    function stopAuto() { clearInterval(timer); timer = null; }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        goTo(i);
        stopAuto();
        startAuto();
      });
    });

    var wrap = suiteEl.closest('.suite-wrap') || suiteEl.parentElement;
    wrap.addEventListener('mouseenter', startAuto);
    wrap.addEventListener('mouseleave', stopAuto);

    if (!slides[0].classList.contains('suite-slide-active')) {
      slides[0].classList.add('suite-slide-active');
      if (dots[0]) dots[0].classList.add('suite-dot-active');
    }
  }
  initSuiteSlideshow();

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
     12. CLIENTS — JSON-DRIVEN RENDERING
  ════════════════════════════════════════════════════════ */
  
})();
