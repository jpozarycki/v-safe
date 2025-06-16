// Track password fields and their values
let passwordFields = new Map();
let isProcessingSubmission = false;

// Function to find all password fields and add listeners
function initializePasswordTracking() {
    try {
        const inputs = document.querySelectorAll('input[type="password"]');
        inputs.forEach(input => {
            if (passwordFields.has(input)) return; // Skip if already tracked
            
            // Add input to tracking
            passwordFields.set(input, '');
            
            // Listen for changes
            input.addEventListener('input', handlePasswordInput);
            input.addEventListener('change', handlePasswordInput);

            // Find and handle the parent form
            setupFormListener(input);
            
            // Handle button clicks that might submit forms
            setupSubmitButtonListeners(input);
        });
    } catch (error) {
        console.error('Error initializing password tracking:', error);
    }
}

// Handle password input changes
function handlePasswordInput(e) {
    try {
        const input = e.target;
        if (!input || !input.value) return;
        
        passwordFields.set(input, input.value);
    } catch (error) {
        console.error('Error handling password input:', error);
    }
}

// Setup form submission listener
function setupFormListener(input) {
    try {
        const form = input.closest('form');
        if (form && !form.hasAttribute('data-pwd-listener')) {
            form.setAttribute('data-pwd-listener', 'true');
            form.addEventListener('submit', handleFormSubmission);
        }
    } catch (error) {
        console.error('Error setting up form listener:', error);
    }
}

// Setup listeners for submit buttons outside forms
function setupSubmitButtonListeners(input) {
    try {
        // Find potential submit buttons near the password field
        const container = input.closest('div, section, main') || document.body;
        const submitButtons = container.querySelectorAll('button[type="submit"], input[type="submit"], button:not([type])');
        
        submitButtons.forEach(button => {
            if (!button.hasAttribute('data-pwd-listener')) {
                button.setAttribute('data-pwd-listener', 'true');
                button.addEventListener('click', handleButtonClick);
            }
        });
    } catch (error) {
        console.error('Error setting up button listeners:', error);
    }
}

// Handle button clicks for forms without submit events
function handleButtonClick(e) {
    try {
        if (isProcessingSubmission) return;
        
        const button = e.target.closest('button, input[type="submit"]');
        if (!button) return;
        
        // Check if any password fields are nearby
        const container = button.closest('div, section, main') || document.body;
        const hasPasswordFields = Array.from(passwordFields.entries())
            .some(([input]) => container.contains(input));
        
        if (hasPasswordFields) {
            handleFormSubmission(e);
        }
    } catch (error) {
        console.error('Error handling button click:', error);
    }
}

// Handle form submission
async function handleFormSubmission(e) {
    try {
        if (isProcessingSubmission) return;
        isProcessingSubmission = true;

        // Get the container (form or nearest parent)
        const container = e.target.closest('form') || e.target.closest('div, section, main') || document.body;
        
        // Get all passwords from the container
        const formPasswords = Array.from(passwordFields.entries())
            .filter(([input]) => container.contains(input))
            .map(([, value]) => value)
            .filter(pwd => pwd.length > 0);

        if (formPasswords.length > 0) {
            // Get the current domain
            const domain = window.location.hostname;
            if (!domain) {
                throw new Error('Unable to determine current domain');
            }
            
            // Send the last password (most likely the confirmed one in case of confirmation fields)
            const password = formPasswords[formPasswords.length - 1];
            
            // Send message to background script
            const response = await chrome.runtime.sendMessage({
                type: 'SAVE_PASSWORD',
                data: { password, domain }
            });

            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to save password');
            }
        }
    } catch (error) {
        console.error('Error handling form submission:', error);
    } finally {
        // Clear stored passwords for security
        passwordFields.clear();
        isProcessingSubmission = false;
    }
}

// Initialize tracking when the script loads
initializePasswordTracking();

// Watch for dynamic content changes
const observer = new MutationObserver((mutations) => {
    try {
        let shouldInit = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                shouldInit = true;
                break;
            }
        }
        if (shouldInit) {
            initializePasswordTracking();
        }
    } catch (error) {
        console.error('Error in MutationObserver:', error);
    }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { 
    childList: true, 
    subtree: true 
}); 