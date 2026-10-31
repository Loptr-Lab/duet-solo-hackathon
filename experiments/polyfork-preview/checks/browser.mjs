import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.PREVIEW_URL || "http://127.0.0.1:8090/";
const evidence = new URL(
  "../../../.local/polyfork-preview-evidence/",
  import.meta.url,
);
await fs.mkdir(evidence, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: [
    "--no-sandbox",
    "--enable-unsafe-swiftshader",
    "--use-angle=swiftshader",
    "--disable-dev-shm-usage",
  ],
});
const results = [];
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["narrow", 390, 844],
    ["tablet", 820, 1180],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const started = performance.now();
    await page.goto(base);
    await page.waitForFunction(
      () => window.duetPreviewDiagnostics?.ready === true,
      { timeout: 15000 },
    );
    await page.waitForFunction(() => window.duetPreviewDiagnostics.renders > 0);
    const readyMs = Math.round(performance.now() - started);
    assert.equal(await page.locator("#piece-list tr").count(), 32);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.getByRole("button", { name: "Overhead", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page
        .getByRole("button", { name: "Overhead", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    const orientation = await page.evaluate(
      () => window.duetPreviewDiagnostics.orientation,
    );
    assert.ok(
      orientation.a8[0] < 0 &&
        orientation.a8[1] > 0 &&
        orientation.h1[0] > 0 &&
        orientation.h1[1] < 0,
      "overhead board orientation",
    );
    await page.selectOption("#fixture", "selected");
    assert.equal(
      (
        await page.evaluate(() =>
          window.duetPreviewDiagnostics.pieces.filter((p) => p.selected),
        )
      )[0].square,
      "e2",
    );
    await page.selectOption("#fixture", "veiled");
    const pieces = await page.evaluate(
      () => window.duetPreviewDiagnostics.pieces,
    );
    const rendered = await page.evaluate(
      () => window.duetPreviewDiagnostics.renderedPieces,
    );
    assert.deepEqual(
      rendered.find((p) => p.square === "e4"),
      { square: "e4", x: 0.5, z: 0.5, selectedMarker: false, veilMarker: true },
    );
    assert.equal(pieces.filter((p) => p.veiled)[0].square, "e4");
    await page.getByRole("button", { name: "Reset view", exact: true }).click();
    await page.waitForTimeout(150);
    const idleBefore = await page.evaluate(
      () => window.duetPreviewDiagnostics.renders,
    );
    await page.waitForTimeout(400);
    assert.equal(
      await page.evaluate(() => window.duetPreviewDiagnostics.renders),
      idleBefore,
      "idle renderer must stop",
    );
    await page.screenshot({
      path: new URL(name + ".png", evidence).pathname,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Close 3D", exact: true }).click();
    assert.equal(await page.locator("canvas").count(), 0);
    assert.equal(await page.locator("#piece-list tr").count(), 5);
    await page.getByRole("button", { name: "Reopen 3D", exact: true }).click();
    await page.waitForFunction(() => window.duetPreviewDiagnostics.ready);
    assert.equal(await page.locator("canvas").count(), 1);
    assert.deepEqual(errors, []);
    await page.selectOption("#fixture", "selected");
    await page.waitForFunction(
      () => window.duetPreviewDiagnostics.renderedFixture === "selected",
    );
    await page.selectOption("#fixture", "veiled");
    await page.waitForFunction(
      () => window.duetPreviewDiagnostics.renderedFixture === "veiled",
    );
    const baseline = await page.evaluate(() => window.duetPreviewDiagnostics);
    for (let i = 0; i < 4; i++) {
      await page.selectOption("#fixture", "selected");
      await page.waitForFunction(
        () => window.duetPreviewDiagnostics.renderedFixture === "selected",
      );
      await page.selectOption("#fixture", "veiled");
      await page.waitForFunction(
        () => window.duetPreviewDiagnostics.renderedFixture === "veiled",
      );
    }
    await page.waitForTimeout(150);
    const metrics = await page.evaluate(() => window.duetPreviewDiagnostics);
    assert.equal(
      metrics.geometries,
      baseline.geometries,
      "shared geometries must not accumulate",
    );
    assert.equal(
      metrics.textures,
      baseline.textures,
      "fixture label textures must be released",
    );
    results.push({
      name,
      width,
      height,
      readyMs,
      idleAdditionalFrames: 0,
      pageErrors: errors,
      drawCalls: metrics.drawCalls,
      triangles: metrics.triangles,
      renderMs: metrics.renderMs,
    });
    await page.close();
  }
  const assetFailure = await browser.newPage();
  // Failure-only simulation: no third-party file is fetched or integrated.
  await assetFailure.route("**/asset-sources.mjs", async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      "export const licenseReviewed = false;",
      "export const licenseReviewed = true;",
    );
    await route.fulfill({ response, body });
  });
  const assetRequests = [];
  await assetFailure.route("https://polyfork.dev/**", (route) => {
    assetRequests.push(route.request().url());
    return route.abort();
  });
  await assetFailure.goto(base);
  await assetFailure.waitForFunction(
    () =>
      Object.values(window.duetPreviewDiagnostics?.assets || {}).filter(
        (s) => s === "failed",
      ).length === 3,
  );
  assert.equal(assetRequests.length, 3);
  assert.match(
    await assetFailure.locator("#status").textContent(),
    /could not load/,
  );
  assert.equal(await assetFailure.locator("#piece-list tr").count(), 32);
  await assetFailure.selectOption("#fixture", "veiled");
  assert.equal(await assetFailure.locator("#piece-list tr").count(), 5);
  results.push({
    case: "simulated three CDN requests denied (license gate stubbed in test only)",
    result:
      "primitive rendering and text remain available; no asset files fetched",
  });
  const failure = await browser.newPage();
  await failure.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });
  await failure.goto(base);
  await failure.waitForSelector("#viewport.failed");
  assert.match(await failure.locator("#status").textContent(), /unavailable/);
  assert.equal(await failure.locator("#piece-list tr").count(), 32);
  await failure.selectOption("#fixture", "veiled");
  assert.equal(await failure.locator("#piece-list tr").count(), 5);
  results.push({
    case: "WebGL denied",
    result: "text and fixture switching remain functional",
  });
  const modules = await browser.newPage();
  await modules.route("**/node_modules/three/**", (route) => route.abort());
  await modules.goto(base);
  await modules.waitForSelector("#viewport.failed");
  assert.equal(await modules.locator("#piece-list tr").count(), 32);
  results.push({
    case: "three.js module denied",
    result: "clear fallback; text remains available",
  });
  await fs.writeFile(
    new URL("results.json", evidence),
    JSON.stringify(
      {
        browser: await browser.version(),
        renderer:
          "Chromium headless / SwiftShader software WebGL; not physical hardware",
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
