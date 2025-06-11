let enabledTabs = new Set();

// Load saved state
chrome.storage.local.get('enabledTabs', (data) => {
  if (Array.isArray(data.enabledTabs)) {
    enabledTabs = new Set(data.enabledTabs);
  }
});

function saveState() {
  chrome.storage.local.set({ enabledTabs: Array.from(enabledTabs) });
}

function updateAction(tabId, enabled) {
  // Without custom icons, only update badge text
  chrome.action.setBadgeText({ tabId, text: enabled ? 'ON' : '' });
  if (enabled) {
    chrome.action.setBadgeBackgroundColor({ tabId, color: '#FF0000' });
  }
}

function toggleTab(tabId) {
  const enabled = enabledTabs.has(tabId);
  if (enabled) {
    enabledTabs.delete(tabId);
  } else {
    enabledTabs.add(tabId);
  }
  updateAction(tabId, !enabled);
  saveState();
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab || tab.id === undefined) return;
  toggleTab(tab.id);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (enabledTabs.delete(tabId)) {
    saveState();
  }
});

function showAlert(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      // TODO: replace with sound or better UI
      alert('Tab reloaded');
    }
  });
}

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId !== 0) return;
  if (details.transitionType === 'reload' && enabledTabs.has(details.tabId)) {
    showAlert(details.tabId);
  }
});
