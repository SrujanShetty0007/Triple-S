document.addEventListener('DOMContentLoaded', () => {
    // Initialize PDF links for subject pages
    initializeSubjectPdfLinks();

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function () {
            backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
        });

        backToTopButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Hide loader when page is fully loaded
    const pageLoader = document.getElementById('page-loader');
    window.addEventListener('load', () => {
        if (pageLoader) {
            pageLoader.style.opacity = '0';
            setTimeout(() => {
                pageLoader.style.visibility = 'hidden';
            }, 300);
        }
    });
});

function initializeSubjectPdfLinks() {
    // Set up event listeners for Mathematics buttons
    const mathButtons = document.querySelectorAll('.math-btn');
    mathButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const mathText = this.querySelector('span').textContent.trim();
            const streamHeader = this.closest('.stream-card').querySelector('.stream-header h2').textContent.trim();

            // Check which mathematics button was clicked
            if (mathText === 'Mathematics-2') {
                if (streamHeader === 'CSE Stream') {
                    // For CSE Mathematics-2
                    showPdfListModal('assets/pdfs/sem2/mathematics', 'sem2', 'mathematics', 'Mathematics 2 for CSE');
                } else if (streamHeader === 'EEE Stream') {
                    // For EEE Mathematics-2
                    showPdfListModal('assets/pdfs/sem2/mathematics-eee', 'sem2', 'mathematics', 'Mathematics 2 for EEE');
                } else {
                    // For other streams that are not yet implemented
                    showCustomAlert('Materials for ' + mathText + ' in ' + streamHeader + ' are coming soon!');
                }
            } else {
                // For other buttons that are not yet implemented
                showCustomAlert('Materials for ' + mathText + ' are coming soon!');
            }
        });
    });

    // Set up event listeners for Physics and Chemistry buttons
    const subjectButtons = document.querySelectorAll('.phys-btn, .chem-btn');
    subjectButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const path = this.getAttribute('href');
            if (!path) return;

            const buttonText = this.querySelector('span').textContent.trim();
            const streamHeader = this.closest('.stream-card').querySelector('.stream-header h2').textContent.trim();

            let paperType = '';
            if (buttonText.includes('Notes')) {
                paperType = 'Notes';
            } else if (buttonText.includes('Model')) {
                paperType = 'Model Papers';
            } else if (buttonText.includes('Previous')) {
                paperType = 'Previous Year Papers';
            } else {
                paperType = buttonText;
            }

            // Extract semester and subject from path
            const pathParts = path.split('/');
            const semester = pathParts[2]; // e.g., sem2
            const subject = pathParts[3]; // e.g., physics, physics-eee, chemistry, chemistry-eee

            const streamText = streamHeader.includes('CSE') ? 'CSE' : 'EEE';
            const displayTitle = `${paperType} for ${streamText}`;

            showPdfListModal(path, semester, subject, displayTitle);
        });
    });
}

// Custom styled alert function
function showCustomAlert(message) {
    // Create alert container
    const alertContainer = document.createElement('div');
    alertContainer.className = 'custom-alert';

    // Create alert content
    alertContainer.innerHTML = `
        <div class="custom-alert-content">
            <div class="custom-alert-header">
                <i class="fas fa-info-circle"></i>
                <span>Information</span>
            </div>
            <div class="custom-alert-body">
                <p>${message}</p>
            </div>
            <div class="custom-alert-footer">
                <button class="custom-alert-button">OK</button>
            </div>
        </div>
    `;

    // Add to body
    document.body.appendChild(alertContainer);
    document.body.style.overflow = 'hidden';

    // Show with animation
    setTimeout(() => alertContainer.classList.add('show'), 10);

    // Handle closing
    const closeAlert = () => {
        alertContainer.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertContainer);
            document.body.style.overflow = '';
        }, 300);
    };

    // Close on button click
    alertContainer.querySelector('.custom-alert-button').addEventListener('click', closeAlert);

    // Close on outside click
    alertContainer.addEventListener('click', (e) => {
        if (e.target === alertContainer) closeAlert();
    });
}

