// Captured from createInitialBoard / server resolveSystems at 92ab274. No rules run in the preview.
const data = [
  {
    id: "opening",
    title: "Normal · starting position",
    description:
      "White is on ranks 1–2; Black is on ranks 7–8. Rebirth occupies d1 and d8; Death occupies e1 and e8. All pieces are labeled placeholders. No selection or Veil marker.",
    snapshot: {
      board: [
        [
          {
            type: "r",
            color: "b",
          },
          {
            type: "n",
            color: "b",
          },
          {
            type: "b",
            color: "b",
          },
          {
            type: "rb",
            color: "b",
          },
          {
            type: "d",
            color: "b",
          },
          {
            type: "b",
            color: "b",
          },
          {
            type: "n",
            color: "b",
          },
          {
            type: "r",
            color: "b",
          },
        ],
        [
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
        ],
        [
          {
            type: "r",
            color: "w",
          },
          {
            type: "n",
            color: "w",
          },
          {
            type: "b",
            color: "w",
          },
          {
            type: "rb",
            color: "w",
          },
          {
            type: "d",
            color: "w",
          },
          {
            type: "b",
            color: "w",
          },
          {
            type: "n",
            color: "w",
          },
          {
            type: "r",
            color: "w",
          },
        ],
      ],
      turn: "w",
      gameOver: false,
      winner: null,
      playersConnected: {
        w: false,
        b: false,
      },
    },
    selectedSquare: null,
  },
  {
    id: "selected",
    title: "Selected · e2 pawn",
    description:
      "The White pawn on e2 has a square outline and SELECTED label. Selection is a presentation-only fixture, not a legal-move hint. The starting board is unchanged.",
    snapshot: {
      board: [
        [
          {
            type: "r",
            color: "b",
          },
          {
            type: "n",
            color: "b",
          },
          {
            type: "b",
            color: "b",
          },
          {
            type: "rb",
            color: "b",
          },
          {
            type: "d",
            color: "b",
          },
          {
            type: "b",
            color: "b",
          },
          {
            type: "n",
            color: "b",
          },
          {
            type: "r",
            color: "b",
          },
        ],
        [
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
          {
            type: "p",
            color: "b",
          },
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
          {
            type: "p",
            color: "w",
          },
        ],
        [
          {
            type: "r",
            color: "w",
          },
          {
            type: "n",
            color: "w",
          },
          {
            type: "b",
            color: "w",
          },
          {
            type: "rb",
            color: "w",
          },
          {
            type: "d",
            color: "w",
          },
          {
            type: "b",
            color: "w",
          },
          {
            type: "n",
            color: "w",
          },
          {
            type: "r",
            color: "w",
          },
        ],
      ],
      turn: "w",
      gameOver: false,
      winner: null,
      playersConnected: {
        w: false,
        b: false,
      },
    },
    selectedSquare: "e2",
  },
  {
    id: "veiled",
    title: "Veiled · e4 rook",
    description:
      "The White rook on e4 is Veiled after the existing Duet server resolves the opposing Rebirth aura from d4. A condition ring and VEILED label propose a visual treatment. The remaining counter is 1. White Death is on h1, outside Sanctuary range. This is an illustrative fixture, not a new rule.",
    snapshot: {
      board: [
        [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          {
            type: "d",
            color: "b",
          },
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
          null,
          null,
          null,
          {
            type: "rb",
            color: "b",
          },
          {
            type: "r",
            color: "w",
            veiled: true,
            veiled_turns: 1,
          },
          null,
          null,
          null,
        ],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [
          null,
          null,
          null,
          {
            type: "rb",
            color: "w",
          },
          null,
          null,
          null,
          {
            type: "d",
            color: "w",
          },
        ],
      ],
      turn: "w",
      gameOver: false,
      winner: null,
      playersConnected: {
        w: false,
        b: false,
      },
    },
    selectedSquare: null,
  },
];

function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
export const fixtures = freeze(data);
