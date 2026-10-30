# Handshake multiplayer challenge — submission draft

Prepared 30 October 2026. **Not submitted; not yet ready for submission.**
Implementation and automated checks are in PR #106. A public Railway demo is now
deployed and public simulated-client tests passed. Physical-device acceptance,
entrant/project eligibility and actual billing impact remain unverified.

## Form fields

**Project title:** Duet: Solo — Classic Multiplayer

**Project cover image:** Existing project artwork at
https://raw.githubusercontent.com/Loptr-Lab/duet-solo-hackathon/main/.github/social-preview.png
Use only after the owner confirms rights to the submitted artwork and game.

**Project description (draft; use after live acceptance):**

Duet: Solo is an experimental two-player strategy game built around Death,
Rebirth and the Veil. Create a room, share its code, and take turns from separate
phones or computers without creating an account or installing an app. Move by
selecting squares or typing coordinates. Rebirth threatens nearby pieces;
Death provides protection. Victory comes when an opposing Rebirth loses control,
rather than through standard chess checkmate.

The game centers keyboard interaction and readable status announcements.
Independent screen-reader and device acceptance remain ongoing. The temporary
multiplayer demo keeps games in server memory: idle rooms expire and server
restarts clear matches. PIXIE provides fixed game help without a model API.

**Project link/URL:** https://duet-multiplayer-production.up.railway.app

Runtime mode and serving SHA verified through `/api/runtime` on 30 October.
Public simulated-client WebSocket testing passed two rooms, reconnect and a
completed 34-move match. Physical-device and independent accessibility acceptance
remain pending. This is not a submission receipt.

## Eligibility and deadline

Official source supplied by the owner:
https://go.joinhandshake.com/rs/390-ZTF-353/images/%5BAI_Skills_Studio_Challenge%5D_Contest_Official_Rules.pdf?version=0

The PDF specifies entry by **30 October 2026, 11:59 p.m. Pacific Time**
(**31 October 2026, 06:59 London time**). The mission screenshot instead says
October 31. Use the earlier PDF deadline unless the organizer resolves the conflict.
Entries go through the Handshake Create a Multiplayer Game mission.

Before submitting, the entrant must confirm eligible residence and presence,
18/age-of-majority status, an active matching Handshake account, and that Duet
qualifies as a project built with the OpenAI mission. Prior project eligibility
and mission provenance are not established by the code. Do not invent a build
history or claim the organizer has approved an existing project.

Submission grants the promotional usage license described in the official rules.
No form has been submitted and no agreement has been accepted by this work.

## Remaining release checks

- [ ] Verify actual billing impact; owner explicitly authorized metered deployment
      before the November 18 subscription end. Do not renew automatically.
- [ ] Review/merge PR #106 through the repository workflow.
- [x] Deploy Dockerfile.demo with one replica and public HTTPS.
- [x] Verify /api/runtime reports memory-demo and the intended source SHA
      (RAILWAY_GIT_COMMIT_SHA or explicitly set DUET_SOURCE_SHA).
- [ ] Two physical devices create/join a room anonymously; both boards agree.
- [ ] Verify turn enforcement, invalid moves, refresh/rejoin and completed play.
- [ ] Verify two independent rooms and record measured CPU, RAM and egress.
- [ ] Record device/accessibility findings under existing issue #70.
- [x] Add the verified URL to this draft and current-state page source in PR #106.
      Main-site publication still requires the repository merge workflow.
- [ ] Confirm entrant eligibility, project/mission qualification and artwork rights.
- [ ] Enter title, cover image, description and public URL in Handshake before
      the controlling deadline; verify the submission receipt.
