# Mise en Place Chrome Extension - Development Guide

## Overview

This guide provides comprehensive instructions for developing, testing, and publishing the Mise en Place Chrome Extension.

> **Note:** This is a placeholder. The full development guide should be copied from the main mise-en-place repository at `docs/pre-plan-chrome-ext.txt`.

## Quick Start

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `mise-en-place-chrome-extension` directory

### Required Backend Endpoints

The extension requires the following API endpoints to be implemented in the main Mise en Place application:

#### 1. Import Recipe
```
POST /api/extension/import
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "url": "https://example.com/recipe"
}

Response:
{
  "success": true,
  "recipe_url": "https://miseenplace.app/recipes/123",
  "message": "Recipe imported successfully"
}
```

#### 2. Get Import Quota
```
GET /api/import-quota
Authorization: Bearer {token}

Response:
{
  "remaining": 10,
  "total": 20,
  "resets_at": "2024-12-01"
}
```

#### 3. Extension Auth Callback
```
GET /auth/extension/callback?token={token}&userName={name}

Purpose: Complete OAuth flow and pass token to extension
Implementation: Create blade view that sends message to extension via chrome.runtime
```

## Backend Implementation

### Laravel Controller (ExtensionController.php)

Create a new controller in the main mise-en-place repository:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExtensionController extends Controller
{
    public function import(Request $request)
    {
        // Validate request
        $request->validate([
            'url' => 'required|url'
        ]);

        // Check user's quota
        $user = $request->user();

        // Import recipe logic here
        // ...

        return response()->json([
            'success' => true,
            'recipe_url' => 'https://miseenplace.app/recipes/123',
            'message' => 'Recipe imported successfully'
        ]);
    }

    public function getQuota(Request $request)
    {
        $user = $request->user();

        // Calculate quota
        // ...

        return response()->json([
            'remaining' => 10,
            'total' => 20,
            'resets_at' => now()->endOfMonth()
        ]);
    }
}
```

### Routes (routes/api.php)

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/extension/import', [ExtensionController::class, 'import']);
    Route::get('/import-quota', [ExtensionController::class, 'getQuota']);
});
```

### Auth Callback View (resources/views/auth/extension-callback.blade.php)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Mise en Place Extension Auth</title>
</head>
<body>
    <h1>Authentication Successful!</h1>
    <p>You can close this tab and return to the extension.</p>

    <script>
        // Send auth token to extension
        chrome.runtime.sendMessage('YOUR_EXTENSION_ID', {
            type: 'AUTH_SUCCESS',
            token: '{{ $token }}',
            userName: '{{ $userName }}'
        });

        // Auto-close after 2 seconds
        setTimeout(() => window.close(), 2000);
    </script>
</body>
</html>
```

## Testing Checklist

- [ ] Authentication flow works
- [ ] Recipe import from various websites
- [ ] YouTube video import
- [ ] Quota display updates correctly
- [ ] Error handling (no internet, invalid token, etc.)
- [ ] Logout functionality
- [ ] UI displays correctly
- [ ] Icons render properly

## Chrome Web Store Submission

### Required Assets

1. **Icons** (already in `images/`)
   - 16x16, 48x48, 128x128

2. **Promotional Images**
   - Small tile: 440x280
   - Large tile: 1280x800
   - Marquee: 1400x560 (optional)

3. **Screenshots**
   - At least 1, recommend 3-5
   - 1280x800 or 640x400

4. **Store Listing**
   - Short description (max 132 chars)
   - Detailed description
   - Category
   - Privacy policy URL
   - Support email

### Submission Process

1. Register Chrome Web Store developer account ($5 fee)
2. Package extension as ZIP file
3. Upload to Chrome Web Store Developer Dashboard
4. Fill out store listing details
5. Submit for review
6. Wait 1-3 business days for approval

## Resources

- [Chrome Extension Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)

## Support

For questions or issues:
- Extension issues: This repository
- Backend issues: Main mise-en-place repository
- Publishing questions: Chrome Web Store support

---

**Full guide location:** `mise-en-place/docs/pre-plan-chrome-ext.txt`
