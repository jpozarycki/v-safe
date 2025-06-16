# Browser Extension Password Saving Implementation Plan

## Overview
Implement automatic password detection and saving functionality in the NeoVault browser extension when forms are submitted.

## Current State
- Extension has popup functionality to view passwords by domain
- Uses Manifest V3
- Has permissions for activeTab, scripting, and all URLs
- API endpoint exists at `POST {{host}}/api/password`

## Implementation Steps

### 1. Add Content Script
Create `content.js` to inject into web pages:
- Monitor all password input fields on the page
- Listen for form submission events
- Extract password and domain when form is submitted
- Send message to background script with password data

### 2. Create Background Service Worker
Create `background.js` to handle API communication:
- Listen for messages from content script
- Make POST request to `/api/password` endpoint
- Handle success/failure responses
- Notify content script of result

### 3. Update Manifest
Modify `manifest.json` to include:
- Content script declaration
- Background service worker
- Additional permissions if needed (storage, notifications)

### 4. Content Script Implementation Details

#### Password Detection
- Use `querySelectorAll('input[type="password"]')` to find password fields
- Track password values on input events
- Store temporarily in memory (not localStorage)

#### Form Submission Interception
- Add event listeners to forms containing password fields
- Listen for both 'submit' events and button clicks
- Capture password value before form submission

#### Message Passing
- Use `chrome.runtime.sendMessage()` to send data to background
- Include password and current domain in message

### 5. Background Script Implementation Details

#### API Communication
- Receive messages from content script
- Make POST request to `http://localhost:8080/api/password`
- Send JSON body with password and domain
- Handle CORS if necessary

#### Response Handling
- On success: optionally notify user
- On failure: log error, optionally retry

### 6. Security Considerations
- Never store passwords in localStorage or sessionStorage
- Clear password from memory after sending
- Use HTTPS for API calls in production
- Consider encrypting password before sending

## File Structure
```
password-extension/
├── manifest.json (updated)
├── content.js (new)
├── background.js (new)
├── popup.html (existing)
├── popup.js (existing)
├── popup.css (existing)
└── icon.png (existing)
```

## API Request Format
```json
{
    "password": "password123",
    "domain": "example.com"
}
```

## Implementation Order
1. Update manifest.json
2. Create content.js with basic password detection
3. Create background.js with API communication
4. Add error handling and edge cases
5. Add user feedback mechanisms 