const browserAPI = typeof browser !== "undefined" ? browser : chrome;

async function updateCookieBadge(tabId, urlString) {
  if (
    !urlString ||
    (!urlString.startsWith("http://") && !urlString.startsWith("https://"))
  ) {
    browserAPI.action.setBadgeText({ tabId: tabId, text: "" });
    return;
  }

  try {
    const url = new URL(urlString);

    // Normal cookies
    const regularCookies = await browserAPI.cookies.getAll({ url: urlString });

    // Partitioned cookies (Try/Catch for Firefox compatibility)
    let partitionedCookies = [];
    try {
      partitionedCookies = await browserAPI.cookies.getAll({
        url: urlString,
        partitionKey: { topLevelSite: url.origin },
      });
    } catch (e) {}

    const domainParts = url.hostname.split(".");
    const rootDomain =
      domainParts.length > 1 ? domainParts.slice(-2).join(".") : url.hostname;
    const rootCookies = await browserAPI.cookies.getAll({ domain: rootDomain });

    const cookieMap = new Map();
    [...regularCookies, ...partitionedCookies, ...rootCookies].forEach((c) => {
      const key = `${c.domain}|${c.path}|${c.name}`;
      cookieMap.set(key, c);
    });

    const count = cookieMap.size;

    if (count > 0) {
      browserAPI.action.setBadgeText({ tabId: tabId, text: count.toString() });
      browserAPI.action.setBadgeBackgroundColor({
        tabId: tabId,
        color: "#4A90E2",
      });
      browserAPI.action.setBadgeTextColor({ tabId: tabId, color: "#000000" });
    } else {
      browserAPI.action.setBadgeText({ tabId: tabId, text: "" });
    }
  } catch (e) {
    browserAPI.action.setBadgeText({ tabId: tabId, text: "" });
  }
}

browserAPI.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await browserAPI.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      updateCookieBadge(tab.id, tab.url);
    }
  } catch (e) {}
});

browserAPI.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    updateCookieBadge(tabId, tab.url);
  }
});
