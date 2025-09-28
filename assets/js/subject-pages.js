document.addEventListener('DOMContentLoaded', () => {
    // Initialize PDF links for subject pages
    initializeSubjectPdfLinks();

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            backToTopButton.classList.toggle('visible', window.pageYOffset > 300);
        });

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
    document.querySelectorAll('.math-btn').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const mathText = this.querySelector('span').textContent.trim();
            const streamHeader = this.closest('.stream-card').querySelector('.stream-header h2').textContent.trim();

            // Check which mathematics button was clicked
            if (mathText === 'Mathematics-2') {
                if (streamHeader === 'CSE Stream') {
                    showPdfListModal('assets/pdfs/sem2/mathematics', 'sem2', 'mathematics', 'Mathematics 2 for CSE');
                } else if (streamHeader === 'EEE Stream') {
                    showPdfListModal('assets/pdfs/sem2/mathematics-eee', 'sem2', 'mathematics', 'Mathematics 2 for EEE');
                } else {
                    showCustomAlert(`Materials for ${mathText} in ${streamHeader} are coming soon!`);
                }
            } else {
                showCustomAlert(`Materials for ${mathText} are coming soon!`);
            }
        });
    });

    // Set up event listeners for Physics, Chemistry, and ESC buttons
    document.querySelectorAll('.phys-btn, .chem-btn, .esc-btn').forEach(button => {
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
            const semester = pathParts[2];
            const subject = pathParts[3];

            // Determine the stream text based on the path or header
            let streamText = '';
            if (subject.includes('electronics')) {
                streamText = 'Electronics Engineering';
            } else if (subject.includes('electrical')) {
                streamText = 'Electrical Engineering';
            } else {
                streamText = streamHeader.includes('CSE') ? 'CSE' : 'EEE';
            }

            showPdfListModal(path, semester, subject, `${paperType} for ${streamText}`);
        });
    });
}

// Custom styled alert function
function showCustomAlert(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'custom-alert';
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

    document.body.appendChild(alertContainer);
    document.body.style.overflow = 'hidden';
    setTimeout(() => alertContainer.classList.add('show'), 10);

    const closeAlert = () => {
        alertContainer.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertContainer);
            document.body.style.overflow = '';
        }, 300);
    };

    alertContainer.querySelector('.custom-alert-button').addEventListener('click', closeAlert);
    alertContainer.addEventListener('click', (e) => {
        if (e.target === alertContainer) closeAlert();
    });
}

function showPdfListModal(path, semester, subject, paperType) {
    let pdfModal = document.getElementById('pdf-modal');
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
    } else if (subject.includes('electronics') || subject.includes('electrical')) {
        headerClass = 'esc-modal-header';
    }

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

    pdfModal.classList.add('show');
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        pdfModal.classList.remove('show');
        document.body.style.overflow = '';
    };

    pdfModal.querySelector('.pdf-close-btn').addEventListener('click', closeModal);
    pdfModal.addEventListener('click', (e) => {
        if (e.target === pdfModal) closeModal();
    });

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
            filePath.includes('mathematics') ? 'math' :
                filePath.includes('electronics') || filePath.includes('electrical') ? 'esc' : '';

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
    const downloadBtn = document.createElement('button');
    downloadBtn.className = `pdf-download-btn ${subjectClass ? subjectClass + '-download-btn' : ''}`;
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    downloadBtn.setAttribute('aria-label', `Download ${fileName}`);
    downloadBtn.setAttribute('data-file', filePath);
    downloadBtn.setAttribute('data-filename', fileName);

    // Add event listener for watermarked download
    if (window.pdfWatermarker) {
        downloadBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

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

                this.innerHTML = '<i class="fas fa-check"></i> Downloaded';
                this.classList.add('download-success');

                setTimeout(() => {
                    URL.revokeObjectURL(downloadUrl);
                    this.innerHTML = originalText;
                    this.classList.remove('download-success');
                    this.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Error downloading watermarked PDF:', error);
                this.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
                this.classList.add('download-error');

                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('download-error');
                    this.disabled = false;
                }, 2000);

                setTimeout(() => {
                    const directLink = document.createElement('a');
                    directLink.href = filePath + '?download=true';
                    directLink.download = fileName;
                    directLink.target = '_blank';
                    document.body.appendChild(directLink);
                    directLink.click();
                    document.body.removeChild(directLink);
                }, 500);
            }
        });
    } else {
        // Fallback if watermarker not available
        downloadBtn.addEventListener('click', function (e) {
            e.preventDefault();
            this.disabled = true;
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';

            const filePath = this.getAttribute('data-file');
            const fileName = this.getAttribute('data-filename');

            const directLink = document.createElement('a');
            directLink.href = filePath + '?download=true';
            directLink.download = fileName;
            directLink.target = '_blank';
            document.body.appendChild(directLink);
            directLink.click();
            document.body.removeChild(directLink);

            this.innerHTML = '<i class="fas fa-check"></i> Downloaded';
            this.classList.add('download-success');

            setTimeout(() => {
                this.innerHTML = originalText;
                this.classList.remove('download-success');
                this.disabled = false;
            }, 2000);
        });
    }

    fileActions.appendChild(downloadBtn);
    fileItem.appendChild(fileActions);
    container.appendChild(fileItem);
}

function showPdfViewer(pdfPath, fileName) {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        window.location.href = `mobile-pdf-viewer/pdf_viewer.html?file=${encodeURIComponent(pdfPath)}&name=${encodeURIComponent(fileName)}`;
        return;
    }

    let viewerModal = document.getElementById('pdf-viewer-modal');
    if (!viewerModal) {
        viewerModal = document.createElement('div');
        viewerModal.id = 'pdf-viewer-modal';
        viewerModal.className = 'pdf-viewer-modal';
        document.body.appendChild(viewerModal);
    }

    // Determine subject-specific classes
    const subjectType = pdfPath.includes('physics') ? 'phys' :
        pdfPath.includes('chemistry') ? 'chem' :
            pdfPath.includes('mathematics') ? 'math' :
                pdfPath.includes('electronics') || pdfPath.includes('electrical') ? 'esc' : '';

    const headerClass = subjectType ? `${subjectType}-viewer-header` : '';
    const spinnerClass = subjectType ? `${subjectType}-loading-spinner` : '';

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

    viewerModal.style.display = 'flex';
    setTimeout(() => viewerModal.classList.add('show'), 10);
    document.body.style.overflow = 'hidden';

    const closeViewer = () => {
        viewerModal.classList.remove('show');
        setTimeout(() => {
            viewerModal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    viewerModal.querySelector('.pdf-viewer-close').addEventListener('click', closeViewer);
    const iframe = document.getElementById('pdf-iframe');
    iframe.onload = () => {
        const loading = viewerModal.querySelector('.pdf-loading');
        if (loading) loading.style.display = 'none';
    };
    iframe.src = pdfPath;
}