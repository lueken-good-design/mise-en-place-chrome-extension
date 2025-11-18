// Configuration
const API_BASE_URL = 'https://mise-en-place.recipes';

// DOM Elements
let authSection, importSection, loginForm, logoutBtn, googleLoginBtn;
let userNameEl, loginText, loginSpinner;

// Tab elements
let tabButtons, tabContents;

// Advanced tab elements
let previewBtn, previewText, previewSpinner, previewContainer;
let saveEditedBtn, saveText, saveSpinner;
let previewTitle, previewDescription, previewIngredients, previewSteps;
let statusAdvanced, urlDisplayAdvanced;
let multiRecipeHeader, recipeTabs, selectAllRecipes;

// Bulk import elements
let scanTabsBtn, tabsList, importSelectedBtn, bulkImportText, bulkImportSpinner;
let bulkProgress, progressFill, progressText, statusBulk;

// State
let currentRecipeData = null;
let selectedTabs = new Set();

// Multi-recipe state
let allRecipes = [];           // Array of all recipes from preview
let selectedRecipes = [];      // Boolean array for selection state
let activeRecipeIndex = 0;     // Currently displayed recipe
let currentLogId = null;       // Shared log ID for all recipes
let currentSourceUrl = null;   // Source URL for the import

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Get common DOM elements
  authSection = document.getElementById('auth-section');
  importSection = document.getElementById('import-section');
  loginForm = document.getElementById('login-form');
  logoutBtn = document.getElementById('logout-btn');
  googleLoginBtn = document.getElementById('google-login-btn');
  userNameEl = document.getElementById('user-name');
  loginText = document.getElementById('login-text');
  loginSpinner = document.getElementById('login-spinner');

  // Advanced tab elements
  previewBtn = document.getElementById('preview-btn');
  previewText = document.getElementById('preview-text');
  previewSpinner = document.getElementById('preview-spinner');
  previewContainer = document.getElementById('preview-container');
  saveEditedBtn = document.getElementById('save-edited-btn');
  saveText = document.getElementById('save-text');
  saveSpinner = document.getElementById('save-spinner');
  previewTitle = document.getElementById('preview-title');
  previewDescription = document.getElementById('preview-description');
  previewIngredients = document.getElementById('preview-ingredients');
  previewSteps = document.getElementById('preview-steps');
  statusAdvanced = document.getElementById('status-advanced');
  urlDisplayAdvanced = document.getElementById('url-display-advanced');
  multiRecipeHeader = document.getElementById('multi-recipe-header');
  recipeTabs = document.getElementById('recipe-tabs');
  selectAllRecipes = document.getElementById('select-all-recipes');

  // Bulk import tab elements
  scanTabsBtn = document.getElementById('scan-tabs-btn');
  tabsList = document.getElementById('tabs-list');
  importSelectedBtn = document.getElementById('import-selected-btn');
  bulkImportText = document.getElementById('bulk-import-text');
  bulkImportSpinner = document.getElementById('bulk-import-spinner');
  bulkProgress = document.getElementById('bulk-progress');
  progressFill = document.getElementById('progress-fill');
  progressText = document.getElementById('progress-text');
  statusBulk = document.getElementById('status-bulk');

  // Tab navigation
  tabButtons = document.querySelectorAll('.tab-btn');
  tabContents = document.querySelectorAll('.tab-content');

  // Event listeners
  loginForm.addEventListener('submit', handleLogin);
  googleLoginBtn.addEventListener('click', handleGoogleLogin);
  logoutBtn.addEventListener('click', handleLogout);

  // Advanced import
  previewBtn.addEventListener('click', handlePreview);
  saveEditedBtn.addEventListener('click', handleSaveEdited);

  // Bulk import
  scanTabsBtn.addEventListener('click', handleScanTabs);
  importSelectedBtn.addEventListener('click', handleBulkImport);

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Check auth status
  checkAuthStatus();

  // Get current tab URL
  getCurrentTabUrl();

  // Listen for tab changes and update URL display
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await getCurrentTabUrl();
  });
});

