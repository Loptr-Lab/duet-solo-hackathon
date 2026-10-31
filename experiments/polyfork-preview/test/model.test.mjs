import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fixtures } from "../fixtures.mjs";
import { squareAt, positionAt, entries, stateLabel } from "../model.mjs";
const require = createRequire(import.meta.url);
const engine = require("../../../veiled-chess-core-server.js");

test("row/column orientation matches authoritative square coordinates", () => {
  assert.equal(squareAt(0, 0), "a8");
  assert.equal(squareAt(7, 7), "h1");
  assert.deepEqual(positionAt(0, 0), { x: -3.5, z: -3.5 });
  assert.deepEqual(positionAt(7, 7), { x: 3.5, z: 3.5 });
  assert.equal(
    new Set(
      Array.from({ length: 64 }, (_, i) => squareAt(Math.floor(i / 8), i % 8)),
    ).size,
    64,
  );
});
test("opening board is the existing authoritative initial board, not another rules implementation", () => {
  const source = fs.readFileSync(
    new URL("../../../gameNamespace.js", import.meta.url),
    "utf8",
  );
  const first = source.indexOf("function createInitialBoard()");
  const last = source.indexOf("\nfunction parseSquare", first);
  const expected = vm.runInNewContext(
    source.slice(first, last) + ";createInitialBoard()",
  );
  assert.deepEqual(
    fixtures[0].snapshot.board,
    JSON.parse(JSON.stringify(expected)),
  );
});
test("snapshot contract is preserved; selection is separate presentation state", () => {
  for (const fixture of fixtures) {
    assert.deepEqual(Object.keys(fixture.snapshot).sort(), [
      "board",
      "gameOver",
      "playersConnected",
      "turn",
      "winner",
    ]);
    assert.equal(fixture.snapshot.board.length, 8);
    assert.ok(fixture.snapshot.board.every((row) => row.length === 8));
  }
  assert.deepEqual(fixtures[0].snapshot, fixtures[1].snapshot);
  const selected = entries(fixtures[1]).filter((p) => p.selected);
  assert.equal(selected.length, 1);
  assert.equal(selected[0].square, "e2");
  assert.equal(stateLabel(selected[0]), "SELECTED");
});
test("Veiled ring follows the server-produced flag and counter; no rule is reimplemented", () => {
  const board = structuredClone(fixtures[2].snapshot.board);
  for (const row of board)
    for (const piece of row)
      if (piece) {
        delete piece.veiled;
        delete piece.veiled_turns;
      }
  engine.resolveSystems(board, "w");
  assert.deepEqual(board, fixtures[2].snapshot.board);
  const marked = entries(fixtures[2]).filter((p) => p.veiled);
  assert.equal(marked.length, 1);
  assert.equal(marked[0].square, "e4");
  assert.equal(marked[0].veilTurns, 1);
  assert.equal(stateLabel(marked[0]), "VEILED");
});

test('the isolated import map matches its CSP hash', async () => {
  const { createHash } = await import('node:crypto');
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const map = html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1];
  const hash = createHash('sha256').update(map).digest('base64');
  assert.ok(html.includes(`'sha256-${hash}'`), 'formatting must not silently break the import map CSP');
  assert.equal(JSON.parse(map).imports.three, './node_modules/three/build/three.module.js');
});
