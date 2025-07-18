// Study Planner JavaScript
class StudyPlanner {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.geminiApiKey = "AIzaSyBgNb24UuDYtaGWnkrb4VGWWikOjORNb_A"; // Default API key
    }

    initializeElements() {
        this.daysLeftInput = document.getElementById('daysLeft');
        this.subjectsInput = document.getElementById('subjects');
        this.hoursPerDayInput = document.getElementById('hoursPerDay');
        this.generateBtn = document.getElementById('generateBtn');
        this.outputSection = document.getElementById('outputSection');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.studyPlan = document.getElementById('studyPlan');
        this.copyBtn = document.getElementById('copyBtn');
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generateStudyPlan());
        this.copyBtn.addEventListener('click', () => this.copyStudyPlan());

        // Add input validation on change
        [this.daysLeftInput, this.subjectsInput, this.hoursPerDayInput].forEach(input => {
            input.addEventListener('input', () => this.validateForm());
            // Enable button on initial load if form is valid
            this.validateForm();
        });
    }

    validateForm() {
        const daysLeft = this.daysLeftInput.value.trim();
        const subjects = this.subjectsInput.value.trim();
        const hoursPerDay = this.hoursPerDayInput.value.trim();

        const isValid = daysLeft && subjects && hoursPerDay &&
            parseInt(daysLeft) > 0 && parseInt(daysLeft) <= 365 &&
            parseInt(hoursPerDay) > 0 && parseInt(hoursPerDay) <= 24;

        this.generateBtn.disabled = !isValid;
        return isValid;
    }

    async generateStudyPlan() {
        if (!this.validateForm()) {
            this.showError('Please fill in all fields with valid values.');
            return;
        }

        this.showLoading();
        this.outputSection.style.display = 'block';
        this.outputSection.classList.add('show');

        try {
            const daysLeft = parseInt(this.daysLeftInput.value);
            const subjects = this.subjectsInput.value.trim();
            const hoursPerDay = parseInt(this.hoursPerDayInput.value);

            // Try with default API key first
            let studyPlan = null;
            try {
                studyPlan = await this.callGeminiAPI(daysLeft, subjects, hoursPerDay);
            } catch (error) {
                console.log("Error with default API key, trying with user key");
                // If default key fails, try with user key or prompt for one
                if (!localStorage.getItem('geminiApiKey')) {
                    this.promptForApiKey();
                } else {
                    this.geminiApiKey = localStorage.getItem('geminiApiKey');
                    studyPlan = await this.callGeminiAPI(daysLeft, subjects, hoursPerDay);
                }
            }

            if (studyPlan) {
                this.displayStudyPlan(studyPlan);
            }
        } catch (error) {
            console.error('Error generating study plan:', error);
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
            this.generateStudyPlan(); // Retry generation
        } else {
            this.showError('API key is required to generate study plans.');
            this.hideLoading();
        }
    }

    async callGeminiAPI(daysLeft, subjects, hoursPerDay) {
        const prompt = this.createPrompt(daysLeft, subjects, hoursPerDay);

        // Timeout after 15 seconds
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
                        parts: [{
                            text: prompt
                        }]
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
                // If we got a response but no content, use backup plan
                return this.createBackupPlan(daysLeft, subjects, hoursPerDay);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('API request timed out. Please try again.');
            }
            throw error;
        }
    }

    createBackupPlan(daysLeft, subjects, hoursPerDay) {
        // Generate a basic study plan without API
        const subjectList = subjects.split(',').map(s => s.trim()).filter(s => s);
        let plan = "# Your Study Plan\n\n";

        // Calculate time per subject
        const subjectsPerDay = Math.ceil(subjectList.length / daysLeft);
        const hoursPerSubject = Math.floor(hoursPerDay / subjectsPerDay);

        // Create simple day-by-day plan
        for (let day = 1; day <= Math.min(daysLeft, 30); day++) {
            plan += `## Day ${day}\n\n`;

            const daySubjects = subjectList.slice(
                ((day - 1) % Math.ceil(daysLeft / subjectList.length)) * subjectsPerDay,
                ((day - 1) % Math.ceil(daysLeft / subjectList.length) + 1) * subjectsPerDay
            );

            daySubjects.forEach((subject, i) => {
                plan += `* ${subject} (${hoursPerSubject} hours)\n`;
                plan += `  * Study theory: ${Math.floor(hoursPerSubject * 0.5)} hours\n`;
                plan += `  * Practice problems: ${Math.floor(hoursPerSubject * 0.5)} hours\n`;
            });

            plan += "\n";
        }

        plan += "## Final Week Tips\n\n";
        plan += "* Review all subjects daily\n";
        plan += "* Focus on practice problems\n";
        plan += "* Get enough sleep before exams\n";

        return plan;
    }

    createPrompt(daysLeft, subjects, hoursPerDay) {
        return `You are an expert academic advisor helping a student create a personalized study plan. 

STUDENT INFORMATION:
- Days until exam: ${daysLeft} days
- Subjects to study: ${subjects}
- Hours available per day: ${hoursPerDay} hours

TASK: Create a detailed, day-by-day study plan that:
1. Distributes study time across all subjects evenly
2. Includes theory, practice, and revision for each subject
3. Uses a friendly, motivational tone
4. Provides specific, actionable tasks for each day
5. Includes time for breaks and review sessions
6. Adapts the plan based on the number of days available

FORMAT YOUR RESPONSE AS:
- Use clear headings for each day (Day 1, Day 2, etc.)
- Include time allocations for each activity
- Use bullet points for easy reading
- Add motivational messages and study tips
- Include a weekly review schedule
- End with final exam preparation tips

Keep the plan concise but comprehensive. Be direct and practical.`;
    }

    displayStudyPlan(plan) {
        this.studyPlan.innerHTML = this.formatPlan(plan);
        this.studyPlan.style.display = 'block';
    }

    formatPlan(plan) {
        // Convert plain text to formatted HTML
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
        this.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Study Plan';
    }

    showError(message) {
        this.studyPlan.innerHTML = `<div style="color: #ef4444; text-align: center; padding: 20px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem; margin-bottom: 10px;"></i>
            <p>${message}</p>
        </div>`;
        this.studyPlan.style.display = 'block';
        this.outputSection.style.display = 'block';
        this.outputSection.classList.add('show');
    }

    async copyStudyPlan() {
        const planText = this.studyPlan.innerText;

        try {
            await navigator.clipboard.writeText(planText);
            this.showCopySuccess();
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyTextToClipboard(planText);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            this.showError('Failed to copy study plan to clipboard.');
        }

        document.body.removeChild(textArea);
    }

    showCopySuccess() {
        this.copyBtn.classList.add('copied');
        this.copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';

        setTimeout(() => {
            this.copyBtn.classList.remove('copied');
            this.copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Plan';
        }, 2000);
    }

    // Load saved API key on page load
    loadSavedApiKey() {
        const savedKey = localStorage.getItem('geminiApiKey');
        if (savedKey) {
            this.geminiApiKey = savedKey;
        }
    }
}

