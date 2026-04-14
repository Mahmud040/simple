
// Global variables to store form data and current step
let currentStep = 1;
let formData = {
    category: 'Food',
    title: '',
    description: '',
    reward: 50,
    pickupLocation: '',
    dropoffLocation: ''
};

/**
 * Initialize the page
 */
function initCreatePage() {
    // 1. Must be logged in
    window.Auth.requireAuth();

    // 2. Setup the UI
    updateStepVisibility();
    setupFormListeners();

    // Check if there was a half-finished request (draft)
    loadSavedDraft();
}

/**
 * Listen for changes in the form inputs
 */
function setupFormListeners() {
    // Category Buttons
    const catButtons = document.querySelectorAll('.category-btn');
    catButtons.forEach(btn => {
        btn.onclick = function () {
            formData.category = btn.dataset.category;

            // Highlight the selected button
            catButtons.forEach(b => b.classList.remove('border-emerald-500', 'bg-emerald-50'));
            btn.classList.add('border-emerald-500', 'bg-emerald-50');

            saveDraft();
        };
    });

    // Text inputs and sliders
    const inputs = ['title', 'description', 'reward', 'pickupLocation', 'dropoffLocation'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.oninput = function (e) {
                formData[id] = e.target.value;

                // Update reward text if slider moves
                if (id === 'reward') {
                    document.getElementById('reward-display').textContent = '৳' + e.target.value;
                }

                saveDraft();
            };
        }
    });
}


function nextStep() {
    // Basic validation
    if (currentStep === 1 && !formData.category) {
        window.UI.toast('Please select a category', 'error');
        return;
    }
    if (currentStep === 2) {
        if (formData.title.length < 5) {
            window.UI.toast('Title is too short', 'error');
            return;
        }
        if (formData.description.length < 10) {
            window.UI.toast('Description is too short', 'error');
            return;
        }
    }

    if (currentStep < 3) {
        currentStep++;
        updateStepVisibility();
        window.scrollTo(0, 0);
    }
}


function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepVisibility();
        window.scrollTo(0, 0);
    }
}


function updateStepVisibility() {
    // Hide all steps first
    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));

    // Show the active step
    const activeStepEl = document.getElementById('step-' + currentStep);
    if (activeStepEl) activeStepEl.classList.remove('hidden');

    // Update the progress dots
    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById('step-dot-' + i);
        if (dot) {
            if (i <= currentStep) {
                dot.classList.add('bg-emerald-500', 'text-white');
            } else {
                dot.classList.remove('bg-emerald-500', 'text-white');
            }
        }
    }

    // Show/Hide buttons
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (currentStep === 1) {
        prevBtn.style.visibility = 'hidden';
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    } else if (currentStep === 3) {
        prevBtn.style.visibility = 'visible';
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        prevBtn.style.visibility = 'visible';
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
}

/**
 * Final submission
 */
function submitRequest() {
    if (!formData.pickupLocation || !formData.dropoffLocation) {
        window.UI.toast('Please enter pickup and dropoff locations', 'error');
        return;
    }

    window.UI.showLoading('submit-btn', 'Posting...');

    const user = window.Auth.getUser();

    // Add user info to the request
    formData.postedBy = user.id;
    formData.postedByName = user.name;

    // Save to "Database"
    window.DB.saveRequest(formData);

    // Clear the draft
    localStorage.removeItem('BringIt_draft');

    setTimeout(() => {
        window.UI.toast('Request posted successfully!', 'success');
        window.location.href = 'feed.html';
    }, 1000);
}

/**
 * Helper: Save draft to localStorage
 */
function saveDraft() {
    localStorage.setItem('BringIt_draft', JSON.stringify(formData));
}

/**
 * Helper: Load draft from localStorage
 */
function loadSavedDraft() {
    const saved = localStorage.getItem('BringIt_draft');
    if (saved) {
        formData = JSON.parse(saved);

        // Fill the inputs with saved data
        document.getElementById('title').value = formData.title;
        document.getElementById('description').value = formData.description;
        document.getElementById('reward').value = formData.reward;
        document.getElementById('reward-display').textContent = '৳' + formData.reward;
        document.getElementById('pickupLocation').value = formData.pickupLocation;
        document.getElementById('dropoffLocation').value = formData.dropoffLocation;

        // Click the saved category button
        const catBtn = document.querySelector(`.category-btn[data-category="${formData.category}"]`);
        if (catBtn) catBtn.click();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initCreatePage);

// Global access for HTML buttons
window.nextStep = nextStep;
window.prevStep = prevStep;
window.submitRequest = submitRequest;
window.CreateRequest = {
    nextStep,
    prevStep,
    submit: submitRequest
};
