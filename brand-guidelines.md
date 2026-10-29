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
