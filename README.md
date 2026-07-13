# Delivery Label Extractor

A mobile-friendly web app for warehouse returns. **Photograph a delivery label,
capture the two numbers that matter, and produce a printable sheet** — replacing
the hand-written return lists.

It reads DSV-style labels where each package has:

- a **delivery / consignment number** — e.g. `NAKD1-8FL64`
- a **reference number** — e.g. `SRV010001` (printed after `Ref:`)

Each row is written as `NAKD1-8FL64/SRV010001 - 7 CLL`, exactly like the manual sheet.

## How it works

1. **Open the app** — it starts on the **Label Extractor** page.
2. **Set the sheet header** — a **Title** (defaults to
   `RETUR BEDRE NÆTTER/SENGEFABRIKKEN`), an editable **Date**, and an optional
   **Pallet** number. Every new sheet gets its own title + date.
3. **Scan a label** — tap *Take a photo of a label*. On a phone this opens the
   camera. The delivery & reference numbers are read automatically and filled
   in. You can rotate the photo, re-scan, or fix any field by hand — the fields
   are always editable. Enter the **CLL** (number of colli) and tap
   *Add to list*. No camera? Use *Add a row by hand*.

   **Rapid capture** (toggle above the camera): each photo is read and added
   as a row automatically — no review/Add tap. On desktop the camera reopens
   itself; on phones tap *Take next photo* for the next label. Rows land in the
   list fully editable, and if a scan finds nothing it drops into the manual
   card so you can type it.

   **Count CLL from packages** (toggle in *Reader* settings): for reconciling
   returns, scan every box. The app also reads the **SSCC serial number** (the
   long barcode at the bottom, unique per box), groups scans by delivery number,
   and sets **CLL = the number of different SSCCs** scanned. Re-scanning the same
   box won't double-count. The sheet then shows one line per delivery number
   (e.g. `NAKD1-8FL64/SRV010001 - 4 CLL`); expand a delivery to see/remove its
   individual boxes.

   **Two readers** (switch with the *Reader* button, top-right):
   - **On-device OCR** (default) — free, no key, works offline; less accurate
     on wrinkled/angled photos. The OCR engine + English model are **self-hosted**
     (`public/tesseract/`), so there's no CDN dependency and nothing leaves the device.
   - **Smart read (AI)** — Claude vision reads even messy labels far more
     reliably. Paste an Anthropic API key once (stored only in your browser;
     usage is billed to your account) and pick a model (Opus 4.8 for accuracy,
     Haiku 4.5 for speed/cost). If an AI read fails, it automatically falls back
     to on-device OCR.
4. **Review the rows** — edit or delete any row inline.
5. **Export / share** using the toolbar:
   - **Excel** — an `.xlsx` spreadsheet (one row per label).
   - **Word** — a printable `.docx` document.
   - **Print** — opens a clean print layout and the browser print dialog.
   - **Email** — opens your mail app with the list pre-filled in the body
     (attach the Excel/Word file you downloaded).

Sheets and rows are saved in the browser (localStorage) so they survive a
reload. Photos are kept only for the current session.

## Tech

- React 19 + TypeScript + Vite + Tailwind
- On-device OCR: [`tesseract.js`](https://github.com/naptha/tesseract.js)
- Optional AI vision: [`@anthropic-ai/sdk`](https://github.com/anthropics/anthropic-sdk-typescript) (Claude vision, in-browser with your key)
- Spreadsheet export: [`exceljs`](https://github.com/exceljs/exceljs)
- Document export: [`docx`](https://github.com/dolanmiu/docx)
- State: `zustand` (persisted)

The OCR engine, the Claude SDK, and the Excel/Word generators are all
**code-split** and load only when first used, so the initial page stays light on
mobile.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # eslint
```

Deploys as a static site — `npm run build` outputs to `dist/` (see `netlify.toml`).
