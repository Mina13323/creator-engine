// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggleButton && navLinks) {
        toggleButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            // Optional: aria-expanded
            const isExpanded = navLinks.classList.contains('active');
            toggleButton.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                toggleButton.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navLinks.contains(event.target) || toggleButton.contains(event.target);
            if (!isClickInside && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth scroll for anchor links (fallback for browsers without CSS scroll-behavior)
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});
