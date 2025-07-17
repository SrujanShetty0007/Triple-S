document.addEventListener('DOMContentLoaded', () => {
    // Quiz questions data
    const quizData = [
        {
            question: "Which of the following is not a valid Python data type?",
            options: ["int", "float", "char", "list"],
            correctAnswer: 2, // char is not a built-in Python data type
            explanation: "In Python, 'char' is not a built-in data type. Python uses strings (str) to represent characters, and individual characters are just strings of length 1."
        },
        {
            question: "What will be the output of the following code?\nprint(type([]))",
            options: ["<class 'list'>", "<class 'tuple'>", "<class 'array'>", "<class 'dict'>"],
            correctAnswer: 0, // <class 'list'>
            explanation: "The empty square brackets [] create an empty list in Python. The type() function returns the data type of the object, which is 'list' in this case."
        },
        {
            question: "Which of the following is the correct way to create a function in Python?",
            options: [
                "function myFunc(): pass",
                "def myFunc(): pass",
                "func myFunc(): pass",
                "myFunc = function(): pass"
            ],
            correctAnswer: 1, // def myFunc(): pass
            explanation: "In Python, functions are defined using the 'def' keyword followed by the function name, parameters in parentheses, and a colon. The function body is indented below."
        },
        {
            question: "What does the 'self' parameter in a Python class method refer to?",
            options: ["The class itself", "The instance of the class", "The parent class", "The module containing the class"],
            correctAnswer: 1, // The instance of the class
            explanation: "In Python class methods, 'self' refers to the instance of the class. It's a convention to name the first parameter of instance methods as 'self', which allows access to the instance's attributes and methods."
        },
        {
            question: "What is the output of the following code?\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)",
            options: [
                "[1, 2, 3]",
                "[1, 2, 3, 4]",
                "[1, 2, 3, [4]]",
                "Error"
            ],
            correctAnswer: 1, // [1, 2, 3, 4]
            explanation: "In Python, when you assign a list to another variable (y = x), both variables reference the same list object in memory. So when you modify the list through one variable, the change is visible through the other variable as well."
        },
        {
            question: "Which of the following is used to handle exceptions in Python?",
            options: ["try-except", "try-catch", "if-else", "for-in"],
            correctAnswer: 0, // try-except
            explanation: "Python uses try-except blocks for exception handling. Code that might raise an exception is placed in the try block, and the handling of specific exceptions is done in the except block(s)."
        },
        {
            question: "What is the purpose of the __init__ method in Python classes?",
            options: ["To initialize class variables", "To create a new instance", "To initialize instance attributes when an object is created", "To import modules"],
            correctAnswer: 2, // To initialize instance attributes when an object is created
            explanation: "The __init__ method in Python classes is a special method that's automatically called when a new instance of the class is created. It's primarily used to initialize instance attributes with the values passed during object creation."
        },
        {
            question: "What will be the output of the following code?\nprint(2 ** 3)",
            options: ["6", "8", "5", "Error"],
            correctAnswer: 1, // 8
            explanation: "In Python, the ** operator represents exponentiation. So 2 ** 3 calculates 2 raised to the power of 3, which equals 8."
        },
        {
            question: "Which of the following is a mutable data type in Python?",
            options: ["string", "tuple", "list", "int"],
            correctAnswer: 2, // list
            explanation: "In Python, lists are mutable, meaning their contents can be changed after creation. Strings, tuples, and integers are immutable, which means once created, their values cannot be modified."
        },
        {
            question: "What is the output of the following code?\nprint('Hello' + 'World')",
            options: ["Hello World", "HelloWorld", "Hello+World", "Error"],
            correctAnswer: 1, // HelloWorld
            explanation: "In Python, the + operator when used with strings performs concatenation without adding any spaces. So 'Hello' + 'World' results in 'HelloWorld'. To include a space, you would need to explicitly add it: 'Hello ' + 'World' or 'Hello' + ' World'."
        }
    ];

    // DOM elements
    const startQuizBtn = document.getElementById('start-quiz');
    const quizContent = document.getElementById('quiz-content');
    const quizStart = document.querySelector('.quiz-start');
    const quizResults = document.getElementById('quiz-results');
    const answersReview = document.getElementById('answers-review');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.querySelector('.options-container');
    const progressFill = document.querySelector('.progress-fill');
    const currentQuestionEl = document.getElementById('current-question');
    const totalQuestionsEl = document.getElementById('total-questions');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const retryBtn = document.getElementById('retry-btn');
    const reviewAnswersBtn = document.getElementById('review-answers-btn');
    const backToResultsBtn = document.getElementById('back-to-results');
    const retryFromReviewBtn = document.getElementById('retry-from-review');
    const reviewContainer = document.querySelector('.review-container');
    const scoreEl = document.getElementById('score');
    const totalScoreEl = document.getElementById('total-score');
    const correctAnswersEl = document.getElementById('correct-answers');
    const incorrectAnswersEl = document.getElementById('incorrect-answers');
    const timeTakenEl = document.getElementById('time-taken');

    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.classList.add('alert');
    alertElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select an option to continue';
    quizContent.appendChild(alertElement);

    // Quiz state variables
    let currentQuestion = 0;
    let score = 0;
    let userAnswers = Array(quizData.length).fill(null);
    let quizStartTime;
    let quizEndTime;
    let timerInterval;

    // Initialize the quiz
    function initQuiz() {
        totalQuestionsEl.textContent = quizData.length;
        totalScoreEl.textContent = quizData.length * 10;
    }

    // Start the quiz
    startQuizBtn.addEventListener('click', () => {
        quizStart.classList.add('hidden');
        quizContent.classList.remove('hidden');
        quizStartTime = new Date();
        loadQuestion(currentQuestion);
        startTimer();
    });

    // Load a question
    function loadQuestion(index) {
        const question = quizData[index];
        questionText.textContent = question.question;

        // Clear previous options
        optionsContainer.innerHTML = '';

        // Create new options
        question.options.forEach((option, i) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');

            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `option${i + 1}`;
            input.name = 'answer';
            input.value = i;

            // Check if user has already answered this question
            if (userAnswers[index] === i) {
                input.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = `option${i + 1}`;
            label.textContent = option;

            optionElement.appendChild(input);
            optionElement.appendChild(label);
            optionsContainer.appendChild(optionElement);

            // Add click event to the entire option div
            optionElement.addEventListener('click', () => {
                input.checked = true;
                userAnswers[index] = i;
                hideAlert();
            });
        });

        // Update progress
        currentQuestionEl.textContent = index + 1;
        progressFill.style.width = `${((index + 1) / quizData.length) * 100}%`;

        // Update navigation buttons
        prevBtn.disabled = index === 0;

        if (index === quizData.length - 1) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    // Show alert function
    function showAlert() {
        alertElement.classList.add('show');

        // Automatically hide after 3 seconds
        setTimeout(() => {
            hideAlert();
        }, 3000);
    }

    // Hide alert function
    function hideAlert() {
        alertElement.classList.remove('show');
    }

    // Check if an option is selected
    function isOptionSelected(index) {
        return userAnswers[index] !== null;
    }

    // Navigation event listeners
    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            loadQuestion(currentQuestion);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (!isOptionSelected(currentQuestion)) {
            showAlert();
            return;
        }

        if (currentQuestion < quizData.length - 1) {
            currentQuestion++;
            loadQuestion(currentQuestion);
        }
    });

    // Submit quiz
    submitBtn.addEventListener('click', () => {
        if (!isOptionSelected(currentQuestion)) {
            showAlert();
            return;
        }

        // Check if all questions have been answered
        const unansweredQuestions = userAnswers.filter(answer => answer === null).length;
        if (unansweredQuestions > 0) {
            alertElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> Please answer all ${unansweredQuestions} remaining question(s)`;
            showAlert();
            return;
        }

        // Calculate score
        score = 0;
        let correctCount = 0;

        userAnswers.forEach((answer, index) => {
            if (answer === quizData[index].correctAnswer) {
                score += 10;
                correctCount++;
            }
        });

        // Stop timer
        clearInterval(timerInterval);
        quizEndTime = new Date();

        // Display results
        scoreEl.textContent = score;
        correctAnswersEl.textContent = correctCount;
        incorrectAnswersEl.textContent = quizData.length - correctCount;
        timeTakenEl.textContent = formatTime(quizEndTime - quizStartTime);

        quizContent.classList.add('hidden');
        quizResults.classList.remove('hidden');
    });

    // Review answers
    reviewAnswersBtn.addEventListener('click', () => {
        quizResults.classList.add('hidden');
        generateReviewContent();
        answersReview.classList.remove('hidden');
    });

    // Back to results
    backToResultsBtn.addEventListener('click', () => {
        answersReview.classList.add('hidden');
        quizResults.classList.remove('hidden');
    });

    // Generate review content
    function generateReviewContent() {
        reviewContainer.innerHTML = '';

        quizData.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            // Create review item
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');
            reviewItem.classList.add(isCorrect ? 'correct' : 'incorrect');

            // Create question header
            const reviewQuestion = document.createElement('div');
            reviewQuestion.classList.add('review-question');

            const questionNumber = document.createElement('span');
            questionNumber.classList.add('question-number');
            questionNumber.textContent = index + 1;

            const questionText = document.createElement('span');
            questionText.textContent = question.question;
            questionText.classList.add('question-text');

            reviewQuestion.appendChild(questionNumber);
            reviewQuestion.appendChild(questionText);

            // Create options container
            const reviewOptions = document.createElement('div');
            reviewOptions.classList.add('review-options');

            // Add options
            question.options.forEach((option, i) => {
                const reviewOption = document.createElement('div');
                reviewOption.classList.add('review-option');

                // Add appropriate classes based on user's answer and correct answer
                if (i === userAnswer && i === question.correctAnswer) {
                    reviewOption.classList.add('selected', 'correct');
                } else if (i === userAnswer) {
                    reviewOption.classList.add('selected', 'incorrect');
                } else if (i === question.correctAnswer) {
                    reviewOption.classList.add('correct');
                }

                // Add icon
                const icon = document.createElement('i');
                if (i === question.correctAnswer) {
                    icon.classList.add('fas', 'fa-check');
                } else if (i === userAnswer && i !== question.correctAnswer) {
                    icon.classList.add('fas', 'fa-times');
                } else {
                    icon.classList.add('far', 'fa-circle');
                }

                const optionText = document.createElement('span');
                optionText.textContent = option;
                optionText.classList.add('option-text');

                reviewOption.appendChild(icon);
                reviewOption.appendChild(optionText);
                reviewOptions.appendChild(reviewOption);
            });

            // Create explanation
            const reviewExplanation = document.createElement('div');
            reviewExplanation.classList.add('review-explanation');
            reviewExplanation.textContent = question.explanation;

            // Assemble review item
            reviewItem.appendChild(reviewQuestion);
            reviewItem.appendChild(reviewOptions);
            reviewItem.appendChild(reviewExplanation);

            // Add to container
            reviewContainer.appendChild(reviewItem);
        });
    }

    // Retry quiz
    retryBtn.addEventListener('click', resetQuiz);
    retryFromReviewBtn.addEventListener('click', resetQuiz);

    function resetQuiz() {
        currentQuestion = 0;
        score = 0;
        userAnswers = Array(quizData.length).fill(null);

        quizResults.classList.add('hidden');
        answersReview.classList.add('hidden');
        quizContent.classList.remove('hidden');

        quizStartTime = new Date();
        loadQuestion(currentQuestion);
        startTimer();
    }

    // Format time (milliseconds to MM:SS)
    function formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Timer function
    function startTimer() {
        // Clear any existing timer
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        const startTime = new Date();

        timerInterval = setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = currentTime - startTime;

            // If time limit is reached (15 minutes)
            if (elapsedTime >= 15 * 60 * 1000) {
                clearInterval(timerInterval);
                submitBtn.click();
            }
        }, 1000);
    }

    // Initialize the quiz
    initQuiz();
});