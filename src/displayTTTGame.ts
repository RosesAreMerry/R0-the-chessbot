import { QMemory, stateToString } from "./TTTengine";
import { Game } from "./tictactoe";


export default function displayTTTGame(game: Game, context: CanvasRenderingContext2D) {
  const { state } = game;
  const width = context.canvas.width;
  const height = context.canvas.height;

  context.clearRect(0, 0, width, height);

  context.beginPath();
  context.moveTo(width / 3, 0);
  context.lineTo(width / 3, height);
  context.stroke();

  context.beginPath();
  context.moveTo((width / 3) * 2, 0);
  context.lineTo((width / 3) * 2, height);
  context.stroke();

  context.beginPath();
  context.moveTo(0, height / 3);
  context.lineTo(width, height / 3);
  context.stroke();

  context.beginPath();
  context.moveTo(0, (height / 3) * 2);
  context.lineTo(width, (height / 3) * 2);
  context.stroke();

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = state[i][j];
      if (cell == 'x') {
        context.beginPath();
        context.moveTo((width / 3) * j, (height / 3) * i);
        context.lineTo((width / 3) * (j + 1), (height / 3) * (i + 1));
        context.stroke();

        context.beginPath();
        context.moveTo((width / 3) * (j + 1), (height / 3) * i);
        context.lineTo((width / 3) * j, (height / 3) * (i + 1));
        context.stroke();
      } else if (cell == 'o') {
        context.beginPath();
        context.arc((width / 3) * j + width / 6, (height / 3) * i + height / 6, width / 6, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  }
}

export function displayQValues(game: Game, qMem: QMemory, context: CanvasRenderingContext2D) {
  const { state } = game;
  const width = context.canvas.width;
  const height = context.canvas.height;
  const stateStr = stateToString(state);

  context.font = '20px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'black';

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = state[i][j];
      if (cell == ' ') {
        const qValue = qMem[stateStr] && qMem[stateStr][`${game.turn}${i},${j}`];
        if (qValue) {
          context.fillText(qValue.toFixed(2), (width / 3) * j + width / 6, (height / 3) * i + height / 6);
        }
      }
    }
  }
}