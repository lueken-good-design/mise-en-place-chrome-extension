# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome Manifest V3 extension that allows users to import recipes from any website or YouTube video directly to their Mise en Place account. The extension acts as a bridge between the user's browser and the main Mise en Place Laravel application at `https://miseenplace.app`.

## Development Commands

### Loading Extension in Chrome
```bash
# Open chrome://extensions/ in browser
# Enable "Developer mode" toggle (top-right)
# Click "Load unpacked" and select the project directory
```

No build process is required - this is a vanilla JavaScript Chrome extension with no compilation step.

## Architecture

### Authentication Flow
The extension uses OAuth-style authentication with the main Mise en Place application:

1. User clicks "Log In" → opens `https://miseenplace.app/auth/extension?redirect=callback` in new tab
2. User authenticates on main site
3. Backend redirects to `/auth/extension/callback` page containing auth token
4. Callback page uses `chrome.runtime.sendMessage()` to send token back to extension (popup.js:173-183)
5. Extension stores token in `chrome.storage.local` for subsequent API calls

### Storage Architecture
Uses Chrome's `chrome.storage.local` API to persist:
- `authToken`: Bearer token for API authentication
- `userName`: Display name of logged-in user

Storage is checked on popup load (popup.js:41-52) to determine which view to show.

### API Integration
The extension communicates with three backend endpoints:

1. **POST /api/extension/import** - Import recipe from URL
   - Headers: `Authorization: Bearer {token}`
   - Body: `{ "url": "..." }`
   - Used in: popup.js:126-133

2. **GET /api/import-quota** - Get user's remaining imports
   - Headers: `Authorization: Bearer {token}`
   - Used in: popup.js:81-100

3. **GET /auth/extension/callback** - Complete OAuth flow
   - Returns HTML page that messages extension with token
   - Implementation required in main Laravel app (not in this repo)

All API calls use `API_BASE_URL` constant (popup.js:2) set to production URL.

### UI State Management
The extension has two mutually exclusive views:
- **Auth Section** (`#auth-section`): Shown when user not logged in
- **Import Section** (`#import-section`): Shown when user is authenticated

State transitions handled by `showAuthView()` and `showImportView()` functions (popup.js:54-65).

### Import Flow
1. Get active tab URL using `chrome.tabs.query()` (popup.js:112)
2. POST URL to `/api/extension/import` endpoint
3. Show loading spinner during request (popup.js:121-123)
4. On success, refresh quota and optionally open recipe in new tab (popup.js:137-146)
5. Handle errors with status messages (popup.js:147-149)

## Key Files

- **manifest.json** - Extension configuration, permissions, and metadata
- **popup.html** - UI markup for extension popup (360px width)
- **popup.css** - Styling with Mise en Place brand colors (terracotta #d4704c, cream #fffaf0)
- **popup.js** - All extension logic (authentication, API calls, state management)

## Backend Dependencies

This extension communicates with the main Mise en Place Laravel application at `C:\Users\31686\Desktop\GitHub\mise-en-place`.

The following backend components are implemented:
- ✅ `app/Http/Controllers/Api/ExtensionController.php` - Handles import and quota
- ✅ `app/Http/Controllers/Auth/ExtensionAuthController.php` - Handles OAuth flow
- ✅ `routes/api.php` - Extension API routes under `auth:sanctum` middleware
- ✅ `routes/web.php` - Extension auth routes
- ✅ `resources/views/auth/extension-callback.blade.php` - OAuth callback view with extension ID

Extension ID: `codenfpacailffppjfbedbkcjobdmlep`

## Design System

Brand colors used throughout:
- Primary action: `#d4704c` (terracotta)
- Background: `#fffaf0` (cream)
- Text: `#2d3748` (dark gray)
- Secondary text: `#718096` (medium gray)

## Common Issues

### Missing Icons
The manifest references icon files (icon16.png, icon48.png, icon128.png, logo.png) that need to be created in the `images/` directory. Extension will not load properly without these.

### API Base URL
Production URL is hardcoded in popup.js:2. For local development, this would need to be changed to local backend URL (not currently configurable).

### Extension ID for Callback
The backend's extension-callback.blade.php needs the actual extension ID (assigned by Chrome) in the `chrome.runtime.sendMessage()` call. This ID changes between local development and published versions.

## Permissions

- `activeTab`: Required to get current tab URL for recipe import
- `storage`: Required to persist auth token and user data
- `host_permissions`: Restricted to `*.miseenplace.app` for API calls
