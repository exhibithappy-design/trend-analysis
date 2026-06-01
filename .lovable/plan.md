## Plan: Replace Natom Pro fonts

Replace the current 2-weight Natom Pro setup (Bold + Regular) with the full 6-weight family from the uploaded `.otf` files.

### Steps

1. **Upload the 6 new font files via Lovable Assets** (keeps binaries out of the repo):
   - `Natom_Pro_Extra_Light.otf` → weight 200
   - `Natom_Pro_Light.otf` → weight 300
   - `Natom_Pro_Regular.otf` → weight 400
   - `Natom_Pro_Medium.otf` → weight 500
   - `Natom_Pro_Bold.otf` → weight 700
   - `Natom_Pro_Black.otf` → weight 900

   Pointer JSONs saved under `src/assets/fonts/`.

2. **Delete old font files** from `public/fonts/`:
   - `NatomPro-Bold.otf`
   - `NatomPro-Regular.otf`

3. **Update `src/pages/HIMSSReport.css`** — replace the two existing `@font-face` blocks with 6 new `@font-face` declarations pointing at the CDN URLs from the asset pointers. Keep `font-family: 'Natom Pro'` so no component CSS needs to change.

4. **Leave** `src/pages/TrendReport2026.css` and `HIMSSReport.css` usages of `font-family: 'Natom Pro'` untouched — they'll pick up the new faces automatically.

### Technical notes
- The existing `HIMSSReport.css` is imported by both report pages, so a single `@font-face` block covers the whole app.
- Asset pointers are imported in a small TS module (e.g. `src/assets/fonts/index.ts`) only if needed; otherwise CSS can reference the CDN URLs directly via a generated string. Simpler path: import each `.asset.json` in `HIMSSReport.tsx` and inject `@font-face` via a `<style>` tag — but cleaner is to hardcode the URLs into the CSS after upload. I'll use the latter.