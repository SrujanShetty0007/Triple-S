document.addEventListener("DOMContentLoaded", function () {
    const feedbackForm = document.getElementById("feedbackForm");
    const thankYouMessage = document.querySelector(".thank-you-message");
    const faqItems = document.querySelectorAll(".faq-item");
    const formGroups = document.querySelectorAll(".form-group");
    const formFields = document.querySelectorAll(".form-group input, .form-group textarea, .form-group select");

    // Initialize FAQ components
    initFAQAccordion();

    // Initialize form field validation
    initFormValidation();

    // Initialize emoji rating
    initEmojiRating();

    // Form submission handler with enhanced UX
    feedbackForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // Get form data
        const formData = new FormData(feedbackForm);
        const formDataObject = Object.fromEntries(formData.entries());

        // Validate form
        if (!validateForm(formDataObject)) {
            return;
        }

        // Show loading state
        const submitBtn = feedbackForm.querySelector(".submit-btn");
        submitBtn.classList.add("loading");
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            // Smoothly hide form and container
            const formContainer = feedbackForm.closest(".feedback-form-container");
            formContainer.style.opacity = "0";
            formContainer.style.transform = "translateY(20px)";
            formContainer.style.transition = "opacity 0.5s ease, transform 0.5s ease";

            // After form fades out, show thank you message
            setTimeout(() => {
                formContainer.style.display = "none";
                thankYouMessage.classList.add("show");

                // Set focus to the thank you message for screen readers
                thankYouMessage.setAttribute("tabindex", "-1");
                thankYouMessage.focus();

                // Set focus to the "Submit Another Response" button
                const returnBtn = thankYouMessage.querySelector(".return-btn");
                setTimeout(() => {
                    returnBtn.focus();
                }, 200);
            }, 500);

            // Reset the form for future submissions
            feedbackForm.reset();
            submitBtn.classList.remove("loading");
            submitBtn.disabled = false;

            // Log form data (in production this would send to server)
            console.log("Feedback submitted:", formDataObject);
        }, 1500);
    });



    // Initialize form validation
    function initFormValidation() {
        // Real-time validation as user types/changes fields
        formFields.forEach(field => {
            field.addEventListener('blur', function () {
                validateField(this);
            });

            field.addEventListener('input', function () {
                // Clear error when user starts typing again
                const feedbackEl = this.closest('.form-group').querySelector('.form-field-feedback');
                if (feedbackEl) {
                    feedbackEl.textContent = '';
                    feedbackEl.classList.remove('active');
                }
            });

            // Handle focus/blur for icon color
            field.addEventListener("focus", () => {
                const icon = field.nextElementSibling;
                if (icon && icon.tagName === "I") {
                    icon.style.color = "var(--primary-color)";
                }
            });

            field.addEventListener("blur", () => {
                const icon = field.nextElementSibling;
                if (icon && icon.tagName === "I" && !field.value) {
                    icon.style.color = "#888";
                }
            });
        });
    }

    // Validate individual form field
    function validateField(field) {
        const feedbackEl = field.closest('.form-group').querySelector('.form-field-feedback');
        let isValid = true;
        let message = '';

        // Skip validation if field is empty and not required
        if (!field.value && !field.required) {
            return true;
        }

        // Check required
        if (field.required && !field.value) {
            isValid = false;
            message = 'This field is required';
        }
        // Email format validation
        else if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Display feedback if invalid
        if (!isValid && feedbackEl) {
            feedbackEl.textContent = message;
            feedbackEl.classList.add('active');
            field.setAttribute('aria-invalid', 'true');
        } else if (field.getAttribute('aria-invalid') === 'true') {
            field.removeAttribute('aria-invalid');
        }

        return isValid;
    }

    // Form validation
    function validateForm(formData) {
        // Clear any existing error message
        hideError();

        // Check all fields individually
        let isValid = true;
        formFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        // Additional validation for required fields
        if (!formData.name || !formData.email || !formData.feedback || !formData.category || !formData.satisfaction || !formData.consent) {
            showError("Please fill in all required fields");
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError("Please enter a valid email address");
            return false;
        }

        return true;
    }

    // Show error message
    function showError(message) {
        // Create error element if it doesn't exist
        let errorEl = document.querySelector(".form-error");

        if (!errorEl) {
            errorEl = document.createElement("div");
            errorEl.className = "form-error";
            errorEl.setAttribute("role", "alert");
            errorEl.setAttribute("aria-live", "assertive");
            feedbackForm.prepend(errorEl);
        }

        // Set error message
        errorEl.textContent = message;
        errorEl.style.display = "block";

        // Ensure error is visible for screen readers and focus on it
        errorEl.tabIndex = -1;
        errorEl.focus();

        // Remove error after 5 seconds
        setTimeout(() => {
            hideError();
        }, 5000);

        return false;
    }

    // Hide error message
    function hideError() {
        const errorEl = document.querySelector(".form-error");
        if (errorEl) {
            errorEl.style.display = "none";
        }
    }

    // Initialize FAQ Accordion functionality
    function initFAQAccordion() {
        faqItems.forEach(item => {
            const question = item.querySelector(".faq-question");
            const answer = item.querySelector(".faq-answer");

            question.addEventListener("click", () => {
                toggleFaq(question, answer);
            });

            // Add keyboard accessibility
            question.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFaq(question, answer);
                }
            });
        });
    }

    function toggleFaq(question, answer) {
        // Get current state
        const isExpanded = question.getAttribute("aria-expanded") === "true";

        // Close all other FAQs
        document.querySelectorAll(".faq-question").forEach(q => {
            if (q !== question) {
                q.setAttribute("aria-expanded", "false");
                const a = document.getElementById(q.getAttribute("aria-controls"));
                if (a) a.setAttribute("aria-hidden", "true");
            }
        });

        // Toggle current FAQ
        question.setAttribute("aria-expanded", !isExpanded);
        answer.setAttribute("aria-hidden", isExpanded);

        if (!isExpanded) {
            // Add subtle animation when opening
            answer.style.opacity = "0";
            setTimeout(() => {
                answer.style.opacity = "1";
                answer.style.transition = "opacity 0.3s ease";
            }, 10);
        }
    }



    // Initialize emoji rating functionality
    function initEmojiRating() {
        const emojiOptions = document.querySelectorAll('.emoji-option input');
        const emojiContainer = document.querySelector('.emoji-rating');

        if (!emojiOptions.length || !emojiContainer) return;

        // Add keyboard navigation
        emojiOptions.forEach((option, index) => {
            option.addEventListener('keydown', (e) => {
                // Left/right arrow keys to navigate between options
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();

                    let nextIndex;
                    if (e.key === 'ArrowLeft') {
                        nextIndex = index > 0 ? index - 1 : 0;
                    } else {
                        nextIndex = index < emojiOptions.length - 1 ? index + 1 : index;
                    }

                    emojiOptions[nextIndex].focus();
                    emojiOptions[nextIndex].checked = true;

                    // Trigger change event
                    const event = new Event('change');
                    emojiOptions[nextIndex].dispatchEvent(event);
                }
            });

            // Handle change event
            option.addEventListener('change', () => {
                // Add visual feedback
                const label = option.closest('.emoji-option');

                // Add a subtle pulse effect
                label.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    label.style.transform = '';
                }, 300);
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