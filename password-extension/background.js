// API endpoint configuration
const API_BASE_URL = 'http://localhost:8080';
const API_ENDPOINTS = {
    SAVE_PASSWORD: `${API_BASE_URL}/api/password`
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Track ongoing requests to prevent duplicates
const pendingRequests = new Map();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAVE_PASSWORD') {
        // Generate unique request ID
        const requestId = `${sender.tab.id}-${Date.now()}`;
        
        // Check if there's already a pending request for this tab
        if (pendingRequests.has(sender.tab.id)) {
            sendResponse({ 
                success: false, 
                error: 'Another password save request is in progress' 
            });
            return false;
        }

        // Validate input data
        if (!isValidPasswordData(message.data)) {
            sendResponse({ 
                success: false, 
                error: 'Invalid password data provided' 
            });
            return false;
        }

        // Track this request
        pendingRequests.set(sender.tab.id, requestId);

        // Handle the password save
        handlePasswordSave(message.data, sender.tab.id, requestId)
            .then(response => {
                pendingRequests.delete(sender.tab.id);
                sendResponse(response);
            })
            .catch(error => {
                pendingRequests.delete(sender.tab.id);
                sendResponse({ 
                    success: false, 
                    error: error.message 
                });
            });
        
        // Keep the message channel open for async response
        return true;
    }
});

// Validate password data
function isValidPasswordData(data) {
    return data 
        && typeof data.password === 'string' 
        && data.password.length > 0
        && typeof data.domain === 'string' 
        && data.domain.length > 0;
}

// Handle password saving with retries
async function handlePasswordSave(data, tabId, requestId) {
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            // Check if this request is still valid
            if (pendingRequests.get(tabId) !== requestId) {
                throw new Error('Request was superseded by another');
            }

            // Make API request
            const response = await fetch(API_ENDPOINTS.SAVE_PASSWORD, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: data.password,
                    domain: data.domain
                })
            });

            // Handle different types of errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || 
                    `API request failed with status ${response.status}`
                );
            }

            const result = await response.json();

            // Show success notification
            await showNotificationSafe(tabId, 'Password saved successfully!');

            return { success: true, data: result };

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt} failed:`, error);

            // Don't retry if request was superseded
            if (error.message === 'Request was superseded by another') {
                throw error;
            }

            // If this wasn't our last attempt, wait before retrying
            if (attempt < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }

    // Show failure notification
    await showNotificationSafe(tabId, 'Failed to save password. Please try again.');
    
    throw lastError;
}

// Safely show notification with error handling
async function showNotificationSafe(tabId, message) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: showNotification,
            args: [message]
        });
    } catch (error) {
        console.error('Failed to show notification:', error);
    }
}

// Function to be injected into the page for showing notifications
function showNotification(message) {
    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background-color: #333;
            color: white;
            border-radius: 5px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                notification.remove();
                // Remove style element after animation
                setTimeout(() => style.remove(), 300);
            }, 300);
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
} 