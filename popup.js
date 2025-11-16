// Configuration
const API_BASE_URL = 'https://mise-en-place.recipes';

// DOM Elements
let authSection, importSection, loginForm, logoutBtn, googleLoginBtn;
let importBtn, importText, importSpinner;
let userNameEl, urlDisplayEl, quotaTextEl, statusEl;
let loginText, loginSpinner, openSidebarBtn;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  authSection = document.getElementById('auth-section');
  importSection = document.getElementById('import-section');
  loginForm = document.getElementById('login-form');
  logoutBtn = document.getElementById('logout-btn');
  googleLoginBtn = document.getElementById('google-login-btn');
  importBtn = document.getElementById('import-btn');
  importText = document.getElementById('import-text');
  importSpinner = document.getElementById('import-spinner');
  userNameEl = document.getElementById('user-name');
  urlDisplayEl = document.getElementById('url-display');
  quotaTextEl = document.getElementById('quota-text');
  statusEl = document.getElementById('status');
  loginText = document.getElementById('login-text');
  loginSpinner = document.getElementById('login-spinner');
  openSidebarBtn = document.getElementById('open-sidebar-btn');

  // Event listeners
  loginForm.addEventListener('submit', handleLogin);
  googleLoginBtn.addEventListener('click', handleGoogleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  importBtn.addEventListener('click', handleImport);
  if (openSidebarBtn) {
    openSidebarBtn.addEventListener('click', handleOpenSidebar);
  }

  // Check auth status
  checkAuthStatus();

  // Get current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      if (urlDisplayEl) {
        urlDisplayEl.textContent = tabs[0].url;
      }
    }
  });
});

// Check if user is authenticated
async function checkAuthStatus() {
  const result = await chrome.storage.local.get(['authToken', 'userName']);

  if (result.authToken) {
    // User is logged in
    showImportView(result.userName);
    loadQuota(result.authToken);
  } else {
    // User is not logged in
    showAuthView();
  }
}

// Show authentication view
function showAuthView() {
  authSection.style.display = 'block';
  importSection.style.display = 'none';
}

// Show import view
function showImportView(userName) {
  authSection.style.display = 'none';
  importSection.style.display = 'block';
  userNameEl.textContent = userName || 'User';

  // Hide "Open as sidebar" button if already in sidebar
  detectSidePanel();
}

