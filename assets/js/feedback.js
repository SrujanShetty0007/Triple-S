document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');
    const thankYouMessage = document.querySelector('.thank-you-message');

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value || 'Feedback';
            const feedback = document.getElementById('feedback').value;
            const rating = document.querySelector('input[name="rating"]:checked')?.value || 'Not rated';

            // Here you would typically send this data to a server
            console.log('Feedback submitted:', {
                name,
                email,
                subject,
                feedback,
                rating
            });

            // Show thank you message
            feedbackForm.style.opacity = '0';
            setTimeout(() => {
                feedbackForm.style.display = 'none';
                if (thankYouMessage) {
                    thankYouMessage.style.display = 'block';
                    setTimeout(() => {
                        thankYouMessage.classList.add('show');
                    }, 100);
                }
            }, 500);

            // Reset form
            feedbackForm.reset();
        });
    }

    // Add animation to stars when hovered
    const stars = document.querySelectorAll('.star-rating label');
    stars.forEach(star => {
        star.addEventListener('mouseover', function () {
            this.classList.add('hover');
        });

        star.addEventListener('mouseout', function () {
            this.classList.remove('hover');
        });
    });
}); 