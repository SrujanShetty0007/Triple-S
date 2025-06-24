# Triple S - Student Study Support

A website for sharing study materials organized by semester and subject.

## Features

- **Automatic PDF Detection**: Add, remove, or replace PDF files in the appropriate folders, and the website will automatically display them without manual HTML edits.
- **Organized Structure**: Content is organized by semester, subject, and material type (notes, model papers, previous papers).
- **Mobile Responsive**: Works well on all device sizes.
- **Static Site**: Fully compatible with GitHub Pages hosting (no server-side code).

## How to Add New PDFs

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
   - Run the `update-website.bat` script
   - This will scan all folders and update the manifest.json file

3. **View the website**
   - Open `index.html` in your browser
   - Your new PDFs should now appear in the correct location

## Folder Structure

The website uses the following folder structure for PDFs:

```
assets/
└── pdfs/
    ├── manifest.json
    ├── sem1/
    │   ├── mathematics/
    │   │   ├── notes/
    │   │   ├── model-papers/
    │   │   └── previous-papers/
    │   └── [other-subjects]/
    ├── sem2/
    │   ├── python-programming/
    │   │   ├── notes/
    │   │   ├── model-papers/
    │   │   └── previous-papers/
    │   └── [other-subjects]/
    └── [other-semesters]/
```

## File Naming

For best results, name your PDF files descriptively. The system will automatically format the display name by:
- Removing the .pdf extension
- Converting underscores and hyphens to spaces
- Capitalizing each word

Example: `python_module_5.pdf` will display as "Python Module 5"

## Troubleshooting

If your PDFs don't appear on the website:

1. Make sure you've run the `update-website.bat` script after adding files
2. Check that the files are in the correct folder structure
3. Verify that the files have a `.pdf` extension
4. Try clearing your browser cache or opening in a private/incognito window

## License

This project is open source and available under the [MIT License](LICENSE).

---

Developed by Srujan Shetty 