# Testing Guide - Mise en Place Chrome Extension

This guide walks you through testing the extension end-to-end.

## Prerequisites

1. **Extension loaded in Chrome**
   - Extension ID: `codenfpacailffppjfbedbkcjobdmlep`
   - Already loaded at `chrome://extensions/`

2. **Backend running locally**
   - Main Laravel app at: `C:\Users\31686\Desktop\GitHub\mise-en-place`
   - Must be accessible (typically `http://localhost` or similar)

3. **Backend components implemented** ✅
   - ExtensionController.php
   - ExtensionAuthController.php
   - Extension routes
   - Extension callback view

## Important: Update API Base URL for Local Testing

Before testing, you need to update the extension to point to your local backend:

1. Open `popup.js` in this repository
2. Change line 2 from:
   ```javascript
   const API_BASE_URL = 'https://miseenplace.app';
   ```
   To your local backend URL:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';  // or whatever your local URL is
   ```
3. Reload the extension in `chrome://extensions/` (click the refresh icon)

## Step-by-Step Testing

### 1. Test Extension Load

1. Click the Mise en Place extension icon in Chrome toolbar
2. **Expected:** Popup opens (360x400px) showing login screen
3. **Check:**
   - Logo displays (or broken image if logo not created yet)
   - "Import This Recipe" heading
   - "Log In to Mise en Place" button

### 2. Test Authentication Flow

1. Click "Log In to Mise en Place" button
2. **Expected:** New tab opens to `http://localhost:8000/auth/extension`
3. **Scenarios:**

   **If NOT logged in:**
   - Should redirect to login page
   - Log in with your test account
   - After login, should redirect back to extension auth

   **If already logged in:**
   - Should immediately show the callback page

4. **Expected on callback page:**
   - "Authentication Successful!" heading
   - Green checkmark icon
   - "Connecting to extension..." message
   - Message changes to "✓ Successfully connected to extension"
   - Tab auto-closes after 2 seconds

5. **Back in extension popup:**
   - Click extension icon again
   - **Expected:** Now showing import view (not login view)
   - Should display your name in top-right
   - Should show "Logout" button
   - Should show current page URL
   - Should show import quota (e.g., "20 of 20 imports remaining this month")

### 3. Test Import Quota Display

With extension popup open:

1. **Check quota text:**
   - Should show actual quota based on user subscription tier
   - Free tier: "10 of 10 imports remaining"
   - Home Cook: "30 of 30 imports remaining"
   - Baker Pro: "100 of 100 imports remaining"
   - Founder: High limit

2. **If quota fails to load:**
   - Should show "Unable to load quota"
   - Check browser console (F12) for errors
   - Check backend logs for API errors

### 4. Test Recipe Import

1. **Navigate to a recipe website** (e.g., allrecipes.com, seriouseats.com)
2. Click extension icon
3. **Check:**
   - "Current Page" should show the recipe URL
   - "Import Recipe" button should be enabled

4. Click "Import Recipe" button
5. **Expected behavior:**
   - Button text changes to spinner
   - Button becomes disabled during import
   - Import process takes 5-30 seconds (depending on recipe complexity)

6. **On success:**
   - Green success message: "Recipe imported successfully!"
   - Quota updates (e.g., "19 of 20 imports remaining")
   - New tab opens with the imported recipe in Mise en Place
   - Success message auto-hides after 5 seconds

7. **On failure (quota exceeded):**
   - Red error message with upgrade prompt
   - HTTP 403 response
   - Button re-enables

8. **On failure (invalid URL):**
   - Red error message: "Failed to import recipe"
   - Button re-enables

### 5. Test YouTube Import

1. Navigate to a YouTube recipe video (e.g., Babish, Joshua Weissman)
2. Click extension icon
3. Click "Import Recipe"
4. **Expected:** Should use Gemini Video Service to extract recipe
5. Check if import succeeds or shows appropriate error

### 6. Test Logout

1. With extension popup open, click "Logout" button
2. **Expected:**
   - Returns to login view
   - Green success message: "Logged out successfully"
   - Quota and user info cleared

3. Click extension icon again
4. **Expected:** Shows login screen (not import view)

### 7. Test Error Handling

**Test 1: Backend offline**
1. Stop Laravel backend
2. Click "Import Recipe"
3. **Expected:** Red error message: "An error occurred while importing"

**Test 2: Invalid token**
1. Open DevTools (F12) → Application → Storage → Local Storage
2. Find extension storage, modify `authToken` to garbage value
3. Click "Import Recipe"
4. **Expected:** 401 Unauthorized error, or token refresh

**Test 3: No internet**
1. Disable network
2. Try to import
3. **Expected:** Appropriate error message

## Common Issues & Debugging

### Extension can't communicate with callback page

**Symptoms:** Callback page shows "Extension not found" error

**Solutions:**
1. Verify extension ID in callback view matches actual ID: `codenfpacailffppjfbedbkcjobdmlep`
2. Check extension is enabled in `chrome://extensions/`
3. Reload extension after any code changes

### CORS errors in console

**Symptoms:** Network errors, "blocked by CORS policy"

**Solutions:**
1. Check `manifest.json` host_permissions includes your local backend URL
2. Add local URL to host_permissions if needed:
   ```json
   "host_permissions": [
     "http://localhost:8000/*",
     "https://miseenplace.app/*"
   ]
   ```

### Quota not loading

**Symptoms:** Shows "Unable to load quota"

**Check:**
1. Backend API is running
2. Route `/api/import-quota` exists and is accessible
3. User has valid Sanctum token
4. Check browser console for network errors
5. Check Laravel logs: `storage/logs/laravel.log`

### Import fails silently

**Check:**
1. Browser console (F12) for JavaScript errors
2. Network tab for API responses
3. Laravel logs for backend errors
4. RecipeImportService is working correctly

### Authentication loops (keeps asking to log in)

**Check:**
1. `chrome.storage.local` is persisting token
2. Token is valid (not expired)
3. Callback page successfully sends message to extension
4. Extension listener (popup.js:173-183) receives message

## Browser Console Commands (DevTools)

Useful for debugging:

```javascript
// Check stored auth data
chrome.storage.local.get(['authToken', 'userName'], console.log)

// Clear auth data
chrome.storage.local.remove(['authToken', 'userName'])

// Manually set auth token
chrome.storage.local.set({
  authToken: 'YOUR_TOKEN_HERE',
  userName: 'Test User'
})
```

## Laravel Backend Debugging

Check these logs when testing:

```bash
# Watch Laravel logs in real-time
cd C:\Users\31686\Desktop\GitHub\mise-en-place
tail -f storage/logs/laravel.log

# Check for extension-specific logs
grep -i "extension" storage/logs/laravel.log

# Check API errors
grep -i "error" storage/logs/laravel.log | grep "api/extension"
```

## Success Criteria

The extension is ready for production when:

- ✅ Authentication flow works smoothly
- ✅ Quota displays correctly for all user tiers
- ✅ Recipe import succeeds from popular recipe sites
- ✅ YouTube import works
- ✅ Logout works
- ✅ Error messages are clear and helpful
- ✅ UI looks good and matches branding
- ✅ No console errors during normal use
- ✅ Auto-close on callback page works
- ✅ Imported recipes open in new tab

## Next Steps After Testing

Once local testing is complete:

1. Change `API_BASE_URL` back to `https://miseenplace.app`
2. Test with production backend
3. Take screenshots for Chrome Web Store listing
4. Package extension for submission
5. Submit to Chrome Web Store
