// Track password fields and their values
let passwordFields = new Map();
let dropdowns = new Map();
let isProcessingSubmission = false;
let activeDropdown = null;

// Secure password storage using WeakMap to allow garbage collection
const securePasswords = new WeakMap();

// Debug logging function
function debugLog(message, data = null) {
    console.log(`[V-Safe Debug] ${message}`, data || '');
}

// Function to securely store password data
function securelyStorePassword(element, password) {
    securePasswords.set(element, password);
}

// Function to securely retrieve password data
function securelyGetPassword(element) {
    return securePasswords.get(element);
}

// Function to securely clear password data
function securelyClearPassword(element) {
    securePasswords.delete(element);
}

// Function to determine if a form is a login form
function isLoginForm(container) {
    return true;
    // try {
    //     debugLog('Checking if form is login form', container);
        
    //     // Get all password fields in the container
    //     const passwordInputs = Array.from(container.querySelectorAll('input[type="password"]'));
    //     debugLog('Found password inputs:', passwordInputs.length);
        
    //     if (passwordInputs.length !== 1) {
    //         debugLog('Not a login form - wrong number of password fields');
    //         return false;
    //     }

    //     // Check for common login indicators
    //     const containerHTML = container.innerHTML.toLowerCase();
    //     const loginIndicators = [
    //         'login', 
    //         'sign in', 
    //         'signin', 
    //         'log in', 
    //         'zaloguj',
    //         'zaloguj się',
    //         'logowanie'
    //     ];
    //     const registrationIndicators = [
    //         'register', 
    //         'sign up', 
    //         'signup', 
    //         'create account', 
    //         'confirm password', 
    //         'rejestracja',
    //         'zarejestruj',
    //         'potwierdź hasło',
    //         'powtórz hasło'
    //     ];

    //     // Check for login-specific attributes
    //     const hasLoginAttributes = container.querySelector([
    //         'form[action*="login"]',
    //         'form[action*="signin"]',
    //         'form[action*="logowanie"]',
    //         'form[id*="login"]',
    //         'form[id*="signin"]',
    //         'form[class*="login"]',
    //         'form[class*="signin"]',
    //         'div[id*="login"]',
    //         'div[id*="signin"]',
    //         'div[class*="login"]',
    //         'div[class*="signin"]'
    //     ].join(','));

    //     // Check for registration indicators first
    //     if (registrationIndicators.some(indicator => containerHTML.includes(indicator))) {
    //         debugLog('Found registration indicators');
    //         return false;
    //     }

    //     // Check if this is a login form based on multiple criteria
    //     const hasLoginText = loginIndicators.some(indicator => containerHTML.includes(indicator));
    //     const isSinglePasswordField = passwordInputs.length === 1;
    //     const hasEmailInput = container.querySelector('input[type="email"], input[name*="email"], input[id*="email"]');
        
    //     // Log all detection criteria
    //     debugLog('Login form detection criteria:', {
    //         hasLoginText,
    //         isSinglePasswordField,
    //         hasEmailInput: !!hasEmailInput,
    //         hasLoginAttributes: !!hasLoginAttributes
    //     });

    //     // Consider it a login form if:
    //     // 1. It has login indicators in text OR login-specific attributes
    //     // 2. AND has exactly one password field
    //     // 3. AND has an email input
    //     const isLogin = (hasLoginText || hasLoginAttributes) && isSinglePasswordField && hasEmailInput;
    //     debugLog('Final login form detection result:', isLogin);
    //     return isLogin;

    // } catch (error) {
    //     console.error('Error determining form type:', error);
    //     return false;
    // }
}

