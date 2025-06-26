document.addEventListener("DOMContentLoaded", function() {
    const feedbackForm = document.getElementById("feedbackForm");
    const thankYouMessage = document.querySelector(".thank-you-message");
    const starRating = document.querySelector(".star-rating");
    const ratingText = document.querySelector(".rating-text");
    const faqItems = document.querySelectorAll(".faq-item");
    
    // Update rating text when stars are hovered or selected
    const stars = document.querySelectorAll(".star-rating input");
    const ratingLabels = document.querySelectorAll(".star-rating label");
    
    ratingLabels.forEach((label, index) => {
        // Update rating text on hover
        label.addEventListener("mouseenter", () => {
            const rating = 5 - index;
            updateRatingText(rating);
        });
        
        // Return to selected rating when mouse leaves the stars area
        starRating.addEventListener("mouseleave", () => {
            const selectedRating = getSelectedRating();
            if (selectedRating > 0) {
                updateRatingText(selectedRating);
            } else {
                ratingText.textContent = "Select your rating";
            }
        });
    });
    
    // Update rating text when a star is clicked
    stars.forEach(star => {
        star.addEventListener("change", () => {
            const rating = star.value;
            updateRatingText(rating);
        });
    });
    
    // Helper function to get the selected rating
    function getSelectedRating() {
        for (let i = 0; i < stars.length; i++) {
            if (stars[i].checked) {
                return stars[i].value;
            }
        }
        return 0;
    }
    
    // Helper function to update rating text
    function updateRatingText(rating) {
        const ratingMessages = {
            1: "Poor - Needs significant improvement",
            2: "Fair - Below expectations",
            3: "Good - Meets expectations",
            4: "Very Good - Exceeds expectations",
            5: "Excellent - Outstanding experience"
        };
        
        ratingText.textContent = ratingMessages[rating] || "Select your rating";
    }
    
    // Form submission handler
    feedbackForm.addEventListener("submit", function(event) {
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
        
        // Simulate form submission (would be replaced with actual AJAX in production)
        setTimeout(() => {
            // Hide form and show thank you message
            feedbackForm.closest(".feedback-form-container").style.opacity = "0";
            
            setTimeout(() => {
                feedbackForm.closest(".feedback-form-container").style.display = "none";
                thankYouMessage.classList.add("show");
                thankYouMessage.style.animation = "slideIn 0.5s forwards";
                
                // Reset the form for future submissions
                feedbackForm.reset();
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Scroll to thank you message
                thankYouMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
            
            // Log form data (in production this would send to server)
            console.log("Feedback submitted:", formDataObject);
            
        }, 1500);
    });
    
    // Form validation
    function validateForm(formData) {
        // Check required fields
        if (!formData.name || !formData.email || !formData.feedback) {
            showError("Please fill in all required fields");
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError("Please enter a valid email address");
            return false;
        }
        
        // Check if rating is selected
        if (!formData.rating) {
            showError("Please select a rating");
            return false;
        }
        
        // Check consent checkbox
        if (!formData.consent) {
            showError("Please agree to share your feedback");
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
        
        // Add styles
        errorEl.style.backgroundColor = "#fff0f0";
        errorEl.style.color = "#d32f2f";
        errorEl.style.padding = "12px";
        errorEl.style.borderRadius = "8px";
        errorEl.style.marginBottom = "20px";
        errorEl.style.borderLeft = "4px solid #d32f2f";
        errorEl.style.animation = "shake 0.5s";
        
        // Define shake animation
        const style = document.createElement("style");
        style.innerHTML = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
        
        // Scroll to error
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
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
    
    // Add focus and blur event handlers for form fields with icons
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
                icon.style.color = "#aaa";
            }
        });
    });
    
    // Animated label effect for inputs
    const formGroups = document.querySelectorAll(".form-group");
    
    formGroups.forEach(group => {
        const input = group.querySelector("input, textarea, select");
        const label = group.querySelector("label");
        
        if (input && label) {
            // Check on page load
            if (input.value) {
                label.classList.add("active");
            }
            
            // Check on input
            input.addEventListener("input", () => {
                if (input.value) {
                    label.classList.add("active");
                } else {
                    label.classList.remove("active");
                }
            });
        }
    });
    
    // Add custom ripple effect to buttons
    const buttons = document.querySelectorAll(".submit-btn, .return-btn");
    
    buttons.forEach(button => {
        button.addEventListener("click", function(e) {
            // Create ripple element
            const ripple = document.createElement("span");
            ripple.classList.add("ripple");
            this.appendChild(ripple);
            
            // Get position
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set position and animate
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Remove after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple effect
    const style = document.createElement("style");
    style.innerHTML = `
        .submit-btn, .return-btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}); 