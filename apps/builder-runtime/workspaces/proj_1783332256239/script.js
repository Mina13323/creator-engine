document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const navLinkElements = document.querySelectorAll('.nav-link');

  // Toggle mobile menu
  menuToggle.addEventListener('click', function() {
    navLinks.classList.toggle('active');
  });

  // Close menu on link click (mobile)
  navLinkElements.forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('active');
    });
  });

  // Smooth scrolling for navigation links
  navLinkElements.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 64, // offset for fixed header
          behavior: 'smooth'
        });
      }
    });
  });

  // Highlight active section on scroll
  const sections = document.querySelectorAll('section');
  window.addEventListener('scroll', function() {
    let current = '';
    sections.forEach(function(section) {
      const sectionTop = section.offsetTop - 80;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinkElements.forEach(function(link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // Animate stat numbers (optional simple counter)
  const stats = document.querySelectorAll('.stat-value');
  function animateStats() {
    stats.forEach(function(stat) {
      const text = stat.textContent;
      const numeric = parseInt(text.replace(/[^0-9]/g, ''));
      if (isNaN(numeric)) return;
      let current = 0;
      const increment = Math.ceil(numeric / 60);
      const timer = setInterval(function() {
        current += increment;
        if (current >= numeric) {
          current = numeric;
          clearInterval(timer);
        }
        stat.textContent = current + '+';
      }, 30);
    });
  }

  // Intersection Observer to trigger animation when about section is visible
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(aboutSection);
  }
});