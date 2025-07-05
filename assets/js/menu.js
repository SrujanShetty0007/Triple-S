document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navContainer = document.getElementById('navContainer');
    const body = document.body;

    if (mobileMenuButton && navContainer) {
        // Toggle menu when button is clicked
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            navContainer.classList.toggle('active');
            body.classList.toggle('menu-open'); // Prevent scrolling when menu is open
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navContainer.classList.contains('active') &&
                !mobileMenuButton.contains(e.target) &&
                !navContainer.contains(e.target)) {
                mobileMenuButton.classList.remove('active');
                navContainer.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuButton.classList.remove('active');
                navContainer.classList.remove('active');
                body.classList.remove('menu-open');
            });
        });

        // Close menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navContainer.classList.contains('active')) {
                mobileMenuButton.classList.remove('active');
                navContainer.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    }
});
