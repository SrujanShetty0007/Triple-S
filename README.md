# Triple-S Authentication

A simple authentication system for Triple-S using Firebase Authentication.

## Features

- Email/Password authentication
- Google authentication
- GitHub authentication
- Persistent sessions
- Responsive design
- User dashboard

## Deployment Instructions

### GitHub Pages Deployment

1. Fork this repository or push your code to a new GitHub repository
2. Go to your repository settings
3. Navigate to "Pages" in the sidebar
4. Under "Source", select "main" branch
5. Click "Save"
6. Your site will be published at `https://[your-username].github.io/[repository-name]/`

### Netlify Deployment

1. Create a Netlify account at [netlify.com](https://www.netlify.com/) if you don't have one
2. Click "New site from Git"
3. Select GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your repository
6. Configure build settings (not required for this static site)
7. Click "Deploy site"

## Firebase Configuration

This project uses Firebase for authentication. The Firebase configuration is already included in the code. If you want to use your own Firebase project:

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable Authentication in your Firebase project
3. Add Email/Password, Google, and GitHub as authentication providers
4. Replace the Firebase configuration in `login.html` and `index.html` with your own:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Local Development

To run this project locally:

1. Clone the repository
2. Open the project in your favorite code editor
3. Use a local server to serve the files (e.g., Live Server extension for VS Code)
4. Open the browser and navigate to the local server URL

## License

This project is licensed under the MIT License - see the LICENSE file for details. 