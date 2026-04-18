# Component Audit — XELA Creative Branding Studio

**Date:** 2026-04-04
**Total component files:** 55
**Active (reachable):** 51
**Orphaned:** 4 (2 now fixed, 2 intentionally preserved)

---

## ACTIVE — Direct imports in App.tsx (8 components)

| # | Component | Import Style |
|---|-----------|-------------|
| 1 | `InputForm.tsx` | static import |
| 2 | `Dashboard.tsx` | static import |
| 3 | `PortfolioGallery.tsx` | static import |
| 4 | `LoadingOverlay.tsx` | static import |
| 5 | `LiveAssistant.tsx` | static import |
| 6 | `ProjectsModal.tsx` | static import |
| 7 | `Pricing.tsx` | static import |
| 8 | `XelaLogo.tsx` | static import |

---

## LAZY — Loaded via Dashboard.tsx React.lazy() (44 components)

| # | Component | Import Style |
|---|-----------|-------------|
| 1 | `LogoGenerator.tsx` | React.lazy |
| 2 | `ColorPalette.tsx` | React.lazy |
| 3 | `BusinessCard.tsx` | React.lazy |
| 4 | `LandingPagePreview.tsx` | React.lazy |
| 5 | `SocialProfilePreview.tsx` | React.lazy |
| 6 | `MarketingMaterials.tsx` | React.lazy |
| 7 | `VideoAdGenerator.tsx` | React.lazy |
| 8 | `VinylStickerGenerator.tsx` | React.lazy |
| 9 | `BrandingPackages.tsx` | React.lazy |
| 10 | `BusinessManagementStudio.tsx` | React.lazy |
| 11 | `Launchpad.tsx` | React.lazy |
| 12 | `TypographyStudio.tsx` | React.lazy |
| 13 | `StudioTutorial.tsx` | React.lazy |
| 14 | `Chatbot.tsx` | React.lazy |
| 15 | `AIStudio.tsx` | React.lazy |
| 16 | `SkillScouter.tsx` | React.lazy |
| 17 | `PortfolioGallery.tsx` | React.lazy (also static in App.tsx) |
| 18 | `BrandAssets.tsx` | React.lazy |
| 19 | `BrandIntelligence.tsx` | React.lazy |
| 20 | `AssetUpscaler.tsx` | React.lazy |
| 21 | `AttentionHeatmap.tsx` | React.lazy |
| 22 | `BrandConsistencyChecker.tsx` | React.lazy |
| 23 | `UsageAnalytics.tsx` | React.lazy |
| 24 | `RevenueProjector.tsx` | React.lazy |
| 25 | `InvestorReadyDeck.tsx` | React.lazy |
| 26 | `BrandFlowStatus.tsx` | React.lazy |
| 27 | `AgentMarketplace.tsx` | React.lazy |
| 28 | `BrandBotBuilder.tsx` | React.lazy |
| 29 | `BrandEmployee.tsx` | React.lazy |
| 30 | `CallCoach.tsx` | React.lazy |
| 31 | `SpotlightChallenge.tsx` | React.lazy |
| 32 | `GrantProposalGenerator.tsx` | React.lazy |
| 33 | `BrandAssetBundle.tsx` | React.lazy |
| 34 | `BrandFormatBridge.tsx` | React.lazy |
| 35 | `AIPowerGrid.tsx` | React.lazy |
| 36 | `BrandVault.tsx` | React.lazy |
| 37 | `BrandDNALockbox.tsx` | React.lazy |
| 38 | `DataSovereignty.tsx` | React.lazy |
| 39 | `ProvenanceDashboard.tsx` | React.lazy |
| 40 | `SimulationVisualizer.tsx` | React.lazy |
| 41 | `GuardianCouncil.tsx` | React.lazy |
| 42 | `SentinelDashboard.tsx` | React.lazy |
| 43 | `VoterGeometry.tsx` | React.lazy |
| 44 | `SentinelBadge.tsx` | static import in Dashboard.tsx |

---

## NEWLY WIRED — Previously orphaned, now imported in App.tsx

| # | Component | Placement |
|---|-----------|-----------|
| 1 | `FloatingCTA.tsx` | Bottom of App (always visible, scroll-triggered) |
| 2 | `TrustGuarantee.tsx` | Landing page between Pricing and FAQ sections |

---

## ORPHANED — Not imported anywhere (preserved for future use)

| # | Component | Notes |
|---|-----------|-------|
| 1 | `WhiteLabelExporter.tsx` | White-label export functionality; likely intended for a future Dashboard tab |
| 2 | `NativeExportEngine.tsx` | Multi-format native export; likely intended for a future Dashboard tab |

> **Do not delete** orphaned components. They are candidates for future Dashboard tabs or feature integrations.

---

## Notes

- `PortfolioGallery.tsx` is imported in both App.tsx (static, for landing page) and Dashboard.tsx (lazy, for Dashboard tab). This is intentional.
- `SentinelBadge.tsx` is the only Dashboard sub-component imported statically (not lazy-loaded), likely because it renders inline in the Dashboard header/nav.
- The `components/services/` directory is a subdirectory, not a component file.
