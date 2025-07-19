// AI Study Planner - Core Logic
class StudyPlanner {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.geminiApiKey = "AIzaSyBgNb24UuDYtaGWnkrb4VGWWikOjORNb_A"; // Default API key
        this.isAuthenticated = false; // Track authentication status
        this.loadSavedApiKey(); // Load saved API key if available
        this.checkAuthStatus();
    }

    initializeElements() {
        this.daysLeftInput = document.getElementById('daysLeft');
        this.subjectsInput = document.getElementById('subjects');
        this.hoursPerDayInput = document.getElementById('hoursPerDay');
        this.learningStyleSelect = document.getElementById('learningStyle');
        this.generateBtn = document.getElementById('generateBtn');
        this.outputSection = document.getElementById('outputSection');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.studyPlan = document.getElementById('studyPlan');
        this.copyBtn = document.getElementById('copyBtn');
        this.authOverlay = document.getElementById('authOverlay');
        this.authRequiredBanner = document.getElementById('authRequiredBanner');
        this.inputSection = document.getElementById('inputSection');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.handleGenerateClick());
        this.copyBtn.addEventListener('click', () => this.copyStudyPlan());
        [this.daysLeftInput, this.subjectsInput, this.hoursPerDayInput].forEach(input => {
            input.addEventListener('input', () => this.validateForm());
            input.addEventListener('click', (e) => this.handleInputClick(e));
            this.validateForm();
        });

        // Add click handler for learning style select
        this.learningStyleSelect.addEventListener('click', (e) => this.handleInputClick(e));
    }

    // Check authentication status from Firebase
    checkAuthStatus() {
        // This will be handled by the Firebase auth state change listener in the HTML
        // We'll just set up the method here for completeness
    }

    // Handle input field clicks
    handleInputClick(e) {
        if (!this.isAuthenticated) {
            e.preventDefault();
            this.showAuthModal();
        }
    }

    // Show authentication modal
    showAuthModal() {
        if (this.authOverlay) {
            this.authOverlay.style.display = 'flex';
        }
    }

    // Handle generate button click
    handleGenerateClick() {
        if (!this.isAuthenticated) {
            this.showAuthModal();
            return;
        }

        this.generateStudyPlan();
    }

    // Set authentication state
    setAuthState(isAuthenticated) {
        this.isAuthenticated = isAuthenticated;

        if (isAuthenticated) {
            this.showAuthenticatedState();
        } else {
            this.showUnauthenticatedState();
        }
    }

    // Show authenticated state UI
    showAuthenticatedState() {
        if (this.authRequiredBanner) this.authRequiredBanner.style.display = 'none';
        if (this.inputSection) this.inputSection.classList.remove('form-disabled');

        // Enable form inputs
        const formInputs = document.querySelectorAll('#inputSection input, #inputSection select');
        formInputs.forEach(input => {
            input.disabled = false;
        });

        this.validateForm(); // Re-validate form to update button state
    }

    // Show unauthenticated state UI
    showUnauthenticatedState() {
        if (this.authRequiredBanner) this.authRequiredBanner.style.display = 'block';
        if (this.inputSection) this.inputSection.classList.add('form-disabled');

        // Disable form inputs
        const formInputs = document.querySelectorAll('#inputSection input, #inputSection select');
        formInputs.forEach(input => {
            input.disabled = true;
        });

        // Disable generate button
        if (this.generateBtn) this.generateBtn.disabled = true;
    }

    validateForm() {
        const daysLeft = this.daysLeftInput.value.trim();
        const subjects = this.subjectsInput.value.trim();
        const hoursPerDay = this.hoursPerDayInput.value.trim();
        const isValid = daysLeft && subjects && hoursPerDay &&
            parseInt(daysLeft) > 0 && parseInt(daysLeft) <= 365 &&
            parseInt(hoursPerDay) > 0 && parseInt(hoursPerDay) <= 24;

        // Only enable button if form is valid AND user is authenticated
        this.generateBtn.disabled = !isValid || !this.isAuthenticated;
        return isValid;
    }

    async generateStudyPlan() {
        if (!this.validateForm()) {
            this.showError('Please fill in all fields with valid values.');
            return;
        }

        // Double-check authentication
        if (!this.isAuthenticated) {
            this.showAuthModal();
            return;
        }

        this.showLoading();
        this.outputSection.style.display = 'block';
        this.outputSection.classList.add('show');
        try {
            const daysLeft = parseInt(this.daysLeftInput.value);
            const subjects = this.subjectsInput.value.trim();
            const hoursPerDay = parseInt(this.hoursPerDayInput.value);
            const learningStyle = this.learningStyleSelect.value;
            let studyPlan = null;
            try {
                studyPlan = await this.callGeminiAPI(daysLeft, subjects, hoursPerDay, learningStyle);
            } catch (error) {
                if (!localStorage.getItem('geminiApiKey')) {
                    this.promptForApiKey();
                } else {
                    this.geminiApiKey = localStorage.getItem('geminiApiKey');
                    studyPlan = await this.callGeminiAPI(daysLeft, subjects, hoursPerDay, learningStyle);
                }
            }
            if (studyPlan) {
                this.displayStudyPlan(studyPlan);
            }
        } catch (error) {
            this.showError('Failed to generate study plan. Please check your internet connection and try again.');
        } finally {
            this.hideLoading();
        }
    }

    promptForApiKey() {
        const apiKey = prompt('Please enter your Gemini API key to generate study plans:');
        if (apiKey && apiKey.trim()) {
            this.geminiApiKey = apiKey.trim();
            localStorage.setItem('geminiApiKey', this.geminiApiKey);
            this.generateStudyPlan();
        } else {
            this.showError('API key is required to generate study plans.');
            this.hideLoading();
        }
    }

    async callGeminiAPI(daysLeft, subjects, hoursPerDay, learningStyle) {
        const prompt = this.createPrompt(daysLeft, subjects, hoursPerDay, learningStyle);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return this.createBackupPlan(daysLeft, subjects, hoursPerDay, learningStyle);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('API request timed out. Please try again.');
            }
            throw error;
        }
    }

    // Fallback plan if API fails
    createBackupPlan(daysLeft, subjects, hoursPerDay, learningStyle) {
        const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s);
        let plan = "# Your AI-Optimized Study Plan\n\n";
        if (learningStyle) {
            plan += `## Personalized for ${this.getLearningStyleName(learningStyle)} Learners\n\n`;
            plan += this.getLearningStyleTips(learningStyle);
            plan += "\n\n";
        }
        const subjectsPerDay = Math.ceil(subjectList.length / daysLeft);
        const hoursPerSubject = Math.floor(hoursPerDay / subjectsPerDay);
        for (let day = 1; day <= Math.min(daysLeft, 30); day++) {
            plan += `## Day ${day}\n\n`;
            const daySubjects = subjectList.slice(
                ((day - 1) % Math.ceil(daysLeft / subjectList.length)) * subjectsPerDay,
                ((day - 1) % Math.ceil(daysLeft / subjectList.length) + 1) * subjectsPerDay
            );
            daySubjects.forEach((subject, i) => {
                plan += `* ${subject} (${hoursPerSubject} hours)\n`;
                if (learningStyle) {
                    const activities = this.getLearningStyleActivities(learningStyle, subject);
                    activities.forEach(activity => {
                        plan += `  * ${activity}\n`;
                    });
                } else {
                    plan += `  * Study theory: ${Math.floor(hoursPerSubject * 0.5)} hours\n`;
                    plan += `  * Practice problems: ${Math.floor(hoursPerSubject * 0.5)} hours\n`;
                }
            });
            plan += "\n";
        }
        plan += "## Final Week Tips\n\n";
        plan += "* Review all subjects daily\n";
        plan += "* Focus on practice problems\n";
        plan += "* Get enough sleep before exams\n";
        plan += "* Use spaced repetition techniques for better retention\n";
        return plan;
    }

    getLearningStyleName(style) {
        const styles = {
            'visual': 'Visual',
            'auditory': 'Auditory',
            'reading': 'Reading/Writing',
            'kinesthetic': 'Kinesthetic'
        };
        return styles[style] || 'Personalized';
    }

    getLearningStyleTips(style) {
        switch (style) {
            case 'visual':
                return "As a visual learner, you learn best through images, diagrams, and spatial understanding. Focus on creating mind maps, using color-coding in your notes, and watching educational videos.";
            case 'auditory':
                return "As an auditory learner, you learn best through listening and speaking. Focus on recording lectures, participating in group discussions, and explaining concepts out loud.";
            case 'reading':
                return "As a reading/writing learner, you learn best through text-based materials. Focus on taking detailed notes, reading textbooks, and writing summaries of key concepts.";
            case 'kinesthetic':
                return "As a kinesthetic learner, you learn best through hands-on activities. Focus on practical applications, building models, and using physical movement while studying.";
            default:
                return "Your study plan has been optimized based on general best practices for effective learning.";
        }
    }

    getLearningStyleActivities(style, subject) {
        switch (style) {
            case 'visual':
                return [
                    `Create mind maps for ${subject} concepts (30 min)`,
                    `Watch video tutorials on ${subject} (45 min)`,
                    `Use color-coded notes for ${subject} formulas (30 min)`,
                    `Draw diagrams to visualize ${subject} processes (45 min)`
                ];
            case 'auditory':
                return [
                    `Record yourself explaining ${subject} concepts (30 min)`,
                    `Discuss ${subject} topics with study partners (45 min)`,
                    `Listen to ${subject} lectures or podcasts (45 min)`,
                    `Recite ${subject} formulas and definitions out loud (30 min)`
                ];
            case 'reading':
                return [
                    `Read ${subject} textbook chapters and take notes (45 min)`,
                    `Write summaries of key ${subject} concepts (30 min)`,
                    `Create flashcards for ${subject} terminology (30 min)`,
                    `Practice ${subject} problems and write out solutions (45 min)`
                ];
            case 'kinesthetic':
                return [
                    `Build physical models related to ${subject} concepts (45 min)`,
                    `Use manipulatives to understand ${subject} problems (30 min)`,
                    `Study ${subject} while walking or moving (30 min)`,
                    `Apply ${subject} concepts to real-world scenarios (45 min)`
                ];
            default:
                return [
                    `Study ${subject} theory (45 min)`,
                    `Practice ${subject} problems (45 min)`,
                    `Review ${subject} notes (30 min)`,
                    `Test yourself on ${subject} concepts (30 min)`
                ];
        }
    }

    createPrompt(daysLeft, subjects, hoursPerDay, learningStyle) {
        let prompt = `You are an expert academic advisor helping a student create a personalized study plan. \n\nSTUDENT INFORMATION:\n- Days until exam: ${daysLeft} days\n- Subjects to study: ${subjects}\n- Hours available per day: ${hoursPerDay} hours`;
        if (learningStyle) {
            prompt += `\n- Learning style: ${this.getLearningStyleName(learningStyle)}`;
        }
        prompt += `\n\nTASK: Create a detailed, day-by-day study plan that:\n1. Distributes study time across all subjects evenly\n2. Includes theory, practice, and revision for each subject\n3. Uses a friendly, motivational tone\n4. Provides specific, actionable tasks for each day\n5. Includes time for breaks and review sessions\n6. Adapts the plan based on the number of days available`;
        if (learningStyle) {
            prompt += `\n7. Tailors study activities to the student's ${this.getLearningStyleName(learningStyle)} learning style`;
        }
        prompt += `\n\nFORMAT YOUR RESPONSE AS:\n- Use clear headings for each day (Day 1, Day 2, etc.)\n- Include time allocations for each activity\n- Use bullet points for easy reading\n- Add motivational messages and study tips\n- Include a weekly review schedule\n- End with final exam preparation tips\n\nKeep the plan concise but comprehensive. Be direct and practical.`;
        return prompt;
    }

    displayStudyPlan(plan) {
        this.studyPlan.innerHTML = this.formatPlan(plan);
        this.studyPlan.style.display = 'block';
    }

    // Format plain text plan to HTML
    formatPlan(plan) {
        return plan
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^(.+)$/gm, (match) => {
                if (match.startsWith('# ')) {
                    return `<h2>${match.substring(2)}</h2>`;
                } else if (match.startsWith('## ') || match.startsWith('Day ')) {
                    return `<h3>${match.replace(/^## /, '')}</h3>`;
                }
                return match;
            })
            .replace(/^<p>/, '')
            .replace(/<\/p>$/, '');
    }

    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.studyPlan.style.display = 'none';
        this.generateBtn.disabled = true;
        this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
        this.generateBtn.disabled = false;
        this.generateBtn.innerHTML = '<i class="fas fa-robot"></i> Generate AI Study Plan';
    }

    showError(message) {
        this.studyPlan.innerHTML = `<div style="color: #ef4444; text-align: center; padding: 20px;">
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p>${message}</p>
        </div>`;
        this.studyPlan.style.display = 'block';
    }

    async copyStudyPlan() {
        const text = this.studyPlan.innerText;
        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess();
        } catch (err) {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    }

    showCopySuccess() {
        const originalText = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        this.copyBtn.classList.add('copied');
        setTimeout(() => {
            this.copyBtn.innerHTML = originalText;
            this.copyBtn.classList.remove('copied');
        }, 2000);
    }

    loadSavedApiKey() {
        const savedKey = localStorage.getItem('geminiApiKey');
        if (savedKey) {
            this.geminiApiKey = savedKey;
        }
    }
}

// Initialize the study planner
const studyPlanner = new StudyPlanner();

// Export for Firebase auth integration
window.studyPlanner = studyPlanner;
