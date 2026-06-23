/* ============================================================
   TIRTHESH JAIN PORTFOLIO — PREMIUM JAVASCRIPT
   ============================================================ */

'use strict';

// ============================================================
// LOADER
// ============================================================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initAnimations();
  }, 300); // Drastically reduced for near-instant load
});

document.body.style.overflow = 'hidden';

// ============================================================
// CUSTOM CURSOR
// ============================================================
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  // Disable custom cursor only on actual mobile screen widths or devices without hover capability
  if (window.innerWidth <= 768 || !window.matchMedia('(hover: hover)').matches) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    raf = requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });

  // Magnetic hover on interactive elements
  document.querySelectorAll('a, button, .stat-card, .tool-card, .expertise-card, .magnetic-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      follower.style.width = '56px';
      follower.style.height = '56px';
      follower.style.borderColor = 'rgba(37,99,235,0.6)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '12px';
      cursor.style.height = '12px';
      follower.style.width = '40px';
      follower.style.height = '40px';
      follower.style.borderColor = 'rgba(37,99,235,0.5)';
    });
  });
})();

// ============================================================
// PARTICLES
// ============================================================
(function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const count = 16;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = Math.random() * 8 + 8;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
    `;
    container.appendChild(p);
  }
})();

// ============================================================
// NAVIGATION
// ============================================================
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  if (!nav) return;

  // Scroll behavior
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastY = y;
    updateActiveLink();
  }, { passive: true });

  // Mobile hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active link tracking
  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    links.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  updateActiveLink();
})();

// ============================================================
// BACK TO TOP
// ============================================================
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ============================================================
// SCROLL REVEAL
// ============================================================
function initAnimations() {
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}

// ============================================================
// COUNTER ANIMATIONS
// ============================================================
(function initCounters() {
  const counters = document.querySelectorAll('.stat-value[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const isDecimal = el.dataset.decimal === 'true';
      const duration = 1800;
      let startTime = null;

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = easeOutCubic(progress);
        const current = target * eased;

        if (isDecimal) {
          el.textContent = current.toFixed(2) + suffix;
        } else {
          el.textContent = Math.floor(current) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.textContent = (isDecimal ? target.toFixed(2) : target) + suffix;
        }
      }

      requestAnimationFrame(animate);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
})();

// ============================================================
// SKILL BARS ANIMATION
// ============================================================
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      const width = bar.dataset.width || 80;
      bar.style.setProperty('--target-width', width);
      bar.classList.add('animated');
      observer.unobserve(bar);
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

// ============================================================
// CERTIFICATION PROGRESS BARS
// ============================================================
(function initCertBars() {
  const bars = document.querySelectorAll('.cert-progress-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

// ============================================================
// SKILLS RADAR CHART
// ============================================================
(function initRadarChart() {
  const canvas = document.getElementById('skills-radar');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Set actual size
  const size = 400;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const radius = 150;

  const skills = [
    { label: 'Google Ads', value: 0.88 },
    { label: 'Meta Ads', value: 0.85 },
    { label: 'PPC', value: 0.87 },
    { label: 'Lead Gen', value: 0.90 },
    { label: 'Analytics', value: 0.82 },
    { label: 'SEO', value: 0.75 },
    { label: 'Growth', value: 0.80 },
  ];

  const total = skills.length;
  const angleStep = (Math.PI * 2) / total;
  const startAngle = -Math.PI / 2;

  let animProgress = 0;
  let raf;
  let hasStarted = false;

  function getPoint(i, r) {
    const angle = startAngle + i * angleStep;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  function drawRadar(progress) {
    ctx.clearRect(0, 0, size, size);

    // Draw web
    for (let ring = 1; ring <= 5; ring++) {
      const r = (radius * ring) / 5;
      ctx.beginPath();
      for (let i = 0; i < total; i++) {
        const pt = getPoint(i, r);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes
    for (let i = 0; i < total; i++) {
      const pt = getPoint(i, radius);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pt.x, pt.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw data
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(37,99,235,0.4)');
    gradient.addColorStop(1, 'rgba(37,99,235,0.05)');

    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const r = radius * skills[i].value * progress;
      const pt = getPoint(i, r);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(37,99,235,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < total; i++) {
      const r = radius * skills[i].value * progress;
      const pt = getPoint(i, r);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#2563EB';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw labels
    ctx.font = '600 12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < total; i++) {
      const pt = getPoint(i, radius + 26);
      ctx.fillText(skills[i].label, pt.x, pt.y);
    }
  }

  function animate(timestamp) {
    if (!animate.start) animate.start = timestamp;
    const elapsed = timestamp - animate.start;
    const duration = 1000;
    animProgress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - animProgress, 3);
    drawRadar(eased);
    if (animProgress < 1) {
      raf = requestAnimationFrame(animate);
    }
  }

  // Initial draw at 0
  drawRadar(0);

  // Animate on intersection
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasStarted) {
      hasStarted = true;
      animate.start = null;
      raf = requestAnimationFrame(animate);
      observer.unobserve(canvas);
    }
  }, { threshold: 0.3 });

  observer.observe(canvas);
})();

// ============================================================
// CONTACT FORM
// ============================================================
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successEl = document.getElementById('form-success');
  const errorEl = document.getElementById('form-error');
  const submitBtn = document.getElementById('form-submit-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Hide previous messages
    if (successEl) successEl.hidden = true;
    if (errorEl) errorEl.hidden = true;

    // Validate
    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const subject = form.querySelector('#contact-subject').value;
    const message = form.querySelector('#contact-message').value.trim();

    if (!name || !email || !subject || !message) {
      if (errorEl) errorEl.hidden = false;
      return;
    }

    if (!isValidEmail(email)) {
      if (errorEl) {
        errorEl.querySelector
          ? errorEl.textContent = 'Please enter a valid email address.'
          : null;
        errorEl.hidden = false;
      }
      return;
    }

    // Send actual email using Formsubmit.co API
    if (submitBtn) {
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;
    }

    fetch('https://formsubmit.co/ajax/sukhadiyatirthesh5@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Name: name,
        Email: email,
        Subject: subject,
        Message: message,
        _template: 'box' // Makes the email look nice
      })
    })
    .then(response => response.json())
    .then(data => {
      if (successEl) successEl.hidden = false;
      form.reset();
      if (submitBtn) {
        submitBtn.textContent = '🚀 Let\'s Build Growth Together';
        submitBtn.disabled = false;
      }
    })
    .catch(error => {
      if (errorEl) {
        errorEl.textContent = 'Something went wrong. Please try again or email directly.';
        errorEl.hidden = false;
      }
      if (submitBtn) {
        submitBtn.textContent = '🚀 Let\'s Build Growth Together';
        submitBtn.disabled = false;
      }
    });
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
})();

// ============================================================
// SMOOTH SCROLLING
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ============================================================
// TILT EFFECT ON STAT CARDS
// ============================================================
(function initTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ============================================================
// CASE STUDY DUAL BARS — INTERSECTION ANIMATION
// ============================================================
(function initDualBars() {
  const cards = document.querySelectorAll('.cs-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.cs-dual-bar').forEach(bar => {
          bar.style.width = bar.style.getPropertyValue('--w') || '0%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => observer.observe(c));
})();

// ============================================================
// INPUT FOCUS ANIMATIONS
// ============================================================
document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    input.parentElement.classList.remove('focused');
  });
});

// ============================================================
// MAGNETIC BUTTONS — MOUSE TRACKING 3D TILT
// ============================================================
(function initMagneticButtons() {
  const btns = document.querySelectorAll('.magnetic-btn');
  if (!btns.length) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = 0.3;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.1s ease';
    });
  });
})();

// ============================================================
// PERFORMANCE — PASSIVE EVENT LISTENERS
// ============================================================
window.addEventListener('scroll', () => {}, { passive: true });
window.addEventListener('touchstart', () => {}, { passive: true });

// ============================================================
// LOG SUPPRESSION (PRODUCTION)
// ============================================================
window.addEventListener('error', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    e.preventDefault();
  }
}, true);