// Initialize the Study Planner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const studyPlanner = new StudyPlanner();
    studyPlanner.loadSavedApiKey();

    // Set active state for current page in navbar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === 'studyplanner.html' || href.includes('studyplanner.html')) {
            link.classList.add('active');
        } else if (window.location.pathname.endsWith('studyplanner.html')) {
            if (link.querySelector('span').textContent === 'Study Planner') {
                link.classList.add('active');
            }
        }
    });

    // Add some helpful tips
    const tips = [
        'Break down complex subjects into smaller topics',
        'Include regular breaks to maintain focus',
        'Review previous material before starting new topics',
        'Practice with past papers and sample questions'
    ];

    // Add tips to the page before the footer
    const tipsContainer = document.createElement('div');
    tipsContainer.className = 'tips-container';
    tipsContainer.setAttribute('data-aos', 'fade-up');
    tipsContainer.setAttribute('data-aos-delay', '300');

    tipsContainer.innerHTML = `
        <h3>Study Tips</h3>
        <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;

    // Insert into placeholder
    const placeholder = document.getElementById('tips-container-placeholder');
    if (placeholder) {
        placeholder.appendChild(tipsContainer);
    } else if (document.querySelector('.site-footer')) {
        // Fallback: insert before footer
        const footer = document.querySelector('.site-footer');
        footer.parentNode.insertBefore(tipsContainer, footer);
    } else {
        // Last resort: append to container
        document.querySelector('.container').appendChild(tipsContainer);
    }
});

// Add smooth scrolling
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll to output when generated
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const outputSection = document.getElementById('outputSection');
                if (outputSection.style.display === 'block') {
                    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    observer.observe(document.getElementById('outputSection'), {
        attributes: true,
        attributeFilter: ['style']
    });
});
