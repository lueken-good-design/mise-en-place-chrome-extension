# Chrome Extension Production Deployment Checklist

This guide walks you through preparing and publishing the Mise en Place Recipe Importer Chrome extension to the Chrome Web Store.

---

## Phase 1: Code Updates (Required Before Publishing)

### 1.1 Update API Endpoint to Production

**File: `popup.js`**
- [ ] Change line 2 from `const API_BASE_URL = 'http://localhost:8000';`
- [ ] To: `const API_BASE_URL = 'https://miseenplace.app';`

### 1.2 Remove Development Permissions

**File: `manifest.json`**
- [ ] Remove `"http://localhost:8000/*"` from `host_permissions` array (line 17)
- [ ] Remove `"http://localhost:8000/*"` from `externally_connectable.matches` array (line 39)
- [ ] Keep only production URLs:
  - `https://miseenplace.app/*`
  - `https://*.miseenplace.app/*`

### 1.3 Verify Version Number

**File: `manifest.json`**
- [ ] Confirm version is `1.0.0` for initial release (line 4)
- [ ] For future updates, increment to `1.0.1`, `1.1.0`, `2.0.0`, etc.

---

## Phase 2: Create Store Assets

### 2.1 Extension Icons (Already Complete ✅)
- [x] 16x16 icon - `images/icon16.png`
- [x] 48x48 icon - `images/icon48.png`
- [x] 128x128 icon - `images/icon128.png`

### 2.2 Promotional Images (Create These)

Create these images using your branding (green theme, chef hat icon):

- [ ] **Small Tile** (440x280 PNG)
  - Appears in search results
  - Should include logo + tagline
  - Recommended: "Import recipes from any website"

- [ ] **Large Tile** (920x680 PNG) - Optional but recommended
  - Used for featuring/promotions
  - More detailed showcase of features

- [ ] **Marquee** (1400x560 PNG) - Optional but recommended
  - Banner-style promotional image
  - Used in featured placements

### 2.3 Screenshots (Create 1-5 Screenshots)

Recommended screenshots to capture:
- [ ] **Screenshot 1**: Login screen showing email/password form
  - Dimensions: 1280x800 or 640x400
  - Caption: "Sign in to your Mise en Place account"

- [ ] **Screenshot 2**: Import screen with recipe URL displayed
  - Show "Import This Recipe" button and quota info
  - Caption: "Import recipes with one click"

- [ ] **Screenshot 3**: Success message after import
  - Show the success status message
  - Caption: "Recipes imported directly to your account"

- [ ] **Screenshot 4** (optional): The extension popup on a recipe website
  - Context showing real-world usage
  - Caption: "Works on any recipe website or YouTube video"

**How to capture screenshots:**
1. Load the extension in Chrome
2. Navigate to a recipe website
3. Click the extension icon
4. Use screenshot tool (Windows: Win+Shift+S, Mac: Cmd+Shift+4)
5. Save as PNG files

---

## Phase 3: Legal & Policy Documents

### 3.1 Create Privacy Policy

Chrome Web Store requires a privacy policy because the extension:
- Collects authentication tokens
- Stores user email/name
- Makes network requests to your API

**Action Items:**
- [ ] Create privacy policy page at `https://miseenplace.app/privacy` (or `/extension-privacy`)
- [ ] Include sections on:
  - What data is collected (auth tokens, email, name, recipe URLs)
  - How data is used (importing recipes to user accounts)
  - How data is stored (locally in Chrome storage, server-side in database)
  - Third-party services (if any - Cloudinary for images, etc.)
  - User rights (data deletion, access)
  - Contact information

