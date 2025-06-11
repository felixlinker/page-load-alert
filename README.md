# Page Load Alert Chrome Extension

This extension displays a notification whenever a tab reloads and the extension is enabled for that tab. The notification indicates which tab reloaded and uses the tab's favicon as the icon when available.

## Installation
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this directory.

## Usage
 - Click the extension's toolbar icon to toggle reload alerts for the active tab.
- When enabled, the badge displays **ON** and stays visible even after the page reloads.
- A notification will appear each time the page reloads on that tab. It shows the page title and uses the favicon as the notification icon.
- The setting is disabled by default and remembered per tab until the tab is closed.
