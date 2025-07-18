document.addEventListener('DOMContentLoaded', () => {
    // Quiz data
    const quizData = [
        {
            question: "Which of the following is not a valid Java access modifier?",
            options: ["public", "private", "friendly", "protected"],
            correct: 2,
            explanation: "Java has four access modifiers: public, private, protected, and default (no keyword). 'friendly' is not a valid access modifier in Java."
        },
        {
            question: "What is the default value of a boolean variable in Java?",
            options: ["true", "false", "null", "undefined"],
            correct: 1,
            explanation: "In Java, the default value of a boolean variable is 'false'."
        },
        {
            question: "Which of the following is not a feature of Java?",
            options: ["Platform Independence", "Pointers", "Garbage Collection", "Object-Oriented"],
            correct: 1,
            explanation: "Java does not support explicit pointer manipulation like C/C++. Memory management is handled by the JVM through garbage collection."
        },
        {
            question: "Which keyword is used to inherit a class in Java?",
            options: ["implements", "extends", "inherits", "using"],
            correct: 1,
            explanation: "In Java, the 'extends' keyword is used to inherit a class. The 'implements' keyword is used to implement interfaces."
        },
        {
            question: "What is the output of System.out.println(10 + 20 + \"Java\")?",
            options: ["30Java", "1020Java", "Java1020", "Error"],
            correct: 0,
            explanation: "Java evaluates expressions from left to right. First, 10 + 20 is calculated as 30, then 30 is concatenated with the string \"Java\" resulting in \"30Java\"."
        },
        {
            question: "Which collection class allows duplicate elements?",
            options: ["HashSet", "TreeSet", "ArrayList", "HashMap"],
            correct: 2,
            explanation: "ArrayList allows duplicate elements. HashSet and TreeSet implement the Set interface which does not allow duplicates. HashMap is a Map implementation that doesn't allow duplicate keys."
        },
        {
            question: "What is the purpose of the 'final' keyword in Java?",
            options: ["To prevent inheritance", "To prevent method overriding", "To make a variable constant", "All of the above"],
            correct: 3,
            explanation: "The 'final' keyword in Java can be used to prevent inheritance (final class), prevent method overriding (final method), and to make a variable constant (final variable)."
        },
        {
            question: "Which of the following is not a primitive data type in Java?",
            options: ["byte", "short", "long", "String"],
            correct: 3,
            explanation: "String is not a primitive data type in Java. It's a class. The primitive data types in Java are byte, short, int, long, float, double, char, and boolean."
        },
        {
            question: "What happens when a checked exception occurs in a Java program?",
            options: ["Program terminates", "Exception is automatically handled", "Program must handle or declare it", "Nothing happens"],
            correct: 2,
            explanation: "In Java, checked exceptions must be either caught (using try-catch) or declared (using throws) in the method signature."
        },
        {
            question: "Which interface is used to create a thread in Java?",
            options: ["Runnable", "Threadable", "Callable", "Executable"],
            correct: 0,
            explanation: "The Runnable interface is used to create a thread in Java. The run() method of the Runnable interface is implemented to define the code that constitutes the new thread."
        }
    ];

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

    // Functions
    function startQuiz() {
        startTime = new Date();
        quizStart.classList.add('hidden');
        quizContent.classList.remove('hidden');
        loadQuestion();
    }

    function loadQuestion() {
        const question = quizData[currentQuestion];
        questionText.textContent = question.question;

        // Clear options
        optionsContainer.innerHTML = '';

        // Add options
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');

            const input = document.createElement('input');
            input.type = 'radio';
            input.id = `option${index + 1}`;
            input.name = 'answer';
            input.value = index;

            // Check if user has answered this question
            if (userAnswers[currentQuestion] === index) {
                input.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = `option${index + 1}`;
            label.textContent = option;

            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            optionsContainer.appendChild(optionDiv);

            // Add event listener to the option div
            optionDiv.addEventListener('click', () => {
                input.checked = true;
                userAnswers[currentQuestion] = index;
            });
        });

        // Update UI
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

    function goToPrevQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            loadQuestion();
        }
    }

    function goToNextQuestion() {
        if (currentQuestion < quizData.length - 1) {
            currentQuestion++;
            loadQuestion();
        }
    }

    function submitQuiz() {
        endTime = new Date();
        const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds

        // Calculate score
        const correctAnswers = userAnswers.filter((answer, index) => answer === quizData[index].correct).length;
        const incorrectAnswers = userAnswers.filter((answer) => answer !== null).length - correctAnswers;
        const unanswered = quizData.length - correctAnswers - incorrectAnswers;
        const score = Math.round((correctAnswers / quizData.length) * 100);

        // Update results UI
        scoreEl.textContent = score;
        totalScoreEl.textContent = '100';
        correctAnswersEl.textContent = correctAnswers;
        incorrectAnswersEl.textContent = incorrectAnswers;
        timeTakenEl.textContent = formatTime(timeTaken);

        // Show results
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

        // Clear review container
        reviewContainer.innerHTML = '';

        // Add review items
        quizData.forEach((question, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');

            // Add correct/incorrect class
            if (userAnswers[index] === question.correct) {
                reviewItem.classList.add('correct');
            } else if (userAnswers[index] !== null) {
                reviewItem.classList.add('incorrect');
            }

            // Question
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

            // Options
            const reviewOptions = document.createElement('div');
            reviewOptions.classList.add('review-options');

            question.options.forEach((option, optIndex) => {
                const reviewOption = document.createElement('div');
                reviewOption.classList.add('review-option');

                // Add classes based on user's answer and correct answer
                if (userAnswers[index] === optIndex) {
                    reviewOption.classList.add('selected');
                    if (optIndex === question.correct) {
                        reviewOption.classList.add('correct');
                    } else {
                        reviewOption.classList.add('incorrect');
                    }
                } else if (optIndex === question.correct) {
                    reviewOption.classList.add('correct');
                }

                // Add icon
                const icon = document.createElement('i');
                if (userAnswers[index] === optIndex && optIndex === question.correct) {
                    icon.className = 'fas fa-check';
                } else if (userAnswers[index] === optIndex && optIndex !== question.correct) {
                    icon.className = 'fas fa-times';
                } else if (optIndex === question.correct) {
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

            // Explanation
            const reviewExplanation = document.createElement('div');
            reviewExplanation.classList.add('review-explanation');
            reviewExplanation.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;

            reviewItem.appendChild(reviewExplanation);
            reviewContainer.appendChild(reviewItem);
        });
    }

    function backToResults() {
        answersReview.classList.add('hidden');
        quizResults.classList.remove('hidden');
    }

    function retryQuiz() {
        // Reset quiz state
        currentQuestion = 0;
        userAnswers = Array(quizData.length).fill(null);

        // Reset UI
        quizResults.classList.add('hidden');
        answersReview.classList.add('hidden');
        quizContent.classList.remove('hidden');

        // Restart quiz
        startQuiz();
    }
}); 