function showPdfListModal(path, semester, subject, paperType) {
    // Get the existing modal
    let pdfModal = document.getElementById('pdf-modal');

    // If no modal exists in the HTML, create one dynamically
    if (!pdfModal) {
        pdfModal = document.createElement('div');
        pdfModal.id = 'pdf-modal';
        pdfModal.className = 'pdf-modal';
        document.body.appendChild(pdfModal);
    }

    // Determine the subject-specific header class
    let headerClass = '';
    if (subject.includes('physics')) {
        headerClass = 'phys-modal-header';
    } else if (subject.includes('chemistry')) {
        headerClass = 'chem-modal-header';
    } else if (subject.includes('mathematics')) {
        headerClass = 'math-modal-header';
    }

    // Set up the modal content
    pdfModal.innerHTML = `
        <div class="pdf-modal-content">
            <div class="pdf-modal-header ${headerClass}">
                <h3>${paperType}</h3>
                <p>${semester.toUpperCase().replace('SEM', 'Semester ')} - ${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
                <button class="pdf-close-btn">&times;</button>
            </div>
            <div class="pdf-modal-body">
                <div class="pdf-list">
                    <div class="pdf-files-container" id="pdf-files-container">
                        <div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading files...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Show the modal
    pdfModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Handle closing
    const closeModal = () => {
        pdfModal.classList.remove('show');
        document.body.style.overflow = '';
    };

    // Close button functionality
    pdfModal.querySelector('.pdf-close-btn').addEventListener('click', closeModal);

    // Close on outside click
    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) closeModal();
    });

    // Fetch PDFs
    fetchPdfs(path, document.getElementById('pdf-files-container'));
}

async function fetchPdfs(path, container, forceRefresh = false) {
    if (!window.pdfScanner) {
        container.innerHTML = '<div class="no-files-message"><i class="fas fa-exclamation-circle"></i><p>PDF scanner not available.</p></div>';
        return;
    }

    try {
        // Check if this is a mathematics-2 path (contains multiple types of PDFs)
        if (path.endsWith('/mathematics') || path.endsWith('/mathematics-eee')) {
            // Create sections for different types of PDFs
            container.innerHTML = `
                <h4 class="pdf-section-title">Notes</h4>
                <div id="notes-container" class="pdf-section-container">
                    <div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading notes...</div>
                </div>
                
                <h4 class="pdf-section-title">Model Papers</h4>
                <div id="model-papers-container" class="pdf-section-container">
                    <div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading model papers...</div>
                </div>
                
                <h4 class="pdf-section-title">Previous Year Papers</h4>
                <div id="previous-papers-container" class="pdf-section-container">
                    <div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading previous papers...</div>
                </div>
            `;

            const sections = [
                { path: `${path}/notes`, container: document.getElementById('notes-container'), type: 'notes' },
                { path: `${path}/model-papers`, container: document.getElementById('model-papers-container'), type: 'model papers' },
                { path: `${path}/previous-papers`, container: document.getElementById('previous-papers-container'), type: 'previous papers' }
            ];

            // Fetch PDFs for each section
            for (const section of sections) {
                try {
                    const pdfs = await window.pdfScanner.scanDirectory(section.path, forceRefresh);
                    displayPDFFiles(pdfs, section.container);
                } catch (error) {
                    console.error(`Error fetching ${section.type}:`, error);
                    section.container.innerHTML = `<div class="no-files-message"><i class="fas fa-exclamation-circle"></i><p>Failed to load ${section.type}.</p></div>`;
                }
            }
        } else {
            // Regular path handling
            const pdfFiles = await window.pdfScanner.scanDirectory(path, forceRefresh);
            displayPDFFiles(pdfFiles, container);
        }
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        container.innerHTML = '<div class="no-files-message"><i class="fas fa-exclamation-circle"></i><p>Failed to load files.</p></div>';
    }
}

function displayPDFFiles(pdfFiles, container) {
    if (!pdfFiles || pdfFiles.length === 0) {
        container.innerHTML = `
            <div class="no-files-message">
                <i class="fas fa-folder-open"></i>
                <p>No files available yet.</p>
                <p>Check back later or contribute materials!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    pdfFiles.forEach(file => displayPdfFile(container, file.name, file.path));
}

