## Plan

1. Upload the ExhibitHappy SVG to Lovable Assets via `lovable-assets create` from `/mnt/user-uploads/ExhibitHappy_-_Primary_horizontal_lockup.svg`, writing the pointer to `src/assets/exhibithappy-logo.svg.asset.json`.
2. Update `src/components/admin/AdminLayout.tsx` to replace the current sidebar brand (the "Steelhead admin" text/dot) with an `<img>` of the ExhibitHappy logo. Constrain height (~28px) and keep it left-aligned in the existing sidebar header.
3. Update `src/pages/admin/Login.tsx` to render the same logo centered above the auth card (replacing the empty bordered placeholder visible in the screenshot). Width ~220px, with spacing below before the card.
4. Add minimal styles in `src/pages/admin/admin.css` for `.admin-brand-logo` (sidebar) and `.admin-login-logo` (login) — size, margin, and `display:block`.

No backend or routing changes.
