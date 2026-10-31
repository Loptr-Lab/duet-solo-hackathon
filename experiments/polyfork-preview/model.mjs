export const pieceNames = {
  p: "Pawn",
  r: "Rook",
  n: "Knight",
  b: "Bishop",
  rb: "Rebirth",
  d: "Death",
  q: "Queen",
  k: "King",
};
export function squareAt(row, col) {
  return `${String.fromCharCode(97 + col)}${8 - row}`;
}
export function positionAt(row, col) {
  return { x: col - 3.5, z: row - 3.5 };
}
export function entries(fixture) {
  return fixture.snapshot.board.flatMap((row, r) =>
    row.flatMap((piece, c) =>
      piece
        ? [
            {
              square: squareAt(r, c),
              ...positionAt(r, c),
              color: piece.color,
              name: pieceNames[piece.type],
              type: piece.type,
              selected: fixture.selectedSquare === squareAt(r, c),
              veiled: piece.veiled === true,
              veilTurns: piece.veiled_turns ?? null,
            },
          ]
        : [],
    ),
  );
}
export function stateLabel(piece) {
  return (
    [piece.selected && "SELECTED", piece.veiled && "VEILED"]
      .filter(Boolean)
      .join(" · ") || "Normal"
  );
}
