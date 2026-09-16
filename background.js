const SCRIPT = {
  id: "force-motion",
  js: ["inject.js"],
  matches: ["<all_urls>"],
  runAt: "document_start",
  world: "MAIN",
  allFrames: true,
};

const icons = (on) => {
  const s = on ? "on" : "off";
  return { 16: `icons/${s}16.png`, 32: `icons/${s}32.png`, 48: `icons/${s}48.png`, 128: `icons/${s}128.png` };
};

const paint = (on) =>
  Promise.all([
    chrome.action.setIcon({ path: icons(on) }),
    chrome.action.setTitle({
      title: on ? "Force motion: on" : "Force motion: off",
    }),
  ]);

const httpTabs = async () =>
  (await chrome.tabs.query({})).filter((t) => t.id && /^https?:/.test(t.url || ""));

const injectAll = async () => {
  for (const t of await httpTabs()) {
    chrome.scripting
      .executeScript({
        target: { tabId: t.id, allFrames: true },
        files: ["inject.js"],
        world: "MAIN",
        injectImmediately: true,
      })
      .catch(() => {});
  }
};

const apply = async (on, { inject, reloadTabId } = {}) => {
  await chrome.storage.local.set({ on });
  await paint(on);
  await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT.id] }).catch(() => {});
  if (on) {
    await chrome.scripting.registerContentScripts([SCRIPT]);
    if (inject) await injectAll();
  } else if (reloadTabId) {
    const tab = await chrome.tabs.get(reloadTabId).catch(() => null);
    if (tab && /^https?:/.test(tab.url || "")) chrome.tabs.reload(reloadTabId).catch(() => {});
  }
};

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === "install") await chrome.storage.local.set({ on: true });
  const { on = true } = await chrome.storage.local.get("on");
  await apply(on, { inject: reason === "install" });
});

chrome.runtime.onStartup.addListener(async () => {
  const { on = true } = await chrome.storage.local.get("on");
  await paint(on);
});

chrome.action.onClicked.addListener(async (tab) => {
  const { on = true } = await chrome.storage.local.get("on");
  await apply(!on, { inject: !on, reloadTabId: on ? tab?.id : undefined });
});