// Tab Switching
function switchTab(tabName) {
  // Update button states
  tabButtons.forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update content visibility
  tabContents.forEach(content => {
    if (content.id === `tab-${tabName}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
}

// Auth Functions
async function checkAuthStatus() {
  const result = await chrome.storage.local.get(['authToken', 'userName']);

  if (result.authToken) {
    showImportView(result.userName);
  } else {
    showAuthView();
  }
}

function showAuthView() {
  authSection.style.display = 'block';
  importSection.style.display = 'none';
}

function showImportView(userName) {
  authSection.style.display = 'none';
  importSection.style.display = 'block';
  userNameEl.textContent = userName || 'User';
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

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
      // Use display_name if available, fallback to name or email
      const displayName = data.user?.display_name || data.user?.name || email;

      await chrome.storage.local.set({
        authToken: data.token,
        userName: displayName
      });

      showImportView(displayName);
      showStatus(statusAdvanced, 'Logged in successfully!', 'success');
    } else {
      showStatus(statusAdvanced, data.message || 'Invalid email or password', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus(statusAdvanced, 'Unable to connect to server', 'error');
  } finally {
    loginBtn.disabled = false;
    loginText.style.display = 'inline';
    loginSpinner.style.display = 'none';
  }
}

async function handleGoogleLogin() {
  const authUrl = `${API_BASE_URL}/auth/google?extension=1`;

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

  const pollInterval = setInterval(async () => {
    const result = await chrome.storage.local.get(['authToken', 'userName']);

    if (result.authToken) {
      clearInterval(pollInterval);

      try {
        await chrome.windows.remove(authWindow.id);
      } catch (e) {
        // Window already closed
      }

      showImportView(result.userName);
      showStatus(statusAdvanced, 'Logged in successfully!', 'success');
    }
  }, 500);

  setTimeout(() => {
    clearInterval(pollInterval);
  }, 5 * 60 * 1000);
}

async function handleLogout() {
  await chrome.storage.local.remove(['authToken', 'userName']);
  showAuthView();
  showStatus(statusAdvanced, 'Logged out successfully', 'success');
}

async function getCurrentTabUrl() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    const url = tabs[0].url;
    if (urlDisplayAdvanced) urlDisplayAdvanced.textContent = url;
  }
}

// Advanced Import Tab Functions
async function handlePreview() {
  const result = await chrome.storage.local.get(['authToken']);

  if (!result.authToken) {
    showStatus(statusAdvanced, 'Please log in first', 'error');
    return;
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs[0]) {
    showStatus(statusAdvanced, 'Unable to get current page', 'error');
    return;
  }

  const url = tabs[0].url;

  previewBtn.disabled = true;
  previewText.style.display = 'none';
  previewSpinner.style.display = 'inline-block';

  // Show duration message
  showStatus(statusAdvanced, 'Importing... This may take 10-30 seconds', 'info');

  try {
    const response = await fetch(`${API_BASE_URL}/api/extension/preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${result.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (response.ok) {
      currentLogId = data.log_id;
      currentSourceUrl = url;

      // Check if this is a multi-recipe response (YouTube)
      if (data.recipes && data.recipe_count > 1) {
        // Multi-recipe mode
        allRecipes = data.recipes;
        selectedRecipes = new Array(data.recipe_count).fill(true);
        activeRecipeIndex = 0;
        currentRecipeData = allRecipes[0];

        // Show multi-recipe UI
        displayMultiRecipeTabs();
        displayPreview(allRecipes[0]);
        multiRecipeHeader.style.display = 'block';
        previewContainer.style.display = 'block';
        updateSaveButtonText();

        showStatus(statusAdvanced, `Found ${data.recipe_count} recipes! Select which to import.`, 'success');
      } else if (data.recipe_data) {
        // Single recipe mode
        allRecipes = [data.recipe_data];
        selectedRecipes = [true];
        activeRecipeIndex = 0;
        currentRecipeData = data.recipe_data;

        // Hide multi-recipe UI
        multiRecipeHeader.style.display = 'none';
        displayPreview(data.recipe_data);
        previewContainer.style.display = 'block';
        updateSaveButtonText();

        showStatus(statusAdvanced, 'Preview loaded! Edit and save when ready.', 'success');
      } else {
        showStatus(statusAdvanced, 'Recipe data missing from response', 'error');
      }
    } else {
      showStatus(statusAdvanced, data.message || 'Failed to preview recipe', 'error');
    }
  } catch (error) {
    console.error('[PREVIEW] Error:', error);
    showStatus(statusAdvanced, 'An error occurred while previewing the recipe', 'error');
  } finally {
    previewBtn.disabled = false;
    previewText.style.display = 'inline';
    previewSpinner.style.display = 'none';
  }
}

function displayPreview(recipeData) {
  // Set title and description
  previewTitle.value = recipeData.title || '';
  previewDescription.value = recipeData.description || '';

  // Display ingredients
  previewIngredients.innerHTML = '';
  if (recipeData.ingredients && recipeData.ingredients.length > 0) {
    recipeData.ingredients.forEach((ing, index) => {
      const item = document.createElement('div');
      item.className = 'editable-item';
      item.innerHTML = `
        <input type="text" value="${escapeHtml(formatIngredient(ing))}" data-index="${index}">
        <button onclick="removeIngredient(${index})">×</button>
      `;
      previewIngredients.appendChild(item);
    });
  } else {
    previewIngredients.innerHTML = '<p class="empty-state">No ingredients found</p>';
  }

  // Display steps
  previewSteps.innerHTML = '';
  if (recipeData.steps && recipeData.steps.length > 0) {
    recipeData.steps.forEach((step, index) => {
      const stepText = typeof step === 'string' ? step : (step.instructions || step.instruction || '');
      const item = document.createElement('div');
      item.className = 'editable-item';
      item.innerHTML = `
        <input type="text" value="${escapeHtml(stepText)}" data-index="${index}">
        <button onclick="removeStep(${index})">×</button>
      `;
      previewSteps.appendChild(item);
    });
  } else {
    previewSteps.innerHTML = '<p class="empty-state">No steps found</p>';
  }
}

function formatIngredient(ing) {
  let text = '';
  if (ing.quantity) text += ing.quantity + ' ';
  if (ing.unit) text += ing.unit + ' ';
  if (ing.item || ing.name) text += (ing.item || ing.name);
  return text.trim();
}

// Multi-recipe functions
function displayMultiRecipeTabs() {
  recipeTabs.innerHTML = '';

  allRecipes.forEach((recipe, index) => {
    const tab = document.createElement('div');
    tab.className = `recipe-tab ${index === activeRecipeIndex ? 'active' : ''}`;
    tab.innerHTML = `
      <input type="checkbox" ${selectedRecipes[index] ? 'checked' : ''} data-index="${index}">
      <span class="recipe-tab-title">${escapeHtml(recipe.title || `Recipe ${index + 1}`)}</span>
    `;

    // Click on tab to view recipe
    tab.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        switchToRecipe(index);
      }
    });

    // Checkbox change
    const checkbox = tab.querySelector('input');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      selectedRecipes[index] = checkbox.checked;
      updateSelectAllCheckbox();
      updateSaveButtonText();
    });

    recipeTabs.appendChild(tab);
  });

  // Set up select all checkbox
  selectAllRecipes.checked = selectedRecipes.every(s => s);
  selectAllRecipes.addEventListener('change', () => {
    const checked = selectAllRecipes.checked;
    selectedRecipes = selectedRecipes.map(() => checked);

    // Update all checkboxes
    recipeTabs.querySelectorAll('input[type="checkbox"]').forEach((cb, i) => {
      cb.checked = checked;
    });

    updateSaveButtonText();
  });
}

