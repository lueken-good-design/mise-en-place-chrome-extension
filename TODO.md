# Chrome Extension TODO List

## Phase 1: Assets & Icons

- [ ] Create `icon16.png` (16x16 pixels)
- [ ] Create `icon48.png` (48x48 pixels)
- [ ] Create `icon128.png` (128x128 pixels)
- [ ] Create `logo.png` for branding in popup
- [ ] Test icons at different sizes in Chrome

**Tools:**
- [Favicon Generator](https://www.favicon-generator.org/)
- Figma, Canva, or Photoshop
- Or hire designer on Fiverr ($10-50)

## Phase 2: Backend Implementation

These need to be implemented in the **main Mise en Place Laravel repo**:

- [ ] Create `ExtensionController.php`
  - [ ] `import()` method - handles recipe imports
  - [ ] `getQuota()` method - returns user's import limits
- [ ] Create API routes in `routes/api.php`
  - [ ] `POST /api/extension/import`
  - [ ] `GET /api/import-quota`
- [ ] Create `resources/views/auth/extension-callback.blade.php`
  - [ ] Handle OAuth callback
  - [ ] Pass token to extension via `chrome.runtime.sendMessage()`
- [ ] Update `LoginController.php` and `RegisterController.php`
  - [ ] Detect `?extension=true` parameter
  - [ ] Redirect to extension callback instead of dashboard
- [ ] Update privacy policy
  - [ ] Add Chrome Extension section
  - [ ] Explain data usage and permissions

**Estimated Time:** 1-2 weeks

## Phase 3: Local Testing

- [ ] Load extension in Chrome (unpacked)
- [ ] Test authentication flow
  - [ ] Login with existing account
  - [ ] Register new account
  - [ ] Logout
- [ ] Test recipe import
  - [ ] Import from recipe website
  - [ ] Import from YouTube
  - [ ] Test with invalid URLs
- [ ] Test quota display
  - [ ] Verify quota decrements after import
  - [ ] Test quota limit enforcement
- [ ] Test error handling
  - [ ] No internet connection
  - [ ] Invalid auth token
  - [ ] Server errors

**Estimated Time:** 3-5 days

## Phase 4: Chrome Web Store Assets

- [ ] Promotional Images
  - [ ] Large promo tile: 1280x800 pixels
  - [ ] Small promo tile: 440x280 pixels
  - [ ] Marquee promo tile: 1400x560 pixels (optional)
- [ ] Screenshots
  - [ ] Extension popup (logged out state)
  - [ ] Extension popup (logged in state)
  - [ ] Extension in action importing recipe
  - [ ] Recipe successfully imported in app
  - [ ] 3-5 total screenshots recommended
- [ ] Store Listing Content
  - [ ] Detailed description (max 132 characters for short, unlimited for full)
  - [ ] List of features
  - [ ] How-to instructions
  - [ ] Privacy policy URL
  - [ ] Support email
- [ ] Legal
  - [ ] Privacy Policy page on miseenplace.app
  - [ ] Terms of Service (if not already available)

**Resources:**
- [Chrome Web Store Image Guidelines](https://developer.chrome.com/docs/webstore/images/)
- Canva templates for promo images

**Estimated Time:** 2-4 days

## Phase 5: Chrome Web Store Registration

- [ ] Register Chrome Web Store Developer Account
  - [ ] Pay one-time $5 registration fee
  - [ ] Verify email
  - [ ] Complete developer profile
- [ ] Package Extension
  - [ ] Remove any development/debug code
  - [ ] Update version in manifest.json if needed
  - [ ] Create ZIP file of extension folder
- [ ] Complete Store Listing
  - [ ] Upload all images and screenshots
  - [ ] Fill out description and details
  - [ ] Set pricing (free)
  - [ ] Add privacy policy URL
  - [ ] Select categories

**Estimated Time:** 1 day

## Phase 6: Submission & Review

- [ ] Submit extension for review
- [ ] Wait for review (typically 1-3 business days)
- [ ] Address any review feedback if rejected
- [ ] Re-submit if necessary

**Chrome Review Process:**
- Reviews can take 1-3 days (sometimes up to a week)
- Common rejection reasons:
  - Privacy policy issues
  - Misleading functionality
  - Permissions not justified
  - Low quality screenshots

## Phase 7: Post-Launch

- [ ] Publish extension (if approved)
- [ ] Add extension link to main Mise en Place website
- [ ] Create promotional content
  - [ ] Blog post announcement
  - [ ] Social media posts
  - [ ] Email to existing users
- [ ] Monitor metrics
  - [ ] Install numbers
  - [ ] User reviews
  - [ ] Crash reports
- [ ] Set up support process
  - [ ] Monitor reviews for bug reports
  - [ ] Create FAQ if needed

## Future Enhancements (v2.0+)

- [ ] Add browser action badge showing import count
- [ ] Add context menu "Import Recipe" option
- [ ] Support for more recipe sources
- [ ] Offline queueing (import when back online)
- [ ] Recipe preview before importing
- [ ] Custom tags during import
- [ ] Keyboard shortcuts
- [ ] Support for other browsers (Firefox, Edge)

## Notes

**Total Estimated Timeline:** 3-4 weeks from start to Chrome Web Store approval

**Critical Path:**
1. Backend API (blocks everything) - Week 1-2
2. Icons (blocks testing & publishing) - Week 1
3. Local testing (blocks submission) - Week 2
4. Store assets (blocks submission) - Week 3
5. Submission & review - Week 4

**Can Work in Parallel:**
- Icons can be created while backend is being developed
- Store assets can be created during testing phase
- Privacy policy can be written early

**Budget Estimates:**
- Chrome Web Store registration: $5
- Icon design (if outsourced): $10-50
- Promotional images (if outsourced): $20-100
- **Total:** $35-155

**Marketing Launch Checklist:**
- [ ] Press release or blog post
- [ ] Tweet announcement
- [ ] Email existing users
- [ ] Post in Product Hunt (optional)
- [ ] Add to website homepage
- [ ] Create demo video (optional but helpful)
