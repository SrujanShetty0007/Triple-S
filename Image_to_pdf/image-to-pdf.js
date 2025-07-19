// Get DOM elements
const imageUpload = document.getElementById('image-upload');
const previewContainer = document.getElementById('preview-container');
const downloadBtn = document.getElementById('download-btn');
const previewHeader = document.getElementById('preview-header');
const previewCount = document.getElementById('preview-count');
const clearBtn = document.getElementById('clear-btn');
const optionsSection = document.getElementById('options-section');
const pdfNameInput = document.getElementById('pdf-name');
const pageSizeSelect = document.getElementById('page-size');
const pageOrientationSelect = document.getElementById('page-orientation');
const imageQualitySelect = document.getElementById('image-quality');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const uploadArea = document.getElementById('upload-area');

// Store uploaded images
let uploadedImages = [];

// Listen for file selection
imageUpload.addEventListener('change', handleFileSelection);

// Handle file selection
function handleFileSelection(event) {
    const files = event.target.files;

    if (files.length === 0) return;

    // Process each file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check if file is an image
        if (!file.type.match('image.*')) continue;

        // Add to uploaded images array
        uploadedImages.push(file);

        // Create image preview
        createImagePreview(file, uploadedImages.length - 1);
    }

    // Update UI
    updateUI();
}

// Create image preview
function createImagePreview(file, index) {
    // Create preview element
    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.dataset.index = index;

    // Create loading animation
    preview.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i></div>';

    // Create image element
    const img = document.createElement('img');

    // Read file and set as image source
    const reader = new FileReader();
    reader.onload = function (e) {
        img.src = e.target.result;
        // Remove loading animation when image is loaded
        img.onload = function () {
            preview.innerHTML = '';
            preview.appendChild(img);

            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeImage(index);
            });
            preview.appendChild(removeBtn);
        };
    };
    reader.readAsDataURL(file);

    // Add preview to container
    previewContainer.appendChild(preview);
}

// Remove an image
function removeImage(index) {
    // Remove from array
    uploadedImages = uploadedImages.filter((_, i) => i !== index);

    // Clear all previews
    previewContainer.innerHTML = '';

    // Recreate previews with new indices
    uploadedImages.forEach((file, i) => {
        createImagePreview(file, i);
    });

    // Update UI
    updateUI();
}

// Clear all images
clearBtn.addEventListener('click', function () {
    // Clear array
    uploadedImages = [];

    // Clear previews
    previewContainer.innerHTML = '';

    // Update UI
    updateUI();
});

// Update UI based on current state
function updateUI() {
    // Show preview header and options if images are uploaded
    if (uploadedImages.length > 0) {
        previewHeader.style.display = 'flex';
        optionsSection.style.display = 'block';
        previewCount.textContent = `${uploadedImages.length} ${uploadedImages.length === 1 ? 'image' : 'images'} selected`;
        downloadBtn.disabled = false;
    } else {
        previewHeader.style.display = 'none';
        optionsSection.style.display = 'none';
        downloadBtn.disabled = true;
    }
}

// Handle PDF download
downloadBtn.addEventListener('click', function () {
    if (uploadedImages.length === 0) return;

    // Show loading state
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating PDF...';

    // Show progress container
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = 'Processing: 0%';

    // Get PDF options
    const pdfName = pdfNameInput.value || 'converted-images';
    const pageSize = pageSizeSelect.value;
    const orientation = pageOrientationSelect.value;
    const quality = getQualityValue(imageQualitySelect.value);

    // Create PDF document
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: pageSize
    });

    // Process each image
    processImages(pdf, 0, pdfName, quality);
});

// Get quality value based on selection
function getQualityValue(quality) {
    switch (quality) {
        case 'high': return 0.95;
        case 'medium': return 0.75;
        case 'low': return 0.5;
        default: return 0.95;
    }
}

// Process images recursively
function processImages(pdf, index, pdfName, quality) {
    if (index >= uploadedImages.length) {
        // All images processed, save PDF
        pdf.save(`${pdfName}.pdf`);

        // Reset button state
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';

        // Hide progress
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 1000);

        return;
    }

    // Update progress
    const progress = Math.round((index / uploadedImages.length) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Processing: ${progress}%`;

    const file = uploadedImages[index];
    const reader = new FileReader();

    reader.onload = function (e) {
        // Create image element to get dimensions
        const img = new Image();
        img.src = e.target.result;

        img.onload = function () {
            // Fix orientation using canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the image on the canvas with correct orientation
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(img, 0, 0, img.width, img.height);
            ctx.restore();

            // Add new page for each image except the first one
            if (index > 0) {
                pdf.addPage();
            }

            // Calculate dimensions to fit image on page while maintaining aspect ratio
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            let imgWidth = img.width;
            let imgHeight = img.height;

            // Scale down if image is larger than page
            const ratio = Math.min(
                pageWidth / imgWidth,
                pageHeight / imgHeight
            ) * 0.9; // 90% of max size to add some margin

            imgWidth *= ratio;
            imgHeight *= ratio;

            // Calculate position to center image on page
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            // Add image to PDF with rotation fix
            pdf.addImage(
                canvas.toDataURL('image/jpeg', quality),
                'JPEG',
                x,
                y,
                imgWidth,
                imgHeight,
                null,
                'FAST',
                0
            );

            // Process next image
            setTimeout(() => {
                processImages(pdf, index + 1, pdfName, quality);
            }, 50);
        };
    };

    reader.readAsDataURL(file);
}

// Add drag and drop functionality
function setupDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    uploadArea.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    uploadArea.classList.add('highlight');
}

function unhighlight() {
    uploadArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    imageUpload.files = files;

    // Trigger change event manually
    const event = new Event('change');
    imageUpload.dispatchEvent(event);
}

// Initialize
setupDragAndDrop();
updateUI();