# AutoLocal.ai — Client Dashboard Redesign Spec

**Date:** March 4, 2026
**Status:** Pending Brian's review — DO NOT BUILD YET
**Context:** Current dashboard is unintuitive, bulky, and redundant. This spec redesigns it around inline editing, live preview, and zero accordions.

---

## Problems with Current Dashboard

- Too many accordions — simple edits require opening menus
- Unimportant metrics taking up space (Preview Views, Services Listed, Date Created)
- Text/photo editing buried instead of front and center
- No live preview — user has to leave dashboard to see their site
- Template switching hidden in accordion
- Website URL hidden in accordion
- Site type toggle is a full accordion section for a binary choice
- Action cards (View Site, Connect Domain, Custom Changes) take up too much space

## Design Principles

1. **No accordions.** Everything visible and editable directly.
2. **Edit where you see it.** Click text → type → autosaves.
3. **Live preview.** Every change reflects immediately.
4. **Fun to use.** Template switching should feel like browsing, not configuring.

---

## New Layout

### 1. Header Bar (sticky)

```
[Business Name]  🟢 LIVE  |  yoursite.autolocal.ai [edit]  |  Individual ⟷ Business  |  [View Site ↗]  [Sign Out]
```

- **Business name:** editable inline
- **Website URL:** visible text, editable (for custom domain setup)
- **Site type:** small toggle switch (Individual / Business)
- **Status badge:** 🟢 LIVE or 🟡 DRAFT
- **Billing:** small "Active — $9/mo" text + "Manage" link
- **View Site:** opens full preview in new tab

### 2. Template & Brand Bar

**Template Carousel:**
- 4-5 template thumbnails in a horizontal scrollable strip
- Current template highlighted with border/glow
- Click any thumbnail to switch templates
- Preview updates instantly on switch
- Content stays the same — only design changes

**Brand Controls (inline, no accordion):**
- **Logo:** current logo shown as small thumbnail + "Change" button. Click to upload new logo.
- **Colors:** 3 color circles (primary, secondary, accent). Click any circle to open color picker. Preset palettes available.
- All controls on one row (desktop). Stacks vertically on mobile.

### 3. Live Mini-Preview

- Rendered preview of the actual site (scaled-down iframe or screenshot)
- Updates in real-time as user edits text, swaps templates, or changes colors
- Click preview to open full-size in new tab
- **Desktop:** right side panel (40% width) alongside content editor, OR top section
- **Mobile:** collapsible preview at top with "👁 Show Preview" toggle button

### 4. Content Editor (main area)

All sections visible. All directly editable. Autosave on every field.

#### Hero Section
- **Headline:** click to edit, large text input
- **Tagline/subtitle:** click to edit
- **Hero image:** shown with "Change" overlay on hover, click to upload/replace

#### About
- **About text:** click to edit, textarea with autosave
- Shows character count or preview of how it renders

#### Services
- List of current services, each editable inline (name + description + price)
- **"＋ Add Service"** button at bottom
- Drag to reorder
- **✕** to remove individual services
- Optional: description and price fields per service

#### Hours
- Day-by-day grid, click any time to edit
- Toggle: Open / Closed per day
- **"Copy to all weekdays"** shortcut button

#### Contact Info
- Phone, email, address — each click-to-edit
- Social media links: small icon row, click to add/edit URLs

#### Photos / Gallery
- Grid of current photos
- Drag to reorder
- Click photo → replace or remove options
- **"＋ Add Photos"** button
- First photo = hero image (labeled as such)

### 5. Bottom Section

- **Custom Changes:** compact row — "Need something special? Request a custom change" with text input + submit button + pricing note
- **Feedback:** small "💡 Feedback | 🐛 Bug Report" link
- **Billing:** plan status, next billing date, "Manage Billing" link

---

## Autosave Behavior

- Every field autosaves on blur (when user clicks away) or after 2 seconds of no typing
- Small **"✓ Saved"** indicator appears briefly after each save
- Changes update the live preview immediately
- No "Save" button needed anywhere — it just works
- Error handling: if save fails, show "⚠️ Couldn't save — try again" with retry option

---

## Template Switching

- Carousel at top shows mini-preview thumbnails of all templates
- Current template has a highlight border
- Clicking a new template:
  1. Preview updates instantly
  2. Small toast notification: "Switched to [Template Name] ✓"
  3. Content stays the same — only design changes
  4. Autosaves the selection

---

## Mobile Layout

- **Header:** simplified — URL hidden behind "ℹ️" icon tap
- **Template carousel:** horizontal scroll, smaller thumbnails
- **Preview:** collapsible at top ("👁 Preview" button to expand/collapse)
- **Content editor:** full-width, stacked sections
- Each section has a subtle visual header but NO accordion — everything visible
- Touch-friendly: larger tap targets, swipe to reorder photos/services

---

## What Gets Removed

- ❌ All accordion dropdowns
- ❌ Preview Views metric
- ❌ Services Listed metric
- ❌ Date Created metric
- ❌ "View My Website" / "Connect My Domain" / "Custom Changes" large action cards
- ❌ Separate "Edit Site Content" accordion section
- ❌ Separate "Manage Photos" accordion section
- ❌ Separate "Design Template" accordion section
- ❌ Separate "Customize Your Brand" accordion section
- ❌ Separate "Your Website URL" accordion section
- ❌ Separate "Site Type" accordion section

## What Gets Added

- ✅ Live mini-preview (real-time updating)
- ✅ Template thumbnail carousel (click to switch)
- ✅ Inline editing with autosave on ALL text fields
- ✅ "✓ Saved" indicators after each edit
- ✅ Inline brand controls (logo thumbnail + color circles)
- ✅ Inline photo grid with drag-to-reorder
- ✅ Sticky header with key info always visible
- ✅ Small toggle for site type (not an accordion)

---

## Future Module Tabs

As modules launch, they appear as tabs in the dashboard navigation:

- 🌐 **My Site** (current — this spec)
- ⭐ **Reviews** (Module 1 — Review Responder)
- 📱 **Social** (Module 3 — Social Media Manager)
- 📧 **Email** (Module 4 — Email Marketing)
- 🎨 **Brand Kit** (Module 2 — Logo & Brand Kit)

Locked modules show as grayed-out tabs with "Unlock — $X/mo" on hover/tap.

---

## Technical Notes

### Autosave Implementation
- Debounce: 2 seconds after last keystroke
- API: PATCH to `/api/dashboard/[token]/update` with changed fields only
- Optimistic UI: show "✓ Saved" immediately, roll back if API fails
- Conflict handling: last write wins (single user per dashboard)

### Live Preview
- Option A: Scaled-down iframe of the actual preview page (simplest, real rendering)
- Option B: Screenshot generated on each save (lighter, but delayed)
- Recommendation: Start with iframe (Option A). If performance is an issue, switch to Option B.

### Template Carousel Thumbnails
- Pre-generate a screenshot of each template using the client's actual data
- Store as static images, regenerate on template/content change
- Or: use CSS-scaled mini-iframes per template (heavier but always current)

### Photo Upload
- Drag-and-drop zone on each photo slot
- Upload to Supabase Storage (`client-assets` bucket)
- Max file size: 5MB per image
- Accepted formats: PNG, JPG, WebP
- Auto-compress if over 1MB for performance

---

*Pending Brian's review. Do not build until approved.*
