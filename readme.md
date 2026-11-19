# Shodan Lookup Extension

Shodan Lookup is an open-source browser extension that enables fast, context-menu-based searches on Shodan. It supports IP addresses, domains, and free-form search queries with automatic routing.

## Features
- **Context menu integration**  
    Search selected text directly on Shodan.

- **Keyboard shortcut**
    Press `Alt+Shift+S` to search the current tab's domain.

- **Automatic input handling**
    - IP addresses open Shodan host pages
    - Domains open Shodan domain pages
    - CVE IDs (e.g. `CVE-2024-6387`) route to a Shodan search
    - Shodan facet shorthand (e.g. `port:443`, `org:"Google"`) routes to a Shodan search
    - Other input is treated as a general search query
        
- **No background queries**  
    All searches are strictly user-initiated.

## What's New (v1.3 / 2.1)
* Both builds now share the same detection logic: CVE patterns, full-URL hostname extraction, and IP/domain validation
* New support for Shodan facet shorthand (`port:`, `org:`, `net:`, `product:`, and more)
* New `Alt+Shift+S` shortcut to search the current tab's domain
* Consistent error notifications on invalid input across Chrome and Firefox

## Usage
1. Highlight text on a webpage.
2. Right-click and select **Search on Shodan**.
3. View results in a new browser tab.

## Permissions
- **Context menus**
- **Tabs / activeTab**
- **Notifications**
    
## Installation
- **Firefox Add-ons**  
    [https://addons.mozilla.org/firefox/addon/shoda-search/](https://addons.mozilla.org/firefox/addon/shoda-search/)  

- **Chrome Web Store:**  
    [updated once review passed]

## Open Source & License
This project is licensed under the MIT License.
Source code:  
[https://github.com/ztothez/ShodanLookup](https://github.com/ztothez/ShodanLookup)

## Privacy Policy

This extension does not collect, store, or track personal data.  
For full details, see the privacy policy below.

[Privacy Policy](https://ztothez.github.io/ShodanLookup/)
