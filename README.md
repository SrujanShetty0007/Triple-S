# Triple S - Student Study Support

A comprehensive educational resource platform for students to access, share, and contribute study materials organized by semester and subject. Triple S aims to simplify exam preparation by providing a centralized repository of notes, model papers, and previous year question papers.

![Triple S Logo](assets/images/logo1.png)

## 📑 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Adding New Study Materials](#adding-new-study-materials)
  - [File Naming Conventions](#file-naming-conventions)
  - [Updating the Website](#updating-the-website)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Technology Stack](#technology-stack)
- [License](#license)
- [Contact](#contact)

## ✨ Features

- **Automatic PDF Detection**: Add, remove, or replace PDF files in the appropriate folders, and the website will automatically display them without manual HTML edits.
- **Organized Content**: Materials organized by semester, subject, and type (notes, model papers, previous papers).
- **Mobile-First Design**: Fully responsive interface that works well on all device sizes, from mobile phones to desktops.
- **PDF Viewer**: Built-in mobile-friendly PDF viewer for seamless reading experience.
- **Contribution System**: Users can contribute their own study materials through the web interface.
- **Testimonials Section**: Showcases student feedback and experiences.
- **Semester Filtering**: Easily filter content by semester.
- **Static Site Architecture**: Fully compatible with GitHub Pages hosting (no server-side code required).

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of file management
- Git (optional, for cloning the repository)

### Installation

#### Option 1: Clone the Repository

```bash
git clone https://github.com/srujanshetty0007/Triple-S.git
cd Triple-S
```

#### Option 2: Download as ZIP

1. Download the ZIP file from the GitHub repository
2. Extract the contents to your desired location
3. Open the folder

## 📋 Usage

### Adding New Study Materials

1. **Place PDF files in the appropriate folder**
   - Navigate to the correct folder structure:
     ```
     assets/pdfs/[semester]/[subject]/[type]
     ```
   - Where:
     - `[semester]` is sem1, sem2, etc.
     - `[subject]` is the subject folder name (e.g., mathematics, python-programming)
     - `[type]` is one of: notes, model-papers, or previous-papers

2. **Update the manifest**
   - Run the `update-website.bat` script (Windows) or manually run:
     ```bash
     node update_manifest.js
     ```
   - This will scan all folders and update the manifest.json file

3. **View the website**
   - Open `index.html` in your browser
   - Your new PDFs should now appear in the correct location

### File Naming Conventions

For best results, name your PDF files descriptively. The system will automatically format the display name by:
- Removing the .pdf extension
- Converting underscores and hyphens to spaces
- Capitalizing each word

Example: `python_module_5.pdf` will display as "Python Module 5"

### Updating the Website

If you've made changes to the code or structure:

1. Test locally by opening `index.html` in your browser
2. If using GitHub Pages:
   - Commit and push your changes to the repository
   - GitHub will automatically build and deploy the updated site

## 📁 Project Structure

```
Triple-S/
├── assets/
│   ├── css/             # Stylesheet files
│   ├── images/          # Images and icons
│   ├── js/              # JavaScript files
│   └── pdfs/            # PDF study materials
│       ├── manifest.json
│       ├── sem1/
│       │   ├── [subject]/
│       │   │   ├── notes/
│       │   │   ├── model-papers/
│       │   │   └── previous-papers/
│       └── [other-semesters]/
├── mobile-pdf-viewer/   # Mobile-friendly PDF viewer
├── index.html           # Home page
├── about.html           # About page
├── feedback.html        # Feedback page
├── update_manifest.js   # Script to update PDF manifest
└── README.md            # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Add Study Materials**: Add your own notes, model papers, or previous papers
2. **Report Issues**: Create an issue if you find bugs or have suggestions
3. **Submit Improvements**: Create a pull request with code improvements
4. **Share Feedback**: Use the feedback form on the website

## ❓ Troubleshooting

If your PDFs don't appear on the website:

1. Make sure you've run the `update-website.bat` script after adding files
2. Check that the files are in the correct folder structure
3. Verify that the files have a `.pdf` extension
4. Check the console for JavaScript errors
5. Try clearing your browser cache or opening in a private/incognito window

## 💻 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PDF Processing**: Node.js for manifest generation
- **PDF Viewing**: pdf.js for in-browser PDF rendering
- **Hosting**: Compatible with GitHub Pages
- **External Libraries**: Font Awesome for icons

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

- **Developer**: Srujan Shetty
- **Email**: triples.studies.edu@gmail.com
- **GitHub**: [srujanshetty0007](https://github.com/srujanshetty0007)

---

<p align="center">
  Triple S - Empowering Students with Knowledge
</p> 