**Privacy Policy Template:**
```markdown
# Privacy Policy for Mise en Place Recipe Importer

Last updated: [DATE]

## Data Collection
This extension collects:
- Authentication credentials (email and password for login)
- User name and authentication tokens
- Recipe URLs from websites you visit

## Data Usage
Collected data is used solely to:
- Authenticate your Mise en Place account
- Import recipes to your personal recipe collection
- Track your monthly import quota

## Data Storage
- Authentication tokens are stored locally in Chrome's secure storage
- Recipe data is transmitted to and stored on Mise en Place servers
- We do not share your data with third parties

## User Rights
You may delete your data at any time by:
- Logging out of the extension (removes local tokens)
- Deleting your Mise en Place account (removes all server data)

## Contact
For privacy questions: [your-email@miseenplace.app]
```

### 3.2 Terms of Service (Optional)
- [ ] Consider linking to main app's terms of service
- [ ] URL: `https://miseenplace.app/terms`

---

## Phase 4: Package Extension

### 4.1 Clean Up Project Directory

Remove any unnecessary files:
- [ ] Remove `.git` folder (if creating fresh package)
- [ ] Remove `node_modules` (if present)
- [ ] Remove `CLAUDE.md` (development documentation)
- [ ] Remove `PRODUCTION_CHECKLIST.md` (this file)
- [ ] Remove any `.env` or config files

### 4.2 Create ZIP Package

**Files to include:**
```
mise-en-place-extension.zip
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── background.js
└── images/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

**Create the ZIP:**
- [ ] Select all required files (manifest.json, popup.html, popup.js, popup.css, background.js, images/)
- [ ] Right-click → "Send to" → "Compressed (zipped) folder" (Windows)
- [ ] Or use: `zip -r mise-en-place-extension.zip manifest.json popup.* background.js images/` (Mac/Linux)
- [ ] Verify ZIP is under 2GB (should be tiny, ~50KB)
- [ ] **Important**: The files should be at the root of the ZIP, not in a subfolder

---

## Phase 5: Chrome Web Store Registration

### 5.1 Register Developer Account

- [ ] Visit [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] Sign in with Google account
  - **Important**: Choose email carefully - cannot be changed later
  - Recommend: Use a dedicated business email
- [ ] Pay $5 one-time registration fee (via Google Payments)
- [ ] Accept Chrome Web Store Developer Agreement

### 5.2 Get Your Publisher Account Details
- [ ] Note your publisher name (displayed publicly on store listing)
- [ ] Verify email preferences for notifications

---

## Phase 6: Submit Extension

### 6.1 Create New Store Listing

- [ ] In [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole), click **"New Item"**
- [ ] Click **"Choose file"** and upload your ZIP package
- [ ] Wait for upload to complete and validation to pass

### 6.2 Complete "Store Listing" Tab

**Product Details:**
- [ ] **Extension name**: "Mise en Place Recipe Importer"
- [ ] **Summary** (132 chars max):
  ```
  Import recipes from any website to your Mise en Place account with one click. Works with recipe sites and YouTube videos.
  ```

- [ ] **Description** (detailed):
  ```
  Save time and organize your recipes with the Mise en Place Recipe Importer!

  Import recipes from any website or YouTube cooking video directly to your
  Mise en Place account with a single click. No more copy-pasting ingredients
  and steps.

  Features:
  • One-click recipe importing from any website
  • Automatic ingredient parsing and organization
  • YouTube video recipe support
  • Works with thousands of recipe websites
  • Syncs directly to your Mise en Place account
  • Monthly import quota based on your subscription tier

  How to use:
  1. Sign in to your Mise en Place account in the extension
  2. Navigate to any recipe website or YouTube cooking video
  3. Click the extension icon
  4. Click "Import This Recipe"
  5. Recipe is automatically saved to your account!

  Requires a Mise en Place account (free tier available).
  Sign up at https://miseenplace.app
  ```

- [ ] **Category**: Productivity
- [ ] **Language**: English (United States)

**Graphic Assets:**
- [ ] Upload small promotional tile (440x280)
- [ ] Upload screenshots (at least 1, up to 5)
- [ ] Upload large tile (920x680) - optional
- [ ] Upload marquee (1400x560) - optional

**Additional Fields:**
- [ ] Official website: `https://miseenplace.app`
- [ ] Support URL: `https://miseenplace.app/support` (or your contact page)

