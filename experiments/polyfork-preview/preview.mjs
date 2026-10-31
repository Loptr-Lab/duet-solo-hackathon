import { fixtures } from "./fixtures.mjs";
import { entries, squareAt, positionAt, stateLabel } from "./model.mjs";
import { assetSources, licenseReviewed } from "./asset-sources.mjs";

const viewport = document.querySelector("#viewport");
const status = document.querySelector("#status");
const fixtureSelect = document.querySelector("#fixture");
let fixture = fixtures[0];
let graphics = null;
let currentView = "white";
let generation = 0;
let booting = false;
const diagnostics = {
  renders: 0,
  assets: {},
  ready: false,
  closed: false,
  pieces: [],
  tiles: 64,
};
// Read-only development evidence; no gameplay methods or live match connection.
Object.defineProperty(window, "duetPreviewDiagnostics", {
  get: () => structuredClone(diagnostics),
});

function describe() {
  document.querySelector("#fixture-title").textContent = fixture.title;
  document.querySelector("#fixture-description").textContent =
    fixture.description;
  const rows = entries(fixture);
  diagnostics.pieces = rows;
  const table = document.querySelector("#piece-list");
  table.replaceChildren(
    ...rows.map((piece) => {
      const tr = document.createElement("tr");
      for (const value of [
        piece.square,
        `${piece.color === "w" ? "White" : "Black"} ${piece.name}`,
        stateLabel(piece),
      ]) {
        const td = document.createElement("td");
        td.textContent = value;
        tr.append(td);
      }
      return tr;
    }),
  );
  graphics?.drawFixture();
}
function message(text) {
  status.textContent = text;
}
function fallback(text) {
  viewport.classList.add("failed");
  viewport.replaceChildren(
    Object.assign(document.createElement("p"), { textContent: text }),
  );
  message(text + " Exact fixture positions remain available below.");
}
function setView(view) {
  currentView = view;
  document
    .querySelectorAll("[data-view]")
    .forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.view === view)),
    );
  document.querySelector("#orientation").textContent = {
    white: "White side: a1 is near-left, h1 near-right; rank 8 is far away.",
    top: "Overhead: a8 is top-left, h8 top-right; a1 is bottom-left.",
    black: "Black side: h8 is near-left, a8 near-right; rank 1 is far away.",
  }[view];
  graphics?.setView(view);
}
fixtureSelect.addEventListener("change", () => {
  fixture = fixtures.find((item) => item.id === fixtureSelect.value);
  describe();
});
document
  .querySelectorAll("[data-view]")
  .forEach((button) =>
    button.addEventListener("click", () => setView(button.dataset.view)),
  );
document
  .querySelector("#reset")
  .addEventListener("click", () => setView("white"));
document.querySelector("#close").addEventListener("click", () => {
  if (graphics || booting) {
    close();
    fallback("3D closed. Graphics resources released; text remains available.");
  } else start();
});
function close() {
  generation++;
  booting = false;
  graphics?.dispose();
  graphics = null;
  diagnostics.ready = false;
  diagnostics.closed = true;
  document.querySelector("#close").textContent = "Reopen 3D";
}
window.addEventListener("pagehide", close);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) start();
});
describe();

async function start() {
  if (booting || graphics) return;
  const token = ++generation;
  booting = true;
  diagnostics.renderedFixture = null;
  viewport.classList.remove("failed");
  viewport.textContent = "Preparing 3D preview…";
  document.querySelector("#close").textContent = "Close 3D";
  try {
    // Text fixtures and controls stay functional even if this module fails.
    const THREE = await import("three");
    const { GLTFLoader } = await import(
      "./node_modules/three/examples/jsm/loaders/GLTFLoader.js"
    );
    if (token !== generation) return;
    graphics = makeGraphics(THREE, GLTFLoader, token);
    diagnostics.ready = true;
    diagnostics.closed = false;
    booting = false;
    describe();
    setView(currentView);
    if (licenseReviewed) graphics.loadAssets();
    else
      message(
        "Primitive preview only. Polyfork loading is disabled until current licensing and asset access can be verified.",
      );
  } catch (error) {
    if (token !== generation) return;
    close();
    fallback(
      "3D is unavailable (WebGL or graphics module failure). Use the text fixture.",
    );
    console.warn("Isolated preview initialization failed:", error.message);
  } finally {
    if (token === generation) booting = false;
  }
}

