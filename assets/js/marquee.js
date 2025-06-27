/**
 * Enhanced Marquee for seamless scrolling across all pages
 * This script ensures the footer marquee works consistently on all devices and pages
 */
document.addEventListener('DOMContentLoaded', function () {
    setupMarquee();
});

function setupMarquee() {
    const marquee = document.querySelector('.footer-marquee');
    if (!marquee) return;

    // Save original content
    const originalContent = marquee.innerHTML;

    // Clear and properly set up the content for seamless looping
    // Adding multiple copies ensures smooth transition even on mobile
    marquee.innerHTML = originalContent + originalContent + originalContent + originalContent;

    // Adjust marquee speed based on screen width
    function adjustMarqueeSpeed() {
        const screenWidth = window.innerWidth;
        let duration;

        if (screenWidth <= 480) {
            duration = '20s'; // Slower on small mobile for better readability
        } else if (screenWidth <= 768) {
            duration = '25s'; // Medium on tablets
        } else {
            duration = '30s'; // Slower on desktop
        }

        marquee.style.animationDuration = duration;

        // Make sure the animation is running
        resetAnimation();
    }

    // Reset animation to prevent glitches
    function resetAnimation() {
        marquee.style.animation = 'none';
        marquee.offsetHeight; // Trigger reflow

        // Get current screen width
        const screenWidth = window.innerWidth;
        let duration;

        if (screenWidth <= 480) {
            duration = '20s'; // Slower on small mobile for better readability
        } else if (screenWidth <= 768) {
            duration = '25s'; // Medium on tablets
        } else {
            duration = '30s'; // Slower on desktop
        }

        // Apply animation with proper duration
        marquee.style.animation = `marquee ${duration} linear infinite`;
    }

    // Call initially
    adjustMarqueeSpeed();

    // Handle visibility changes to prevent animation issues
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            resetAnimation();
        }
    });

    // Handle orientation changes
    window.addEventListener('orientationchange', function () {
        setTimeout(resetAnimation, 100);
    });

    // Adjust on window resize with debounce
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustMarqueeSpeed, 250);
    });

    // Add click functionality to marquee items
    const marqueeItems = document.querySelectorAll('.footer-marquee-content');
    marqueeItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get the text content
            const content = item.querySelector('.footer-marquee-item').textContent;

            // Check if we're on the homepage
            const isHomepage = window.location.pathname.endsWith('index.html') ||
                window.location.pathname.endsWith('/') ||
                window.location.pathname.split('/').pop() === '';

            // Handle navigation based on current page
            if (content.includes('Contribute')) {
                if (isHomepage) {
                    document.querySelector('#contribute-section')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.location.href = 'index.html#contribute-section';
                }
            } else if (content.includes('materials')) {
                if (isHomepage) {
                    document.querySelector('.semester-filter')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.location.href = 'index.html#sem1';
                }
            }
        });
    });
} 