// Detect if we're running in a side panel and hide the button
async function detectSidePanel() {
  try {
    // In a side panel, window.innerWidth is typically wider and the view is different
    // Better detection: check if we have access to chrome.sidePanel API and current context
    const views = chrome.extension.getViews({ type: 'popup' });

    // If there are no popup views, we're likely in the side panel
    if (views.length === 0 && openSidebarBtn) {
      openSidebarBtn.style.display = 'none';
    }
  } catch (e) {
    // If detection fails, keep button visible
    console.log('Could not detect panel type:', e);
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Show loading state
  const loginBtn = document.getElementById('login-btn');
  loginBtn.disabled = true;
  loginText.style.display = 'none';
  loginSpinner.style.display = 'inline-block';

  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // Store auth data
      await chrome.storage.local.set({
        authToken: data.token,
        userName: data.user?.name || email
      });

      // Show import view
      showImportView(data.user?.name || email);
      loadQuota(data.token);
      showStatus('Logged in successfully!', 'success');
    } else {
      showStatus(data.message || 'Invalid email or password', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus('Unable to connect to server', 'error');
  } finally {
    // Reset button state
    loginBtn.disabled = false;
    loginText.style.display = 'inline';
    loginSpinner.style.display = 'none';
  }
}

// Handle Google login
async function handleGoogleLogin() {
  // Add extension=1 parameter to tell backend this is from extension
  const authUrl = `${API_BASE_URL}/auth/google?extension=1`;

  // Open in a centered popup window (common for OAuth flows)
  const width = 500;
  const height = 600;
  const left = Math.round((screen.width - width) / 2);
  const top = Math.round((screen.height - height) / 2);

  const authWindow = await chrome.windows.create({
    url: authUrl,
    type: 'popup',
    width: width,
    height: height,
    left: left,
    top: top
  });

  // Poll for auth completion - check storage every 500ms
  const pollInterval = setInterval(async () => {
    const result = await chrome.storage.local.get(['authToken', 'userName']);

    if (result.authToken) {
      // Auth successful! Clean up and update UI
      clearInterval(pollInterval);

      // Close the auth window if still open
      try {
        await chrome.windows.remove(authWindow.id);
      } catch (e) {
        // Window might already be closed, that's fine
      }

      // Update the UI
      showImportView(result.userName);
      loadQuota(result.authToken);
      showStatus('Logged in successfully!', 'success');
    }
  }, 500);

  // Stop polling after 5 minutes (timeout)
  setTimeout(() => {
    clearInterval(pollInterval);
  }, 5 * 60 * 1000);
}

// Handle logout
async function handleLogout() {
  await chrome.storage.local.remove(['authToken', 'userName']);
  showAuthView();
  showStatus('Logged out successfully', 'success');
}

// Load user's import quota
async function loadQuota(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/import-quota`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      quotaTextEl.textContent = `${data.remaining} of ${data.total} imports remaining this month`;
    } else {
      quotaTextEl.textContent = 'Unable to load quota';
    }
  } catch (error) {
    console.error('Error loading quota:', error);
    quotaTextEl.textContent = 'Unable to load quota';
  }
}

// Handle recipe import
async function handleImport() {
  console.log('[IMPORT] Starting import process...');

  const result = await chrome.storage.local.get(['authToken']);

  if (!result.authToken) {
    console.error('[IMPORT] No auth token found');
    showStatus('Please log in first', 'error');
    return;
  }

  // Get current tab URL
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]) {
    console.error('[IMPORT] Unable to get current tab');
    showStatus('Unable to get current page', 'error');
    return;
  }

  const url = tabs[0].url;
  console.log('[IMPORT] Importing URL:', url);

  // Disable button and show loading
  importBtn.disabled = true;
  importText.style.display = 'none';
  importSpinner.style.display = 'inline-block';

  try {
    console.log('[IMPORT] Sending request to:', `${API_BASE_URL}/api/extension/import`);

    const response = await fetch(`${API_BASE_URL}/api/extension/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${result.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    console.log('[IMPORT] Response status:', response.status);

    const data = await response.json();
    console.log('[IMPORT] Response data:', data);

    if (response.ok) {
      console.log('[IMPORT] Success!');
      showStatus('Recipe imported successfully!', 'success');
      loadQuota(result.authToken); // Refresh quota

      // Optionally open the recipe in a new tab
      if (data.recipe_url) {
        console.log('[IMPORT] Opening recipe at:', data.recipe_url);
        setTimeout(() => {
          chrome.tabs.create({ url: data.recipe_url });
        }, 1000);
      }
    } else {
      console.error('[IMPORT] Failed:', response.status, data);
      showStatus(data.message || 'Failed to import recipe', 'error');
    }
  } catch (error) {
    console.error('[IMPORT] Error:', error);
    showStatus('An error occurred while importing the recipe. Please try again.', 'error');
  } finally {
    // Re-enable button
    importBtn.disabled = false;
    importText.style.display = 'inline';
    importSpinner.style.display = 'none';
  }
}

// Show status message
function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 5000);
}

// Handle opening as sidebar
function handleOpenSidebar() {
  chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' }, (response) => {
    if (response && response.success) {
      // Close the popup after opening sidebar
      window.close();
    }
  });
}

// Listen for messages from auth callback page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTH_SUCCESS') {
    chrome.storage.local.set({
      authToken: request.token,
      userName: request.userName
    }, () => {
      checkAuthStatus();
      showStatus('Logged in successfully!', 'success');
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }
});