### 6.3 Complete "Privacy" Tab

**Single Purpose:**
- [ ] **Single purpose description**:
  ```
  This extension imports recipes from websites and YouTube videos to the user's
  Mise en Place account for organizing and meal planning.
  ```

**Permissions Justification:**
- [ ] **activeTab**: "Required to access the current page URL for recipe importing"
- [ ] **storage**: "Required to store authentication tokens and user session data locally"
- [ ] **host_permissions (miseenplace.app)**: "Required to communicate with Mise en Place API for authentication and recipe importing"

**Data Usage Certification:**
- [ ] Check "This extension collects or transmits user data"
- [ ] Select data types collected:
  - ✅ Authentication information
  - ✅ Personally identifiable information
  - ✅ Website content (URLs)
- [ ] Data usage: "Authentication and functionality"
- [ ] Privacy policy URL: `https://miseenplace.app/privacy`
- [ ] Certify compliance with disclosure requirements

### 6.4 Complete "Distribution" Tab

- [ ] **Visibility**: Public
- [ ] **Pricing**: Free
- [ ] **Distribution territories**:
  - Select "All regions" OR
  - Select specific countries where you want to offer the extension
- [ ] **Developer name/email**: Your publisher name and contact email (displayed publicly)

### 6.5 Optional: Content Rating Tab
- [ ] Answer content rating questions (usually "None of the above" for recipe extension)

---

## Phase 7: Submit for Review

### 7.1 Final Verification
- [ ] Review all tabs have green checkmarks (no validation errors)
- [ ] Preview store listing to verify appearance
- [ ] Double-check screenshots are clear and representative

### 7.2 Submit
- [ ] Click **"Submit for Review"** button
- [ ] Choose publishing preference:
  - **Automatic**: Publishes immediately after approval (recommended for first release)
  - **Deferred**: Manually publish within 30 days after approval
- [ ] Confirm submission

### 7.3 Note Your Submission Details
- [ ] Save your new Chrome Web Store extension ID (it will be different from dev ID)
- [ ] Note submission date
- [ ] Set calendar reminder to check status in 3-5 days

---

## Phase 8: Backend Production Updates

### 8.1 Update Extension ID in Backend

Once you receive your published extension ID from Chrome Web Store:

**File: `app/Http/Controllers/Auth/ExtensionAuthController.php`**
- [ ] Update the `$extensionId` variable with your new published ID
- [ ] Old dev ID: `codenfpacailffppjfbedbkcjobdmlep`
- [ ] New production ID: `[YOUR_NEW_ID_FROM_CHROME_WEB_STORE]`

**File: `resources/views/auth/extension-callback.blade.php`**
- [ ] Update the extension ID in the `chrome.runtime.sendMessage()` call
- [ ] Use the same production ID from above

### 8.2 Deploy Backend Changes
- [ ] Commit and push changes to Laravel app
- [ ] Deploy to production server
- [ ] Verify routes are accessible:
  - `https://miseenplace.app/api/extension/import`
  - `https://miseenplace.app/api/import-quota`
  - `https://miseenplace.app/auth/extension`
  - `https://miseenplace.app/auth/extension/callback`

### 8.3 Test API Endpoints
- [ ] Test authentication flow from production
- [ ] Test recipe import endpoint
- [ ] Test quota endpoint
- [ ] Verify CORS headers allow extension communication

---

## Phase 9: Review Process

### 9.1 During Review
- [ ] Monitor email for Chrome Web Store notifications
- [ ] Typical review time: 3-7 days (can be longer for first submission)
- [ ] Be prepared to respond to reviewer questions/requests

### 9.2 Common Rejection Reasons (and how to fix)
- **Privacy policy issues**: Ensure policy URL is accessible and comprehensive
- **Permission justification**: Clearly explain why each permission is needed
- **Functionality mismatch**: Ensure description matches actual functionality
- **Metadata issues**: Fix any typos or unclear descriptions

