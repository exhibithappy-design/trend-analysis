I’ll fix the two visible issues directly:

1. **Admin login layout**
   - Wrap the ExhibitHappy logo and login card in a new `.ad-login-stack` container inside `.ad-login`.
   - Make `.ad-login-stack` a centered vertical flex column so the logo sits above the card and the whole stack remains centered in the viewport.
   - Keep the login card at `max-width: 420px` and size the logo with `max-width` so it cannot push the card sideways.

2. **Admin sidebar logo**
   - Keep `AdminLayout.tsx` using the uploaded ExhibitHappy asset for the admin sidebar.
   - Clean `.ad-brand` CSS so it no longer carries old text-brand styling.
   - Remove the unused old `.dot` styling.

3. **Report sidebar logo shown in your screenshot**
   - Replace the hardcoded `/images/exhibit-happy-logo.svg` references in `TrendReport2026.tsx` with the uploaded ExhibitHappy asset import.
   - This addresses the sidebar screenshot that is still pulling the old public logo path instead of the newly uploaded SVG asset.

No backend or unrelated UI changes.