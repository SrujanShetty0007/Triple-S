document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const semesterSections = document.querySelectorAll('.semester-section');
    const subjectCards = document.querySelectorAll('.subject-card');
    const backToTopButton = document.getElementById('backToTop');
    const pageLoader = document.getElementById('page-loader');
    window.addEventListener('load', () => {
        if (pageLoader) {
            pageLoader.style.opacity = '0';
            setTimeout(() => {
                pageLoader.style.visibility = 'hidden';
            }, 300);
        }
    });

    const contributionForm = document.getElementById('contributionForm');
    const fileUpload = document.getElementById('pdfUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const uploadBtn = document.querySelector('.upload-btn');
    const studentNameInput = document.getElementById('studentName');
    const semesterSelect = document.getElementById('semesterSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const materialTypeSelect = document.getElementById('materialType');
    const submitBtn = document.getElementById('submitContribution');
    const thankYouMessage = document.getElementById('thankYouMessage');
    const shareEmailBtn = document.querySelector('.share-btn.email-btn');
    const shareWhatsappBtn = document.querySelector('.share-btn.whatsapp-btn');
    const adminWhatsapp = '8217358117';
    const adminEmail = 'srujanshetty0007@gmail.com';

    if (window.pdfScanner) {
        window.pdfScanner.clearCache();
    }

    // Initialize animations
    initializeAnimations();

    // Initialize back-to-top button
    initializeBackToTop();

    // Initialize form handling
    initializeFormHandling();

    // Initialize semester filtering
    initializeSemesterFiltering();

    // Initialize PDF links
    initializePdfLinks();

    // Initialize testimonials carousel
    initializeTestimonialsCarousel();

    if (window.location.search.includes('submitted=true')) {
        showThankYouMessage();
    }

    function initializeAnimations() {
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
                observer.observe(card);
            });
        }
    }

    function initializeBackToTop() {
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
    }

    function initializeFormHandling() {
        if (fileUpload && uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                fileUpload.click();
            });

            fileUpload.addEventListener('change', () => {
                const file = fileUpload.files[0];
                if (file) {
                    fileNameDisplay.textContent = file.name;
                    uploadBtn.innerHTML = '<i class="fas fa-check"></i> File Selected';
                    uploadBtn.style.backgroundColor = '#d1e7dd';
                } else {
                    fileNameDisplay.textContent = 'No file chosen';
                    uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Choose File';
                    uploadBtn.style.backgroundColor = '';
                }
            });
        }

        setupSubjectFiltering();

        if (contributionForm) {
            contributionForm.addEventListener('submit', function () {
                this.method = "POST";

                setTimeout(() => {
                    if (submitBtn && submitBtn.disabled) {
                        setTimeout(() => {
                            if (submitBtn.disabled) {
                                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Contribution';
                                submitBtn.disabled = false;
                            }
                        }, 20000);
                    }
                }, 10000);
            });
        }

        if (shareEmailBtn) {
            shareEmailBtn.addEventListener('click', () => {
                if (!studentNameInput.value.trim()) {
                    showCustomAlert('Form Incomplete', 'Please fill the form to send an email.');
                    studentNameInput.focus();
                    return;
                }

                if (!validateForm()) return;

                const studentName = studentNameInput.value;
                const subject = subjectSelect.options[subjectSelect.selectedIndex].text;
                const materialType = materialTypeSelect.options[materialTypeSelect.selectedIndex].text;
                const emailSubject = `Study Material Contribution: ${subject} - ${materialType}`;
                const emailBody = `Hello,\n\nI am ${studentName} and I would like to contribute a ${materialType} for ${subject}.\n\nPlease find the attached file.\n\nThank you.`;
                const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

                shareEmailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
                window.location.href = mailtoLink;

                setTimeout(() => {
                    shareEmailBtn.innerHTML = '<i class="fas fa-envelope"></i> Email';
                }, 2000);
            });
        }

        if (shareWhatsappBtn) {
            shareWhatsappBtn.addEventListener('click', () => {
                if (!studentNameInput.value.trim()) {
                    showCustomAlert('Form Incomplete', 'Please fill the form to send a WhatsApp message.');
                    studentNameInput.focus();
                    return;
                }

                if (!validateForm()) return;

                const studentName = studentNameInput.value;
                const subject = subjectSelect.options[subjectSelect.selectedIndex].text;
                const materialType = materialTypeSelect.options[materialTypeSelect.selectedIndex].text;
                const message = `Hello, I am ${studentName} and I would like to contribute a ${materialType} for ${subject}. I have a file to share.`;
                const whatsappLink = `https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(message)}`;

                shareWhatsappBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';
                window.open(whatsappLink, '_blank');

                setTimeout(() => {
                    shareWhatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> WhatsApp';
                }, 2000);
            });
        }
    }

    // Custom alert function
    function showCustomAlert(title, message) {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) document.body.removeChild(existingAlert);

        // Create alert element
        const alertContainer = document.createElement('div');
        alertContainer.className = 'custom-alert';

        alertContainer.innerHTML = `
            <div class="custom-alert-content">
                <div class="custom-alert-header">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${title}</span>
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
        setTimeout(() => alertContainer.classList.add('show'), 10);

        // Add event listeners
        const closeAlert = () => {
            alertContainer.classList.remove('show');
            setTimeout(() => document.body.removeChild(alertContainer), 300);
        };

        alertContainer.querySelector('.custom-alert-button').addEventListener('click', closeAlert);
        alertContainer.addEventListener('click', (e) => {
            if (e.target === alertContainer) closeAlert();
        });
    }

    function setupSubjectFiltering() {
        if (!semesterSelect || !subjectSelect) return;

        const allSubjectOptions = Array.from(subjectSelect.options).map(option => ({
            value: option.value,
            text: option.textContent
        }));

        const subjectsBySemester = {
            sem1: ['BMATS101', 'BCHES102', 'BCADK103', 'BESCK104C', 'BETCK105J', 'BENGK106', 'BKSK107', 'BKBKK107', 'BSFHK158'],
            sem2: ['BMATS201', 'BMATE201', 'BPHYS202', 'BCHES202', 'BHEE202', 'BPOPS203', 'BCEDK203', 'BESCK204B', 'BESCK204C', 'BPLCK205B', 'BPWSK206', 'BICOK207', 'BIDTK258'],
            sem3: ['BCS301'],
            sem4: ['BCS401'],
            sem5: ['BCS501'],
            sem6: ['BCS601'],
            sem7: ['BCS701'],
            sem8: ['BCS801']
        };

        semesterSelect.addEventListener('change', () => {
            const selectedSemester = semesterSelect.value;

            subjectSelect.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Subject';
            subjectSelect.appendChild(defaultOption);

            if (!selectedSemester) return;

            const semesterSubjects = subjectsBySemester[selectedSemester] || [];
            allSubjectOptions.forEach(option => {
                if (semesterSubjects.includes(option.value)) {
                    const newOption = document.createElement('option');
                    newOption.value = option.value;
                    newOption.textContent = option.text;
                    subjectSelect.appendChild(newOption);
                }
            });
        });
    }

    function validateForm() {
        // Check required fields
        const requiredFields = [
            { field: studentNameInput, message: 'name' },
            { field: semesterSelect, message: 'semester' },
            { field: subjectSelect, message: 'subject' },
            { field: materialTypeSelect, message: 'material type' }
        ];

        for (const item of requiredFields) {
            if (!item.field.value.trim()) {
                showCustomAlert('Form Incomplete', `Please select a ${item.message}.`);
                item.field.focus();
                return false;
            }
        }

        // Check file upload
        if (!fileUpload.files[0]) {
            showCustomAlert('Missing File', 'Please upload a file.');
            return false;
        }

        const file = fileUpload.files[0];
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValidExtension) {
            showCustomAlert('Invalid File', 'Please upload a PDF, JPG, JPEG, or PNG file.');
            return false;
        }

        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            showCustomAlert('File Too Large', `File must be under 20MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
            return false;
        }

        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
        }

        return true;
    }

    function initializeSemesterFiltering() {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const semester = btn.dataset.semester;

                if (semester === 'all') {
                    semesterSections.forEach(section => {
                        section.style.display = 'block';
                        setTimeout(() => {
                            section.style.opacity = '1';
                            section.style.transform = 'translateY(0)';
                        }, 100);
                    });
                } else {
                    semesterSections.forEach(section => {
                        section.style.opacity = '0';
                        section.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            section.style.display = 'none';
                        }, 300);
                    });

                    const selectedSection = document.getElementById(semester);
                    if (selectedSection) {
                        setTimeout(() => {
                            selectedSection.style.display = 'block';
                            setTimeout(() => {
                                selectedSection.style.opacity = '1';
                                selectedSection.style.transform = 'translateY(0)';
                            }, 100);
                        }, 300);
                    }
                }
            });
        });
    }

    function showThankYouMessage() {
        if (!thankYouMessage) return;

        thankYouMessage.classList.add('show');

        if (contributionForm) contributionForm.style.display = 'none';

        if (contributionForm) contributionForm.reset();
        if (fileNameDisplay) fileNameDisplay.textContent = 'No file chosen';
        if (uploadBtn) {
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Choose File';
            uploadBtn.style.backgroundColor = '';
        }

        setTimeout(() => {
            if (thankYouMessage) thankYouMessage.classList.remove('show');
            if (contributionForm) contributionForm.style.display = 'block';
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Contribution';
                submitBtn.disabled = false;
            }

            if (history.replaceState) {
                history.replaceState(null, '', window.location.pathname + '#contribute-section');
            }
        }, 5000);
    }

    function initializePdfLinks() {
        const materialLinks = document.querySelectorAll('.material-link');

        if (window.pdfScanner) {
            window.pdfScanner.clearCache();
        }

        materialLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                if (window.pdfScanner) {
                    window.pdfScanner.clearCache();
                }

                const path = this.getAttribute('href');
                const isModelPaper = this.textContent.includes('Model');
                const paperType = isModelPaper ? 'Model Question Papers' : (
                    this.textContent.includes('Previous') ? 'Previous Year Papers' : 'Notes'
                );

                const pathParts = path.split('/');
                const semester = pathParts[2];
                const subject = pathParts[3];

                showPdfListModal(path, semester, subject, paperType);
            });
        });
    }

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
                    <p>${semesterName}</p>
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

        const closeBtn = modal.querySelector('.pdf-close-btn');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 300);
            }
        });

        fetchPdfs(path, modal.querySelector('#pdfList'));
    }

    async function fetchPdfs(path, container, forceRefresh = false) {
        try {
            container.innerHTML = '<p class="loading-text"><i class="fas fa-spinner fa-spin"></i> Loading files...</p>';

            if (window.pdfScanner) {
                const pdfFiles = await window.pdfScanner.scanDirectory(path, forceRefresh);
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

        if (pdfFiles && pdfFiles.length > 0) {
            const fileListContainer = document.createElement('div');
            fileListContainer.classList.add('pdf-files-container');

            pdfFiles.forEach(file => {
                displayPdfFile(fileListContainer, file.name, file.path);
            });

            container.appendChild(fileListContainer);
        } else {
            const noFilesMessage = document.createElement('div');
            noFilesMessage.classList.add('no-files-message');
            noFilesMessage.innerHTML = `
                <p><i class="fas fa-folder-open"></i></p>
                <p>No PDF files available yet.</p>
                <p>Please check back later or contribute your own materials.</p>
                <a href="index.html#contribute-section" class="contribute-btn">
                    <i class="fas fa-upload"></i> Contribute Materials
                </a>
            `;
            container.appendChild(noFilesMessage);
        }
    }

    function displayPdfFile(container, fileName, filePath) {
        const viewPath = `${filePath}?t=${Date.now()}`;

        // Check if on mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        const fileItem = document.createElement('div');
        fileItem.classList.add('pdf-file-item');

        const fileExtension = filePath.split('.').pop().toLowerCase();
        let fileIcon;
        if (fileExtension === 'pdf') {
            fileIcon = '<i class="far fa-file-pdf"></i>';
        } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
            fileIcon = '<i class="far fa-file-image"></i>';
        } else {
            fileIcon = '<i class="far fa-file"></i>';
        }

        fileItem.innerHTML = `
            <div class="pdf-file-info">
                ${fileIcon}
                <span class="pdf-file-name">${fileName}</span>
            </div>
            <div class="pdf-file-actions">
                ${fileExtension === 'pdf' ?
                `<button class="pdf-view-btn" data-file="${filePath}">
                        <i class="fas fa-eye"></i> View
                    </button>` : ''
            }
                <a href="javascript:void(0);" class="pdf-download-btn" data-file="${filePath}" data-filename="${fileName}">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        `;

        container.appendChild(fileItem);

        // Add event listener for the view button if this is a PDF
        if (fileExtension === 'pdf') {
            const viewBtn = fileItem.querySelector('.pdf-view-btn');
            if (viewBtn) {
                if (isMobile) {
                    viewBtn.addEventListener('click', function () {
                        window.location.href = `mobile-pdf-viewer/pdf_viewer.html?pdf=${encodeURIComponent(filePath)}`;
                    });
                } else {
                    viewBtn.addEventListener('click', function () {
                        showPdfViewer(filePath, fileName);
                    });
                }
            }

            // Add event listener for the download button
            const downloadBtn = fileItem.querySelector('.pdf-download-btn');
            if (downloadBtn && window.pdfWatermarker) {
                downloadBtn.addEventListener('click', async function (e) {
                    e.preventDefault();
                    try {
                        // Get file path and name from data attributes
                        const filePath = this.getAttribute('data-file');
                        const fileName = this.getAttribute('data-filename');

                        // Watermark the PDF
                        const watermarkedPdf = await window.pdfWatermarker.watermarkPDF(filePath);

                        // Create download link for the watermarked PDF
                        const downloadUrl = URL.createObjectURL(watermarkedPdf);
                        const tempLink = document.createElement('a');
                        tempLink.href = downloadUrl;
                        tempLink.download = fileName;
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);

                        // Clean up
                        setTimeout(() => {
                            URL.revokeObjectURL(downloadUrl);
                        }, 100);
                    } catch (error) {
                        console.error('Error downloading watermarked PDF:', error);
                        // Fallback to direct download if watermarking fails
                        window.location.href = filePath + '?download=true';
                    }
                });
            } else if (downloadBtn) {
                // Fallback if watermarker not available
                downloadBtn.href = filePath + '?download=true';
                downloadBtn.download = fileName;
            }
        } else {
            // For non-PDF files, use direct download
            const downloadBtn = fileItem.querySelector('.pdf-download-btn');
            if (downloadBtn) {
                downloadBtn.href = filePath + '?download=true';
                downloadBtn.download = fileName;
            }
        }
    }

    // Function to show PDF viewer modal
    function showPdfViewer(pdfPath, fileName) {
        // Check if viewer modal already exists, if not create it
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

            // Add close button event listener
            const closeBtn = viewerModal.querySelector('.pdf-viewer-close');
            closeBtn.addEventListener('click', function () {
                viewerModal.classList.remove('show');
                document.body.style.overflow = 'auto';
            });

            // Close modal when clicking outside content
            viewerModal.addEventListener('click', function (e) {
                if (e.target === viewerModal) {
                    viewerModal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
            });
        }

        // Update modal content
        const viewerTitle = viewerModal.querySelector('#pdf-viewer-title');
        const pdfIframe = viewerModal.querySelector('#pdf-iframe');
        const pdfLoading = viewerModal.querySelector('#pdf-loading');

        viewerTitle.textContent = fileName;

        // Show loading indicator
        if (pdfLoading) {
            pdfLoading.style.display = 'flex';
        }

        // Set iframe src and add load event listener
        pdfIframe.onload = function () {
            // Hide loading indicator
            if (pdfLoading) {
                pdfLoading.style.display = 'none';
            }
        };

        // Handle iframe load errors
        pdfIframe.onerror = function () {
            // Hide loading indicator
            if (pdfLoading) {
                pdfLoading.style.display = 'none';
            }
        };

        // Set iframe src after setting up event handlers
        pdfIframe.src = pdfPath;

        // Show modal
        viewerModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function initializeTestimonialsCarousel() {
        const track = document.getElementById('testimonials-track');
        const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
        const indicators = Array.from(document.querySelectorAll('.testimonial-indicator'));
        const prevButton = document.getElementById('testimonials-prev-button');
        const nextButton = document.getElementById('testimonials-next-button');
        const progressBar = document.getElementById('testimonials-progress-bar');

        if (!track || !slides.length || !indicators.length) return;

        let currentIndex = 0;
        const slideCount = slides.length;
        let autoplayInterval;
        let progressInterval;
        let isPaused = false;
        const autoplayDuration = 6000; // 6 seconds per slide
        let isAnimating = false;

        function updateCarousel() {
            if (isAnimating) return;

            isAnimating = true;
            resetProgressBar();

            if (track) {
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }

            slides.forEach((slide, index) => {
                if (index === currentIndex) {
                    slide.classList.add('active');
                    slide.setAttribute('aria-hidden', 'false');
                    slide.classList.add('slide-in');
                    setTimeout(() => {
                        slide.classList.remove('slide-in');
                    }, 600);
                } else {
                    slide.classList.remove('active');
                    slide.setAttribute('aria-hidden', 'true');
                }
            });

            indicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                    indicator.setAttribute('aria-selected', 'true');
                } else {
                    indicator.classList.remove('active');
                    indicator.setAttribute('aria-selected', 'false');
                }
            });

            setTimeout(() => {
                isAnimating = false;
            }, 600);
        }

        function goToPrev() {
            if (isAnimating) return;
            currentIndex = (currentIndex - 1 + slideCount) % slideCount;
            updateCarousel();
        }

        function goToNext() {
            if (isAnimating) return;
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarousel();
        }

        function startProgressBar() {
            let width = 0;
            const increment = 100 / (autoplayDuration / 100);

            if (!progressBar) return;

            progressBar.style.width = '0%';

            if (progressInterval) {
                clearInterval(progressInterval);
            }

            progressInterval = setInterval(() => {
                width += increment;
                if (width >= 100) {
                    width = 100;
                    clearInterval(progressInterval);
                }
                progressBar.style.width = width + '%';
            }, 100);
        }

        function resetProgressBar() {
            if (progressInterval) {
                clearInterval(progressInterval);
            }

            if (!progressBar) return;

            progressBar.style.width = '0%';
            if (!isPaused) {
                startProgressBar();
            }
        }

        function startAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }

            startProgressBar();
            autoplayInterval = setInterval(goToNext, autoplayDuration);
        }

        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }

            if (progressInterval) {
                clearInterval(progressInterval);
            }

            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                goToPrev();
                if (!isPaused) {
                    stopAutoplay();
                    startAutoplay();
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                goToNext();
                if (!isPaused) {
                    stopAutoplay();
                    startAutoplay();
                }
            });
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (currentIndex === index || isAnimating) return;
                currentIndex = index;
                updateCarousel();
                if (!isPaused) {
                    stopAutoplay();
                    startAutoplay();
                }
            });
        });

        const testimonialContainer = document.querySelector('.testimonials-container');
        let touchStartX = 0;
        let touchEndX = 0;

        if (testimonialContainer) {
            testimonialContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                isPaused = true;
                stopAutoplay();
            }, { passive: true });

            testimonialContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();

                setTimeout(() => {
                    isPaused = false;
                    startAutoplay();
                }, 1000);
            }, { passive: true });
        }

        function handleSwipe() {
            const swipeThreshold = 50;
            const swipeDistance = touchEndX - touchStartX;

            if (swipeDistance > swipeThreshold) {
                goToPrev();
            } else if (swipeDistance < -swipeThreshold) {
                goToNext();
            }
        }

        if (testimonialContainer) {
            testimonialContainer.addEventListener('mouseenter', () => {
                isPaused = true;
                stopAutoplay();
            });

            testimonialContainer.addEventListener('mouseleave', () => {
                isPaused = false;
                startAutoplay();
            });
        }

        startAutoplay();
    }
});

