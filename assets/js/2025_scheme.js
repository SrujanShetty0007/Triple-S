// 2025 Scheme Page JavaScript
document.addEventListener('DOMContentLoaded', function () {
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
                const show = targetSemester === 'all' || section.id === targetSemester;
                section.style.display = show ? 'block' : 'none';
                section.style.opacity = show ? '1' : '0';
                section.style.transform = show ? 'translateY(0)' : 'translateY(20px)';
            });

            // Smooth scroll to content
            if (targetSemester !== 'all') {
                setTimeout(() => {
                    const targetSection = document.getElementById(targetSemester);
                    targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
}

// PDF Links Functionality
function initializePdfLinks() {
    const materialLinks = document.querySelectorAll('.material-link');

    if (window.pdfScanner2025) {
        window.pdfScanner2025.clearCache();
    }

    materialLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            if (window.pdfScanner2025) {
                window.pdfScanner2025.clearCache();
            }

            const path = this.getAttribute('href');
            const isModelPaper = this.textContent.includes('Model');
            const paperType = isModelPaper ? 'Model Question Papers' :
                (this.textContent.includes('Previous') ? 'Previous Year Papers' : 'Notes');

            const pathParts = path.split('/');
            const semester = pathParts[1];
            const subject = pathParts[2];

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

    setTimeout(() => modal.classList.add('show'), 10);

    // Close modal functionality
    const closeBtn = modal.querySelector('.pdf-close-btn');
    closeBtn.addEventListener('click', () => closeModal(modal));

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });

    // Fetch PDFs
    fetchPdfs(path, modal.querySelector('#pdfList'));
}

async function fetchPdfs(path, container) {
    try {
        container.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading files...</p>';

        if (window.pdfScanner2025) {
            const pdfFiles = await window.pdfScanner2025.scanDirectory(path);
            displayPDFFiles(pdfFiles, container);
        } else {
            container.innerHTML = `
                <div class="error-message">
                    <p><i class="fas fa-exclamation-triangle"></i></p>
                    <p>PDF scanner not available.</p>
                    <p>Please refresh the page and try again.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        container.innerHTML = `
            <div class="error-message">
                <p><i class="fas fa-exclamation-triangle"></i></p>
                <p>There was an error loading the files.</p>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function displayPDFFiles(pdfFiles, container) {
    container.innerHTML = '';

    if (pdfFiles?.length > 0) {
        const fileListContainer = document.createElement('div');
        fileListContainer.classList.add('pdf-files-container');

        pdfFiles.forEach(file => displayPdfFile(fileListContainer, file.name, file.path));
        container.appendChild(fileListContainer);
    } else {
        const noFilesMessage = document.createElement('div');
        noFilesMessage.classList.add('no-files-message');
        noFilesMessage.innerHTML = `
            <p><i class="fas fa-folder-open"></i></p>
            <p>No PDF files available yet for 2025 scheme.</p>
            <p>Materials are being prepared and will be available soon.</p>
            <a href="index.html#my-contribution-section" class="contribute-btn">
                <i class="fas fa-upload"></i> Contribute Materials
            </a>
        `;
        container.appendChild(noFilesMessage);
    }
}

function displayPdfFile(container, fileName, filePath) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const fileExtension = filePath.split('.').pop().toLowerCase();

    const fileIcon = fileExtension === 'pdf' ? '<i class="far fa-file-pdf"></i>' :
        (['jpg', 'jpeg', 'png'].includes(fileExtension) ? '<i class="far fa-file-image"></i>' :
            '<i class="far fa-file"></i>');

    const fileItem = document.createElement('div');
    fileItem.classList.add('pdf-file-item');
    fileItem.innerHTML = `
        <div class="pdf-file-info">
            ${fileIcon}
            <span class="pdf-file-name">${fileName}</span>
        </div>
        <div class="pdf-file-actions">
            ${fileExtension === 'pdf' ?
            `<button class="pdf-view-btn" data-file="${filePath}">
                <i class="fas fa-eye"></i> View
            </button>` : ''}
            <a href="javascript:void(0);" class="pdf-download-btn" data-file="${filePath}" data-filename="${fileName}">
                <i class="fas fa-download"></i> Download
            </a>
        </div>
    `;

    container.appendChild(fileItem);

    // Add event listeners
    if (fileExtension === 'pdf') {
        const viewBtn = fileItem.querySelector('.pdf-view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', () => {
                if (isMobile) {
                    window.location.href = `mobile-pdf-viewer/pdf_viewer.html?pdf=${encodeURIComponent(filePath)}`;
                } else {
                    showPdfViewer(filePath, fileName);
                }
            });
        }

        const downloadBtn = fileItem.querySelector('.pdf-download-btn');
        if (downloadBtn) {
            if (window.pdfWatermarker) {
                downloadBtn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    try {
                        const filePath = this.getAttribute('data-file');
                        const fileName = this.getAttribute('data-filename');
                        const watermarkedPdf = await window.pdfWatermarker.watermarkPDF(filePath);
                        const downloadUrl = URL.createObjectURL(watermarkedPdf);

                        const tempLink = document.createElement('a');
                        tempLink.href = downloadUrl;
                        tempLink.download = fileName;
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);

                        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
                    } catch (error) {
                        console.error('Error downloading watermarked PDF:', error);
                        window.location.href = filePath + '?download=true';
                    }
                });
            } else {
                downloadBtn.href = filePath + '?download=true';
                downloadBtn.download = fileName;
            }
        }
    } else {
        const downloadBtn = fileItem.querySelector('.pdf-download-btn');
        if (downloadBtn) {
            downloadBtn.href = filePath + '?download=true';
            downloadBtn.download = fileName;
        }
    }
}

// Function to show PDF viewer modal
function showPdfViewer(pdfPath, fileName) {
    let viewerModal = document.getElementById('pdf-viewer-modal');

    if (!viewerModal) {
        viewerModal = document.createElement('div');
        viewerModal.id = 'pdf-viewer-modal';
        viewerModal.className = 'pdf-viewer-modal';
        viewerModal.innerHTML = `
            <div class="pdf-viewer-content">
                <div class="pdf-viewer-header">
                    <h3 id="pdf-viewer-title"></h3>
                    <span class="pdf-viewer-close">&times;</span>
                </div>
                <div class="pdf-viewer-body">
                    <div id="pdf-loading" class="pdf-loading">
                        <div class="pdf-loading-spinner"></div>
                        <p>Loading PDF...</p>
                    </div>
                    <iframe id="pdf-iframe" src="" frameborder="0"></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(viewerModal);

        const closeBtn = viewerModal.querySelector('.pdf-viewer-close');
        closeBtn.addEventListener('click', () => {
            viewerModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        });

        viewerModal.addEventListener('click', (e) => {
            if (e.target === viewerModal) {
                viewerModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    }

    const viewerTitle = viewerModal.querySelector('#pdf-viewer-title');
    const pdfIframe = viewerModal.querySelector('#pdf-iframe');
    const pdfLoading = viewerModal.querySelector('#pdf-loading');

    viewerTitle.textContent = fileName;
    pdfLoading.style.display = 'flex';

    pdfIframe.onload = () => pdfLoading.style.display = 'none';
    pdfIframe.onerror = () => pdfLoading.style.display = 'none';
    pdfIframe.src = pdfPath;

    viewerModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300);
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
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}