document.addEventListener("DOMContentLoaded", function () {
    const feedbackForm = document.getElementById("feedbackForm");
    const thankYouMessage = document.querySelector(".thank-you-message");
    const faqItems = document.querySelectorAll(".faq-item");
    const formGroups = document.querySelectorAll(".form-group");
    const formFields = document.querySelectorAll(".form-group input, .form-group textarea, .form-group select");
    const categorySelect = document.getElementById("category");
    const subjectField = document.querySelector("input[name='_subject']");

    // Initialize FAQ components with enhanced animations
    initFAQAccordion();

    // Initialize form field validation
    initFormValidation();

    // Initialize emoji rating
    initEmojiRating();

    // Update email subject with selected category
    if (categorySelect && subjectField) {
        categorySelect.addEventListener("change", function () {
            const selectedCategory = this.options[this.selectedIndex].text;
            if (selectedCategory && selectedCategory !== "Select Category") {
                subjectField.value = `New Triple S Feedback: ${selectedCategory}`;
            } else {
                subjectField.value = "New Triple S Feedback";
            }
        });
    }

    // Form submission handler with enhanced UX
    if (feedbackForm) {
        feedbackForm.addEventListener("submit", function (event) {
            event.preventDefault();

            // Update subject line with category right before submission
            if (categorySelect && subjectField) {
                const selectedCategory = categorySelect.options[categorySelect.selectedIndex].text;
                if (selectedCategory && selectedCategory !== "Select Category") {
                    subjectField.value = `New Triple S Feedback: ${selectedCategory}`;
                }
            }

            // Show loading state
            const submitBtn = document.querySelector(".submit-btn");
            submitBtn.classList.add("loading");
            submitBtn.disabled = true;

            // Collect form data
            const formData = new FormData(feedbackForm);

            // Get the form action URL
            const formAction = feedbackForm.getAttribute('action');

            // Send the form data using fetch API instead of regular form submission
            fetch(formAction, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Required for FormSubmit.co
            })
                .then(response => {
                    // Hide the form container
                    feedbackForm.style.display = 'none';

                    // Show thank you message
                    thankYouMessage.classList.add("show");

                    // Scroll to the thank you message to ensure it's visible
                    thankYouMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    // Reset form
                    feedbackForm.reset();

                    // Automatically hide thank you message after 5 seconds
                    setTimeout(() => {
                        // Hide thank you message
                        thankYouMessage.classList.remove("show");

                        // Show the form again
                        feedbackForm.style.display = 'flex';

                        // Reset button state
                        submitBtn.classList.remove("loading");
                        submitBtn.disabled = false;
                    }, 5000);
                })
                .catch(error => {
                    console.error('Error submitting form:', error);
                    submitBtn.classList.remove("loading");
                    submitBtn.disabled = false;
                    alert('There was an error submitting your feedback. Please try again.');
                });
        });
    }

    // Enhanced FAQ accordion functionality
    function initFAQAccordion() {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const answerParagraph = answer.querySelector('p');

            // Add initial state
            if (answerParagraph) {
                answerParagraph.style.opacity = '0';
                answerParagraph.style.transform = 'translateY(10px)';
            }

            question.addEventListener('click', () => {
                const isExpanded = question.getAttribute('aria-expanded') === 'true';

                // Close all other FAQs
                faqItems.forEach(otherItem => {
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherParagraph = otherAnswer.querySelector('p');

                    if (otherItem !== item && otherQuestion.getAttribute('aria-expanded') === 'true') {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                        otherAnswer.setAttribute('aria-hidden', 'true');

                        // Animate paragraph
                        if (otherParagraph) {
                            otherParagraph.style.opacity = '0';
                            otherParagraph.style.transform = 'translateY(10px)';
                        }
                    }
                });

                // Toggle current FAQ
                question.setAttribute('aria-expanded', !isExpanded);
                answer.setAttribute('aria-hidden', isExpanded);

                // Animate paragraph
                if (answerParagraph) {
                    if (!isExpanded) {
                        // Small delay to allow the container to expand first
                        setTimeout(() => {
                            answerParagraph.style.opacity = '1';
                            answerParagraph.style.transform = 'translateY(0)';
                        }, 150);
                    } else {
                        answerParagraph.style.opacity = '0';
                        answerParagraph.style.transform = 'translateY(10px)';
                    }
                }
            });
        });
    }

    // Form validation
    function initFormValidation() {
        formFields.forEach(field => {
            field.addEventListener('blur', function () {
                validateField(this);
            });

            field.addEventListener('input', function () {
                const feedbackElement = this.parentElement.nextElementSibling;
                if (feedbackElement && feedbackElement.classList.contains('form-field-feedback')) {
                    feedbackElement.classList.remove('active');
                }
            });
        });
    }

    function validateField(field) {
        const feedbackElement = field.parentElement.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('form-field-feedback')) return;

        if (field.required && !field.value.trim()) {
            feedbackElement.textContent = 'This field is required';
            feedbackElement.classList.add('active');
            return false;
        }

        if (field.type === 'email' && field.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) {
                feedbackElement.textContent = 'Please enter a valid email address';
                feedbackElement.classList.add('active');
                return false;
            }
        }

        feedbackElement.classList.remove('active');
        return true;
    }

    // Emoji rating functionality
    function initEmojiRating() {
        const emojiInputs = document.querySelectorAll('.emoji-option input');

        emojiInputs.forEach(input => {
            input.addEventListener('change', function () {
                // Remove selection from all options
                emojiInputs.forEach(otherInput => {
                    const parentLabel = otherInput.closest('.emoji-option');
                    if (parentLabel) {
                        parentLabel.classList.remove('selected');
                    }
                });

                // Add selection to current option
                const parentLabel = this.closest('.emoji-option');
                if (parentLabel) {
                    parentLabel.classList.add('selected');
                }
            });
        });
    }

    // Prevent zooming on focus in iOS
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        document.addEventListener('touchstart', function (event) {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
                event.target.style.fontSize = '16px';
            }
        }, { passive: true });
    }

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');

    // Back to Top Button functionality
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Smooth scroll to top when clicked
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}); 