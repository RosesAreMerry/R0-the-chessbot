import { Chess, Square } from 'chess.js'
import { move } from 'chessground/drag';

// minimax algorithm

// traverse depth first, 
// white is maximizing

export function determineMove(chess: Chess) {
  const max = chess.turn() == "w"

  let bestMove = null;
  let bestMoveVal = max ? -Infinity : Infinity;

  for (const move of chess.moves({verbose: true})) {
    chess.move(move)
    let val = minimax(chess, 3, !max, -Infinity, Infinity);
    if (move.san == "O-O" || move.san == "O-O-O") {
      // castling is a good move, so we add a little bonus
      val -= 2;
    }
    if (max && val > bestMoveVal || !max && val < bestMoveVal) {
      bestMoveVal = val;
      bestMove = move;
    }
    chess.undo();
  }

  if (!isFinite(bestMoveVal)) {
    console.log(":( No moves??")
  }

  console.log(`Maxing? ${max}. Move score? ${bestMoveVal}`)
  return {
    move: bestMove,
    score: bestMoveVal
  };
}

export function minimax(chess: Chess, depth: number, max: boolean, alpha: number, beta: number) {
  if (chess.isGameOver() || depth == 0) {
    const rating = rateState(chess);
    return rating;
  }

  if (max) {
    let value = -Infinity;
    const moves = chess.moves();
    for (const move of moves) {
      chess.move(move)
      value = Math.max(value, minimax(chess, depth - 1, false, alpha, beta))
      chess.undo();
      alpha = Math.max(alpha, value);
      if (alpha >= beta) {
        break;
      }
    }
    return value;
  } else {
    let value = Infinity;
    const moves = chess.moves();
    for (const move of moves) {
      chess.move(move)
      value = Math.min(value, minimax(chess, depth - 1, true, alpha, beta))
      chess.undo();
      beta = Math.min(beta, value);
      if (alpha >= beta) {
        break;
      }
    }
    return value;
  }
}

function rateState(chess: Chess): number {
  const maximizing = chess.turn() == "w" ? 1 : -1;

  let value = 0;

  if (chess.isCheckmate()) {
    return maximizing * -1000;
  }

  if (chess.isDraw()) {
    return 0;
  }

  const board = chess.board();

  const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const piece = board[i][j];
      const square: Square = letters[j] + (8 - i) as Square;
      if (piece) {
        const pieceVal = pieceValue(piece.type) * (piece.color == "w" ? 1 : -1);
        value += pieceVal;
        const threatened = chess.isAttacked(square, piece.color == "w" ? "b" : "w");
        if (threatened) {
          //console.log(`Piece: ${piece.color}${piece.type} at ${square} threatened. Value: ${pieceValue(piece.type)}.`)
          value -= pieceVal * 0.25;
        }
      }
    }
  }

  return value;
}

function pieceValue(piece: string): number {
  switch (piece) {
    case "p":
      return 1;
    case "n":
      return 3;
    case "b":
      return 3;
    case "r":
      return 5;
    case "q":
      return 9;
    case "k":
      return 100;
    default:
      return 0;
  }
  return 0;
}
