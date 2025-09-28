// 2025 Scheme Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Initialize page functionality
    initializeSemesterFilter();
    initializePdfLinks();
    initializeAnimations();
    initializeBackToTop();

    // Hide loader
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }, 500);
    }
});

// Semester Filter Functionality
function initializeSemesterFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const semesterSections = document.querySelectorAll('.semester-section');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSemester = this.getAttribute('data-semester');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show/hide semester sections
            semesterSections.forEach(section => {
                if (targetSemester === 'all') {
                    section.style.display = 'block';
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    if (section.id === targetSemester) {
                        section.style.display = 'block';
                        setTimeout(() => {
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        section.style.opacity = '0';
                        section.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            section.style.display = 'none';
                        }, 300);
                    }
                }
            });

            // Smooth scroll to content
            if (targetSemester !== 'all') {
                setTimeout(() => {
                    const targetSection = document.getElementById(targetSemester);
                    if (targetSection) {
                        targetSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 100);
            }
        });
    });
}

// PDF Links Functionality (similar to main page)
function initializePdfLinks() {
    const materialLinks = document.querySelectorAll('.material-link');

    materialLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const path = this.getAttribute('href');
            const isModelPaper = this.textContent.includes('Model');
            const paperType = isModelPaper ? 'Model Question Papers' : (
                this.textContent.includes('Previous') ? 'Previous Year Papers' : 'Notes'
            );

            const pathParts = path.split('/');
            const semester = pathParts[3]; // 2025-scheme/sem1/...
            const subject = pathParts[4];

            showPdfListModal(path, semester, subject, paperType);
        });
    });
}

// PDF Modal Functionality
function showPdfListModal(path, semester, subject, paperType) {
    const modal = document.createElement('div');
    modal.classList.add('pdf-modal');

    const semesterName = 'Semester ' + semester.replace('sem', '');
    const subjectName = subject.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    modal.innerHTML = `
        <div class="pdf-modal-content">
            <div class="pdf-modal-header">
                <h3>${paperType} - ${subjectName}</h3>
                <p>${semesterName} (2025 Scheme)</p>
                <span class="pdf-close-btn">&times;</span>
            </div>
            <div class="pdf-modal-body">
                <div class="pdf-list" id="pdfList">
                    <p class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading files...</p>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Close modal functionality
    const closeBtn = modal.querySelector('.pdf-close-btn');
    closeBtn.addEventListener('click', () => {
        closeModal(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });

    // Fetch PDFs (placeholder - would need actual implementation)
    fetchPdfs(path, modal.querySelector('#pdfList'));
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300);
}

// Placeholder for PDF fetching (would need actual implementation)
function fetchPdfs(path, container) {
    setTimeout(() => {
        container.innerHTML = `
            <div class="no-files-message">
                <p><i class="fas fa-folder-open"></i></p>
                <p>No PDF files available yet for 2025 scheme.</p>
                <p>Materials are being prepared and will be available soon.</p>
                <a href="index.html#my-contribution-section" class="contribute-btn">
                    <i class="fas fa-upload"></i> Contribute Materials
                </a>
            </div>
        `;
    }, 1000);
}

// Animation functionality
function initializeAnimations() {
    const subjectCards = document.querySelectorAll('.subject-card');

    if (subjectCards.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        subjectCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            observer.observe(card);
        });
    }
}

// Back to Top Button
function initializeBackToTop() {
    const backToTopButton = document.getElementById('backToTop');

    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Utility function to format display names
function formatDisplayName(filename) {
    return filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
}