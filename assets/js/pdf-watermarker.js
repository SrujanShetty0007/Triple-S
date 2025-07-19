/**
 * PDF Watermarker - Adds persistent watermarks to downloaded PDFs
 * Uses PDF.js and PDF-Lib to modify PDFs before download
 */

class PDFWatermarker {
    constructor() {
        this.watermarkText = "TRIPLE-S";
        this.opacity = 0.2;
    }

    /**
     * Add watermark to a PDF and return a Blob for download
     * @param {string} pdfUrl - URL to the PDF file
     * @returns {Promise<Blob>} - Blob containing the watermarked PDF
     */
    async watermarkPDF(pdfUrl) {
        try {
            // Show loading indicator - preparing state
            this.showLoading('preparing');

            // Load the PDF document using PDF-Lib
            const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
            const newPdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

            // Get the font
            const helveticaFont = await newPdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

            // Process each page
            const pages = newPdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();

                // Calculate appropriate font size based on page dimensions
                const fontSize = Math.min(width, height) * 0.18;

                // Add watermark text to page
                page.drawText(this.watermarkText, {
                    x: width * 0.1,
                    y: height / 2,
                    size: fontSize,
                    font: helveticaFont,
                    opacity: this.opacity,
                    color: PDFLib.rgb(0.4, 0.4, 0.4),
                    rotate: PDFLib.degrees(-30),
                    textAlign: PDFLib.TextAlignment.Center,
                    maxWidth: width * 0.8
                });
            }

            // Update loading indicator - downloading state
            this.updateLoading('downloading');

            // Save the new PDF as a blob
            const modifiedPdfBytes = await newPdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

            // Show completed state briefly before hiding
            this.updateLoading('completed');

            // Hide loading indicator after a brief delay to show completion
            setTimeout(() => {
                this.hideLoading();
            }, 1000);

            return blob;
        } catch (error) {
            console.error('Error watermarking PDF:', error);
            this.updateLoading('error');
            setTimeout(() => {
                this.hideLoading();
            }, 2000);
            throw error;
        }
    }

    /**
     * Show loading indicator
     * @param {string} state - Current state of the download process
     */
    showLoading(state = 'preparing') {
        let loadingEl = document.getElementById('pdf-watermarking-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'pdf-watermarking-loading';
            loadingEl.className = 'pdf-watermarking-loading';
            document.body.appendChild(loadingEl);
        }

        this.updateLoading(state);
        loadingEl.style.display = 'flex';
    }

    /**
     * Update loading indicator message based on state
     * @param {string} state - Current state of the download process
     */
    updateLoading(state) {
        const loadingEl = document.getElementById('pdf-watermarking-loading');
        if (!loadingEl) return;

        let message = '';
        let iconClass = 'pdf-watermarking-spinner';

        switch (state) {
            case 'preparing':
                message = 'Preparing watermarked PDF...';
                break;
            case 'downloading':
                message = 'Finalizing download...';
                break;
            case 'completed':
                message = 'Download complete!';
                iconClass = 'pdf-watermarking-success';
                break;
            case 'error':
                message = 'Download failed. Trying direct download...';
                iconClass = 'pdf-watermarking-error';
                break;
            default:
                message = 'Processing PDF...';
        }

        loadingEl.innerHTML = `
            <div class="${iconClass}"></div>
            <p>${message}</p>
        `;
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingEl = document.getElementById('pdf-watermarking-loading');
        if (loadingEl) {
            loadingEl.classList.add('fade-out');
            setTimeout(() => {
                loadingEl.style.display = 'none';
                loadingEl.classList.remove('fade-out');
            }, 300);
        }
    }
}

// Initialize watermarker when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pdfWatermarker = new PDFWatermarker();
}); 