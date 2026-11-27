# Roadmap

| Milestone | Status | Acceptance |
| --- | --- | --- |
| Own brand and support surfaces | Implementation proposed | Review diff and attribution audit |
| Restore native CI and retain NAVI pilot | Verified on f918746 | Required checks execute and pass on main-targeted PR |
| Public data contracts | Existing implementation; review pending | Schema, provenance and offline fixtures pass |
| Visual integration with profile and Abyss | Existing renderer; visual acceptance pending | Browser/mobile/accessibility smoke |
| Public API deployment | Not approved | Security review, token boundary and explicit release decision |

Do not treat implementation as validated production readiness. Update status with actual evidence.

Dependency audit: 28 flagged package entries remediated; full and production audit both zero on f918746. The permanent gate rejects new known advisories. Public API deployment review remains mandatory. Keep Scorecard on the default branch per upstream guidance; PR CodeQL and NAVI/native gates remain.

Universe homepage branding is in review. Verify the two-column header on desktop and its single-column layout on mobile before updating the profile publication pin.
