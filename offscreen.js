chrome.runtime.onMessage.addListener((msg) => {
  if (msg.playSound) {
    const url = chrome.runtime.getURL('sound.mp3');
    // play the sound without needing user interaction
    new Audio(url).play();
  }
});
