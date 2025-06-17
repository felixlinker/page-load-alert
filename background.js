function getEnabled() {
  return chrome.storage.session.get({ enabledTabs: [] })
    .then(({ enabledTabs }) => new Set(enabledTabs));
}

function setEnabled(enabled) {
  return chrome.storage.session.set({ enabledTabs: Array.from(enabled) });
}

// enable:
//  undefined => toggle
//  true      => enable
//  false     => disable
function toggle(enabled, tabId, enable) {
  const add = (enable === undefined || enable) && !enabled.has(tabId);
  const remove = (enable === undefined || enable === false) && enabled.has(tabId);

  if (add) {
    return setEnabled(enabled.add(tabId)).then(() => true);
  } else if (remove) {
    return setEnabled(enabled.delete(tabId)).then(() => false);
  } else {
    return Promise.resolve(enabled.has(tabId));
  }
}

function setBadgeText(tabId, enabled) {
  return chrome.action.setBadgeText({ tabId, text: enabled ? 'ON' : '' });
}

chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.id !== undefined) {
    getEnabled()
      .then((enabled) => toggle(enabled, tab.id))
      .then((isEnabled) => setBadgeText(tab.id, isEnabled));
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  getEnabled().then((enabled) => toggle(enabled, tabId, false));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  getEnabled().then((enabled) => {
    const isEnabled = enabled.has(tabId);
    setBadgeText(tabId, isEnabled);
    if (isEnabled && changeInfo.status === 'complete') {
      const title = `"${tab.title}"` || 'The tab';
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('progress-check.png'),
        title: 'Tab Reloaded',
        message: `${title} has finished loading.`
      });
    }
  });
});
