document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navContainer = document.getElementById('navContainer');

    // Create and add menu header with logo
    if (navContainer) {
        const menuHeader = document.createElement('div');
        menuHeader.className = 'menu-header';
        menuHeader.innerHTML = `
            <div class="menu-logo">
                <img src="assets/images/logo1.png" alt="Triple S Logo">
            </div>
            <div class="menu-title">Student Study Support</div>
        `;
        navContainer.prepend(menuHeader);

        // Add social links at the bottom of the menu
        const socialLinks = document.createElement('div');
        socialLinks.className = 'menu-social-links';
        socialLinks.innerHTML = `
            <a href="https://www.instagram.com/srujan_shetty_0007/" class="menu-social-icon" target="_blank">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/srujan-shetty0007/" class="menu-social-icon" target="_blank">
                <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="https://github.com/srujanshetty0007" class="menu-social-icon" target="_blank">
                <i class="fab fa-github"></i>
            </a>
        `;
        navContainer.appendChild(socialLinks);
    }

    // Add active class to current page link
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage ||
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === '/' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });

    if (mobileMenuButton && navContainer) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            navContainer.classList.toggle('active');

            // Add body class to prevent scrolling when menu is open
            document.body.classList.toggle('menu-open');

            // Add animation delay to each menu item
            const navLinks = document.querySelectorAll('.nav-links li');
            if (navContainer.classList.contains('active')) {
                navLinks.forEach((link, index) => {
                    link.style.transitionDelay = `${0.1 + index * 0.1}s`;
                });
            } else {
                navLinks.forEach(link => {
                    link.style.transitionDelay = '0s';
                });
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !navContainer.contains(e.target) && navContainer.classList.contains('active')) {
                mobileMenuButton.classList.remove('active');
                navContainer.classList.remove('active');
                document.body.classList.remove('menu-open');

                // Reset transition delays
                const navLinks = document.querySelectorAll('.nav-links li');
                navLinks.forEach(link => {
                    link.style.transitionDelay = '0s';
                });
            }
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuButton.classList.remove('active');
                navContainer.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
});
