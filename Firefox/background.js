// Function to determine the Shodan URL based on the input type
function getShodanUrl(input) {
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const generalSearchUrl = "https://www.shodan.io/search?query=";
  const hostSearchUrl = "https://www.shodan.io/host/";
  const domainSearchUrl = "https://www.shodan.io/domain/";

  const value = (input || "").trim();
  if (!value) return null;

  // Handle IP addresses
  if (ipRegex.test(value)) {
    return hostSearchUrl + value;
  }

  // Handle domains
  if (domainRegex.test(value)) {
    return domainSearchUrl + value;
  }

  // Treat everything else as a general search term
  return `${generalSearchUrl}${encodeURIComponent(value)}`;
}

const MENU_ID = "searchShodan";

// Create context menu item on install/update
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.removeAll().catch(() => {}).finally(() => {
    browser.contextMenus.create({
      id: MENU_ID,
      title: "Search on Shodan",
      contexts: ["selection", "link"]
    });
  });
});

// Listener for when the context menu item is clicked
browser.contextMenus.onClicked.addListener((info) => {
  const input = info.linkUrl || info.selectionText || "";
  const queryUrl = getShodanUrl(input);
  if (!queryUrl) return;

  browser.tabs.create({ url: queryUrl });
});
