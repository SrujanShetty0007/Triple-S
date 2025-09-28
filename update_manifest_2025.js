/**
 * Update Manifest Tool for 2025 Scheme
 * 
 * This script scans the 2025_scheme directories and updates the manifest.json file.
 * Run this script whenever you add, remove, or update PDF files in the 2025_scheme folder.
 * 
 * Usage: node update_manifest_2025.js
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '2025_scheme');
const MANIFEST_PATH = path.join(BASE_DIR, 'manifest.json');

// Predefined subjects for each semester
const SEMESTER_SUBJECTS = {
    sem1: [
        'chemistry',
        'electronics',
        'embedded-systems',
        'engineering-drawing',
        'english',
        'health',
        'kannada',
        'mathematics'
    ],
    sem2: [
        'caed',
        'chemistry',
        'electrical',
        'mathematics',
        'physics',
        'programming-c',
        'python'
    ],
    sem3: [
        'data-structures'
    ],
    sem4: [
        'algorithms',
        'algorithms-lab',
        'biology',
        'database-systems',
        'discrete-mathematics',
        'human-values',
        'microcontrollers',
        'mongodb-lab'
    ],
    sem5: [
        'database-systems'
    ],
    sem6: [
        'web-technologies'
    ],
    sem7: [
        'machine-learning'
    ],
    sem8: [
        'cloud-computing'
    ]
};

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

        // Use predefined subjects if available, otherwise scan directory
        const subjectDirs = SEMESTER_SUBJECTS[semester] ||
            fs.readdirSync(semesterPath)
                .filter(item => fs.statSync(path.join(semesterPath, item)).isDirectory());

        console.log(`Found subjects for ${semester}:`, subjectDirs);

        subjectDirs.forEach(subject => {
            manifest[semester][subject] = {};
            const subjectPath = path.join(semesterPath, subject);

            // Ensure all material types are initialized even if directories don't exist
            const expectedMaterialTypes = ['model-papers', 'notes', 'previous-papers'];

            expectedMaterialTypes.forEach(materialType => {
                const materialPath = path.join(subjectPath, materialType);
                let pdfFiles = [];

                // Check if directory exists before scanning
                if (fs.existsSync(materialPath)) {
                    pdfFiles = scanDirectory(materialPath);
                }

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
    console.log('Starting manifest update for 2025 scheme...');

    try {
        const manifest = generateManifest();

        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

        console.log('2025 Scheme manifest updated successfully!');
        console.log(`Manifest saved to: ${MANIFEST_PATH}`);
    } catch (error) {
        console.error('Error updating 2025 scheme manifest:', error);
    }
}

updateManifest();