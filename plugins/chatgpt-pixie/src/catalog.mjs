/**
 * Curated public ecosystem snapshot. Links point to source pages; tool calls do not crawl or revalidate them.
 * Prepared from the reviewed public ecosystem catalog on 2026-10-14.
 */
export const CATALOG_CAPTURED_AT = "2026-10-14";

export const STATUS_COPY = {
  implemented: "Implemented means the behavior exists in reviewed source or a current demo. It does not prove production completeness or acceptance.",
  simulated: "Simulated means a local or preview-only flow is shown; it does not perform the external action.",
  planned: "Planned means the source describes a proposal or design direction, not a verified implementation.",
  unverified: "Unverified means a deployment, connection, or validation was not established by the reviewed evidence."
};

const profile = (slug) => `https://ecosystem.loptrlab.com/projects/${slug}/`;
const repo = (owner, name) => `https://github.com/${owner}/${name}`;

export const PROJECTS = [
  {
    id: "duet", name: "DUET", category: "play", categoryLabel: "Play & worlds",
    maturity: "Public testing",
    summary: "An accessibility-first solo chess experience with developing social-play pathways.",
    pixieRole: "A narrow, player-facing game-help layer; it is not the game rules engine.",
    capabilities: [
      { status: "implemented", label: "Fixed game help in source", note: "Reviewed code has eight bounded answers and a neutral fallback, without a model call." },
      { status: "unverified", label: "Live revision and full acceptance", note: "The repository leaves current serving revision, real-client checks, and assistive-technology acceptance open." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("duet") },
      { label: "Play DUET", url: "https://duet.loptrlab.com/" },
      { label: "Repository", url: repo("Loptr-Lab", "duet-solo-hackathon") },
      { label: "PIXIE source scope", url: repo("Loptr-Lab", "duet-solo-hackathon") + "/blob/main/agentScope.js" }
    ]
  },
  {
    id: "made-sick", name: "Made Sick", category: "create", categoryLabel: "Creator practice",
    maturity: "Read-only pre-alpha",
    summary: "A creator pathway centered on consent, ownership, and user-chosen care.",
    pixieRole: "A separate care and participation context. It does not make medical claims or require personal disclosure.",
    capabilities: [
      { status: "unverified", label: "Current feature-by-feature behavior", note: "The public profile calls this read-only pre-alpha; this guide does not infer features beyond that description." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("made-sick") },
      { label: "Project site", url: "https://made-sick.org/" },
      { label: "Repository", url: repo("ibloud", "made-sick") },
      { label: "Participation", url: "https://ibloud.github.io/collaborate/" }
    ]
  },
  {
    id: "50-ways", name: "50 Ways to Leave Another", category: "discover", categoryLabel: "Discovery & network",
    maturity: "Creative work in development; discovery pre-alpha",
    summary: "A music-first creative development record with a related public discovery experiment.",
    pixieRole: "The repository documents PIXIE as a bounded discover-and-context guide: suggest paths, explain evidence, and let the visitor choose whether to continue.",
    capabilities: [
      { status: "implemented", label: "Read-only discovery prototype", note: "The current public description identifies a working pre-alpha that searches public Bluesky topics; it has no login, follow, message, or publish connection." },
      { status: "planned", label: "Broader network primitives", note: "The design notes describe future adapters and protocol experiments; these are not proof of deployed integrations." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("50-ways") },
      { label: "Open discovery demo", url: "https://50ways.loptrlab.com/pixie/demo/" },
      { label: "Repository", url: repo("ibloud", "50-ways-to-leave-another") },
      { label: "PIXIE behavior contract", url: repo("ibloud", "50-ways-to-leave-another") + "/blob/main/docs/SUPERME-AI-BUILDER-HANDOFF.md" },
      { label: "AT Protocol design notes", url: repo("ibloud", "50-ways-to-leave-another") + "/blob/main/docs/pixie-atproto.md" }
    ]
  },
  {
    id: "battle-the-beast", name: "Battle the Beast", category: "story", categoryLabel: "Stories & archives",
    maturity: "Narrative archive and prototype",
    summary: "A transformative fan archive exploring fractured timelines, recurring identity, and narrative repair.",
    pixieRole: "No separate PIXIE integration is claimed on the public ecosystem profile.",
    capabilities: [{ status: "unverified", label: "PIXIE integration", note: "The reviewed ecosystem listing does not establish a connected PIXIE surface here." }],
    links: [
      { label: "Ecosystem profile", url: profile("battle-the-beast") },
      { label: "Repository", url: repo("ibloud", "battle-the-beast") }
    ]
  },
  {
    id: "ren-rhapsody", name: "Ren Rhapsody", category: "story", categoryLabel: "Stories & archives",
    maturity: "Public creative study",
    summary: "A creative study with a public evidence ledger.",
    pixieRole: "No separate PIXIE integration is claimed on the public ecosystem profile.",
    capabilities: [{ status: "unverified", label: "PIXIE integration", note: "The reviewed ecosystem listing does not establish a connected PIXIE surface here." }],
    links: [
      { label: "Ecosystem profile", url: profile("ren-rhapsody") },
      { label: "Repository", url: repo("ibloud", "ren-rhapsody") }
    ]
  },
  {
    id: "story-lab", name: "Story Lab", category: "story", categoryLabel: "Stories & archives",
    maturity: "Public story archive and development surface",
    summary: "A story archive and set of experiments connecting Loptr Lab's creative practice.",
    pixieRole: "No shared PIXIE runtime or site integration is established by the listing.",
    capabilities: [{ status: "unverified", label: "PIXIE connection", note: "A cross-project relationship is not the same as a technical connection." }],
    links: [
      { label: "Ecosystem profile", url: profile("story-lab") },
      { label: "Repository", url: repo("ibloud", "ibloud-ivxx-story-lab") }
    ]
  },
  {
    id: "veiled-dominion", name: "Veiled Dominion", category: "play", categoryLabel: "Play & worlds",
    maturity: "Original game system in development",
    summary: "An original strategic system about asymmetry, restraint, consequence, and shared responsibility.",
    pixieRole: "The project describes PIXIE as a non-directive presentation and accessibility layer, distinct from story characters and the game engine.",
    capabilities: [
      { status: "implemented", label: "Opt-in browser reader prototype", note: "A review page uses browser speech synthesis to read the current scene and choices; it does not interpret or choose for the player." },
      { status: "unverified", label: "Production PIXIE runtime and accessibility acceptance", note: "The integration notes explicitly leave runtime and full accessibility validation open." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("veiled-dominion") },
      { label: "Repository", url: repo("Loptr-Lab", "veiled-dominion-engine") },
      { label: "PIXIE reader integration notes", url: repo("Loptr-Lab", "veiled-dominion-engine") + "/blob/main/docs/interactive/PIXIE_50_WAYS_INTEGRATION.md" },
      { label: "Reader review page", url: repo("Loptr-Lab", "veiled-dominion-engine") + "/blob/main/50-ways.html" }
    ]
  },
  {
    id: "violets-revenge", name: "Violet's Revenge", category: "story", categoryLabel: "Stories & archives",
    maturity: "Game development branch",
    summary: "A developing gothic-forensics branch investigating inherited identity.",
    pixieRole: "No separate PIXIE integration is claimed on the public ecosystem profile.",
    capabilities: [{ status: "unverified", label: "PIXIE integration", note: "The reviewed ecosystem listing does not establish a connected PIXIE surface here." }],
    links: [
      { label: "Ecosystem profile", url: profile("violets-revenge") },
      { label: "Repository", url: repo("ibloud", "violets-revenge") }
    ]
  },
  {
    id: "pixie-codex", name: "PIXIE · The Little Black Codex", category: "pixie", categoryLabel: "PIXIE surfaces",
    maturity: "Illustrated development; owner-private preview; payments off",
    summary: "Two matched 54-card decks and an optional listening companion form a separate creative iteration.",
    pixieRole: "This is a narrative and listening expression of PIXIE, not the shared guide runtime or a public installation.",
    capabilities: [
      { status: "planned", label: "Decks and listening companion", note: "The project page describes development work; the decks are not presented as a finished production run." },
      { status: "unverified", label: "Public preview and playlist", note: "The deck preview is owner-private, and no public playlist is claimed." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("pixie-codex") },
      { label: "Training and collaboration", url: "https://loptrlab.com/training" }
    ]
  },
  {
    id: "narrative-provenance", name: "Narrative Provenance", category: "create", categoryLabel: "Creator practice",
    maturity: "Local Obsidian plugin",
    summary: "A local tool for keeping authorship, sources, rights, and creative decisions legible.",
    pixieRole: "A private creator-controlled memory layer; it should not be treated as public PIXIE telemetry.",
    capabilities: [{ status: "implemented", label: "Local Obsidian plugin", note: "The ecosystem listing identifies this as a local plugin; no cross-project data sync is implied." }],
    links: [
      { label: "Ecosystem profile", url: profile("narrative-provenance") },
      { label: "Project site", url: "https://ibloud.github.io/narrative-provenance/" },
      { label: "Repository", url: repo("ibloud", "narrative-provenance") }
    ]
  },
  {
    id: "pixie-creator", name: "PIXIE Creator OS", category: "pixie", categoryLabel: "PIXIE surfaces",
    maturity: "Local workspace prototype",
    summary: "A local-first place to prepare creative work, review its context, and choose a sharing path.",
    pixieRole: "Creator OS prepares; Discovery discovers; any external publication remains an explicit user choice.",
    capabilities: [
      { status: "implemented", label: "Local workspace prototype", note: "The repository describes draft preparation, review, and user-mediated handoffs." },
      { status: "simulated", label: "Routing and external handoff", note: "Routing can be previewed locally; AT Protocol authentication and live publishing are not connected." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("pixie-creator") },
      { label: "Open local workspace", url: "https://ibloud.github.io/pixie-creator-os/" },
      { label: "Repository", url: repo("ibloud", "pixie-creator-os") },
      { label: "Interoperability notes", url: repo("ibloud", "pixie-creator-os") + "/blob/main/interoperability.js" }
    ]
  },
  {
    id: "pixie-device-stewardship", name: "PIXIE Device Stewardship", category: "pixie", categoryLabel: "PIXIE surfaces",
    maturity: "Research and interactive example",
    summary: "Research into accessible ways to name, organize, and return to creative work without forced disclosure.",
    pixieRole: "Canonical for the research, evidence boundaries, methodology, and safety notes—not a claim of full device control.",
    capabilities: [
      { status: "simulated", label: "Local planning example", note: "The example previews a plan; it does not access or rename real device files." },
      { status: "planned", label: "Device-level stewardship", note: "The repository labels native/device integration proposals as staged work, not implemented behavior." },
      { status: "unverified", label: "Connected identity and publishing", note: "The ecosystem page says these connections have not been verified." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("pixie-device-stewardship") },
      { label: "Open example", url: "https://ibloud.github.io/pixie-device-stewardship/" },
      { label: "Repository", url: repo("ibloud", "pixie-device-stewardship") },
      { label: "Safety and privacy", url: repo("ibloud", "pixie-device-stewardship") + "/blob/main/SAFETY-AND-PRIVACY.md" }
    ]
  },
  {
    id: "pixie-discovery", name: "PIXIE Public Discovery", category: "pixie", categoryLabel: "PIXIE surfaces",
    maturity: "Working read-only pre-alpha; stable-release review remains open",
    summary: "Search public Bluesky topics and explore bounded suggestions with visible retrieval context.",
    pixieRole: "Discover and explain public signals, then let the visitor decide whether to follow a link or stop.",
    capabilities: [
      { status: "implemented", label: "Public read-only topic search", note: "The project page describes a public AppView search demo. It has no login, follow, message, or publish connection." },
      { status: "unverified", label: "Stable release and broader validation", note: "The public page says stable-release review remains open." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("pixie-discovery") },
      { label: "Open discovery demo", url: "https://50ways.loptrlab.com/pixie/demo/" },
      { label: "Repository", url: repo("ibloud", "50-ways-to-leave-another") },
      { label: "Read-only engine", url: repo("ibloud", "50-ways-to-leave-another") + "/blob/main/pixie/v0.1/README.md" },
      { label: "Behavior contract", url: repo("ibloud", "50-ways-to-leave-another") + "/blob/main/docs/SUPERME-AI-BUILDER-HANDOFF.md" }
    ]
  },
  {
    id: "pixie-holdings", name: "PIXIE Holdings / PIXIE OS", category: "pixie", categoryLabel: "PIXIE surfaces",
    maturity: "Executable prototype",
    summary: "A companion test bench for creator capacity, resource allocation, and receipt preparation.",
    pixieRole: "A portfolio steward that previews consequences and asks before an external action; not a general agent with blanket authority.",
    capabilities: [
      { status: "implemented", label: "Runnable prototype and MCP tools", note: "The repository describes a Node app and a bounded MCP surface for local evaluation and previews." },
      { status: "simulated", label: "Public receipt preparation", note: "Receipt preparation is preview-only; live AT Protocol record publication was not verified." },
      { status: "unverified", label: "Cross-project runtime", note: "A continuity contract documents direction and routes; it does not grant remote control or prove integration." }
    ],
    links: [
      { label: "Ecosystem profile", url: profile("pixie-holdings") },
      { label: "Open PIXIE OS", url: "https://holdings.loptrlab.com/" },
      { label: "Repository", url: repo("ibloud", "pixie-holdings") },
      { label: "Continuity contract", url: repo("ibloud", "pixie-holdings") + "/blob/main/docs/PIXIE-CONTINUITY.md" }
    ]
  },
  {
    id: "story-finder", name: "Made Sick Story Finder", category: "discover", categoryLabel: "Discovery & network",
    maturity: "Working read-only public-feed tool",
    summary: "Find passages in one public Bluesky author feed and collect references for a story.",
    pixieRole: "A bounded research path associated with Discovery; it is not a publishing or messaging agent.",
    capabilities: [{ status: "unverified", label: "Current public-feed behavior", note: "The ecosystem homepage labels it working and read-only; this guide did not independently exercise the tool." }],
    links: [
      { label: "Ecosystem profile", url: profile("story-finder") },
      { label: "Participation", url: "https://ibloud.github.io/collaborate/" }
    ]
  },
  {
    id: "break-this-build", name: "Break This Build", category: "development", categoryLabel: "Development & review",
    maturity: "Public development and review surface",
    summary: "A public development home for creative review, game prototypes, and documented decisions.",
    pixieRole: "A host for review surfaces; this guide does not infer that every project page embeds PIXIE.",
    capabilities: [{ status: "unverified", label: "Shared PIXIE runtime", note: "A public review surface is not evidence of an embedded or shared assistant." }],
    links: [
      { label: "Ecosystem profile", url: profile("break-this-build") },
      { label: "Open review site", url: "https://break.loptrlab.com/" },
      { label: "DUET source repository", url: repo("Loptr-Lab", "duet-solo-hackathon") }
    ]
  },
  {
    id: "daddys-little-mortis", name: "Daddy's Little Mortis", category: "story", categoryLabel: "Stories & archives",
    maturity: "Public project surface; implementation not assessed",
    summary: "A distinct creative presence in the Loptr Lab ecosystem.",
    pixieRole: "No PIXIE capability is asserted here without reviewed project evidence.",
    capabilities: [{ status: "unverified", label: "Implementation and PIXIE role", note: "The ecosystem directory explicitly says implementation was not assessed." }],
    links: [
      { label: "Ecosystem profile", url: profile("daddys-little-mortis") },
      { label: "Project site", url: "https://www.daddyslittlemortis.com/" }
    ]
  },
  {
    id: "tumblr-archive", name: "Loptr Lab Tumblr archive", category: "archive", categoryLabel: "Stories & archives",
    maturity: "Public archive",
    summary: "A separate public archive and discovery surface.",
    pixieRole: "No shared runtime or data connection is claimed by the directory entry.",
    capabilities: [{ status: "unverified", label: "PIXIE integration", note: "This catalog entry does not establish a connected PIXIE surface." }],
    links: [
      { label: "Ecosystem profile", url: profile("tumblr-archive") },
      { label: "Open Tumblr archive", url: "https://loptrlab.tumblr.com/" }
    ]
  }
];

