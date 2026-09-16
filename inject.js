(() => {
  if (window.__forceMotion) return;
  window.__forceMotion = 1;

  const orig = window.matchMedia.bind(window);
  const forced = (q) => {
    const s = String(q);
    if (!/prefers-reduced-motion/i.test(s)) return null;
    return /no-preference/i.test(s);
  };
  window.matchMedia = (q) => {
    const mql = orig(q);
    const v = forced(q);
    if (v == null) return mql;
    const wrap = Object.create(mql);
    Object.defineProperty(wrap, "matches", { get: () => v });
    wrap.addEventListener = () => {};
    wrap.removeEventListener = () => {};
    wrap.addListener = () => {};
    wrap.removeListener = () => {};
    wrap.onchange = null;
    return wrap;
  };

  const rewrite = (mq) =>
    mq
      .replace(/prefers-reduced-motion\s*:\s*reduce/gi, "not all")
      .replace(/prefers-reduced-motion\s*:\s*no-preference/gi, "all")
      .replace(/\(\s*prefers-reduced-motion\s*\)/gi, "(not all)");

  const patchRules = (rules) => {
    if (!rules) return;
    for (const rule of rules) {
      if (rule.media) {
        const next = rewrite(String(rule.media.mediaText));
        if (next !== rule.media.mediaText) {
          try {
            rule.media.mediaText = next;
          } catch {}
        }
      }
      if (rule.styleSheet) patchSheet(rule.styleSheet);
      else if (rule.cssRules) patchRules(rule.cssRules);
    }
  };
  const patchSheet = (sheet) => {
    try {
      patchRules(sheet.cssRules);
    } catch {}
  };
  const scan = () => {
    for (const s of document.styleSheets) patchSheet(s);
    for (const l of document.querySelectorAll('link[rel="stylesheet"]'))
      l.addEventListener("load", scan, { once: true });
  };

  const start = () => {
    scan();
    new MutationObserver(scan).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  };
  if (document.documentElement) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
