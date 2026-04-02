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
  const form = document.getElementById('cForm');
  const sbtn = document.getElementById('sbtn');
  if (form && sbtn) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      sbtn.textContent = 'Message Sent ✓';
      sbtn.classList.add('sent');
      sbtn.disabled = true;
    });
  }

  /* ── IMAGE FALLBACK ─────────────────────────────────────── */
  /* If a photo hasn't been added yet, show the named placeholder instead */
  document.querySelectorAll('.img-zone img').forEach(img => {
    const showPlaceholder = () => {
      img.style.display = 'none';
      const ph = img.closest('.img-zone')?.querySelector('.ph');
      if (ph) ph.style.display = 'flex';
    };
    img.addEventListener('error', showPlaceholder);
    /* Already failed (cached 404) */
    if (img.complete && !img.naturalWidth) showPlaceholder();
  });

});
