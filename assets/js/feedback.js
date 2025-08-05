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

    // Initialize form progress tracking
    initFormProgress();

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

    // Form submission handler with improved speed
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

            // Create a hidden iframe for submission
            const iframe = document.createElement('iframe');
            iframe.name = 'hidden-feedback-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Set form target to the iframe
            feedbackForm.setAttribute('target', 'hidden-feedback-iframe');

            // Submit the form directly
            feedbackForm.submit();

            // Add a backup timeout to reset button if submission takes too long
            setTimeout(() => {
                if (submitBtn && submitBtn.disabled) {
                    setTimeout(() => {
                        if (submitBtn.disabled) {
                            submitBtn.innerHTML = '<span class="btn-content"><i class="fas fa-paper-plane" aria-hidden="true"></i> Submit Feedback</span>';
                            submitBtn.disabled = false;
                            submitBtn.classList.remove("loading");
                        }
                    }, 15000);
                }
            }, 5000);

            // Show thank you message after a short delay
            setTimeout(() => {
                // Show thank you message without hiding the form
                if (thankYouMessage) {
                    thankYouMessage.classList.add('show');

                    // Position the thank you message properly
                    thankYouMessage.style.position = 'fixed';
                    thankYouMessage.style.top = '50%';
                    thankYouMessage.style.left = '50%';
                    thankYouMessage.style.transform = 'translate(-50%, -50%)';
                    thankYouMessage.style.zIndex = '1000';

                    setTimeout(() => {
                        thankYouMessage.classList.remove('show');
                        thankYouMessage.style.position = '';
                        thankYouMessage.style.top = '';
                        thankYouMessage.style.left = '';
                        thankYouMessage.style.transform = '';
                        thankYouMessage.style.zIndex = '';

                        // Reset form
                        feedbackForm.reset();

                        // Reset button state
                        submitBtn.classList.remove("loading");
                        submitBtn.disabled = false;
                    }, 3000);
                }
            }, 1000);
        });
    }

    // Simple FAQ accordion functionality
    function initFAQAccordion() {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const answerParagraph = answer.querySelector('p');

            // Add initial state
            if (answerParagraph) {
                answerParagraph.style.opacity = '0';
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

                        // Hide paragraph
                        if (otherParagraph) {
                            otherParagraph.style.opacity = '0';
                        }
                    }
                });

                // Toggle current FAQ
                question.setAttribute('aria-expanded', !isExpanded);
                answer.setAttribute('aria-hidden', isExpanded);

                // Show/hide paragraph
                if (answerParagraph) {
                    if (!isExpanded) {
                        // Small delay to allow the container to expand first
                        setTimeout(() => {
                            answerParagraph.style.opacity = '1';
                        }, 100);
                    } else {
                        answerParagraph.style.opacity = '0';
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

                // Update form progress
                updateFormProgress();
            });
        });
    }

    // Form progress tracking
    function initFormProgress() {
        const requiredFields = document.querySelectorAll('#feedbackForm [required]');

        requiredFields.forEach(field => {
            field.addEventListener('input', updateFormProgress);
            field.addEventListener('change', updateFormProgress);
        });

        // Initial progress calculation
        updateFormProgress();
    }

    function updateFormProgress() {
        const progressBar = document.getElementById('formProgressBar');
        if (!progressBar) return;

        const requiredFields = document.querySelectorAll('#feedbackForm [required]');
        let filledFields = 0;

        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                // For radio buttons, check if any in the group is selected
                const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
                const isSelected = Array.from(radioGroup).some(radio => radio.checked);
                if (isSelected) filledFields++;
            } else if (field.type === 'checkbox') {
                if (field.checked) filledFields++;
            } else {
                if (field.value.trim() !== '') filledFields++;
            }
        });

        const progress = (filledFields / requiredFields.length) * 100;
        progressBar.style.width = `${progress}%`;
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