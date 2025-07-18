document.addEventListener('DOMContentLoaded', () => {
    // Fetch and randomize quiz data from java-questions.json
    fetch('java-questions.json')
        .then(response => response.json())
        .then(data => {
            // Shuffle questions
            const quizData = data.sort(() => Math.random() - 0.5);
            runJavaQuiz(quizData);
        });

    function runJavaQuiz(quizData) {
        // DOM elements
        const startQuizBtn = document.getElementById('start-quiz');
        const quizContent = document.getElementById('quiz-content');
        const quizStart = document.querySelector('.quiz-start');
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.querySelector('.options-container');
        const progressFill = document.querySelector('.progress-fill');
        const currentQuestionEl = document.getElementById('current-question');
        const totalQuestionsEl = document.getElementById('total-questions');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        const quizResults = document.getElementById('quiz-results');
        const scoreEl = document.getElementById('score');
        const totalScoreEl = document.getElementById('total-score');
        const correctAnswersEl = document.getElementById('correct-answers');
        const incorrectAnswersEl = document.getElementById('incorrect-answers');
        const timeTakenEl = document.getElementById('time-taken');
        const reviewAnswersBtn = document.getElementById('review-answers-btn');
        const retryBtn = document.getElementById('retry-btn');
        const answersReview = document.getElementById('answers-review');
        const reviewContainer = document.querySelector('.review-container');
        const backToResultsBtn = document.getElementById('back-to-results');
        const retryFromReviewBtn = document.getElementById('retry-from-review');

        // Add alert element for validation
        const alertElement = document.createElement('div');
        alertElement.classList.add('alert');
        alertElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select an option to continue';
        quizContent.appendChild(alertElement);

        // Quiz state
        let currentQuestion = 0;
        let userAnswers = Array(quizData.length).fill(null);
        let startTime;
        let endTime;

        // Initialize quiz
        totalQuestionsEl.textContent = quizData.length;
        updateProgressBar();

        // Event listeners
        startQuizBtn.addEventListener('click', startQuiz);
        prevBtn.addEventListener('click', goToPrevQuestion);
        nextBtn.addEventListener('click', goToNextQuestion);
        submitBtn.addEventListener('click', submitQuiz);
        reviewAnswersBtn.addEventListener('click', showAnswersReview);
        retryBtn.addEventListener('click', retryQuiz);
        backToResultsBtn.addEventListener('click', backToResults);
        retryFromReviewBtn.addEventListener('click', retryQuiz);

        function startQuiz() {
            startTime = new Date();
            quizStart.classList.add('hidden');
            quizContent.classList.remove('hidden');
            loadQuestion();
        }

        function loadQuestion() {
            const question = quizData[currentQuestion];
            questionText.textContent = question.question;
            optionsContainer.innerHTML = '';
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('option');
                const input = document.createElement('input');
                input.type = 'radio';
                input.id = `option${index + 1}`;
                input.name = 'answer';
                input.value = index;
                if (userAnswers[currentQuestion] === index) {
                    input.checked = true;
                }
                const label = document.createElement('label');
                label.htmlFor = `option${index + 1}`;
                label.textContent = option;
                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                optionsContainer.appendChild(optionDiv);
                optionDiv.addEventListener('click', () => {
                    input.checked = true;
                    userAnswers[currentQuestion] = index;
                    hideAlert();
                });
            });
            currentQuestionEl.textContent = currentQuestion + 1;
            updateProgressBar();
            updateNavigationButtons();
        }

        function updateProgressBar() {
            const progress = ((currentQuestion + 1) / quizData.length) * 100;
            progressFill.style.width = `${progress}%`;
        }

        function updateNavigationButtons() {
            prevBtn.disabled = currentQuestion === 0;
            if (currentQuestion === quizData.length - 1) {
                nextBtn.classList.add('hidden');
                submitBtn.classList.remove('hidden');
            } else {
                nextBtn.classList.remove('hidden');
                submitBtn.classList.add('hidden');
            }
        }

        function isOptionSelected(index) {
            return userAnswers[index] !== null;
        }

        function showAlert(message) {
            if (message) {
                alertElement.innerHTML = `<i class='fas fa-exclamation-circle'></i> ${message}`;
            }
            alertElement.classList.add('show');
            setTimeout(() => {
                hideAlert();
            }, 3000);
        }

        function hideAlert() {
            alertElement.classList.remove('show');
        }

        function goToPrevQuestion() {
            if (currentQuestion > 0) {
                currentQuestion--;
                loadQuestion();
            }
        }

        function goToNextQuestion() {
            if (!isOptionSelected(currentQuestion)) {
                showAlert();
                return;
            }
            if (currentQuestion < quizData.length - 1) {
                currentQuestion++;
                loadQuestion();
            }
        }

        function submitQuiz() {
            if (!isOptionSelected(currentQuestion)) {
                showAlert();
                return;
            }
            // Check if all questions have been answered
            const unansweredQuestions = userAnswers.filter(answer => answer === null).length;
            if (unansweredQuestions > 0) {
                showAlert(`Please answer all ${unansweredQuestions} remaining question(s)`);
                return;
            }
            endTime = new Date();
            const timeTaken = Math.floor((endTime - startTime) / 1000);
            const correctAnswers = userAnswers.filter((answer, index) => answer === quizData[index].answer).length;
            const incorrectAnswers = userAnswers.filter((answer) => answer !== null).length - correctAnswers;
            const score = Math.round((correctAnswers / quizData.length) * 100);
            scoreEl.textContent = score;
            totalScoreEl.textContent = '100';
            correctAnswersEl.textContent = correctAnswers;
            incorrectAnswersEl.textContent = incorrectAnswers;
            timeTakenEl.textContent = formatTime(timeTaken);
            quizContent.classList.add('hidden');
            quizResults.classList.remove('hidden');
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        }

        function showAnswersReview() {
            quizResults.classList.add('hidden');
            answersReview.classList.remove('hidden');
            reviewContainer.innerHTML = '';
            quizData.forEach((question, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.classList.add('review-item');
                if (userAnswers[index] === question.answer) {
                    reviewItem.classList.add('correct');
                } else if (userAnswers[index] !== null) {
                    reviewItem.classList.add('incorrect');
                }
                const reviewQuestion = document.createElement('div');
                reviewQuestion.classList.add('review-question');
                const questionNumber = document.createElement('div');
                questionNumber.classList.add('question-number');
                questionNumber.textContent = index + 1;
                const questionTextEl = document.createElement('div');
                questionTextEl.classList.add('question-text');
                questionTextEl.textContent = question.question;
                reviewQuestion.appendChild(questionNumber);
                reviewQuestion.appendChild(questionTextEl);
                reviewItem.appendChild(reviewQuestion);
                const reviewOptions = document.createElement('div');
                reviewOptions.classList.add('review-options');
                question.options.forEach((option, optIndex) => {
                    const reviewOption = document.createElement('div');
                    reviewOption.classList.add('review-option');
                    if (userAnswers[index] === optIndex) {
                        reviewOption.classList.add('selected');
                        if (optIndex === question.answer) {
                            reviewOption.classList.add('correct');
                        } else {
                            reviewOption.classList.add('incorrect');
                        }
                    } else if (optIndex === question.answer) {
                        reviewOption.classList.add('correct');
                    }
                    const icon = document.createElement('i');
                    if (userAnswers[index] === optIndex && optIndex === question.answer) {
                        icon.className = 'fas fa-check';
                    } else if (userAnswers[index] === optIndex && optIndex !== question.answer) {
                        icon.className = 'fas fa-times';
                    } else if (optIndex === question.answer) {
                        icon.className = 'fas fa-check';
                    }
                    const optionText = document.createElement('div');
                    optionText.classList.add('option-text');
                    optionText.textContent = option;
                    reviewOption.appendChild(icon);
                    reviewOption.appendChild(optionText);
                    reviewOptions.appendChild(reviewOption);
                });
                reviewItem.appendChild(reviewOptions);
                const reviewExplanation = document.createElement('div');
                reviewExplanation.classList.add('review-explanation');
                reviewExplanation.innerHTML = `<strong>Concept:</strong> ${question.concept}`;
                reviewItem.appendChild(reviewExplanation);
                reviewContainer.appendChild(reviewItem);
            });
        }

        function backToResults() {
            answersReview.classList.add('hidden');
            quizResults.classList.remove('hidden');
        }

        function retryQuiz() {
            currentQuestion = 0;
            userAnswers = Array(quizData.length).fill(null);
            quizResults.classList.add('hidden');
            answersReview.classList.add('hidden');
            quizContent.classList.remove('hidden');
            startQuiz();
        }
    }
}); 