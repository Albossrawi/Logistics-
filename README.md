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
   camera. The photo is read **on-device** (no internet needed for a key, no data
   leaves the browser) and the delivery & reference numbers are filled in
   automatically. You can rotate the photo, re-scan, or fix any field by hand —
   the fields are always editable. Enter the **CLL** (number of colli) and tap
   *Add to list*. No camera? Use *Add a row by hand*.
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
- Spreadsheet export: [`exceljs`](https://github.com/exceljs/exceljs)
- Document export: [`docx`](https://github.com/dolanmiu/docx)
- State: `zustand` (persisted)

The OCR engine and the Excel/Word generators are **code-split** and load only
when first used, so the initial page stays light on mobile.

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run lint     # eslint
```

> This repo also contains a separate `LogisticAI` analytics dashboard (reachable
> from the sidebar); the Label Extractor is the default landing page.
