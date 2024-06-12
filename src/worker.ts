import { Chess } from "chess.js";
import { determineMove } from "./chessEngine";

onmessage = (e) => {
  const chess = new Chess(e.data);
  const move = determineMove(chess);
  postMessage(move);
}