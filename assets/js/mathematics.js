document.addEventListener('DOMContentLoaded', () => {
    // Initialize PDF links for Mathematics page
    initializeMathPdfLinks();

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
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

function initializeMathPdfLinks() {
    // Set up event listeners for Mathematics buttons
    const mathButtons = document.querySelectorAll('.math-btn');

    mathButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            const mathText = this.querySelector('span').textContent.trim();

            // Check which mathematics button was clicked
            if (mathText === 'Mathematics-2' && this.closest('.stream-card').querySelector('.stream-header h2').textContent.includes('CSE')) {
                // For CSE Mathematics-2
                showPdfListModal('assets/pdfs/sem2/mathematics', 'sem2', 'mathematics', 'Mathematics 2 for CSE');
            } else {
                // For other buttons that are not yet implemented
                showCustomAlert('Materials for ' + mathText + ' are coming soon!');
            }
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

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Show with animation
    setTimeout(() => {
        alertContainer.classList.add('show');
    }, 10);

    // Close on button click
    const closeButton = alertContainer.querySelector('.custom-alert-button');
    closeButton.addEventListener('click', () => {
        alertContainer.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertContainer);
            document.body.style.overflow = '';
        }, 300);
    });

    // Close on outside click
    alertContainer.addEventListener('click', (e) => {
        if (e.target === alertContainer) {
            alertContainer.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertContainer);
                document.body.style.overflow = '';
            }, 300);
        }
    });
}

function showPdfListModal(path, semester, subject, paperType) {
    // Create or get the modal
    let pdfModal = document.getElementById('pdf-modal');

    if (!pdfModal) {
        pdfModal = document.createElement('div');
        pdfModal.id = 'pdf-modal';
        pdfModal.className = 'pdf-modal';
        document.body.appendChild(pdfModal);
    }

    // Set up the modal content
    pdfModal.innerHTML = `
        <div class="pdf-modal-content">
            <div class="pdf-modal-header">
                <h3>${paperType}</h3>
                <p>${semester.toUpperCase().replace('SEM', 'Semester ')} - ${subject.charAt(0).toUpperCase() + subject.slice(1)}</p>
                <button class="pdf-close-btn">&times;</button>
            </div>
            <div class="pdf-modal-body">
                <div class="pdf-list">
                    <h4>Model Question Papers</h4>
                    <div class="pdf-files-container" id="model-papers-container">
                        <div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading files...</div>
                    </div>
                    
                    <h4>Notes</h4>
                    <div class="pdf-files-container" id="notes-container">
                        <div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading files...</div>
                    </div>
                    
                    <h4>Previous Year Papers</h4>
                    <div class="pdf-files-container" id="previous-papers-container">
                        <div class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading files...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Show the modal
    pdfModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Close button functionality
    const closeBtn = pdfModal.querySelector('.pdf-close-btn');
    closeBtn.addEventListener('click', () => {
        pdfModal.classList.remove('show');
        document.body.style.overflow = '';
    });

    // Close on outside click
    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) {
            pdfModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Fetch PDFs for each category
    fetchPdfs(`${path}/model-papers`, document.getElementById('model-papers-container'));
    fetchPdfs(`${path}/notes`, document.getElementById('notes-container'));
    fetchPdfs(`${path}/previous-papers`, document.getElementById('previous-papers-container'));
}

async function fetchPdfs(path, container, forceRefresh = false) {
    if (!window.pdfScanner) {
        container.innerHTML = '<div class="no-files-message"><i class="fas fa-exclamation-circle"></i><p>PDF scanner not available.</p></div>';
        return;
    }

    try {
        const pdfFiles = await window.pdfScanner.scanDirectory(path, forceRefresh);
        displayPDFFiles(pdfFiles, container);
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

    pdfFiles.forEach(file => {
        displayPdfFile(container, file.name, file.path);
    });
}

function displayPdfFile(container, fileName, filePath) {
    const fileItem = document.createElement('div');
    fileItem.className = 'pdf-file-item';

    const fileInfo = document.createElement('div');
    fileInfo.className = 'pdf-file-info';

    const fileIcon = document.createElement('i');
    fileIcon.className = 'fas fa-file-pdf';
    fileInfo.appendChild(fileIcon);

    const fileNameSpan = document.createElement('span');
    fileNameSpan.className = 'pdf-file-name';
    fileNameSpan.textContent = fileName;
    fileInfo.appendChild(fileNameSpan);

    fileItem.appendChild(fileInfo);

    const fileActions = document.createElement('div');
    fileActions.className = 'pdf-file-actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'pdf-view-btn';
    viewBtn.innerHTML = '<i class="fas fa-eye"></i> View';
    viewBtn.addEventListener('click', () => showPdfViewer(filePath, fileName));
    fileActions.appendChild(viewBtn);

    const downloadBtn = document.createElement('a');
    downloadBtn.className = 'pdf-download-btn';
    downloadBtn.href = filePath;
    downloadBtn.download = '';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    downloadBtn.setAttribute('aria-label', `Download ${fileName}`);
    fileActions.appendChild(downloadBtn);

    fileItem.appendChild(fileActions);
    container.appendChild(fileItem);
}

function showPdfViewer(pdfPath, fileName) {
    // Check if we need to use the mobile PDF viewer
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // For mobile, open in a new tab or use the mobile PDF viewer
        window.open(`mobile-pdf-viewer/pdf_viewer.html?pdf=${encodeURIComponent(pdfPath)}&title=${encodeURIComponent(fileName)}`, '_blank');
        return;
    }

    // Create or get the PDF viewer modal
    let pdfViewerModal = document.getElementById('pdf-viewer-modal');

    if (!pdfViewerModal) {
        pdfViewerModal = document.createElement('div');
        pdfViewerModal.id = 'pdf-viewer-modal';
        pdfViewerModal.className = 'pdf-viewer-modal';
        document.body.appendChild(pdfViewerModal);
    }

    // Set up the modal content
    pdfViewerModal.innerHTML = `
        <div class="pdf-viewer-content">
            <div class="pdf-viewer-header">
                <h3>${fileName}</h3>
                <button class="pdf-viewer-close">&times;</button>
            </div>
            <div class="pdf-viewer-body">
                <div class="pdf-loading">
                    <div class="pdf-loading-spinner"></div>
                    <p>Loading PDF...</p>
                </div>
                <iframe id="pdf-iframe" src="about:blank" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `;

    // Show the modal
    pdfViewerModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Close button functionality
    const closeBtn = pdfViewerModal.querySelector('.pdf-viewer-close');
    closeBtn.addEventListener('click', () => {
        pdfViewerModal.classList.remove('show');
        document.body.style.overflow = '';
        document.getElementById('pdf-iframe').src = 'about:blank';
    });

    // Set the iframe source after a short delay to allow the modal to render
    setTimeout(() => {
        const iframe = document.getElementById('pdf-iframe');
        iframe.onload = function () {
            pdfViewerModal.querySelector('.pdf-loading').style.display = 'none';
        };
        iframe.src = pdfPath;
    }, 100);
}
