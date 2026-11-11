# AleXelA finishing studio release

## Ten improvements to logo, card and flyer generation

1. Download real PDF files, without depending on a browser print dialog.
2. Export business cards as an exact 3.5 × 2 inch, two-page front/back PDF.
3. Export full-resolution PNGs at 300 pixels per inch of intended trim size.
4. Download editable SVG layout files with physical inch dimensions and live text.
5. Preserve uploaded logo proportions with contain scaling; no cropping or recoloring.
6. Create transparent logo wordmarks and mirror the entire logo for heat transfer.
7. Generate QR images locally, with black-on-white contrast and four-module quiet zones.
8. Decode the final full-size QR-bearing artwork and compare its exact normalized destination before export.
9. Block missing names, slogans and customer contact details; remove invented contact placeholders from legacy proofs.
10. Escape customer text, fit long logo names, preserve liked concepts during randomization and expose editable content in the finishing studio.

## Ten efficiency improvements

1. Use a 185,528-byte WebP display derivative instead of the 2,879,673-byte master PNG in homepage branding. Keep the approved original unchanged.
2. Load portfolio code as the section approaches the viewport.
3. Load product-catalog code as its section approaches the viewport.
4. Load the finishing-studio UI only when opened.
5. Load the PDF, QR encoder and QR decoder libraries on demand.
6. Reuse in-flight/completed QR generation promises for identical destinations.
7. Bound the QR cache to 24 destinations.
8. Memoize the live SVG proof and brief inspection; avoid recomputing on status-only updates.
9. Render logo concepts in batches of 36 with an explicit show-more control.
10. Apply immutable caching to hashed build assets and content visibility to long, below-fold sections.

These are concrete efficiency changes; a tenfold improvement in whole-site speed has not been established.

## Other corrections

- Replace “One vision. Every touchpoint.” with “From idea. To income.”
- Put the approved logo at the X position in the AleXelA header/footer wordmark and standalone document headers.
- Keep Colossians 3:23 in the purpose section.
- Include a simple logo/wordmark concept and slogan options in the $75 card package; include logo setup in Sticker System and its inheriting packages. Existing approved logos may be supplied instead.
- Regenerate the compact downloadable pricing PDF from the current catalog.
- Accept a valid service-account project_id for Firebase without requiring redundant FIREBASE_PROJECT_ID configuration.

## Verification and limits

TypeScript, Vitest, and the production build are run before publication. The test suite checks physical SVG sizes, escaping, transparent/mirrored logo output, contact prerequisites, normalized QR destinations, encoder/decoder agreement and service-account configuration, alongside existing site/pricing/intake tests.

Design SVGs retain live text and may contain uploaded raster logos. They are explicitly not labeled as Cricut cut-ready files. No font outlining, path boolean editor, automatic raster tracing, Avery 8859 sheet imposition, printer-specific bleed or CMYK profiling is claimed by this release. PNGs have the correct pixel dimensions for 300 PPI at trim size; physical size is explicit in SVG and PDF. QR verification applies to finishing-studio downloads, not every legacy print preview. PDF pages contain the checked 300-PPI artwork. The finishing studio supplies its own editable layout, rather than exporting every decorative legacy preview effect.

Full AI generation, payments and authenticated financial services depend on production provider configuration. Configuration detection is not a successful provider transaction or payment test.
