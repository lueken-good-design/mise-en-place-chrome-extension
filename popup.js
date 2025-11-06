// Configuration
const API_BASE_URL = 'https://miseenplace.app';

// DOM Elements
let authSection, importSection, loginBtn, logoutBtn;
let importBtn, importText, importSpinner;
let userNameEl, urlDisplayEl, quotaTextEl, statusEl;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  authSection = document.getElementById('auth-section');
  importSection = document.getElementById('import-section');
  loginBtn = document.getElementById('login-btn');
  logoutBtn = document.getElementById('logout-btn');
  importBtn = document.getElementById('import-btn');
  importText = document.getElementById('import-text');
  importSpinner = document.getElementById('import-spinner');
  userNameEl = document.getElementById('user-name');
  urlDisplayEl = document.getElementById('url-display');
  quotaTextEl = document.getElementById('quota-text');
  statusEl = document.getElementById('status');

  // Event listeners
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  importBtn.addEventListener('click', handleImport);

  // Check auth status
  checkAuthStatus();

  // Get current tab URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      urlDisplayEl.textContent = tabs[0].url;
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
}

// Handle login
function handleLogin() {
  const authUrl = `${API_BASE_URL}/auth/extension?redirect=callback`;
  chrome.tabs.create({ url: authUrl });
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
  const result = await chrome.storage.local.get(['authToken']);

  if (!result.authToken) {
    showStatus('Please log in first', 'error');
    return;
  }

  // Get current tab URL
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]) {
    showStatus('Unable to get current page', 'error');
    return;
  }

  const url = tabs[0].url;

  // Disable button and show loading
  importBtn.disabled = true;
  importText.style.display = 'none';
  importSpinner.style.display = 'inline-block';

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${result.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (response.ok) {
      showStatus('Recipe imported successfully!', 'success');
      loadQuota(result.authToken); // Refresh quota

      // Optionally open the recipe in a new tab
      if (data.recipe_url) {
        setTimeout(() => {
          chrome.tabs.create({ url: data.recipe_url });
        }, 1000);
      }
    } else {
      showStatus(data.message || 'Failed to import recipe', 'error');
    }
  } catch (error) {
    console.error('Import error:', error);
    showStatus('An error occurred while importing', 'error');
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

// Listen for messages from auth callback page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'AUTH_SUCCESS') {
    chrome.storage.local.set({
      authToken: request.token,
      userName: request.userName
    }, () => {
      checkAuthStatus();
      showStatus('Logged in successfully!', 'success');
    });
  }
});
