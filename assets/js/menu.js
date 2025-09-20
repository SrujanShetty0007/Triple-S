document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const navContainer = document.getElementById('navContainer');
    const body = document.body;

    if (mobileMenuButton && navContainer) {
        // Toggle mobile menu
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            navContainer.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navContainer.classList.contains('active') &&
                !mobileMenuButton.contains(e.target) &&
                !navContainer.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-links a:not(.dropbtn)');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navContainer.classList.contains('active')) {
                closeMenu();
            }
        });

        // Dropdown functionality
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const dropbtn = dropdown.querySelector('.dropbtn');

            if (dropbtn) {
                dropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                        }
                    });

                    dropdown.classList.toggle('active');
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }

    function closeMenu() {
        mobileMenuButton.classList.remove('active');
        navContainer.classList.remove('active');
        body.classList.remove('menu-open');
    }
});
