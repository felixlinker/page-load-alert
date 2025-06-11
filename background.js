let enabledTabs = new Set();

function saveState() {
  chrome.storage.local.set({ enabledTabs: Array.from(enabledTabs) });
}

function updateAction(tabId, enabled) {
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
  if (tab && tab.id !== undefined) {
    toggleTab(tab.id);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (enabledTabs.delete(tabId)) {
    saveState();
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0 && enabledTabs.has(details.tabId)) {
    updateAction(details.tabId, true);
    chrome.tabs.get(details.tabId, (tab) => {
      const iconUrl = tab.favIconUrl || chrome.runtime.getURL('progress-check.png');
      const title = `"${tab.title}"` || 'The tab';
      chrome.notifications.create({
        type: 'basic',
        iconUrl,
        title: 'Tab Reloaded',
        message: `${title} has finished loading.`
      });
    });
  }
});
