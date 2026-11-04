# AleXelA Production Standards and Studio Expansion (2026-11-04)

## Non-negotiable production rules
- **Cricut Explore 3**: export true vector SVG with closed paths, simplified nodes, no raster images, solid colors, weedable details, separate cut layers and physical units. No gradients, shadows, glows or textures. Test import and cut preview in Cricut Design Space before claiming verified compatibility.
- **Print stickers**: US Letter landscape (11 × 8.5 in), 300 DPI at final size (3300 × 2550 px), appropriate safe margins, optional bleed, detailed shading and gradients permitted. Export PDF/PNG.
- **BMX**: left/right paired artwork mirrored geometrically, text always left-to-right readable on both sides; head tube is single. Maintain vertical down-tube layout when requested.
- **Heat transfer**: mirror entire image including text when requested, unlike BMX paired artwork.
- **Brand fidelity**: preserve supplied approved logos, wording, subjects, colors and layout; scope edits narrowly.
- **QR**: preserve exact URL, contrast and quiet zone; decode final exported image before declaring verified.
- **Template accuracy**: use verified vendor dimensions for Avery 8859 and other templates, not approximations.
- **Deliverables**: real SVG/PDF/PNG files with size, orientation and mirroring identified; never claim validation that did not run.
- **Safety**: do not claim proprietary software feature parity or import/export compatibility without functional tests.

## Ten prioritized product improvements and acceptance criteria
1. **Unified project editor** — layers, object tree, snapping, guides, undo/redo, autosave, multi-artboard. Acceptance: edits survive reload and export.
2. **Vectorization studio** — bitmap trace with adjustable threshold, smoothing, speck removal, hole handling, curve/node editing, path boolean operations. Acceptance: SVG contains editable paths, not an embedded image.
3. **Cricut cut preparation** — contour simplification, weld/union, offset, cut-layer separation, minimum-detail warnings, real-size preview. Acceptance: cut-ready SVG import test on Explore 3 workflow.
4. **BMX decal pair generator** — mirrored imagery with independently preserved text direction, down-tube presets, head-tube single. Acceptance: both side files show readable text.
5. **Print production engine** — bleed, trim, safe zones, US Letter landscape, 300 DPI, multi-up nesting, crop marks, PDF/PNG export. Acceptance: physical dimensions and print margins validated.
6. **Brand identity engine** — reusable logos, palette, fonts, lockable approved artwork, variants, version history. Acceptance: edits do not alter locked logo.
7. **Marketing template factory** — cards, flyers, door hangers, bookmarks, fridge magnets, shirts, signage, vehicle graphics, social assets. Acceptance: each template has verified physical dimensions.
8. **QR and variable-data designer** — generate and decode-test QR, batch names/contact details, protected quiet zones. Acceptance: decoded export matches destination.
9. **AI creative assistant** — text/image generation and editing with user-owned reference preservation, design briefs, multiple variants, commercial use metadata. Acceptance: user can edit output and inspect provenance.
10. **Preflight and export QA** — check spelling, DPI, vector purity, font outlines, path closure, transparent backgrounds, bleeds, dimensions, and QR readability; create QA report. Acceptance: blockers prevent 'production-ready' label.

## Delivery approach
Implement incrementally behind feature flags, with automated tests and manual device/application verification. Do not advertise CorelDRAW, Cricut Design Space, or image-app equivalence until the specific capability is implemented and verified. Preserve current storefront and payments.

## Source of truth
This file is the product production contract for AleXelA. Align future code, UI presets, agent prompts, and acceptance tests with it. It is a specification, not evidence that the ten features are already coded.
