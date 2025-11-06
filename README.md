# Mise en Place Chrome Extension

A Chrome extension that allows users to import recipes from any website or YouTube video directly to their Mise en Place account with just one click.

## Features

- One-click recipe import from any website
- YouTube video recipe import support
- Secure authentication with Mise en Place account
- Real-time import quota display
- Clean, branded UI matching Mise en Place design

## Project Status

**Current Status:** Development Setup Complete

### Completed
- Extension file structure created
- Manifest V3 configuration
- UI components (popup.html, popup.css)
- Authentication flow logic (popup.js)
- Documentation

### In Progress
- Icon creation (16x16, 48x48, 128x128)
- Backend API implementation (main repo)

### Not Started
- Local testing with backend
- Chrome Web Store submission
- Marketing materials

## File Structure

```
mise-en-place-chrome-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html            # Extension popup UI
├── popup.css             # Popup styling
├── popup.js              # Authentication & import logic
├── images/               # Extension icons
│   ├── icon16.png       # (needs creation)
│   ├── icon48.png       # (needs creation)
│   ├── icon128.png      # (needs creation)
│   └── logo.png         # (needs creation)
├── docs/                 # Documentation
│   └── DEVELOPMENT_GUIDE.md
└── README.md            # This file
```

## Backend Requirements

The following endpoints need to be implemented in the main Mise en Place Laravel application:

### 1. Extension Import Endpoint
- **Route:** `POST /api/extension/import`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ "url": "https://example.com/recipe" }`
- **Response:** Recipe data or error

### 2. Import Quota Endpoint
- **Route:** `GET /api/import-quota`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** `{ "remaining": 10, "total": 20 }`

### 3. Extension Auth Callback
- **Route:** `GET /auth/extension/callback`
- **Purpose:** Complete OAuth flow and pass token to extension

See `docs/DEVELOPMENT_GUIDE.md` for detailed implementation instructions.

## Development Setup

### Prerequisites
- Chrome browser (or Chromium-based browser)
- Mise en Place backend running locally or accessible

### Loading the Extension Locally

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select this directory

The extension will now appear in your extensions list and toolbar.

### Testing

1. Ensure the backend API is running and accessible
2. Navigate to any recipe website
3. Click the extension icon
4. Log in with your Mise en Place account
5. Click "Import Recipe"

## Next Steps

### Phase 1: Assets (Week 1)
- [ ] Create extension icons (16x16, 48x48, 128x128)
- [ ] Create logo.png for popup branding
- [ ] Test icons in Chrome at different sizes

### Phase 2: Backend Implementation (Week 1-2)
In the main `mise-en-place` repository:
- [ ] Create `ExtensionController.php`
- [ ] Implement `/api/extension/import` endpoint
- [ ] Implement `/api/import-quota` endpoint
- [ ] Create `extension-callback.blade.php` view
- [ ] Update privacy policy

### Phase 3: Testing (Week 2-3)
- [ ] Test authentication flow end-to-end
- [ ] Test recipe import from various websites
- [ ] Test YouTube import
- [ ] Test quota display and limits
- [ ] Fix any bugs

### Phase 4: Chrome Web Store Preparation (Week 3-4)
- [ ] Create promotional images (1280x800, 640x400)
- [ ] Take 3-5 screenshots of extension in use
- [ ] Write store listing description
- [ ] Create privacy policy page
- [ ] Register Chrome Web Store developer account ($5 one-time)

### Phase 5: Publishing (Week 4)
- [ ] Package extension as ZIP
- [ ] Submit to Chrome Web Store
- [ ] Wait for review (1-3 days typically)
- [ ] Launch!

## Resources

- [Chrome Extension Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- Main Mise en Place Repository: [mise-en-place](https://github.com/lueken-good-design/mise-en-place)

## Support

For issues related to:
- **Extension functionality:** Open an issue in this repository
- **Backend API:** Open an issue in the main mise-en-place repository
- **General questions:** Contact the development team

## License

This extension is part of the Mise en Place project and follows the same license as the main application.
