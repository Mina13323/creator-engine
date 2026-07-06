// ===== Mobile Menu Toggle =====
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });

    // Close menu on link click (mobile)
    navLinks.querySelectorAll('.nav-link, .btn').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // ===== Active Nav Link Highlighting =====
  const sections = document.querySelectorAll('section[id]');
  const navLinksArr = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinksArr.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // ===== Fade-In Animations on Scroll =====
  const fadeElements = document.querySelectorAll('.card-elevated, .stat-item, .about-text, .hero-content');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  fadeElements.forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
  });

  // ===== Interactive Progress Bar on Hero =====
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    // Animate on load
    setTimeout(() => {
      progressFill.style.width = '75%';
    }, 500);
  }

  // ===== Smooth Scroll for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
});