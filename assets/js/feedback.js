document.addEventListener("DOMContentLoaded", function () {
    const feedbackForm = document.getElementById("feedbackForm");
    const thankYouMessage = document.querySelector(".thank-you-message");
    const starRating = document.querySelector(".star-rating");
    const ratingText = document.querySelector(".rating-text");
    const faqItems = document.querySelectorAll(".faq-item");

    // Rating functionality
    const stars = document.querySelectorAll(".star-rating input");
    const ratingLabels = document.querySelectorAll(".star-rating label");

    // Update rating text on hover and selection
    ratingLabels.forEach((label, index) => {
        label.addEventListener("mouseenter", () => {
            const rating = 5 - index;
            updateRatingText(rating);
        });
    });

    starRating.addEventListener("mouseleave", () => {
        const selectedRating = getSelectedRating();
        if (selectedRating > 0) {
            updateRatingText(selectedRating);
        } else {
            ratingText.textContent = "Select your rating";
        }
    });

    stars.forEach(star => {
        star.addEventListener("change", () => {
            const rating = star.value;
            updateRatingText(rating);
        });
    });

    function getSelectedRating() {
        for (let i = 0; i < stars.length; i++) {
            if (stars[i].checked) {
                return stars[i].value;
            }
        }
        return 0;
    }

    function updateRatingText(rating) {
        const ratingMessages = {
            1: "Poor - Needs improvement",
            2: "Fair - Below expectations",
            3: "Good - Meets expectations",
            4: "Very Good - Exceeds expectations",
            5: "Excellent - Outstanding experience"
        };

        ratingText.textContent = ratingMessages[rating] || "Select your rating";
    }

    // Form submission handler
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
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            // Hide form and show thank you message
            feedbackForm.closest(".feedback-form-container").style.display = "none";
            thankYouMessage.classList.add("show");

            // Reset the form for future submissions
            feedbackForm.reset();
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;

            // Log form data (in production this would send to server)
            console.log("Feedback submitted:", formDataObject);

        }, 1500);
    });

    // Form validation
    function validateForm(formData) {
        // Check required fields
        if (!formData.name || !formData.email || !formData.feedback || !formData.category || !formData.rating || !formData.consent) {
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
            feedbackForm.prepend(errorEl);
        }

        // Set error message
        errorEl.textContent = message;
        errorEl.style.display = "block";

        // Remove error after 5 seconds
        setTimeout(() => {
            errorEl.style.display = "none";
        }, 5000);

        return false;
    }

    // FAQ Accordion functionality
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {
            // Toggle active class on the current item
            item.classList.toggle("active");

            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                }
            });
        });
    });

    // Form field icon color change on focus/blur
    const inputFields = document.querySelectorAll(".input-with-icon input, .input-with-icon select, .textarea-with-icon textarea");

    inputFields.forEach(field => {
        field.addEventListener("focus", () => {
            const icon = field.previousElementSibling;
            if (icon && icon.tagName === "I") {
                icon.style.color = "var(--primary-color)";
            }
        });

        field.addEventListener("blur", () => {
            const icon = field.previousElementSibling;
            if (icon && icon.tagName === "I" && !field.value) {
                icon.style.color = "#888";
            }
        });
    });
}); 