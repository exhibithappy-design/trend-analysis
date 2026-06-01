## Changes

1. **Upload the black texture as a Lovable asset**
   - Run `lovable-assets create --file /mnt/user-uploads/Black_Background.jpg --filename black-background.jpg > src/assets/black-background.jpg.asset.json`

2. **`src/pages/admin/Login.tsx`**
   - Import the new asset JSON.
   - Remove the three `<span className="ad-orb …" />` elements and the `<span className="ad-grid" />` from `.ad-login-bg`.
   - Apply the texture as the background via inline style (or a new class) using the asset URL.
   - Add a dark overlay element on top of the image.

3. **`src/pages/admin/admin.css`**
   - Remove (or leave unused) the `.ad-orb*`, `ad-float*` keyframes, and `.ad-grid` rules tied to the login background.
   - Update `.ad-login-bg` to render the texture with `background-size: cover; background-position: center;` and add an overlay rule (e.g. `.ad-login-overlay` with `background: rgba(0,0,0,0.55)`).
   - Keep card glassmorphism and all other styling intact.

No logic, auth, or layout changes.