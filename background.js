// Function to determine the Shodan URL based on the input type
function getShodanUrl(input) {
    const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const generalSearchUrl = "https://www.shodan.io/search?query=";
    const hostSearchUrl = "https://www.shodan.io/host/";
    const domainSearchUrl = "https://www.shodan.io/domain/";

    // Handle IP addresses
    if (ipRegex.test(input)) {
        console.log("Detected as IP address.");
        return hostSearchUrl + input;
    }

    // Handle domains
    if (domainRegex.test(input)) {
        console.log("Detected as domain.");
        return domainSearchUrl + input;
    }

    // Treat everything else as a general search term
    console.log("Detected as general search term.");
    return `${generalSearchUrl}${encodeURIComponent(input)}`;
}

// Create context menu item for Shodan search
browser.contextMenus.create({
    id: "searchShodan",
    title: "Search on Shodan",
    contexts: ["selection", "link"]
});

// Listener for when the context menu item is clicked
browser.contextMenus.onClicked.addListener((info, tab) => {
    let input = info.linkUrl || info.selectionText.trim();

    if (input) {
        const queryUrl = getShodanUrl(input);
        console.log("Final Shodan Query URL:", queryUrl);
        browser.tabs.create({ url: queryUrl });
    }
});
