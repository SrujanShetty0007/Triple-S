document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to the hero section
    const hero = document.querySelector('.hero');
    hero.style.opacity = '0';
    setTimeout(() => {
        hero.style.transition = 'opacity 0.8s ease';
        hero.style.opacity = '1';
    }, 100);

    // Add hover effect to subject cards
    const subjectCards = document.querySelectorAll('.subject-card');
    subjectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('i');
            icon.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('i');
            icon.style.transform = 'scale(1)';
        });
    });

    // Mobile menu toggle functionality can be added here if needed

    // Log that the quiz hub is ready
    console.log('Quiz Hub initialized successfully!');
});