function displayPdfFile(container, fileName, filePath) {
    const fileItem = document.createElement('div');
    fileItem.className = 'pdf-file-item';

    // Determine subject-specific classes
    const subjectClass = filePath.includes('physics') ? 'phys' :
        filePath.includes('chemistry') ? 'chem' :
            filePath.includes('mathematics') ? 'math' : '';

    // Create file info section
    const fileInfo = document.createElement('div');
    fileInfo.className = 'pdf-file-info';

    const fileIcon = document.createElement('i');
    fileIcon.className = `fas fa-file-pdf ${subjectClass ? subjectClass + '-file-icon' : ''}`;
    fileInfo.appendChild(fileIcon);

    const fileNameSpan = document.createElement('span');
    fileNameSpan.className = 'pdf-file-name';
    fileNameSpan.textContent = fileName;
    fileInfo.appendChild(fileNameSpan);

    fileItem.appendChild(fileInfo);

    // Create file actions section
    const fileActions = document.createElement('div');
    fileActions.className = 'pdf-file-actions';

    // View button
    const viewBtn = document.createElement('button');
    viewBtn.className = `pdf-view-btn ${subjectClass ? subjectClass + '-view-btn' : ''}`;
    viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
    viewBtn.addEventListener('click', () => showPdfViewer(filePath, fileName));
    fileActions.appendChild(viewBtn);

    // Download button
    const downloadBtn = document.createElement('a');
    downloadBtn.className = `pdf-download-btn ${subjectClass ? subjectClass + '-download-btn' : ''}`;
    downloadBtn.href = filePath;
    downloadBtn.download = '';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    downloadBtn.setAttribute('aria-label', `Download ${fileName}`);
    fileActions.appendChild(downloadBtn);

    fileItem.appendChild(fileActions);
    container.appendChild(fileItem);
}

function showPdfViewer(pdfPath, fileName) {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // For mobile, use a different viewer
        window.location.href = `mobile-pdf-viewer/pdf_viewer.html?file=${encodeURIComponent(pdfPath)}&name=${encodeURIComponent(fileName)}`;
        return;
    }

    // Get the existing viewer modal
    let viewerModal = document.getElementById('pdf-viewer-modal');

    // If no modal exists in the HTML, create one dynamically
    if (!viewerModal) {
        viewerModal = document.createElement('div');
        viewerModal.id = 'pdf-viewer-modal';
        viewerModal.className = 'pdf-viewer-modal';
        document.body.appendChild(viewerModal);
    }

    // Determine subject-specific classes
    const subjectType = pdfPath.includes('physics') ? 'phys' :
        pdfPath.includes('chemistry') ? 'chem' :
            pdfPath.includes('mathematics') ? 'math' : '';

    const headerClass = subjectType ? `${subjectType}-viewer-header` : '';
    const spinnerClass = subjectType ? `${subjectType}-loading-spinner` : '';

    // Set up the viewer content
    viewerModal.innerHTML = `
        <div class="pdf-viewer-content">
            <div class="pdf-viewer-header ${headerClass}">
                <h3>${fileName}</h3>
                <span class="pdf-viewer-close">&times;</span>
            </div>
            <div class="pdf-viewer-body">
                <div class="pdf-loading">
                    <div class="pdf-loading-spinner ${spinnerClass}"></div>
                    <p>Loading PDF...</p>
                </div>
                <iframe id="pdf-iframe" src="about:blank" title="PDF Viewer"></iframe>
            </div>
        </div>
    `;

    // Show the modal
    viewerModal.style.display = 'flex';
    setTimeout(() => viewerModal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';

    // Handle closing
    const closeViewer = () => {
        viewerModal.classList.remove('show');
        setTimeout(() => {
            viewerModal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    // Close button functionality
    viewerModal.querySelector('.pdf-viewer-close').addEventListener('click', closeViewer);

    // Load the PDF
    const iframe = document.getElementById('pdf-iframe');
    iframe.onload = function () {
        const loading = viewerModal.querySelector('.pdf-loading');
        if (loading) loading.style.display = 'none';
    };

    // Use direct PDF path
    iframe.src = pdfPath;
} 