import { Action, QMemory, decideMove, updateQValue } from "./TTTengine";
import displayTTTGame, { displayQValues } from "./displayTTTGame";
import { Game, move, newGame } from "./tictactoe";



const canvas = document.getElementById('game') as HTMLCanvasElement;
const context = canvas.getContext('2d');
if (!context) {
  throw new Error('Failed to get 2d context');
}

const qMemO: QMemory = {};
const qMemX: QMemory = {};
let game: Game = null;



const fun = async () => {
  for (let i = 0; i < 10000; i++) {
    await runGame();
  }

  game = newGame();
  displayTTTGame(game, context);
  displayQValues(game, qMemX, context);
};
fun();

console.log('QMemX', qMemX);
console.log('QMemO', qMemO);

type QPair = {
  state: Game,
  action: Action
};
let xLast: QPair = null;
let oLast: QPair = null;
// move on click
canvas.addEventListener('click', (e) => {
  if (!game) {
    return;
  }
  const x = Math.floor(e.offsetX / (canvas.width / 3));
  const y = Math.floor(e.offsetY / (canvas.height / 3));
  const action = `${game.turn}${y},${x}` as Action;

  if (game.turn == 'x') {
    xLast = {
      state: JSON.parse(JSON.stringify(game)),
      action: action
    };
  } else {
    oLast = {
      state: JSON.parse(JSON.stringify(game)),
      action: action
    };
  }
  move(action, game);
  if (game.turn == 'x' && xLast) {
    updateQValue(qMemX, xLast.action, xLast.state, game);
  } else if (game.turn == 'o' && oLast) {
    updateQValue(qMemO, oLast.action, oLast.state, game);
  }
  const qMem = game.turn == 'x' ? qMemX : qMemO;
  displayTTTGame(game, context);
  displayQValues(game, qMem, context);
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  game = newGame();
  displayTTTGame(game, context);
  displayQValues(game, qMemX, context);
});


async function runGame(turnDelay?: number) {
  game = newGame();
  let playing = true;
  let xLast: QPair = null;
  let oLast: QPair = null;
  while (playing) {
    const qMem = game.turn == 'x' ? qMemX : qMemO;
    const action = decideMove(qMem, game);
    if (!action) {
      playing = false;
      continue;
    }

    if (game.turn == 'x') {
      xLast = {
        state: JSON.parse(JSON.stringify(game)),
        action: action
      };
    } else {
      oLast = {
        state: JSON.parse(JSON.stringify(game)),
        action: action
      };
    }

    const success = move(action, game);
  
    if (game.turn == 'x' && xLast) {
      updateQValue(qMemX, xLast.action, xLast.state, game);
    } else if (game.turn == 'o' && oLast) {
      updateQValue(qMemO, oLast.action, oLast.state, game);
    }
    if (!success) {
      playing = false;
      continue;
    }

    if (turnDelay) {
      await new Promise(resolve => setTimeout(resolve, turnDelay));
      displayTTTGame(game, context);
      const qMem = game.turn == 'x' ? qMemX : qMemO;
      displayQValues(game, qMem, context);
    }
  }
  if (game.turn == 'o') {
    console.log('Scoring last move for X');
    game.turn = 'x';
    updateQValue(qMemX, xLast.action, game);
  } else { 
    console.log('Scoring last move for O');
    game.turn = 'o';
    updateQValue(qMemO, oLast.action, game);
  }
}