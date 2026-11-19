// Function to determine the Shodan URL based on the input type
function getShodanUrl(rawInput) {
  const input = (rawInput || "").trim();
  if (!input) return null;

  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const domainRegex = /^(?=.{1,253}$)(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/;
  const cveRegex = /CVE-\d{4}-\d+/i; // Detects CVE patterns (e.g., CVE-2024-6387)
  const facetRegex = /^(port|org|net|product|hostname|city|country|os|isp|asn|ssl|http\.title|vuln|before|after|category):/i;

  const generalSearchUrl = "https://www.shodan.io/search?query=";
  const hostSearchUrl = "https://www.shodan.io/host/";
  const domainSearchUrl = "https://www.shodan.io/domain/";

  // 1. CVE pattern
  const cveMatch = input.match(cveRegex);
  if (cveMatch) {
    return `${generalSearchUrl}${encodeURIComponent(cveMatch[0])}`;
  }

  // 2. Shodan search-facet shorthand (e.g. "port:443", "org:\"Google\"")
  if (facetRegex.test(input)) {
    return `${generalSearchUrl}${encodeURIComponent(input)}`;
  }

  // 3. Extract hostname if input is a full URL
  let candidate = input;
  try {
    const url = new URL(input);
    candidate = url.hostname;
  } catch (_) {
    // not a URL, keep as-is
  }

  // 4. IP addresses
  if (ipRegex.test(candidate)) {
    return hostSearchUrl + candidate;
  }

  // 5. Domains
  if (domainRegex.test(candidate)) {
    return domainSearchUrl + candidate;
  }

  // 6. General search fallback
  return `${generalSearchUrl}${encodeURIComponent(input)}`;
}

const MENU_ID = "searchShodan";

function notifyError(message) {
  browser.notifications.create({
    type: "basic",
    iconUrl: "images/icon48.png",
    title: "Shodan Lookup Error",
    message
  });
}

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
  const input = (info.linkUrl || info.selectionText || "").trim();

  if (!input) {
    notifyError("Please select text or a link to search on Shodan.");
    return;
  }

  const queryUrl = getShodanUrl(input);
  if (queryUrl) {
    browser.tabs.create({ url: queryUrl });
  } else {
    notifyError("Invalid input. Please select a valid IP, domain, or keyword to search on Shodan.");
  }
});

// Keyboard shortcut: search the current tab's domain
browser.commands.onCommand.addListener(async (command) => {
  if (command !== "lookup-current-tab") return;

  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;

  const queryUrl = getShodanUrl(tab.url);
  if (queryUrl) browser.tabs.create({ url: queryUrl });
});