export const PIXIE_SURFACES = [
  {
    id: "surface-discovery", name: "Public Discovery", project: "50 Ways to Leave Another",
    maturity: "Working read-only pre-alpha",
    role: "Discover public conversations and topics, show why a result appeared, offer a bounded path, and let the visitor release it.",
    boundary: "No login, following, messaging, publishing, automatic introduction, or verified production connection is claimed.",
    capabilities: [
      { status: "implemented", label: "Read-only public search" },
      { status: "unverified", label: "Stable release review" }
    ],
    sources: [
      { label: "Live demo", url: "https://50ways.loptrlab.com/pixie/demo/" },
      { label: "Engine notes", url: repo("ibloud", "50-ways-to-leave-another") + "/blob/main/pixie/v0.1/README.md" },
      { label: "Behavior contract", url: repo("ibloud", "50-ways-to-leave-another") + "/blob/main/docs/SUPERME-AI-BUILDER-HANDOFF.md" }
    ]
  },
  {
    id: "surface-creator", name: "Creator OS", project: "PIXIE Creator OS",
    maturity: "Local workspace prototype",
    role: "Prepare creative work locally, review context and provenance, then choose a sharing route at the user's pace.",
    boundary: "External authentication and live AT Protocol publishing are not connected; handoffs remain user-mediated.",
    capabilities: [
      { status: "implemented", label: "Local draft and review workspace" },
      { status: "simulated", label: "Routing and publication paths" }
    ],
    sources: [
      { label: "Live workspace", url: "https://ibloud.github.io/pixie-creator-os/" },
      { label: "Repository", url: repo("ibloud", "pixie-creator-os") },
      { label: "Interoperability module", url: repo("ibloud", "pixie-creator-os") + "/blob/main/interoperability.js" }
    ]
  },
  {
    id: "surface-device", name: "Device Stewardship", project: "PIXIE Device Stewardship",
    maturity: "Research and interactive example",
    role: "Make planning around creative files more accessible, inspectable, and user-controlled.",
    boundary: "The browser demo plans with examples; it does not inspect or rename device files. Native integration remains proposed or unverified.",
    capabilities: [
      { status: "simulated", label: "Local planning example" },
      { status: "planned", label: "Native/device access" },
      { status: "unverified", label: "Connected identity and publishing" }
    ],
    sources: [
      { label: "Live example", url: "https://ibloud.github.io/pixie-device-stewardship/" },
      { label: "Repository", url: repo("ibloud", "pixie-device-stewardship") },
      { label: "Safety and privacy", url: repo("ibloud", "pixie-device-stewardship") + "/blob/main/SAFETY-AND-PRIVACY.md" }
    ]
  },
  {
    id: "surface-holdings", name: "Holdings / PIXIE OS", project: "PIXIE Holdings / PIXIE OS",
    maturity: "Executable prototype",
    role: "Preview resource choices and consequences in a bounded test bench; explain the next step before the user acts.",
    boundary: "Receipt preparation is preview-only. A continuity manifest describes roles and routes; it is not a remote-control permission or proof of integration.",
    capabilities: [
      { status: "implemented", label: "Runnable prototype" },
      { status: "simulated", label: "Public receipt preparation" },
      { status: "unverified", label: "Cross-project runtime" }
    ],
    sources: [
      { label: "Live test bench", url: "https://holdings.loptrlab.com/" },
      { label: "Repository", url: repo("ibloud", "pixie-holdings") },
      { label: "Continuity contract", url: repo("ibloud", "pixie-holdings") + "/blob/main/docs/PIXIE-CONTINUITY.md" }
    ]
  },
  {
    id: "surface-duet", name: "DUET game help", project: "DUET",
    maturity: "Fixed-answer source implementation; deployment and acceptance pending",
    role: "Answer a small allowlist of questions about DUET rules, controls, and accessibility; give a neutral fallback otherwise.",
    boundary: "This is product-specific help, not a general knowledge agent. It does not call a model or decide gameplay.",
    capabilities: [
      { status: "implemented", label: "Eight fixed answers in source" },
      { status: "unverified", label: "Current served build and assistive-technology acceptance" }
    ],
    sources: [
      { label: "DUET README", url: repo("Loptr-Lab", "duet-solo-hackathon") + "/blob/main/README.md" },
      { label: "Answer scope", url: repo("Loptr-Lab", "duet-solo-hackathon") + "/blob/main/agentScope.js" },
      { label: "Live acceptance notes", url: repo("Loptr-Lab", "duet-solo-hackathon") + "/blob/main/docs/PIXIE_LIVE_CHECK.md" }
    ]
  },
  {
    id: "surface-veiled", name: "Opt-in reader", project: "Veiled Dominion / 50 Ways review page",
    maturity: "Browser review integration",
    role: "Read the current scene and available choices aloud on request using the browser's speech synthesis.",
    boundary: "It does not interpret the story or choose for the player. It is explicitly not a production PIXIE runtime or validated production Ink integration.",
    capabilities: [
      { status: "implemented", label: "Read/stop browser prototype" },
      { status: "unverified", label: "Production integration and accessibility conformance" }
    ],
    sources: [
      { label: "Reader review page", url: repo("Loptr-Lab", "veiled-dominion-engine") + "/blob/main/50-ways.html" },
      { label: "Integration boundaries", url: repo("Loptr-Lab", "veiled-dominion-engine") + "/blob/main/docs/interactive/PIXIE_50_WAYS_INTEGRATION.md" }
    ]
  },
  {
    id: "surface-training", name: "Announcer track", project: "Loptr Lab training",
    maturity: "Proposed design and learning path",
    role: "Define how a PIXIE presentation layer might receive and announce project events from an explicit contract.",
    boundary: "Training material is guidance, not a running PIXIE app, shared protocol, room service, or deployment contract.",
    capabilities: [
      { status: "planned", label: "Presentation/event contract exercises" },
      { status: "unverified", label: "Shared runtime and site integration" }
    ],
    sources: [
      { label: "PIXIE Announcer Track", url: repo("Loptr-Lab", "training") + "/blob/main/docs/PIXIE_ANNOUNCER_TRACK.md" },
      { label: "Training repository", url: repo("Loptr-Lab", "training") }
    ]
  },
  {
    id: "surface-codex", name: "The Little Black Codex", project: "PIXIE Codex",
    maturity: "Illustrated development; owner-private preview",
    role: "A narrative, symbolic, and optional listening expression of PIXIE, distinct from software runtime behavior.",
    boundary: "The project page says the proposed codex domain is not connected, the preview is owner-private, and no public playlist is claimed.",
    capabilities: [
      { status: "planned", label: "Deck and companion content" },
      { status: "unverified", label: "Public preview and connected music release" }
    ],
    sources: [
      { label: "Codex project page", url: profile("pixie-codex") },
      { label: "Training and collaboration path", url: "https://loptrlab.com/training" }
    ]
  }
];

