document.addEventListener('DOMContentLoaded', () => {
    // Quiz questions data
    const quizData = [
        {
            question: "Which of the following is not a valid C data type?",
            options: ["int", "float", "string", "char"],
            correctAnswer: 2, // string is not a valid C data type
            explanation: "In C, 'string' is not a built-in data type. Instead, strings are represented as arrays of characters (char arrays) terminated by a null character '\\0'."
        },
        {
            question: "Which operator is used for pointer declaration in C?",
            options: ["&", "*", "#", "^"],
            correctAnswer: 1, // * is used for pointer declaration
            explanation: "The asterisk (*) operator is used to declare a pointer variable in C. For example: int *ptr; declares a pointer to an integer."
        },
        {
            question: "What is the correct way to declare a function in C?",
            options: [
                "function myFunc() { }",
                "void myFunc() { }",
                "def myFunc(): pass",
                "myFunc: function() { }"
            ],
            correctAnswer: 1, // void myFunc() { }
            explanation: "In C, functions are declared with a return type followed by the function name and parameters. 'void myFunc() { }' is the correct syntax for a function that returns nothing."
        },
        {
            question: "Which header file should be included to use malloc() and free()?",
            options: ["<memory.h>", "<stdlib.h>", "<string.h>", "<malloc.h>"],
            correctAnswer: 1, // <stdlib.h>
            explanation: "The stdlib.h header file contains declarations for dynamic memory allocation functions like malloc(), calloc(), realloc(), and free()."
        },
        {
            question: "What does the sizeof() operator return?",
            options: [
                "The address of the variable",
                "The value of the variable",
                "The size of the variable in bytes",
                "The data type of the variable"
            ],
            correctAnswer: 2, // The size of the variable in bytes
            explanation: "The sizeof() operator returns the size in bytes of its operand, which can be a variable, data type, or expression."
        },
        {
            question: "Which of the following is used to terminate a string in C?",
            options: ["\\n", "\\0", "\\t", "\\s"],
            correctAnswer: 1, // \0 (null character)
            explanation: "In C, strings are terminated with the null character '\\0', which marks the end of the string. This allows functions to know where a string ends."
        },
        {
            question: "What is the correct way to access the value of a pointer variable?",
            options: ["*ptr", "&ptr", "ptr", "ptr[]"],
            correctAnswer: 0, // *ptr
            explanation: "The dereference operator (*) is used to access the value stored at the memory address held by a pointer. For example, if ptr points to an integer, *ptr gives you the integer value."
        },
        {
            question: "Which function is used to read a single character from the standard input in C?",
            options: ["scanf()", "getchar()", "gets()", "read()"],
            correctAnswer: 1, // getchar()
            explanation: "The getchar() function reads a single character from the standard input (usually the keyboard) and returns it as an integer."
        },
        {
            question: "What is the output of the following code?\nint x = 5;\nprintf(\"%d\", ++x);",
            options: ["5", "6", "4", "Error"],
            correctAnswer: 1, // 6
            explanation: "The pre-increment operator (++x) increments the value of x before it's used in the expression. So x becomes 6 first, then 6 is printed."
        },
        {
            question: "Which of the following is not a loop structure in C?",
            options: ["for", "while", "do-while", "foreach"],
            correctAnswer: 3, // foreach is not a loop in C
            explanation: "C has three loop structures: for, while, and do-while. The 'foreach' loop is found in other languages like PHP, JavaScript, and C#, but not in standard C."
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