/* ============================================================
   CARVE & CURVE  —  script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── CUSTOM CURSOR ──────────────────────────────────────── */
  const cur  = document.getElementById('cur');
  const ring = document.getElementById('cur-ring');

  if (cur && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.left = mx + 'px';
      cur.style.top  = my + 'px';
    });

    /* Smooth-follow ring */
    (function loop() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(loop);
    })();

    /* Expand cursor on interactive elements */
    const interactiveEls = document.querySelectorAll(
      'a, button, .edition-card, .channel, .pillar, .p-card, .benefit-card, .suite-comp, .dim-cell, .bfeat'
    );
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => { cur.classList.add('big'); ring.classList.add('big'); });
      el.addEventListener('mouseleave', () => { cur.classList.remove('big'); ring.classList.remove('big'); });
    });
  }

  /* ── NAV SCROLL STATE ───────────────────────────────────── */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('solid', window.scrollY > 70);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* run once on load */
  }

  /* ── MOBILE HAMBURGER MENU ──────────────────────────────── */
  const ham = document.getElementById('ham');
  const mob = document.getElementById('mobile-menu');

  if (ham && mob) {
    ham.addEventListener('click', () => {
      const isOpen = mob.classList.toggle('open');
      ham.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close when any mobile link is tapped */
    mob.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        ham.classList.remove('open');
        mob.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── SCROLL REVEAL ──────────────────────────────────────── */
  const revealObs = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target); /* fire once */
      }
    }),
    { threshold: 0.09, rootMargin: '0px 0px -36px 0px' }
  );
  document.querySelectorAll('.rw').forEach(el => revealObs.observe(el));

  /* ── SMOOTH ANCHOR SCROLL ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ── ENQUIRY FORM ───────────────────────────────────────── */
  /*
   * On submit:
   *  1. Validates name (required) and phone (required, digits only)
   *  2. Opens WhatsApp chat to +918778459236 with message pre-filled
   *  3. Opens Gmail mailto to carveandcurve1@gmail.com with details pre-filled
   */
  const form  = document.getElementById('cForm');
  const sbtn  = document.getElementById('sbtn');
  const fName  = document.getElementById('f-name');
  const fPhone = document.getElementById('f-phone');
  const fSpace = document.getElementById('f-space');
  const fMsg   = document.getElementById('f-msg');
  const errName  = document.getElementById('err-name');
  const errPhone = document.getElementById('err-phone');

  function clearErrors() {
    [fName, fPhone].forEach(el => el.classList.remove('invalid'));
    [errName, errPhone].forEach(el => el.classList.remove('show'));
  }

  function validatePhone(val) {
    /* Accept formats like +91 98765 43210, 9876543210, +919876543210 */
    return /^[0-9+\s\-]{7,15}$/.test(val.trim());
  }

  if (form && sbtn) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      clearErrors();

      const name  = fName.value.trim();
      const phone = fPhone.value.trim();
      const space = fSpace ? fSpace.value : '';
      const msg   = fMsg ? fMsg.value.trim() : '';

      let valid = true;

      if (!name || name.length < 2) {
        fName.classList.add('invalid');
        errName.classList.add('show');
        fName.focus();
        valid = false;
      }

      if (!validatePhone(phone)) {
        fPhone.classList.add('invalid');
        errPhone.classList.add('show');
        if (valid) fPhone.focus();
        valid = false;
      }

      if (!valid) return;

      /* ── Build message text ── */
      const lines = [
        `*New Enquiry — Carve & Curve*`,
        ``,
        `*Name:* ${name}`,
        `*Phone:* ${phone}`,
        space ? `*Space Type:* ${space}` : null,
        msg   ? `*Project Details:* ${msg}` : null,
      ].filter(l => l !== null).join('\n');

      /* ── 1. Open WhatsApp ── */
      const waURL = `https://wa.me/918778459236?text=${encodeURIComponent(lines)}`;
      window.open(waURL, '_blank');

      /* ── 2. Open Gmail mailto ── */
      const subject = `Acoustic Panel Enquiry — ${name}`;
      const body = [
        `Name: ${name}`,
        `Phone: ${phone}`,
        space ? `Space Type: ${space}` : null,
        msg   ? `Project Details:\n${msg}` : null,
      ].filter(l => l !== null).join('\n');

      const mailURL = `mailto:carveandcurve1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      /* Small delay so both popups don't fight each other */
      setTimeout(() => { window.location.href = mailURL; }, 600);

      /* ── Update button ── */
      sbtn.textContent = 'Sent! Check WhatsApp & Email ✓';
      sbtn.classList.add('sent');
      sbtn.disabled = true;
      form.reset();
    });

    /* Clear individual field error on input */
    fName.addEventListener('input', () => {
      fName.classList.remove('invalid');
      errName.classList.remove('show');
    });
    fPhone.addEventListener('input', () => {
      fPhone.classList.remove('invalid');
      errPhone.classList.remove('show');
    });
  }

  /* ── IMAGE FALLBACK ─────────────────────────────────────── */
  /*
   * .ph placeholders are hidden via CSS (display:none) by default.
   * They only appear here when an image actually fails to load.
   * Real photos in /assets/ always show correctly — no JS needed to show them.
   */
  document.querySelectorAll('.img-zone img').forEach(img => {
    const showPlaceholder = () => {
      img.style.display = 'none';
      const ph = img.closest('.img-zone')?.querySelector('.ph');
      if (ph) ph.style.display = 'flex';
    };

    /* Listen for future load errors */
    img.addEventListener('error', showPlaceholder);

    /* Handle images that already failed before this script ran */
    if (img.complete && img.naturalWidth === 0) {
      showPlaceholder();
    }
  });

});
