# PIXIE routes and verification

Checked October 5, 2026. This record distinguishes repository source, rendered public
pages, and service verification. A rendered page does not prove authenticated services,
publishing, remote gameplay, device access, or cross-project synchronization.

## Roles and destinations

| Surface | Destination | Observed boundary |
| --- | --- | --- |
| Public discovery | https://ibloud.github.io/50-ways-to-leave-another/pixie/demo/index.html | Pre-alpha topic discovery and Story Finder routes; Creator routing is a local simulation |
| Creator workspace | https://ibloud.github.io/pixie-creator-os/ | Local preparation and manual sharing; account sign-in and direct publishing disconnected |
| Practice notes | https://ibloud.github.io/pixie-creator-os/session.html | Separate local session and export UI; no recording or instrument connection |
| Additional tools | https://ibloud.github.io/pixie-creator-os/tools.html | Local story/DJ demonstrations; external publishing and account sign-in disconnected |
| Story Finder | https://made-sick.org/story-finder.html | Public-feed search and reviewed ledger export UI; no private mailbox or DM access |
| Device Stewardship | https://ibloud.github.io/pixie-device-stewardship/ | Designed demonstration; no device-file changes or real health-data access |
| Holdings | https://holdings.loptrlab.com/ | Synthetic economics test bench; private adapter implemented/unverified |
| Learning pathways | https://ibloud.github.io/tarantula-clone-hero/ | Early community prototype with separate practice and Creator handoffs |

All destinations above rendered during the review. File import/export, live search,
remote matches, iPad Safari, Files, VoiceOver and provider connections were not tested
by that rendering review. The existing project/research boundaries continue to apply.

## Identity and continuity

The shared manifests in
[Holdings](https://github.com/ibloud/pixie-holdings/blob/main/pixie-continuity.json) and
[Device Stewardship](https://github.com/ibloud/pixie-device-stewardship/blob/main/pixie-continuity.json)
currently agree:

- `did: null`
- `identity_status: "not-configured"`
- `schema_version: "pixie-continuity/v1"`
- `path` values are logical labels; use `source_url` and `web_url`.

`xyz.ibloud.pixie` is a project contract label. The schema version, consent policy,
`active` project status and `https://bsky.social` reference endpoint do not establish
a verified identity, authenticated PDS, implemented rollback across sites or publishing.

Use the [versioned continuity contract](https://github.com/ibloud/pixie-holdings/blob/main/docs/PIXIE-CONTINUITY.md)
and repository manifest for current continuity references. The proposed
`https://holdings.loptrlab.com/pixie` and
`https://holdings.loptrlab.com/pixie/manifest.json` both returned GitHub Pages 404
on October 5, 2026. They must not be presented as working public status endpoints.

## DUET source versus deployment

PR #72 merged as `617dd41cbdb8a496f1ac03e6c5c865785fdaa99b` and changed only
`public/index.html`: discovery labels, a Creator workspace link, and Contribute
pointing to `main/CONTRIBUTING.md`. It did not change the manifests, README or
`duet-review.html`.

The public https://duet.loptrlab.com/ rendered the older "Enter PIXIE" labels,
branch-specific Contribute link and no Creator workspace link on October 5.
The cause and serving revision were not established. A merged commit is not proof
that Cloud Run serves it.

The https://loptr-lab.github.io/duet-solo-hackathon/ review surface is deployed
separately: the Pages workflow copies `duet-review.html` to its site root.
Changing `public/index.html` alone does not update that review surface.

## Next verification and governance

1. Review these continuity corrections independently of the held support/operations PRs.
2. Preserve the external-review hold on #68, #67 and #71. Qualified rules and
   screen-reader feedback must be received and triaged under
   [#69](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/69); hands-on evidence
   remains under [#70](https://github.com/Loptr-Lab/duet-solo-hackathon/issues/70).
   CI and route checks do not close those gates.
3. Reconcile overlapping README edits during the existing eventual order:
   #68, then rebased/reviewed #67, then rebased/reviewed #71. Keep source, proposed
   fixed help and independently observed production behavior distinct.
4. Before any production change, privately establish serving revision, traffic,
   trigger and owner build-approval setting. Keep the Gemini key absent.
   Owner build approval is separate from external review. This continuity change
   authorizes no build approval, deployment, service authentication or traffic change.
5. After an authorized rollout, inspect both public surfaces. Confirm discovery
   and Creator links, `main/CONTRIBUTING.md`, and the separate review-page wording;
   record the serving revision and capture date.
6. Use repository references until dedicated public status endpoints are implemented
   and independently verified. If shared manifests change later, update both copies
   and preserve explicit identity status.
