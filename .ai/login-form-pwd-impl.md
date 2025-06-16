# Password Dropdown Implementation Plan

## Overview
Implement a dropdown feature that appears next to password input fields on login forms, populated with passwords from the API based on the current domain. When a user selects a password from the dropdown, it automatically fills the password input field.

## Architecture Components

### 1. Content Script Enhancement (`content.js`)
- **Password Field Detection**
  - Enhance existing `initializePasswordTracking()` to identify login forms vs registration forms
  - Add logic to distinguish between password fields for login (single field) vs registration (multiple fields)
  - Create a mapping of password fields to their associated dropdowns

- **Dropdown Creation**
  - Create `createPasswordDropdown(passwordInput)` function
  - Position dropdown adjacent to password field (right side or below based on available space)
  - Style dropdown to match the website's theme (adaptive styling)
  - Add unique identifier to prevent duplicate dropdowns

- **API Integration**
  - Create `fetchPasswordsForDomain()` function
  - Call API endpoint: `GET http://localhost:8080/api/password?domain=${currentDomain}`
  - Handle API errors gracefully (show empty dropdown or error state)

- **Dropdown Population**
  - Parse API response and extract password values from data array
  - Create dropdown options for each password
  - Display passwords partially masked (e.g., "pass****123") for security
  - Add hover effect to show full password temporarily

- **User Interaction**
  - Implement click handler for dropdown options
  - Copy selected password to the associated password input field
  - Close dropdown after selection

### 2. Background Script Updates (`background.js`)
- **API Communication**
  - Add new message type: `FETCH_PASSWORDS`
  - Implement `handlePasswordFetch(domain)` function

### 3. Styling Considerations
- **Dropdown Styles**
  - Create adaptive CSS that inherits from parent form styles
  - Ensure dropdown is visible above other elements (z-index management)
  - Add smooth animations for dropdown show/hide
  - Responsive design for mobile devices

## Implementation Steps

### Phase 1: Detection and Positioning
1. Enhance password field detection to identify login forms
2. Create dropdown container element
3. Implement positioning logic relative to password field
4. Add mutation observer to handle dynamically loaded forms

### Phase 2: API Integration
1. Implement API call in background script
2. Add message passing between content and background scripts
3. Add error handling

### Phase 3: Dropdown Functionality
1. Create dropdown UI component
2. Populate dropdown with API data
3. Implement password masking/unmasking
4. Add click handlers for password selection

### Phase 4: User Experience
1. Implement auto-hide on outside click
2. Add loading states during API calls
3. Implement smooth animations

### Phase 5: Security and Polish
1. Ensure passwords are not stored in DOM unnecessarily
2. Clear dropdown data when navigating away
4. Implement secure password display (partial masking)

## Technical Details

### API Response Format
```json
{
  "data": [
    {
      "id": 1,
      "domain": "example.com",
      "password": "password123"
    },
    {
      "id": 2,
      "domain": "account.proton.me",
      "password": "!Tester12345"
    }
  ]
}
```

### Dropdown HTML Structure
```html
<div class="vsafe-password-dropdown" data-for-input="[input-id]">
  <div class="vsafe-dropdown-header">Saved Passwords</div>
  <ul class="vsafe-password-list">
    <li class="vsafe-password-item" data-password="[encrypted]">
      <span class="vsafe-password-masked">****12345</span>
      <span class="vsafe-password-full" style="display:none;">!Tester12345</span>
    </li>
  </ul>
</div>
```

### Event Flow
1. Page loads → Content script initializes
2. Password field detected → Dropdown created (hidden)
3. User focuses password field → API call triggered
4. API response received → Dropdown populated and shown
5. User selects password → Field filled and dropdown hidden

## Security Considerations
- Use secure message passing between scripts
- Clear sensitive data from memory after use

## Edge Cases to Handle
- Multiple password fields on same page
- Single-page applications with dynamic forms
- Shadow DOM implementations
- iframes with different domains
- Password fields with autocomplete="off"
- Custom-styled input fields
- Mobile responsive layouts
