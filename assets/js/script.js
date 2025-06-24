document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const filterBtns = document.querySelectorAll('.filter-btn');
    const semesterSections = document.querySelectorAll('.semester-section');
    const subjectCards = document.querySelectorAll('.subject-card');
    const welcomeBanner = document.querySelector('.welcome-banner');

    // Form Elements
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

    // Contact info
    const adminWhatsapp = '8217358117';
    const adminEmail = 'srujanshetty0007@gmail.com';

    if (window.pdfScanner) {
        window.pdfScanner.clearCache();
    }

    // Initialize all functionality
    initializeAnimations();
    initializeFormHandling();
    initializeSemesterFiltering();
    initializePdfLinks();

    if (window.location.search.includes('submitted=true')) {
        showThankYouMessage();
    }

    function initializeAnimations() {
        setTimeout(() => {
            if (welcomeBanner) welcomeBanner.classList.add('animated');
        }, 300);

        subjectCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 * index);
        });
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
        if (!studentNameInput.value.trim()) {
            alert('Please enter your name');
            return false;
        }

        if (!semesterSelect.value) {
            alert('Please select a semester');
            return false;
        }

        if (!subjectSelect.value) {
            alert('Please select a subject');
            return false;
        }

        if (!materialTypeSelect.value) {
            alert('Please select a material type');
            return false;
        }

        if (!fileUpload.files[0]) {
            alert('Please upload a file');
            return false;
        }

        const file = fileUpload.files[0];
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];

        const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValidExtension) {
            alert('Please upload a valid PDF, JPG, JPEG, or PNG file');
            return false;
        }

        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 20MB. Your file is ' + (file.size / (1024 * 1024)).toFixed(2) + 'MB');
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

                semesterSections.forEach(section => {
                    if (semester === 'all') {
                        section.style.display = 'block';
                    } else {
                        if (section.id === semester) {
                            section.style.display = 'block';
                        } else {
                            section.style.display = 'none';
                        }
                    }
                });
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
                <a href="${viewPath}" class="pdf-view-btn" target="_blank">
                    <i class="fas fa-eye"></i> View
                </a>
                <a href="${filePath}?download=true" class="pdf-download-btn" download="${fileName}">
                    <i class="fas fa-download"></i> Download
                </a>
            </div>
        `;

        container.appendChild(fileItem);
    }
});

// Hero Section Animation
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
