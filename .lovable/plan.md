Plan:

1. Remove the leaking full-width line
   - Override the inherited `.ch` `border-top` specifically on `#cat-functional > .ch` so the original full-bleed category-header border no longer appears at the left and right ends.

2. Keep only one divider
   - Leave the existing `#cat-functional > .ch::after` divider as the single visible line.
   - Keep it constrained to the same content padding values: `64px`, `40px`, and `20px` at the existing breakpoints.

3. Verify against the screenshot issue
   - Confirm the divider is a clean horizontal line across the content area only, with no visible leftover segments at either viewport edge.