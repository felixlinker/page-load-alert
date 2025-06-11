let enabledTabs = new Set();

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get('enabledTabs', (data) => {
    if (Array.isArray(data.enabledTabs)) {
      enabledTabs = new Set(data.enabledTabs);
      for (const tabId of enabledTabs) {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError || !tab) {
            enabledTabs.delete(tabId);
            saveState();
          } else {
            updateAction(tabId, true);
          }
        });
      }
    }
  });
});

function saveState() {
  chrome.storage.local.set({ enabledTabs: Array.from(enabledTabs) });
}

function updateAction(tabId, enabled) {
  // Without custom icons, only update badge text
  chrome.action.setBadgeText({ tabId, text: enabled ? 'ON' : '' });
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
  if (!enabledTabs.has(details.tabId)) return;
  updateAction(details.tabId, true);
  showAlert(details.tabId);
});
