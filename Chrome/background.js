// Function to determine the Shodan URL based on the input type
function getShodanUrl(input) {
    // Improved regex for IP and domain validation
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const domainRegex = /^(?=.{1,253}$)(?:(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/;
    const cveRegex = /CVE-\d{4}-\d+/i; // Regex to detect CVE patterns (e.g., CVE-2024-6387)
    const generalSearchUrl = "https://www.shodan.io/search?query=";
    const hostSearchUrl = "https://www.shodan.io/host/";
    const domainSearchUrl = "https://www.shodan.io/domain/";

    // 1. Handle CVE patterns first
    const cveMatch = input.match(cveRegex);
    if (cveMatch) {
        // If a CVE pattern is found, use it as a search term on Shodan
        return `${generalSearchUrl}${encodeURIComponent(cveMatch[0])}`;
    }

    // 2. Check if the input is a URL and extract the domain
    try {
        const url = new URL(input);
        input = url.hostname; // Extract only the domain name from the URL (e.g., rtings.com from https://www.rtings.com/router)
    } catch (error) {
        // If input is not a valid URL, proceed with it as-is
    }

    // 3. Handle IP addresses
    if (ipRegex.test(input)) {
        return hostSearchUrl + input;
    }

    // 4. Handle domains
    if (domainRegex.test(input)) {
        return domainSearchUrl + input;
    }

    // 5. Treat everything else as a general search term
    return `${generalSearchUrl}${encodeURIComponent(input)}`;
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
    let input = (info.linkUrl || info.selectionText || "").trim();

    if (input) {
        const queryUrl = getShodanUrl(input);

        // Validate URL format and open in a new tab
        if (queryUrl) {
            chrome.tabs.create({ url: queryUrl });
        } else {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "images/icon48.png",
                title: "Shodan Lookup Error",
                message: "Invalid input. Please select a valid IP, domain, or keyword to search on Shodan."
            });
        }
    } else {
        // Notify user if no valid input is detected
        chrome.notifications.create({
            type: "basic",
            iconUrl: "images/icon48.png",
            title: "Shodan Lookup Error",
            message: "Please select text or a link to search on Shodan."
        });
    }
});
