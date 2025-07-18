document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to the hero section
    const hero = document.querySelector('.hero');
    hero.style.opacity = '0';
    setTimeout(() => {
        hero.style.transition = 'opacity 0.8s ease';
        hero.style.opacity = '1';
    }, 100);

    // Enhanced subject card animations
    const subjectCards = document.querySelectorAll('.subject-card');

    // Add staggered animation to cards
    subjectCards.forEach((card, index) => {
        // Add slight delay for each card
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 50));

    });

    // Add animation for coming soon badges
    const comingSoonBadges = document.querySelectorAll('.card-badge');
    comingSoonBadges.forEach(badge => {
        if (badge.textContent.includes('10 Questions')) {
            badge.style.background = 'linear-gradient(to right,rgb(5, 179, 141),rgb(12, 221, 228))';
            badge.style.color = 'white';
        }
        if (badge.textContent.includes('Coming Soon')) {
            badge.style.background = 'linear-gradient(to right, #ff7e5f, #feb47b)';
            badge.style.color = 'white';

            // Get the parent card element
            const card = badge.closest('.subject-card');

            // Prevent default navigation for coming soon cards
            card.addEventListener('click', function (e) {
                e.preventDefault();
                showComingSoonAlert();
            });
        }
    });

    // Coming Soon Alert Functionality
    const alertOverlay = document.getElementById('alertOverlay');
    const comingSoonAlert = document.getElementById('comingSoonAlert');
    const alertCloseButton = document.getElementById('alertCloseButton');

    // Function to show the alert
    function showComingSoonAlert() {
        alertOverlay.classList.add('show');
        comingSoonAlert.classList.add('show');

        // Add a subtle animation to the icon
        const alertIcon = comingSoonAlert.querySelector('.alert-icon i');
        alertIcon.style.animation = 'pulse 2s infinite';
    }

    // Function to hide the alert
    function hideComingSoonAlert() {
        alertOverlay.classList.remove('show');
        comingSoonAlert.classList.remove('show');
    }

    // Event listeners for closing the alert
    if (alertCloseButton) {
        alertCloseButton.addEventListener('click', hideComingSoonAlert);
    }

    if (alertOverlay) {
        alertOverlay.addEventListener('click', hideComingSoonAlert);
    }

    // Close alert with escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && alertOverlay.classList.contains('show')) {
            hideComingSoonAlert();
        }
    });

    // Detect mobile devices and adjust animations accordingly
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
        // Simplify animations on mobile for better performance
        document.querySelectorAll('.floating-shape').forEach(shape => {
            shape.style.animationDuration = '15s';
        });
    }

    // Initialize cards with initial state for animations
    subjectCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Log that the quiz hub is ready
    console.log('Quiz Hub initialized successfully!');
});

// Add pulse animation for the alert icon
document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }
    </style>
`);
