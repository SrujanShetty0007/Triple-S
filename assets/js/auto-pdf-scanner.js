/**
 * Auto PDF Scanner for GitHub Pages
 */

class PDFScanner {
    constructor() {
        this.pdfCache = new Map();
        this.manifestPath = 'assets/pdfs/manifest.json';
        this.cacheLifetime = 60000; // 1 minute
        this.cacheTimestamps = new Map();
    }

    /**
     * Initialize the scanner
     */
    init() {
        this.clearCache();
        setInterval(() => this.expireCacheEntries(), 30000);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.clearCache();
            }
        });
    }

    /**
     * Expire cache entries older than the cache lifetime
     */
    expireCacheEntries() {
        const now = Date.now();
        const expiredEntries = [];

        this.cacheTimestamps.forEach((timestamp, key) => {
            if (now - timestamp > this.cacheLifetime) {
                expiredEntries.push(key);
            }
        });

        expiredEntries.forEach(key => {
            this.pdfCache.delete(key);
            this.cacheTimestamps.delete(key);
        });
    }

    /**
     * Clear the PDF cache
     */
    clearCache() {
        this.pdfCache.clear();
        this.cacheTimestamps.clear();
        localStorage.setItem('pdf_cache_cleared', Date.now().toString());
    }

    /**
     * Format a filename for display
     */
    formatDisplayName(filename) {
        return filename
            .replace('.pdf', '')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Scan a directory for PDF files
     */
    async scanDirectory(directoryPath, forceRefresh = false) {
        // Check cache first, unless force refresh is requested
        if (!forceRefresh && this.pdfCache.has(directoryPath)) {
            const now = Date.now();
            const timestamp = this.cacheTimestamps.get(directoryPath);

            if (timestamp && now - timestamp < this.cacheLifetime) {
                return this.pdfCache.get(directoryPath);
            }
        }

        try {
            const manifestResults = await this.getFilesFromManifest(directoryPath);

            this.pdfCache.set(directoryPath, manifestResults);
            this.cacheTimestamps.set(directoryPath, Date.now());

            return manifestResults;
        } catch (error) {
            console.error('Error scanning directory:', error);

            if (this.pdfCache.has(directoryPath)) {
                return this.pdfCache.get(directoryPath);
            }

            return [];
        }
    }

    /**
     * Get files from the manifest.json file
     */
    async getFilesFromManifest(directoryPath) {
        try {
            const manifest = await this.loadManifest();
            const pathParts = directoryPath.split('/');

            const baseIndex = pathParts.indexOf('pdfs');
            if (baseIndex === -1) return [];

            const semester = pathParts[baseIndex + 1];
            const subject = pathParts[baseIndex + 2];
            const materialType = pathParts[baseIndex + 3];

            if (manifest &&
                manifest[semester] &&
                manifest[semester][subject] &&
                manifest[semester][subject][materialType]) {

                const files = manifest[semester][subject][materialType];
                return files.map(file => ({
                    name: file.name || this.formatDisplayName(file.filename),
                    path: `${directoryPath}/${file.filename}`
                }));
            }
        } catch (error) {
            console.warn('Error getting files from manifest:', error);
        }

        return [];
    }

    /**
     * Load the manifest.json file
     */
    async loadManifest() {
        try {
            const timestamp = Date.now();
            const response = await fetch(`${this.manifestPath}?t=${timestamp}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`Failed to load manifest: ${response.status}`);
            }

            const manifest = await response.json();

            try {
                localStorage.setItem('pdf_manifest_cache', JSON.stringify(manifest));
            } catch (e) {
                console.warn('Could not cache manifest in localStorage', e);
            }

            return manifest;
        } catch (error) {
            console.warn('Error loading manifest:', error);

            try {
                const cachedManifest = localStorage.getItem('pdf_manifest_cache');
                if (cachedManifest) {
                    return JSON.parse(cachedManifest);
                }
            } catch (e) {
                console.warn('Could not load cached manifest', e);
            }

            return null;
        }
    }
}

// Create global instance
window.pdfScanner = new PDFScanner();

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pdfScanner.init();
}); 