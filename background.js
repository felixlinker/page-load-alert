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
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      args: [ chrome.runtime.getURL('sound.mp3') ],
      func: (url) => {
        console.log(url);
        new Audio(url).play();
      }
    });
  }
});
