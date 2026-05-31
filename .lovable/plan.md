

## Plan: Scroll to Top on Page Navigation

When navigating between pages, React Router preserves the scroll position. Fix by adding a `ScrollToTop` component that calls `window.scrollTo(0, 0)` on every route change.

### Changes

**1. Create `src/components/ScrollToTop.tsx`**
A small component that uses `useLocation` from react-router-dom and a `useEffect` to scroll to top on pathname change.

**2. Update `src/App.tsx`**
Add `<ScrollToTop />` inside `<BrowserRouter>`, before `<Routes>`.

### Files modified
- `src/components/ScrollToTop.tsx` (new)
- `src/App.tsx`

### Files untouched
- Everything else

