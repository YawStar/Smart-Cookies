async function updateCookieBadge(tabId, urlString) {
  if (
    !urlString ||
    (!urlString.startsWith("http://") && !urlString.startsWith("https://"))
  ) {
    chrome.action.setBadgeText({ tabId: tabId, text: "" });
    return;
  }

  try {
    const url = new URL(urlString);

    // Normal cookies
    const regularCookies = await chrome.cookies.getAll({ url: urlString });

    // Partitioned cookies
    let partitionedCookies = [];
    try {
      partitionedCookies = await chrome.cookies.getAll({
        url: urlString,
        partitionKey: { topLevelSite: url.origin },
      });
    } catch (e) {}

    const domainParts = url.hostname.split(".");
    const rootDomain =
      domainParts.length > 1 ? domainParts.slice(-2).join(".") : url.hostname;
    const rootCookies = await chrome.cookies.getAll({ domain: rootDomain });

    const cookieMap = new Map();
    [...regularCookies, ...partitionedCookies, ...rootCookies].forEach((c) => {
      const key = `${c.domain}|${c.path}|${c.name}`;
      cookieMap.set(key, c);
    });

    const count = cookieMap.size;

    if (count > 0) {
      chrome.action.setBadgeText({ tabId: tabId, text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#4A90E2" });
      chrome.action.setBadgeTextColor({ tabId: tabId, color: "#000000" });
    } else {
      chrome.action.setBadgeText({ tabId: tabId, text: "" });
    }
  } catch (e) {
    chrome.action.setBadgeText({ tabId: tabId, text: "" });
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab && tab.url) {
    updateCookieBadge(tab.id, tab.url);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    updateCookieBadge(tabId, tab.url);
  }
});
