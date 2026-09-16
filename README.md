# Force Motion

<p align="center">
  <img src="icons/on128.png" width="88" alt="Force Motion play icon">
</p>

I like motion on websites. Hover states, page transitions, the small interactions people actually design. I do not want that in macOS. The dock, Mission Control, and the rest of the system chrome feel better with Reduce Motion on.

So the OS setting stays on, and this toggle tells the browser that pages should see `prefers-reduced-motion: no-preference`.

No popup, no settings page. A few kilobytes.

| Icon | Color | What pages see |
| --- | --- | --- |
| Play | Purple | `prefers-reduced-motion: no-preference` |
| Pause | Gray | Whatever the OS reports. Reloads this tab only. |

Other tabs stay put until you refresh them.

## Install

### Chromium

Chrome, Edge, Brave, and Arc on version 121 or newer.

1. Open `chrome://extensions`
2. Turn on Developer mode
3. **Load unpacked** and pick this folder

### Firefox

Firefox 128 or newer.

1. Open [`about:debugging#/runtime/this-firefox`](about:debugging#/runtime/this-firefox)
2. **Load Temporary Add-on**
3. Choose [`manifest.json`](manifest.json)

> [!NOTE]
> A temporary Firefox add-on is gone the next time you quit the browser. Load it again from this folder, or sign it through [addons.mozilla.org](https://addons.mozilla.org/) if you want it to stick.

> [!TIP]
> After install, open [`check.html`](check.html). Both the JS line and the CSS line should say `MOTION OK` while the toggle is on.

> [!IMPORTANT]
> `file://` pages only see the script if you allow the extension access to file URLs. Chrome puts that toggle on the extension's details page.

## How it works

Chrome runs [`background.js`](background.js) as a Manifest V3 [service worker](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers). Firefox uses the same file as an [event page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts). [MDN documents that split](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background#cross-browser_manifest_v3_background_scripts): both `service_worker` and `scripts` live in the manifest, and each browser picks the one it supports.

<details>
<summary>What the injected script changes</summary>

With the toggle on, [`inject.js`](inject.js) starts in the page's main world before the site's own scripts:

- `matchMedia('(prefers-reduced-motion: …)')` reports no preference
- `@media (prefers-reduced-motion)` rules the script can read get rewritten so the reduce branch does not apply

</details>

> [!WARNING]
> Stylesheets from another origin that hide `cssRules` stay untouched. Same-origin CSS and most JS motion libraries are covered.

Nothing is sent anywhere. The only stored value is a boolean in `chrome.storage.local`. Firefox also declares [`data_collection_permissions`](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/) as `none`.

## License

[MIT](LICENSE)