// Subject search functionality
document.addEventListener('DOMContentLoaded', () => {
    const subjectSearch = document.getElementById('subjectSearch');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    // Define all subjects from the page
    const subjects = [
        // Semester 1 subjects
        { name: "Mathematics-I for CSE Stream", code: "BMATS101" },
        { name: "Applied Chemistry for CSE Stream", code: "BCHES102" },
        { name: "Computer-Aided Engineering Drawing", code: "BCADK103" },
        { name: "Introduction to Electronics Communication", code: "BESCK104C" },
        { name: "Introduction to Embedded System", code: "BETCK105J" },
        { name: "Communicative English", code: "BENGK106" },
        { name: "Samskrutika Kannada", code: "BKSK107" },
        { name: "Balake Kannada", code: "BKBKK107" },
        { name: "Scientific Foundations of Health", code: "BSFHK158" },

        // Semester 2 subjects
        { name: "Mathematics-II for CSE Stream", code: "BMATS201" },
        { name: "Mathematics-II for EEE Stream", code: "BMATE201" },
        { name: "Applied Physics for CSE Stream", code: "BPHYS202" },
        { name: "Applied Chemistry for CSE Stream", code: "BCHES202" },
        { name: "Applied Chemistry for EEE Stream", code: "BCHEE202" },
        { name: "Principles of Programming using C", code: "BPOPS203" },
        { name: "Computer Aided Engineering Drawing", code: "BCEDK203" },
        { name: "Introduction to Electrical Engineering", code: "BESCK204B" },
        { name: "Introduction to Electronics and Engineering", code: "BESCK204C" },
        { name: "Introduction to Python Programming", code: "BPLCK205B" },
        { name: "Professional Writing Skills in English", code: "BPWSK206" },
        { name: "Indian Constitution", code: "BICOK207" },
        { name: "Innovation and Design Thinking", code: "BIDTK258" },

        // Semester 3 subjects
        { name: "Data Structures and Algorithms", code: "BCS301" },

        // Semester 4 subjects
        { name: "Analysis & Design of Algorithms", code: "BCS401" },
        { name: "Microcontrollers", code: "BCS402" },
        { name: "Database Management Systems", code: "BCS403" },
        { name: "Analysis & Design of Algorithms Lab", code: "BCSL404" },
        { name: "Discrete Mathematical Structures", code: "BCS405A" },
        { name: "MongoDB Lab", code: "BDSL456B" },
        { name: "Biology For Engineers", code: "BBOK407" },
        { name: "Universal Human Values", code: "BUHK408" },
        { name: "Operating Systems", code: "BCS401" },

        // Semester 5+ subjects
        { name: "Database Management Systems", code: "BCS501" },
        { name: "Web Technologies", code: "BCS601" },
        { name: "Machine Learning", code: "BCS701" },
        { name: "Cloud Computing", code: "BCS801" }
    ];

    // Function to search subjects
    function searchSubjects(query) {
        query = query.toLowerCase().trim();
        if (!query) return [];

        return subjects.filter(subject =>
            subject.name.toLowerCase().includes(query) ||
            subject.code.toLowerCase().includes(query)
        );
    }

    // Function to display search results
    function displaySearchResults(results) {
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No subjects found matching your search</div>';
            searchResults.classList.add('active');
            return;
        }

        // Group subjects by semester
        const semesterGroups = {};

        results.forEach(subject => {
            // Extract semester from subject code (assuming format like "BMATS201" where 2 is semester)
            let semester = "";
            const codeMatch = subject.code.match(/\d/);
            if (codeMatch) {
                const semNumber = codeMatch[0];
                semester = `Semester ${semNumber}`;
            }

            if (!semesterGroups[semester]) {
                semesterGroups[semester] = [];
            }
            semesterGroups[semester].push(subject);
        });

        // Get search query for highlighting
        const query = subjectSearch.value.toLowerCase().trim();

        // Create DOM elements for each group
        Object.keys(semesterGroups).sort().forEach(semester => {
            const semesterSubjects = semesterGroups[semester];

            if (semesterSubjects.length > 0) {
                // Add semester header
                if (semester) {
                    const semesterHeader = document.createElement('div');
                    semesterHeader.className = 'search-result-semester';
                    semesterHeader.textContent = semester;
                    searchResults.appendChild(semesterHeader);
                }

                // Add subjects
                semesterSubjects.forEach(subject => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';

                    // Highlight matching text if there's a query
                    let displayName = subject.name;
                    let displayCode = subject.code;

                    if (query) {
                        // Highlight in name
                        const nameRegex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
                        displayName = displayName.replace(nameRegex, '<span class="highlight">$1</span>');

                        // Highlight in code
                        const codeRegex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
                        displayCode = displayCode.replace(codeRegex, '<span class="highlight">$1</span>');
                    }

                    resultItem.innerHTML = `
                        <div class="result-title">${displayName}</div>
                        <div class="result-code">${displayCode}</div>
                    `;

                    // Scroll to subject card when clicked
                    resultItem.addEventListener('click', () => {
                        // Find the subject card with this subject
                        const subjectCards = document.querySelectorAll('.subject-card');
                        let targetCard = null;

                        subjectCards.forEach(card => {
                            const subjectName = card.querySelector('h3').textContent;
                            const subjectCode = card.querySelector('.subject-code').textContent;

                            if (subjectName === subject.name && subjectCode === subject.code) {
                                targetCard = card;
                            }
                        });

                        if (targetCard) {
                            // Highlight the card temporarily
                            targetCard.style.boxShadow = '0 0 0 3px var(--primary-color)';
                            setTimeout(() => {
                                targetCard.style.boxShadow = '';
                            }, 2000);

                            // Scroll to the card
                            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

                            // Hide search results
                            searchResults.classList.remove('active');
                        }
                    });

                    searchResults.appendChild(resultItem);
                });
            }
        });

        searchResults.classList.add('active');
    }

    // Search on input
    if (subjectSearch) {
        subjectSearch.addEventListener('input', () => {
            const query = subjectSearch.value;
            if (query.length >= 2) {
                const results = searchSubjects(query);
                displaySearchResults(results);
            } else {
                searchResults.classList.remove('active');
            }
        });
    }

    // Search on button click
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = subjectSearch.value;
            if (query.length >= 2) {
                const results = searchSubjects(query);
                displaySearchResults(results);
            }
        });
    }

    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (searchResults && !searchResults.contains(e.target) && e.target !== subjectSearch && e.target !== searchButton) {
            searchResults.classList.remove('active');
        }
    });

    // Search on Enter key
    if (subjectSearch) {
        subjectSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = subjectSearch.value;
                if (query.length >= 2) {
                    const results = searchSubjects(query);
                    displaySearchResults(results);
                }
                e.preventDefault();
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const heroSection = document.querySelector('.hero-section');
    const icons = document.querySelectorAll('.floating-icons .icon');

    if (heroSection && icons.length) {
        heroSection.addEventListener('mousemove', function (e) {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            icons.forEach(icon => {
                const speed = parseFloat(icon.getAttribute('data-speed') || 0.05);
                const offsetX = (x - 0.5) * 50 * speed;
                const offsetY = (y - 0.5) * 50 * speed;

                icon.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            });
        });
    }

    icons.forEach((icon, index) => {
        const speed = 0.03 + (index * 0.01);
        icon.setAttribute('data-speed', speed.toString());
    });
});


