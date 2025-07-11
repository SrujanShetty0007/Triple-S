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
            // Show loading indicator
            this.showLoading();

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

            // Save the new PDF as a blob
            const modifiedPdfBytes = await newPdfDoc.save();
            const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

            // Hide loading indicator
            this.hideLoading();

            return blob;
        } catch (error) {
            console.error('Error watermarking PDF:', error);
            this.hideLoading();
            throw error;
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        let loadingEl = document.getElementById('pdf-watermarking-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'pdf-watermarking-loading';
            loadingEl.className = 'pdf-watermarking-loading';
            loadingEl.innerHTML = `
                <div class="pdf-watermarking-spinner"></div>
                <p>Preparing watermarked PDF...</p>
            `;
            document.body.appendChild(loadingEl);
        }
        loadingEl.style.display = 'flex';
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingEl = document.getElementById('pdf-watermarking-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
}

// Initialize watermarker when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pdfWatermarker = new PDFWatermarker();
}); 