// Function to determine the Shodan URL based on the input type
function getShodanUrl(rawInput) {
    const input = (rawInput || "").trim();
    if (!input) return null;

    // Regex for IP, domain, CVE, and Shodan search-facet shorthand validation
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const domainRegex = /^(?=.{1,253}$)(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/;
    const cveRegex = /CVE-\d{4}-\d+/i; // Detects CVE patterns (e.g., CVE-2024-6387)
    const facetRegex = /^(port|org|net|product|hostname|city|country|os|isp|asn|ssl|http\.title|vuln|before|after|category):/i;

    const generalSearchUrl = "https://www.shodan.io/search?query=";
    const hostSearchUrl = "https://www.shodan.io/host/";
    const domainSearchUrl = "https://www.shodan.io/domain/";

    // 1. Handle CVE patterns first
    const cveMatch = input.match(cveRegex);
    if (cveMatch) {
        return `${generalSearchUrl}${encodeURIComponent(cveMatch[0])}`;
    }

    // 2. Handle Shodan search-facet shorthand (e.g. "port:443", "org:\"Google\"")
    if (facetRegex.test(input)) {
        return `${generalSearchUrl}${encodeURIComponent(input)}`;
    }

    // 3. Check if the input is a URL and extract the domain
    let candidate = input;
    try {
        const url = new URL(input);
        candidate = url.hostname; // e.g. rtings.com from https://www.rtings.com/router
    } catch (error) {
        // If input is not a valid URL, proceed with it as-is
    }

    // 4. Handle IP addresses
    if (ipRegex.test(candidate)) {
        return hostSearchUrl + candidate;
    }

    // 5. Handle domains
    if (domainRegex.test(candidate)) {
        return domainSearchUrl + candidate;
    }

    // 6. Treat everything else as a general search term
    return `${generalSearchUrl}${encodeURIComponent(input)}`;
}

function notifyError(message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "images/icon48.png",
        title: "Shodan Lookup Error",
        message
    });
}

// Function to create context menu item, wrapped in a promise to ensure removal is complete
function createContextMenu() {
    return new Promise((resolve) => {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: "searchShodan",
                title: "Search on Shodan",
                contexts: ["selection", "link"]
            });
            resolve();
        });
    });
}

// Call createContextMenu on extension installation or startup
chrome.runtime.onInstalled.addListener(() => createContextMenu());
chrome.runtime.onStartup.addListener(() => createContextMenu());

// Listener for when the context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const input = (info.linkUrl || info.selectionText || "").trim();

    if (!input) {
        notifyError("Please select text or a link to search on Shodan.");
        return;
    }

    const queryUrl = getShodanUrl(input);
    if (queryUrl) {
        chrome.tabs.create({ url: queryUrl });
    } else {
        notifyError("Invalid input. Please select a valid IP, domain, or keyword to search on Shodan.");
    }
});

// Keyboard shortcut: search the current tab's domain
chrome.commands.onCommand.addListener((command) => {
    if (command !== "lookup-current-tab") return;
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab || !tab.url) return;
        const queryUrl = getShodanUrl(tab.url);
        if (queryUrl) chrome.tabs.create({ url: queryUrl });
    });
});