// Create and position the dropdown for a password field
function createPasswordDropdown(passwordInput) {
    try {
        if (activeDropdown) {
            hideDropdown(activeDropdown);
        }

        // Create dropdown container
        const dropdown = document.createElement('div');
        const dropdownId = `vsafe-dropdown-${Math.random().toString(36).substr(2, 9)}`;
        dropdown.id = dropdownId;
        dropdown.className = 'vsafe-password-dropdown';
        dropdown.setAttribute('role', 'listbox');
        dropdown.setAttribute('aria-label', 'Saved passwords');
        dropdown.style.cssText = `
            position: absolute;
            display: none;
            z-index: 999999;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            max-height: 200px;
            overflow-y: auto;
        `;

        // Create header
        const header = document.createElement('div');
        header.className = 'vsafe-dropdown-header';
        header.textContent = 'Saved Passwords';
        dropdown.appendChild(header);

        // Create password list container
        const ul = document.createElement('ul');
        ul.className = 'vsafe-password-list';
        dropdown.appendChild(ul);

        // Position the dropdown
        const rect = passwordInput.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.width = `${rect.width}px`;

        // Add to document
        document.body.appendChild(dropdown);
        dropdowns.set(passwordInput, dropdown);

        // Add keyboard navigation
        passwordInput.addEventListener('keydown', (e) => handleDropdownKeyboard(e, dropdown));

        // Add click outside listener to hide dropdown
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && e.target !== passwordInput) {
                hideDropdown(dropdown);
            }
        });

        // Update positioning on window resize and scroll
        const updatePosition = () => {
            const rect = passwordInput.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + window.scrollY}px`;
            dropdown.style.left = `${rect.left + window.scrollX}px`;
            dropdown.style.width = `${rect.width}px`;
        };

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        // Add cleanup function
        const cleanup = () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
            
            // Clear any stored passwords
            const items = dropdown.querySelectorAll('.vsafe-password-item');
            items.forEach(item => {
                securelyClearPassword(item);
            });
            
            // Remove from DOM
            if (dropdown.parentNode) {
                dropdown.parentNode.removeChild(dropdown);
            }
        };

        dropdown.cleanup = cleanup;
        return dropdown;
    } catch (error) {
        console.error('Error creating password dropdown:', error);
        return null;
    }
}

// Function to fetch passwords for the current domain
async function fetchPasswordsForDomain(domain) {
    try {
        const response = await chrome.runtime.sendMessage({
            type: 'FETCH_PASSWORDS',
            data: { domain }
        });

        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch passwords');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching passwords:', error);
        throw error;
    }
}

// Function to populate the dropdown with passwords
function populateDropdown(dropdown, passwords) {
    const ul = dropdown.querySelector('.vsafe-password-list');
    ul.innerHTML = ''; // Clear existing items

    // Clear any previously stored passwords
    const oldItems = dropdown.querySelectorAll('.vsafe-password-item');
    oldItems.forEach(item => {
        securelyClearPassword(item);
    });

    if (!passwords || passwords.length === 0) {
        const li = document.createElement('li');
        li.className = 'vsafe-password-item';
        li.setAttribute('role', 'option');
        li.setAttribute('aria-disabled', 'true');
        li.textContent = 'No saved passwords found';
        ul.appendChild(li);
        return;
    }

    passwords.forEach((passwordData, index) => {
        const li = document.createElement('li');
        li.className = 'vsafe-password-item';
        li.setAttribute('role', 'option');
        li.setAttribute('tabindex', '-1');
        
        // Securely store the password
        securelyStorePassword(li, passwordData.password);
        
        // Create masked password element
        const maskedSpan = document.createElement('span');
        maskedSpan.className = 'vsafe-password-masked';
        // Improve masking to not reveal password length
        const maskedLength = Math.floor(Math.random() * 3) + 8; // Random length between 8-10
        const maskedPassword = '•'.repeat(maskedLength) + 
                             passwordData.password.slice(-3);
        maskedSpan.textContent = maskedPassword;
        maskedSpan.setAttribute('aria-hidden', 'true');
        
        // Create full password element (hidden by default)
        const fullSpan = document.createElement('span');
        fullSpan.className = 'vsafe-password-full';
        fullSpan.style.display = 'none';
        // Don't store password in DOM
        fullSpan.setAttribute('aria-hidden', 'true');
        
        // Create screen reader text
        const srSpan = document.createElement('span');
        srSpan.className = 'vsafe-sr-only';
        srSpan.textContent = `Password ${index + 1} of ${passwords.length}`;
        
        li.appendChild(srSpan);
        li.appendChild(maskedSpan);
        li.appendChild(fullSpan);
        
        // Add hover effect to show full password
        li.addEventListener('mouseenter', () => {
            maskedSpan.style.display = 'none';
            fullSpan.style.display = 'inline';
            fullSpan.textContent = securelyGetPassword(li);
            li.classList.add('selected');
        });
        
        li.addEventListener('mouseleave', () => {
            maskedSpan.style.display = 'inline';
            fullSpan.style.display = 'none';
            fullSpan.textContent = '';
            if (!li.hasAttribute('aria-selected')) {
                li.classList.remove('selected');
            }
        });
        
        // Add click handler to fill password
        li.addEventListener('click', () => {
            const passwordInput = Array.from(passwordFields.keys())
                .find(input => dropdowns.get(input) === dropdown);
            
            if (passwordInput) {
                const password = securelyGetPassword(li);
                passwordInput.value = password;
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
                hideDropdown(dropdown);
                passwordInput.focus();
            }
        });
        
        ul.appendChild(li);
    });

    // Select first item by default for keyboard navigation
    const firstItem = ul.querySelector('.vsafe-password-item');
    if (firstItem) {
        firstItem.classList.add('selected');
        firstItem.setAttribute('aria-selected', 'true');
    }
}

// Function to show loading state in dropdown
function showDropdownLoading(dropdown) {
    const ul = dropdown.querySelector('.vsafe-password-list');
    ul.innerHTML = `
        <li class="vsafe-dropdown-loading" role="status" aria-live="polite">
            Loading passwords...
        </li>
    `;
}

// Function to show error state in dropdown
function showDropdownError(dropdown, error) {
    const ul = dropdown.querySelector('.vsafe-password-list');
    ul.innerHTML = `
        <li class="vsafe-dropdown-error" role="alert">
            ${error}
            <button class="vsafe-retry-button" aria-label="Retry loading passwords">Retry</button>
        </li>
    `;

    // Add retry button functionality
    const retryButton = ul.querySelector('.vsafe-retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const input = Array.from(passwordFields.keys())
                .find(input => dropdowns.get(input) === dropdown);
            if (input) {
                showDropdownLoading(dropdown);
                try {
                    const domain = window.location.hostname;
                    const passwords = await fetchPasswordsForDomain(domain);
                    populateDropdown(dropdown, passwords);
                } catch (error) {
                    showDropdownError(dropdown, 'Failed to load passwords');
                }
            }
        });
    }
}

// Handle keyboard navigation
function handleDropdownKeyboard(e, dropdown) {
    if (!dropdown || dropdown.style.display === 'none') return;

    const items = Array.from(dropdown.querySelectorAll('.vsafe-password-item'));
    const selectedItem = dropdown.querySelector('.vsafe-password-item.selected');
    let selectedIndex = selectedItem ? items.indexOf(selectedItem) : -1;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (selectedIndex < items.length - 1) {
                if (selectedItem) {
                    selectedItem.classList.remove('selected');
                    selectedItem.removeAttribute('aria-selected');
                }
                items[selectedIndex + 1].classList.add('selected');
                items[selectedIndex + 1].setAttribute('aria-selected', 'true');
                ensureItemVisible(items[selectedIndex + 1]);
            }
            break;

        case 'ArrowUp':
            e.preventDefault();
            if (selectedIndex > 0) {
                if (selectedItem) {
                    selectedItem.classList.remove('selected');
                    selectedItem.removeAttribute('aria-selected');
                }
                items[selectedIndex - 1].classList.add('selected');
                items[selectedIndex - 1].setAttribute('aria-selected', 'true');
                ensureItemVisible(items[selectedIndex - 1]);
            }
            break;

        case 'Enter':
            e.preventDefault();
            if (selectedItem) {
                selectedItem.click();
            }
            break;

        case 'Escape':
            e.preventDefault();
            hideDropdown(dropdown);
            break;
    }
}

// Ensure selected item is visible in the dropdown
function ensureItemVisible(item) {
    const container = item.closest('.vsafe-password-list');
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += itemRect.bottom - containerRect.bottom;
    } else if (itemRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - itemRect.top;
    }
}

// Show dropdown with animation
function showDropdown(dropdown) {
    if (activeDropdown && activeDropdown !== dropdown) {
        hideDropdown(activeDropdown);
    }
    dropdown.style.display = 'block';
    // Trigger reflow
    dropdown.offsetHeight;
    dropdown.classList.add('visible');
    activeDropdown = dropdown;
}

// Hide dropdown with animation and cleanup
function hideDropdown(dropdown) {
    if (!dropdown) return;
    
    dropdown.classList.remove('visible');
    setTimeout(() => {
        dropdown.style.display = 'none';
        if (activeDropdown === dropdown) {
            activeDropdown = null;
        }
        
        // Clear passwords when dropdown is hidden
        const items = dropdown.querySelectorAll('.vsafe-password-item');
        items.forEach(item => {
            const fullSpan = item.querySelector('.vsafe-password-full');
            if (fullSpan) {
                fullSpan.textContent = '';
            }
        });
    }, 200);
}

// Function to find all password fields and add listeners
function initializePasswordTracking() {
    try {
        debugLog('Initializing password tracking');
        const inputs = document.querySelectorAll('input[type="password"]');
        debugLog('Found password inputs:', inputs.length);
        
        inputs.forEach(input => {
            if (passwordFields.has(input)) {
                debugLog('Skipping already tracked input');
                return;
            }
            
            debugLog('Adding tracking to password input', input);
            
            // Add input to tracking
            passwordFields.set(input, '');
            
            // Listen for changes
            input.addEventListener('input', handlePasswordInput);
            input.addEventListener('change', handlePasswordInput);
            
            // Add focus listener to show dropdown
            input.addEventListener('focus', async (e) => {
                debugLog('Password input focused');
                const container = input.closest('form') || input.closest('div, section, main');
                debugLog('Found container:', container);
                
                if (container && isLoginForm(container)) {
                    debugLog('Creating/showing dropdown');
                    const dropdown = dropdowns.get(input) || createPasswordDropdown(input);
                    if (dropdown) {
                        showDropdown(dropdown);
                        showDropdownLoading(dropdown);
                        
                        try {
                            const domain = window.location.hostname;
                            debugLog('Fetching passwords for domain:', domain);
                            const passwords = await fetchPasswordsForDomain(domain);
                            debugLog('Fetched passwords:', passwords?.length || 0);
                            populateDropdown(dropdown, passwords);
                        } catch (error) {
                            console.error('Error fetching passwords:', error);
                            showDropdownError(dropdown, 'Failed to load passwords');
                        }
                    }
                } else {
                    debugLog('Not showing dropdown - not a login form or no container found');
                }
            });

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

// Cleanup function for page unload
function cleanup() {
    // Clear all dropdowns
    dropdowns.forEach((dropdown, input) => {
        if (dropdown.cleanup) {
            dropdown.cleanup();
        }
    });
    
    // Clear all maps
    passwordFields.clear();
    dropdowns.clear();
    
    // Remove mutation observer
    if (observer) {
        observer.disconnect();
    }
}

// Add cleanup on page unload
window.addEventListener('unload', cleanup); 