function makeGraphics(T, GLTFLoader, token) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x101b17);
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, 0.1, 60);
  const board = new T.Group(),
    pieces = new T.Group(),
    models = new T.Group();
  scene.add(board, pieces, models);
  scene.add(new T.HemisphereLight(0xf4f5d8, 0x334839, 2.5));
  const light = new T.DirectionalLight(0xfff0ca, 3);
  light.position.set(4, 10, 6);
  scene.add(light);
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  const requests = new Set(),
    templates = {};
  let closed = false,
    pendingFrame = 0;
  const geometry = (value) => (geometries.add(value), value);
  const material = (value) => (materials.add(value), value);
  const mat = (color) =>
    material(
      new T.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0 }),
    );
  const tileGeometry = geometry(new T.BoxGeometry(0.97, 0.1, 0.97));
  const lightTile = mat(0xb9c69b),
    darkTile = mat(0x364f40);
  const plinthGeometry = geometry(new T.CylinderGeometry(0.22, 0.28, 0.3, 6));
  const whitePiece = mat(0xf6edce),
    blackPiece = mat(0x566b85);
  const outlineGeometry = geometry(new T.TorusGeometry(0.36, 0.025, 6, 24));
  const ringMaterial = mat(0xffd58e);
  const selectionBox = new T.BoxGeometry(0.88, 0.04, 0.88);
  const selectionGeometry = geometry(new T.EdgesGeometry(selectionBox));
  selectionBox.dispose();
  const selectionMaterial = material(
    new T.LineBasicMaterial({ color: 0xe6f9ba }),
  );
  function mesh(g, m, x, y, z, parent) {
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  }
  function label(text, x, y, z, width = 0.85, height = 0.38) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 192;
    const context = c.getContext("2d");
    context.fillStyle = "#102019";
    context.fillRect(0, 0, 512, 192);
    context.strokeStyle = "#d9e7c0";
    context.lineWidth = 6;
    context.strokeRect(3, 3, 506, 186);
    context.fillStyle = "#fff6dc";
    context.font = "bold 56px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const lines = text.split("\n");
    lines.forEach((line, i) =>
      context.fillText(line, 256, lines.length === 1 ? 96 : 52 + i * 85, 480),
    );
    const texture = new T.CanvasTexture(c);
    texture.colorSpace = T.SRGBColorSpace;
    textures.add(texture);
    const m = material(
      new T.SpriteMaterial({
        map: texture,
        depthTest: false,
        depthWrite: false,
      }),
    );
    const sprite = new T.Sprite(m);
    sprite.position.set(x, y, z);
    sprite.scale.set(width, height, 1);
    sprite.renderOrder = 5;
    return sprite;
  }
  const boardTiles = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const { x, z } = positionAt(r, c);
      const tile = mesh(
        tileGeometry,
        (r + c) % 2 === 0 ? lightTile : darkTile,
        x,
        0,
        z,
        board,
      );
      tile.userData.square = squareAt(r, c);
      boardTiles.push(tile);
    }
  for (let i = 0; i < 8; i++) {
    board.add(
      label(String.fromCharCode(97 + i), i - 3.5, 0.08, 4.35, 0.32, 0.22),
    );
    board.add(
      label(String.fromCharCode(97 + i), i - 3.5, 0.08, -4.35, 0.32, 0.22),
    );
    board.add(label(String(8 - i), -4.35, 0.08, i - 3.5, 0.28, 0.22));
    board.add(label(String(8 - i), 4.35, 0.08, i - 3.5, 0.28, 0.22));
  }
  board.add(label("RUNE\nDECORATION", 5.25, 0.2, 0, 1, 0.4));
  function invalidate() {
    if (closed || document.hidden || pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      if (!closed) {
        const began = performance.now();
        renderer.render(scene, camera);
        diagnostics.renders++;
        diagnostics.renderedFixture = fixture.id;
        diagnostics.renderMs = Number((performance.now() - began).toFixed(2));
        diagnostics.drawCalls = renderer.info.render.calls;
        diagnostics.triangles = renderer.info.render.triangles;
        diagnostics.geometries = renderer.info.memory.geometries;
        diagnostics.textures = renderer.info.memory.textures;
      }
    });
  }
  function resize() {
    if (closed) return;
    const { width, height } = viewport.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    applyView(currentView);
  }
  function applyView(view) {
    camera.up.set(0, 1, 0);
    const direction =
      view === "white"
        ? new T.Vector3(8, 11, 11)
        : view === "black"
          ? new T.Vector3(-8, 11, -11)
          : new T.Vector3(0.01, 16, 0);
    if (view === "top") camera.up.set(0, 0, -1);
    const corners = [];
    for (const x of [-4.7, 4.7])
      for (const z of [-4.7, 4.7])
        for (const y of [0, 1.2]) corners.push(new T.Vector3(x, y, z));
    corners.push(new T.Vector3(5.85, 1.3, 0));
    let low = 0.35,
      high = 4;
    for (let i = 0; i < 20; i++) {
      const scale = (low + high) / 2;
      camera.position.copy(direction).multiplyScalar(scale);
      camera.lookAt(0.3, 0, 0);
      camera.updateMatrixWorld(true);
      const fits = corners.every((p) => {
        const v = p.clone().project(camera);
        return Math.abs(v.x) < 0.89 && Math.abs(v.y) < 0.89;
      });
      if (fits) high = scale;
      else low = scale;
    }
    camera.position.copy(direction).multiplyScalar(high);
    camera.lookAt(0.3, 0, 0);
    camera.updateMatrixWorld(true);
    diagnostics.orientation = {
      a8: new T.Vector3(-3.5, 0, -3.5).project(camera).toArray(),
      h1: new T.Vector3(3.5, 0, 3.5).project(camera).toArray(),
    };
    invalidate();
  }

  const labelResources = { textures: new Set(), materials: new Set() };
  function clearPieces() {
    pieces.clear();
    labelResources.textures.forEach((t) => {
      t.dispose();
      textures.delete(t);
    });
    labelResources.materials.forEach((m) => {
      m.dispose();
      materials.delete(m);
    });
    labelResources.textures.clear();
    labelResources.materials.clear();
  }
  function drawFixture() {
    clearPieces();
    const oldTextures = new Set(textures),
      oldMaterials = new Set(materials);
    diagnostics.renderedPieces = [];
    entries(fixture).forEach((piece) => {
      const tokenMesh = mesh(
        plinthGeometry,
        piece.color === "w" ? whitePiece : blackPiece,
        piece.x,
        0.22,
        piece.z,
        pieces,
      );
      diagnostics.renderedPieces.push({
        square: piece.square,
        x: tokenMesh.position.x,
        z: tokenMesh.position.z,
        selectedMarker: piece.selected,
        veilMarker: piece.veiled,
      });
      if (piece.veiled) {
        if (templates.ring) {
          const o = templates.ring.clone(true);
          o.position.set(piece.x, 0.08, piece.z);
          pieces.add(o);
        } else {
          const ring = mesh(
            outlineGeometry,
            ringMaterial,
            piece.x,
            0.11,
            piece.z,
            pieces,
          );
          ring.rotation.x = -Math.PI / 2;
        }
      }
      if (piece.selected) {
        const line = new T.LineSegments(selectionGeometry, selectionMaterial);
        line.position.set(piece.x, 0.12, piece.z);
        pieces.add(line);
      }
      pieces.add(
        label(
          `${piece.color === "w" ? "W" : "B"} ${piece.name.toUpperCase()}`,
          piece.x,
          0.68,
          piece.z,
        ),
      );
      if (piece.selected || piece.veiled)
        pieces.add(label(stateLabel(piece), piece.x, 0.98, piece.z, 0.9, 0.23));
    });
    textures.forEach((t) => {
      if (!oldTextures.has(t)) labelResources.textures.add(t);
    });
    materials.forEach((m) => {
      if (!oldMaterials.has(m)) labelResources.materials.add(m);
    });
    invalidate();
  }
  function track(root) {
    root.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      for (const m of (Array.isArray(o.material)
        ? o.material
        : [o.material]
      ).filter(Boolean)) {
        materials.add(m);
        for (const v of Object.values(m)) if (v?.isTexture) textures.add(v);
      }
    });
  }
  function normalized(root, footprint) {
    // One square is one world unit. Center X/Z and put the lowest Y at zero.
    const group = new T.Group();
    group.add(root);
    root.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(root),
      size = box.getSize(new T.Vector3());
    if (
      !Number.isFinite(size.x + size.y + size.z) ||
      Math.max(size.x, size.z) <= 0
    )
      throw Error("Invalid asset bounds");
    const maxHeight =
      footprint === 0.92 ? 0.1 : footprint === 0.82 ? 0.2 : 0.95;
    const scale = Math.min(
      footprint / Math.max(size.x, size.z),
      size.y > 0 ? maxHeight / size.y : Infinity,
    );
    root.scale.multiplyScalar(scale);
    root.updateMatrixWorld(true);
    const fitted = new T.Box3().setFromObject(root),
      center = fitted.getCenter(new T.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
    root.position.y -= fitted.min.y;
    return group;
  }
  async function load(key) {
    const controller = new AbortController();
    requests.add(controller);
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(assetSources[key].url, {
        signal: controller.signal,
        credentials: "omit",
        referrerPolicy: "no-referrer",
      });
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > 16 * 1024 * 1024)
        throw Error("Asset exceeds preview budget");
      if (bytes.byteLength < 20) throw Error("Invalid GLB file");
      const header = new DataView(bytes);
      if (
        header.getUint32(0, true) !== 0x46546c67 ||
        header.getUint32(4, true) !== 2 ||
        header.getUint32(8, true) !== bytes.byteLength
      )
        throw Error("Invalid GLB header");
      const manager = new T.LoadingManager();
      manager.setURLModifier((url) => {
        if (url.startsWith("data:") || url.startsWith("blob:")) return url;
        const absolute = new URL(url, assetSources[key].url);
        if (absolute.origin !== "https://polyfork.dev")
          throw Error("External asset dependency blocked");
        return absolute.href;
      });
      const gltf = await new GLTFLoader(manager).parseAsync(
        bytes,
        "https://polyfork.dev/cdn/",
      );
      if (token !== generation || closed) {
        gltf.scene.traverse((o) => {
          o.geometry?.dispose();
          for (const m of [o.material].flat().filter(Boolean)) {
            for (const v of Object.values(m)) if (v?.isTexture) v.dispose();
            m.dispose();
          }
        });
        return;
      }
      track(gltf.scene);
      templates[key] = normalized(
        gltf.scene,
        key === "tile" ? 0.92 : key === "ring" ? 0.82 : 0.95,
      );
      diagnostics.assets[key] = "loaded";
      if (key === "tile") {
        const tinted = new Map();
        boardTiles.forEach((tile, index) => {
          const dark = (Math.floor(index / 8) + (index % 8)) % 2 === 1;
          const clone = templates.tile.clone(true);
          clone.traverse((o) => {
            if (!o.isMesh) return;
            const tint = (m) => {
              const id = m.uuid + ":" + dark;
              if (!tinted.has(id)) {
                const copy = m.clone();
                copy.color?.multiplyScalar(dark ? 0.24 : 1.1);
                material(copy);
                tinted.set(id, copy);
              }
              return tinted.get(id);
            };
            o.material = Array.isArray(o.material)
              ? o.material.map(tint)
              : tint(o.material);
          });
          clone.position.set(tile.position.x, 0.055, tile.position.z);
          models.add(clone);
        });
      }
      if (key === "rune") {
        const clone = templates.rune.clone(true);
        clone.position.set(5.25, 0.06, 0);
        models.add(clone);
      }
      if (key === "ring") drawFixture();
      invalidate();
    } catch (error) {
      if (!closed) {
        diagnostics.assets[key] = "failed";
        message(
          "A Polyfork asset could not load. Primitive tiles/rings and text remain available; the rune may be absent.",
        );
      }
    } finally {
      clearTimeout(timer);
      requests.delete(controller);
    }
  }
  async function loadAssets() {
    message(
      "Loading three Polyfork models. The text fixture is already available.",
    );
    await Promise.all(Object.keys(assetSources).map(load));
    if (closed) return;
    if (Object.values(diagnostics.assets).every((value) => value === "loaded"))
      message(
        "Three Polyfork models loaded. Static read-only preview; no live game connection.",
      );
  }
  function lost(event) {
    event.preventDefault();
    close();
    fallback(
      "WebGL context was lost. Resources released. Reopen 3D or use the text fixture.",
    );
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
    } else invalidate();
  }
  renderer.domElement.addEventListener("webglcontextlost", lost);
  viewport.replaceChildren(renderer.domElement);
  const observer = new ResizeObserver(resize);
  observer.observe(viewport);
  document.addEventListener("visibilitychange", visibility);
  resize();
  return {
    drawFixture,
    setView: applyView,
    loadAssets,
    dispose() {
      closed = true;
      observer.disconnect();
      cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
      requests.forEach((controller) => controller.abort());
      requests.clear();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      clearPieces();
      scene.clear();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      diagnostics.assets = {};
    },
  };
}
start();
