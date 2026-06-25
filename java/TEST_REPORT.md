# Test report - clean package

Date: 2026-06-25

Package tested: `j2mejs_jarnova_clean`

Important difference from previous ZIP:

- This is a **clean runtime package**. It does not contain the old Chinese upload launcher files:
  - no `index.js`
  - no `gamelist.js`
  - no `indexbatch.html`
  - no `updatelog.html`
  - no old demo `jar/*.jar`
- Root `index.html` is the new launcher.
- Put games directly into root `jar/`.

Browser test:

1. Temporarily copied `BounceTales.jar` into `jar/`.
2. Ran `python tools/generate-games-list.py`.
3. Ran `python -m http.server 8788`.
4. Opened `http://127.0.0.1:8788/` with Chromium headless via Playwright.
5. Verified:
   - launcher title is `J2meJS - Chơi game JAR trên máy chủ`;
   - no visible/local JAR upload launcher on `index.html`;
   - `BounceTales.jar` appears in the server JAR list;
   - click opens iframe to `main.html?jars=jar%2FBounceTales.jar...`;
   - runtime + game JAR loaded (`JARStore.getjars().size == 2`);
   - MIDlet detected: `RMIDlet`;
   - canvas initialized successfully.

Final ZIP note:

The temporary test game JAR was removed before packaging. Add your own `.jar` files to `jar/`, run `startserver.bat`, and the launcher will generate `games.js` automatically.