function switchToRecipe(index) {
  // Save current edits before switching
  saveCurrentEdits();

  // Switch to new recipe
  activeRecipeIndex = index;
  currentRecipeData = allRecipes[index];

  // Update tab active state
  recipeTabs.querySelectorAll('.recipe-tab').forEach((tab, i) => {
    if (i === index) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Display the new recipe
  displayPreview(allRecipes[index]);
}

function saveCurrentEdits() {
  if (activeRecipeIndex >= 0 && activeRecipeIndex < allRecipes.length) {
    // Save title and description
    allRecipes[activeRecipeIndex].title = previewTitle.value;
    allRecipes[activeRecipeIndex].description = previewDescription.value;

    // Save edited ingredients
    const ingredientInputs = previewIngredients.querySelectorAll('input');
    allRecipes[activeRecipeIndex].ingredients = Array.from(ingredientInputs).map(input => {
      return parseIngredientText(input.value);
    });

    // Save edited steps
    const stepInputs = previewSteps.querySelectorAll('input');
    allRecipes[activeRecipeIndex].steps = Array.from(stepInputs).map(input => input.value);
  }
}

function updateSelectAllCheckbox() {
  const allSelected = selectedRecipes.every(s => s);
  const noneSelected = selectedRecipes.every(s => !s);

  selectAllRecipes.checked = allSelected;
  selectAllRecipes.indeterminate = !allSelected && !noneSelected;
}

function updateSaveButtonText() {
  const selectedCount = selectedRecipes.filter(s => s).length;
  const totalCount = allRecipes.length;

  if (totalCount > 1) {
    saveText.textContent = `Save ${selectedCount} of ${totalCount} Recipes`;
    saveEditedBtn.disabled = selectedCount === 0;
  } else {
    saveText.textContent = 'Save Recipe';
    saveEditedBtn.disabled = false;
  }
}

function removeIngredient(index) {
  if (currentRecipeData && currentRecipeData.ingredients) {
    currentRecipeData.ingredients.splice(index, 1);
    displayPreview(currentRecipeData);
  }
}

function removeStep(index) {
  if (currentRecipeData && currentRecipeData.steps) {
    currentRecipeData.steps.splice(index, 1);
    displayPreview(currentRecipeData);
  }
}

async function handleSaveEdited() {
  const result = await chrome.storage.local.get(['authToken']);
  if (!result.authToken) {
    showStatus(statusAdvanced, 'Please log in first', 'error');
    return;
  }

  // Save current edits before processing
  saveCurrentEdits();

  // Get selected recipes
  const recipesToSave = allRecipes
    .map((recipe, index) => ({ recipe, index }))
    .filter(({ index }) => selectedRecipes[index]);

  if (recipesToSave.length === 0) {
    showStatus(statusAdvanced, 'Please select at least one recipe to save', 'error');
    return;
  }

  saveEditedBtn.disabled = true;
  saveText.style.display = 'none';
  saveSpinner.style.display = 'inline-block';

  const url = currentSourceUrl || '';
  let savedCount = 0;
  let failedCount = 0;
  let lastRecipeUrl = null;

  try {
    // Show progress for multiple recipes
    if (recipesToSave.length > 1) {
      showStatus(statusAdvanced, `Saving ${recipesToSave.length} recipes...`, 'info');
    }

    // Save each selected recipe
    for (let i = 0; i < recipesToSave.length; i++) {
      const { recipe } = recipesToSave[i];

      try {
        const response = await fetch(`${API_BASE_URL}/api/extension/import`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${result.authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ url, recipeData: recipe })
        });

        const data = await response.json();

        if (response.ok) {
          savedCount++;
          lastRecipeUrl = data.recipe_url;
        } else {
          failedCount++;
          console.error(`[SAVE] Failed to save recipe ${i + 1}:`, data.message);
        }
      } catch (error) {
        failedCount++;
        console.error(`[SAVE] Error saving recipe ${i + 1}:`, error);
      }

      // Small delay between saves
      if (i < recipesToSave.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Show result
    if (savedCount > 0) {
      const message = recipesToSave.length > 1
        ? `Saved ${savedCount} of ${recipesToSave.length} recipes!`
        : 'Recipe saved successfully!';
      showStatus(statusAdvanced, message, failedCount > 0 ? 'info' : 'success');

      // Reset preview
      previewContainer.style.display = 'none';
      multiRecipeHeader.style.display = 'none';
      currentRecipeData = null;
      allRecipes = [];
      selectedRecipes = [];

      // Open recipe book if single recipe, or last recipe if multiple
      if (lastRecipeUrl) {
        setTimeout(() => {
          chrome.tabs.create({ url: savedCount > 1 ? `${API_BASE_URL}/recipe-book` : lastRecipeUrl });
        }, 1000);
      }
    } else {
      showStatus(statusAdvanced, 'Failed to save recipes', 'error');
    }
  } catch (error) {
    console.error('[SAVE] Error:', error);
    showStatus(statusAdvanced, 'An error occurred while saving', 'error');
  } finally {
    saveEditedBtn.disabled = false;
    saveText.style.display = 'inline';
    saveSpinner.style.display = 'none';
  }
}

function parseIngredientText(text) {
  // Simple parsing: "quantity unit item"
  const parts = text.trim().split(/\s+/);
  const quantity = parts[0] && !isNaN(parts[0]) ? parts[0] : '';
  const unit = quantity && parts[1] ? parts[1] : '';
  const item = quantity ? parts.slice(unit ? 2 : 1).join(' ') : text;

  return { quantity, unit, item };
}

// Bulk Import Tab Functions
async function handleScanTabs() {
  // Get tabs from current window only
  const tabs = await chrome.tabs.query({ currentWindow: true });

  // Filter to only http/https URLs, exclude mise-en-place.recipes
  const validTabs = tabs.filter(tab => {
    if (!tab.url) return false;

    const url = tab.url.toLowerCase();

    // Only include http/https URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

    // Exclude our own site and chrome extension pages
    if (url.includes('mise-en-place.recipes')) return false;
    if (url.startsWith('chrome://')) return false;
    if (url.startsWith('chrome-extension://')) return false;

    return true;
  });

  // Sort tabs by their index to maintain browser order
  validTabs.sort((a, b) => a.index - b.index);

  tabsList.innerHTML = '';
  selectedTabs.clear();

  if (validTabs.length === 0) {
    tabsList.innerHTML = '<p class="empty-state">No recipe tabs found in this window.<br>Open some recipe pages and try again.</p>';
    return;
  }

  validTabs.forEach(tab => {

    const item = document.createElement('div');
    item.className = 'tab-item';
    item.innerHTML = `
      <input type="checkbox" id="tab-${tab.id}" data-tab-id="${tab.id}" data-url="${escapeHtml(tab.url)}">
      <div class="tab-item-content">
        <div class="tab-item-title">${escapeHtml(tab.title || 'Untitled')}</div>
        <div class="tab-item-url">${escapeHtml(tab.url)}</div>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const checkbox = item.querySelector('input');
        checkbox.checked = !checkbox.checked;
        handleTabSelection(checkbox);
      }
    });

    const checkbox = item.querySelector('input');
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      handleTabSelection(checkbox);
    });

    tabsList.appendChild(item);
  });

  showStatus(statusBulk, `Found ${validTabs.length} tab${validTabs.length === 1 ? '' : 's'} in this window`, 'info');
}

function handleTabSelection(checkbox) {
  const tabId = parseInt(checkbox.dataset.tabId);
  const url = checkbox.dataset.url;

  if (checkbox.checked) {
    selectedTabs.add({ id: tabId, url: url });
  } else {
    selectedTabs.delete([...selectedTabs].find(t => t.id === tabId));
  }

  if (selectedTabs.size > 0) {
    importSelectedBtn.style.display = 'block';
    importSelectedBtn.querySelector('span').textContent = `Import ${selectedTabs.size} Selected Recipe${selectedTabs.size > 1 ? 's' : ''}`;
  } else {
    importSelectedBtn.style.display = 'none';
  }
}

async function handleBulkImport() {
  if (selectedTabs.size === 0) {
    showStatus(statusBulk, 'Please select at least one tab', 'error');
    return;
  }

  const result = await chrome.storage.local.get(['authToken']);
  if (!result.authToken) {
    showStatus(statusBulk, 'Please log in first', 'error');
    return;
  }

  const tabsArray = Array.from(selectedTabs);
  let completed = 0;
  let failed = 0;

  // Calculate and show estimated duration
  const recipeCount = tabsArray.length;
  const recipeWord = recipeCount === 1 ? 'recipe' : 'recipes';
  const minTime = recipeCount * 20;
  const maxTime = recipeCount * 30;

  importSelectedBtn.disabled = true;
  bulkProgress.style.display = 'block';

  // Show estimated duration message
  showStatus(statusBulk, `Processing ${recipeCount} ${recipeWord}... This may take ~${minTime}-${maxTime} seconds`, 'info');

  for (let i = 0; i < tabsArray.length; i++) {
    const tab = tabsArray[i];
    progressText.textContent = `Importing ${i + 1} of ${tabsArray.length}... This may take 10-30 seconds per recipe`;
    progressFill.style.width = `${((i + 1) / tabsArray.length) * 100}%`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/extension/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${result.authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: tab.url })
      });

      const data = await response.json();

      if (response.ok) {
        completed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('[BULK] Error importing:', tab.url, error);
      failed++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  progressFill.style.width = '100%';
  progressText.textContent = `Complete: ${completed} imported, ${failed} failed`;

  showStatus(statusBulk, `Bulk import complete! ${completed} recipes imported${failed > 0 ? `, ${failed} failed` : ''}`, completed > 0 ? 'success' : 'error');

  setTimeout(() => {
    bulkProgress.style.display = 'none';
    importSelectedBtn.disabled = false;
    selectedTabs.clear();
    handleScanTabs();
  }, 3000);
}

// Utility Functions
function showStatus(element, message, type = 'info') {
  element.textContent = message;
  element.className = `status ${type}`;
  element.style.display = 'block';

  setTimeout(() => {
    element.style.display = 'none';
  }, 5000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions global for onclick handlers
window.removeIngredient = removeIngredient;
window.removeStep = removeStep;