### 9.3 If Rejected
- [ ] Read rejection email carefully
- [ ] Address specific issues mentioned
- [ ] Update extension package or store listing as needed
- [ ] Resubmit

---

## Phase 10: Post-Approval Actions

### 10.1 Publish Extension
- [ ] If using deferred publishing, click **"Publish"** in dashboard
- [ ] Verify extension appears in Chrome Web Store
- [ ] Note your public URL: `https://chrome.google.com/webstore/detail/[YOUR_EXTENSION_ID]`

### 10.2 Test Published Extension
- [ ] Install extension from Chrome Web Store (not from local files)
- [ ] Test login with real account
- [ ] Test recipe import from various websites
- [ ] Verify quota tracking works
- [ ] Test Google OAuth login flow
- [ ] Check for any console errors

### 10.3 Update Marketing Materials
- [ ] Add Chrome Web Store badge to website
- [ ] Link from `https://miseenplace.app` to extension
- [ ] Announce extension launch (email, social media, etc.)
- [ ] Update app footer/navigation to include extension link

### 10.4 Monitor Performance
- [ ] Check Developer Dashboard for installation stats
- [ ] Monitor user reviews and ratings
- [ ] Track crash reports (if any)
- [ ] Watch for support emails about extension

---

## Phase 11: Ongoing Maintenance

### 11.1 Updating the Extension

When you need to release an update:
- [ ] Increment version in `manifest.json` (e.g., 1.0.0 → 1.0.1)
- [ ] Make your code changes
- [ ] Create new ZIP package
- [ ] In Developer Dashboard, click on your extension
- [ ] Click **"Package"** tab → **"Upload new package"**
- [ ] Submit for review again
- [ ] Updates typically review faster than initial submission

### 11.2 Monitoring
- [ ] Set up weekly check of Developer Dashboard
- [ ] Respond to user reviews (helps with rankings)
- [ ] Monitor server logs for API errors from extension
- [ ] Track feature requests from users

### 11.3 Version History Best Practices
Keep a changelog of versions:
```
v1.0.0 (Initial Release)
- Email/password authentication
- Google OAuth support
- One-click recipe import
- Import quota tracking

v1.0.1 (Bug fixes)
- Fixed [specific bug]
- Improved error messages

v1.1.0 (New features)
- Added [new feature]
```

---

## Quick Reference: Key URLs

- **Developer Dashboard**: https://chrome.google.com/webstore/devconsole
- **Publishing Guide**: https://developer.chrome.com/docs/webstore/publish
- **Developer Registration**: https://developer.chrome.com/docs/webstore/register
- **Your Extension URL** (after publish): https://chrome.google.com/webstore/detail/[YOUR_ID]

---

## Troubleshooting

### Extension won't upload
- Ensure manifest.json is valid JSON
- Verify all required fields are present in manifest
- Check file size is under 2GB
- Ensure files are at root of ZIP, not in subfolder

### Privacy tab won't validate
- Privacy policy URL must be publicly accessible
- Must use HTTPS
- Policy must address all data collection mentioned in extension

### Can't submit for review
- All tabs must have green checkmarks
- Fill out all required fields in each section
- Upload at least one screenshot
- Provide valid privacy policy URL

---

## Estimated Timeline

- **Preparation** (code + assets): 2-4 hours
- **Store listing creation**: 1-2 hours
- **Review process**: 3-7 days
- **Total time to publish**: 1 week

---

## Cost Summary

- **Chrome Web Store Developer Registration**: $5 (one-time)
- **Extension Submission**: Free
- **Updates**: Free
- **Total**: $5

---

## Notes

- You can publish up to 20 extensions per developer account
- Extension ID will change from development to production
- Users will auto-update to new versions (within 24-48 hours)
- You can unpublish at any time if needed
- Keep your developer account credentials secure
- Consider enabling two-factor authentication on your Google account

---

**Once published, share your extension link and celebrate! 🎉**
