import {
  CATALOG_CAPTURED_AT,
  DISCOVERY_PATHS,
  MATURITY_GROUPS,
  PIXIE_SURFACES,
  PROJECTS,
  STATUS_COPY,
} from "./catalog.mjs";

export const STATUS_VALUES = ["implemented", "simulated", "planned", "unverified"];
export const CATEGORY_VALUES = ["play", "create", "discover", "story", "pixie", "development", "archive"];
export const MATURITY_VALUES = ["early", "development", "prototype", "public", "local", "private", "proposal", "archive"];
export const INTENT_VALUES = ["play", "create", "discover", "contribute", "pixie"];

export const SNAPSHOT_NOTE =
  `This is a curated public-source snapshot prepared ${CATALOG_CAPTURED_AT}. ` +
  "The server does not check live pages or deployments; follow the source links to verify current details.";

function normalizeCapability(capability) {
  return {
    status: capability.status,
    label: capability.label,
    note: capability.note ?? null,
  };
}

function normalizeProject(project) {
  return {
    kind: "project",
    id: project.id,
    name: project.name,
    category: project.category,
    categoryLabel: project.categoryLabel,
    maturity: project.maturity,
    maturityGroups: [...(MATURITY_GROUPS[project.id] ?? [])],
    summary: project.summary,
    role: project.pixieRole,
    boundary: null,
    capabilities: project.capabilities.map(normalizeCapability),
    links: project.links.map(({ label, url }) => ({ label, url })),
  };
}

function normalizeSurface(surface) {
  return {
    kind: "pixie_surface",
    id: surface.id,
    name: surface.name,
    category: "pixie",
    categoryLabel: "PIXIE surface",
    maturity: surface.maturity,
    maturityGroups: [...(MATURITY_GROUPS[surface.id] ?? [])],
    summary: surface.role,
    role: surface.role,
    boundary: surface.boundary,
    capabilities: surface.capabilities.map(normalizeCapability),
    links: surface.sources.map(({ label, url }) => ({ label, url })),
  };
}

export const PROJECT_ENTRIES = PROJECTS.map(normalizeProject);
export const SURFACE_ENTRIES = PIXIE_SURFACES.map(normalizeSurface);
export const ALL_ENTRIES = [...PROJECT_ENTRIES, ...SURFACE_ENTRIES];

function entrySearchText(entry) {
  return [
    entry.id,
    entry.name,
    entry.category,
    entry.categoryLabel,
    entry.maturity,
    entry.summary,
    entry.role,
    entry.boundary ?? "",
    ...entry.maturityGroups,
    ...entry.capabilities.flatMap(({ label, note }) => [label, note ?? ""]),
    ...entry.links.map(({ label }) => label),
  ].join(" ").toLocaleLowerCase("en");
}

function matchesStatus(entry, status) {
  return !status || entry.capabilities.some((capability) => capability.status === status);
}

function matchesMaturity(entry, maturityGroup) {
  return !maturityGroup || entry.maturityGroups.includes(maturityGroup);
}

function matchesQuery(entry, query) {
  return !query || entrySearchText(entry).includes(query.toLocaleLowerCase("en").trim());
}

export function searchEcosystem({
  query = "",
  scope = "all",
  category,
  maturity_group: maturityGroup,
  status,
  limit = 10,
  offset = 0,
}) {
  let entries = scope === "projects"
    ? PROJECT_ENTRIES
    : scope === "pixie_surfaces"
      ? SURFACE_ENTRIES
      : ALL_ENTRIES;

  entries = entries.filter((entry) =>
    (!category || entry.category === category) &&
    matchesStatus(entry, status) &&
    matchesMaturity(entry, maturityGroup) &&
    matchesQuery(entry, query)
  );

  const total = entries.length;
  const selected = entries.slice(offset, offset + limit);
  return {
    entries: selected,
    total,
    limit,
    offset,
    hasMore: offset + selected.length < total,
    capturedAt: CATALOG_CAPTURED_AT,
    snapshotNote: SNAPSHOT_NOTE,
  };
}

export function getEcosystemEntry(id) {
  return ALL_ENTRIES.find((entry) => entry.id === id) ?? null;
}

export function listPixieSurfaces({
  query = "",
  maturity_group: maturityGroup,
  status,
  limit = 10,
  offset = 0,
}) {
  const entries = SURFACE_ENTRIES.filter((entry) =>
    matchesStatus(entry, status) &&
    matchesMaturity(entry, maturityGroup) &&
    matchesQuery(entry, query)
  );
  const total = entries.length;
  const selected = entries.slice(offset, offset + limit);
  return {
    surfaces: selected,
    total,
    limit,
    offset,
    hasMore: offset + selected.length < total,
    capturedAt: CATALOG_CAPTURED_AT,
    snapshotNote: SNAPSHOT_NOTE,
  };
}

export function suggestPath(intent) {
  const path = DISCOVERY_PATHS[intent];
  const entries = path.ids.map(getEcosystemEntry).filter(Boolean);
  return {
    intent,
    title: path.title,
    guidance: path.text,
    entries,
    capturedAt: CATALOG_CAPTURED_AT,
    snapshotNote: SNAPSHOT_NOTE,
  };
}

export function getStatusDefinitions() {
  return { ...STATUS_COPY };
}
