document.addEventListener("DOMContentLoaded", async () => {
  const siteUrlElement = document.getElementById("site-url");
  const tableBody = document.querySelector("#cookie-table tbody");
  const table = document.getElementById("cookie-table");
  const formatSelect = document.getElementById("export-format");
  const chkNowrap = document.getElementById("chk-nowrap");

  let currentDomain = "";
  let activeTabCookies = [];

  // Anchor & Sponsor Links များကို Chrome Tab သစ်တွင် ပွင့်စေရန်
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) {
      const url = link.getAttribute("href");
      if (url && url !== "#" && !url.startsWith("javascript:")) {
        e.preventDefault();
        chrome.tabs.create({ url: url });
      }
    }
  });

  // Toggle Table Nowrap
  chkNowrap.addEventListener("change", () => {
    if (chkNowrap.checked) {
      table.classList.add("nowrap");
    } else {
      table.classList.remove("nowrap");
    }
  });

  // Fetch all cookies including Partitioned Cookies (CHIPS)
  async function fetchTabCookies(tabUrl) {
    const url = new URL(tabUrl);

    // Get normal and subdomain cookies
    const regularCookies = await chrome.cookies.getAll({ url: tabUrl });

    // Get partitioned cookies by top-level site
    let partitionedCookies = [];
    try {
      partitionedCookies = await chrome.cookies.getAll({
        url: tabUrl,
        partitionKey: { topLevelSite: url.origin },
      });
    } catch (e) {
      // Ignore if partitionKey is not supported
    }

    // Get root domain cookies
    const domainParts = url.hostname.split(".");
    const rootDomain =
      domainParts.length > 1 ? domainParts.slice(-2).join(".") : url.hostname;
    const rootCookies = await chrome.cookies.getAll({ domain: rootDomain });

    // Combine cookies using Map to prevent duplicates
    const cookieMap = new Map();
    [...regularCookies, ...partitionedCookies, ...rootCookies].forEach((c) => {
      const key = `${c.domain}|${c.path}|${c.name}`;
      cookieMap.set(key, c);
    });

    return Array.from(cookieMap.values());
  }

  // Get Active Tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      currentDomain = url.hostname;

      // Link text နှင့် href နှစ်ခုလုံး ထည့်ပေးခြင်း
      siteUrlElement.textContent = tab.url;
      siteUrlElement.href = tab.url;

      activeTabCookies = await fetchTabCookies(tab.url);
      renderTable(activeTabCookies);
    } catch (e) {
      siteUrlElement.textContent = "Invalid URL";
      siteUrlElement.removeAttribute("href");
    }
  } else {
    siteUrlElement.textContent = "Unavailable";
    siteUrlElement.removeAttribute("href");
  }

  function renderTable(cookies) {
    tableBody.innerHTML = "";
    cookies.forEach((c) => {
      const tr = document.createElement("tr");
      const includeSub = c.domain.startsWith(".") ? "TRUE" : "FALSE";
      const isSecure = c.secure ? "TRUE" : "FALSE";
      const expiration = c.expirationDate
        ? Math.round(c.expirationDate)
        : "Session";

      tr.innerHTML = `
        <td>${c.domain}</td>
        <td>${includeSub}</td>
        <td>${c.path}</td>
        <td>${isSecure}</td>
        <td>${expiration}</td>
        <td>${c.name}</td>
        <td>${c.value}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function formatNetscape(cookies) {
    let output =
      "# Netscape HTTP Cookie File\n# http://curl.haxx.se/rfc/cookie_spec.html\n# This is a generated file! Do not edit.\n\n";
    cookies.forEach((c) => {
      const flag = c.domain.startsWith(".") ? "TRUE" : "FALSE";
      const path = c.path;
      const secure = c.secure ? "TRUE" : "FALSE";
      const expiration = c.expirationDate ? Math.round(c.expirationDate) : 0;
      const name = c.name;
      const value = c.value;

      output += `${c.domain}\t${flag}\t${path}\t${secure}\t${expiration}\t${name}\t${value}\n`;
    });
    return output;
  }

  function getFormattedCookies(cookies) {
    const format = formatSelect.value;
    if (format === "json") {
      return JSON.stringify(cookies, null, 2);
    }
    return formatNetscape(cookies);
  }

  function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  document.getElementById("btn-export").addEventListener("click", () => {
    const ext = formatSelect.value === "json" ? "json" : "txt";
    const content = getFormattedCookies(activeTabCookies);
    downloadFile(content, `${currentDomain}_cookies.${ext}`);
  });

  document.getElementById("btn-export-as").addEventListener("click", () => {
    const ext = formatSelect.value === "json" ? "json" : "txt";
    const defaultName = `${currentDomain}_cookies.${ext}`;
    const filename = prompt("Enter filename:", defaultName);
    if (filename) {
      const content = getFormattedCookies(activeTabCookies);
      downloadFile(content, filename);
    }
  });

  document.getElementById("btn-copy").addEventListener("click", () => {
    const content = getFormattedCookies(activeTabCookies);
    navigator.clipboard.writeText(content).then(() => {
      alert("Cookies copied to clipboard!");
    });
  });

  document
    .getElementById("btn-export-all")
    .addEventListener("click", async () => {
      const allCookies = await chrome.cookies.getAll({ partitionKey: {} });
      const ext = formatSelect.value === "json" ? "json" : "txt";
      const content = getFormattedCookies(allCookies);
      downloadFile(content, `all_cookies.${ext}`);
    });
});
