/**
 * Update Manifest Tool
 * 
 * This script scans the PDF directories and updates the manifest.json file.
 * Run this script whenever you add, remove, or update PDF files.
 * 
 * Usage: node update_manifest.js
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'assets', 'pdfs');
const MANIFEST_PATH = path.join(BASE_DIR, 'manifest.json');

function formatDisplayName(filename) {
    return filename
        .replace('.pdf', '')
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function scanDirectory(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);
        return files.filter(file => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            return stat.isFile() && ['.pdf', '.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase());
        });
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error);
        return [];
    }
}

function generateManifest() {
    const manifest = {};

    const semesterDirs = fs.readdirSync(BASE_DIR)
        .filter(item => item.startsWith('sem') && fs.statSync(path.join(BASE_DIR, item)).isDirectory());

    console.log('Found semesters:', semesterDirs);

    semesterDirs.forEach(semester => {
        manifest[semester] = {};
        const semesterPath = path.join(BASE_DIR, semester);

        const subjectDirs = fs.readdirSync(semesterPath)
            .filter(item => fs.statSync(path.join(semesterPath, item)).isDirectory());

        console.log(`Found subjects for ${semester}:`, subjectDirs);

        subjectDirs.forEach(subject => {
            manifest[semester][subject] = {};
            const subjectPath = path.join(semesterPath, subject);

            const materialTypeDirs = fs.readdirSync(subjectPath)
                .filter(item => fs.statSync(path.join(subjectPath, item)).isDirectory());

            materialTypeDirs.forEach(materialType => {
                const materialPath = path.join(subjectPath, materialType);
                const pdfFiles = scanDirectory(materialPath);

                manifest[semester][subject][materialType] = pdfFiles.map(filename => ({
                    filename,
                    name: formatDisplayName(filename)
                }));

                console.log(`Found ${pdfFiles.length} files in ${semester}/${subject}/${materialType}`);
            });
        });
    });

    return manifest;
}

function updateManifest() {
    console.log('Starting manifest update...');

    try {
        const manifest = generateManifest();

        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

        console.log('Manifest updated successfully!');
        console.log(`Manifest saved to: ${MANIFEST_PATH}`);
    } catch (error) {
        console.error('Error updating manifest:', error);
    }
}

updateManifest(); 