// Background service worker for handling external messages

// Listen for messages from the auth callback page (external)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('[BACKGROUND] Received external message:', request);

  if (request.type === 'AUTH_SUCCESS') {
    // Store authentication data
    chrome.storage.local.set({
      authToken: request.token,
      userName: request.userName
    }).then(() => {
      console.log('[BACKGROUND] Auth data saved successfully');
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('[BACKGROUND] Error saving auth data:', error);
      sendResponse({ success: false, error: error.message });
    });

    return true; // Keep message channel open for async response
  }

  // Always send a response to prevent channel errors
  sendResponse({ success: false, error: 'Unknown message type' });
  return false;
});

// Listen for internal messages (from popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[BACKGROUND] Received internal message:', request);

  if (request.type === 'OPEN_SIDE_PANEL') {
    // Try to open side panel for the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId })
          .then(() => {
            console.log('[BACKGROUND] Side panel opened successfully');
            sendResponse({ success: true });
          })
          .catch((error) => {
            console.error('[BACKGROUND] Error opening side panel:', error);
            sendResponse({ success: false, error: error.message });
          });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep channel open for async response
  }

  if (request.type === 'AUTH_SUCCESS') {
    chrome.storage.local.set({
      authToken: request.token,
      userName: request.userName
    }).then(() => {
      console.log('[BACKGROUND] Auth data saved successfully');
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('[BACKGROUND] Error saving auth data:', error);
      sendResponse({ success: false, error: error.message });
    });

    return true;
  }

  // Always send a response to prevent channel errors
  sendResponse({ success: false, error: 'Unknown message type' });
  return false;
});
