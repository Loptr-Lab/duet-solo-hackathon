# Weaver presentation instructions

Before editing Weaver, read brand-guidelines.md and the linked canonical Loptr Lab
Design Bible. Keep 20px default reading text, labels and controls, normal tracking,
neutral near-black surfaces and gold signals rather than gold fills. Use public/style.css
as the single presentation authority; the builder copies it to site/style.css.
Do not edit generated pages as independent designs. Preserve game code, collaboration
content, invitation/privacy boundaries and the existing read-only PIXIE behavior.
Verify the complete rendered page, keyboard paths and enlarged text. Report local,
deployed HTTP and physical-device checks separately. Preview before publication;
no main merge, production promotion or domain change without owner approval.

Owner amendment, 29 October 2026 (PR #105): the private issued-invitation flow
through PIXIE is now in scope, superseding the earlier read-only-helper restriction
for this flow only. Read current sections of docs/provenance/WEAVER_DOOR.md,
OPEN_RESPONSE_PROTOCOL.md and VERIFIED_PROFILE_SYSTEM.md. No unsolicited requests,
real invitation writes, publication or message sending are authorized. Keep mock
identities/provider responses confined to tests; static previews must fail closed.

## Current deployment evidence — binding rule

Before introducing or relying on hosting, storage, authentication or external
services, verify the current authorized deployment and cite the evidence.
Historical imports, configuration examples and passing mocked tests are not
proof of operational availability. Inspect existing solutions before creating
new ones. Report an unresolved dependency instead of choosing infrastructure
without owner direction.
