# Weaver: Loptr Lab brand application

Owner direction: 29 October 2026. This is a site application of the existing
[Loptr Lab Design Bible](https://github.com/Loptr-Lab/veiled-dominion-engine/blob/main/docs/design/DESIGN_BIBLE.md), not a replacement identity or change to game/story canon.

Read the Design Bible and this file before Weaver presentation changes. Keep near-black #050505, neutral-gray reading text #e0e0e0, Helvetica Neue/Helvetica/Arial,
and restrained #d4a853 gold for links, labels, outlines and focus. Gold is a signal,
not a surface fill. The preview's #ababab supporting text is an accessibility-derived
neutral; do not use the Bible's historical #666 on black for small readable text.

20px default body, labels and controls are retained. Major title uses the studio
sans, normal tracking and responsive display size. Group headings, titles, body
and labels semantically; do not use tiny uppercase mono labels or tall empty
hero panels. Bounded prose, stable gutters and 8/16/24/32/48/64-style spacing
express hierarchy. Neutral surfaces group only meaningful comparative content.

public/style.css is the single authoritative stylesheet for this static site.
The existing builder copies it byte-for-byte into site/style.css and normalizes
source/alias URLs. All Weaver presentation is scoped under html.weaver to protect
the existing game and current-state review. No per-page embedded presentation or
runtime framework is added. Game mechanics and its independent runtime are outside
this correction. Source public/weaver/index.html builds the published entrance and
/weaver alias. Do not edit generated copies as separate themes.

Material 3 supplies semantic roles, hierarchy, adaptive layouts and component/state
logic. References: https://m3.material.io/ and the owner-supplied third-party skill
https://github.com/skydashnet/material-design-3-ui-skill . Material defaults do not
override the studio identity. Preserve the existing read-only/invitation boundaries,
content and fixed informational PIXIE panel; do not add interaction, accounts, model
calls or new participation gates. Keep explicit button state, visible focus,
Escape recovery, skip navigation, 48px targets, text scaling and reduced motion.

Check actual contrast (normal text 4.5:1, large text/UI 3:1), phone/tablet/wide
layouts, breakpoints, enlarged text and keyboard. Do not claim physical Safari,
VoiceOver, legal validation or official Material certification from local tests.

This amendment stays on the existing review/weaver-low-vision branch and requires
preview review before merge or publication. No DNS, game rules, hosting migration,
server storage or production promotion is authorized.

## Proposed invitation flow — PR #105, 29 October 2026

The owner's newer instruction explicitly supersedes this file's earlier “read-only PIXIE / do not add interaction” restriction for the private, issued-invitation acceptance flow only. Public participation remains closed; no unsolicited request form is permitted. Account control, named-person verification, approval and explicit acceptance are different states. The versioned acceptance notice does not adopt disputed history, create a relationship, transfer/waive rights, authorize publication or accept collaboration terms.

Implementation is proposed on the same review branch, not approved for publication. Use public/style.css and the existing builder for controls and aliases. Preserve the 20px default, normal tracking, bounded text, keyboard/Escape recovery, safe-area helper placement and reduced motion. The PIXIE helper reuses the Companion's unchanged sigil at the pinned pixie-ecosystem-guide commit 0d049b8114c09991ce0382e38661ae72dad64a02; no new PIXIE artwork is generated. Its remote asset is an explicit availability dependency.

The Weaver's mark uses the owner's exact inline SVG supplied in this review: outer ring, W-shaped thread, nested diamonds and breathing core. It sits inside header before .hero, with the supplied 7-second pulse, narrow-screen placement and reduced-motion fallback. Only the existing header rule is amended for its layout reservation; public/style.css stays authoritative. The Yellow Door footer destination is the owner-supplied https://ibloud.github.io/inpatient-corridors-review/interactive/yellow-door/docs/ . The missing local commit 0185c72 was not recoverable here; the pasted SVG/CSS is the authoritative recovery source. No earlier rejected private wording was recovered from that worktree. Existing narrative and game links remain intact.

Static review deployment must show backend unavailability, not synthetic identity or acceptance success. A Germ handoff is a person-controlled external navigation after durable acceptance, never an automated notification or delivery claim. Provider and owner-authorization failures leave privileged actions unavailable. Publication, real invitation changes, message sending and domain changes remain unauthorized.

The later Railway integration amendment makes PIXIE Companion the proposed private response runtime. The Weaver helper offers a navigation link to that scoped view, without copying login cookies, tokens or private invitation data between sites. Public Weaver keeps its approved marks, 20px reading scale and independent game links. This does not restrict Companion's general open recruitment: issued-invitation eligibility applies only to Weaver.