export const MATURITY_GROUPS = {
  duet: ["early"],
  "made-sick": ["early"],
  "50-ways": ["early", "development"],
  "battle-the-beast": ["prototype"],
  "ren-rhapsody": ["public"],
  "story-lab": ["public", "development"],
  "veiled-dominion": ["development"],
  "violets-revenge": ["development"],
  "pixie-codex": ["development", "private"],
  "narrative-provenance": ["local"],
  "pixie-creator": ["local", "prototype"],
  "pixie-device-stewardship": ["prototype"],
  "pixie-discovery": ["early"],
  "pixie-holdings": ["prototype"],
  "story-finder": ["early", "public"],
  "break-this-build": ["public", "development"],
  "daddys-little-mortis": ["public"],
  "tumblr-archive": ["public", "archive"],
  "surface-discovery": ["early"],
  "surface-creator": ["local", "prototype"],
  "surface-device": ["prototype", "proposal"],
  "surface-holdings": ["prototype"],
  "surface-duet": ["early"],
  "surface-veiled": ["prototype"],
  "surface-training": ["proposal"],
  "surface-codex": ["development", "private"]
};

export const DISCOVERY_PATHS = {
  play: {
    title: "Find a place to play",
    text: "Start with the public DUET experience or explore Veiled Dominion's current review surface. PIXIE stays in the support layer; the work retains its own rules and story authority.",
    ids: ["duet", "veiled-dominion", "50-ways"]
  },
  create: {
    title: "Prepare or care for creative work",
    text: "Creator OS is the local workspace prototype; Device Stewardship documents careful file-planning boundaries; Narrative Provenance keeps a separate local record. Their capabilities are not interchangeable.",
    ids: ["pixie-creator", "pixie-device-stewardship", "narrative-provenance"]
  },
  discover: {
    title: "Explore public material",
    text: "Public Discovery is the clearest PIXIE discovery route. It is read-only in its current pre-alpha; suggestions are context, not claims about a person.",
    ids: ["pixie-discovery", "story-finder", "50-ways"]
  },
  contribute: {
    title: "Find a continuation path",
    text: "Use the project profile and linked repository to check scope before contributing. Where no repository or issue path is linked, start with the ecosystem's participation page instead of guessing.",
    ids: ["duet", "pixie-creator", "pixie-holdings"]
  },
  pixie: {
    title: "Compare PIXIE's different iterations",
    text: "These surfaces share a name and design lineage, not a proven common runtime. Read each role, maturity label, and boundary before assuming one can do another's job.",
    ids: ["pixie-discovery", "pixie-creator", "pixie-device-stewardship", "pixie-holdings"]
  }
};
