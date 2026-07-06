// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      // Optional: animate hamburger to X
      const spans = this.querySelectorAll('path');
      if (!mobileMenu.classList.contains('hidden')) {
        // Change to X
        this.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>`;
      } else {
        // Revert to hamburger
        this.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>`;
      }
    });
  }

  // Close mobile menu when clicking a link
  const mobileLinks = document.querySelectorAll('#mobileMenu a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.add('hidden');
      // Reset hamburger icon
      if (menuButton) {
        menuButton.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>`;
      }
    });
  });

  // Smooth scroll for anchor links (in case default doesn't work)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Intersection Observer for scroll animations (optional)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0');
        entry.target.classList.remove('opacity-0', 'translate-y-4');
      }
    });
  }, observerOptions);

  // Observe feature cards and about section
  document.querySelectorAll('#features .grid > div, #about .grid > div').forEach(el => {
    el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700', 'ease-out');
    observer.observe(el);
  });
});

// Console greeting (fun Easter egg)
console.log('%c🎮 LEVELUP TECH', 'font-size: 20px; font-weight: bold; color: #00E5FF;');
console.log('%cAuthentication & dashboards for gamers', 'font-size: 14px; color: #b0b0b0;');
