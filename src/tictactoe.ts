import { Action } from "./TTTengine";


export function newGame(): Game {
  return {
    turn: 'x',
    state: [
      [' ', ' ', ' '],
      [' ', ' ', ' '],
      [' ', ' ', ' ']
    ]
  }
}

/**
 * Make a move in the game.
 * @param action The action to take
 * @param game The game state
 * @returns Whether the move was successful
 */
export function move(action: Action, game: Game): boolean {
  const player = action[0];
  const x = Number(action[1]);
  const y = Number(action[3]);
  const { turn, state } = game;
  if (state[x][y] != ' ') {
    return false;
  }
  if(x > 2 || x < 0 || y > 2 || y < 0) {
    return false;
  }
  if (player != turn) {
    return false;
  }
  if (winner(game) != ' ') {
    return false;
  }

  if (player == 'x') {
    game.turn = 'o';
  } else {
    game.turn = 'x';
  }
  state[x][y] = player;

  return true;
}

export function winner(game: Game): Mark {
  const state = game.state;
  let winner: Mark = ' ';
  for (let i = 0; i < 3; i++) {
    if (state[i][0] == state[i][1] && state[i][1] == state[i][2] && state[i][0] != ' ') {
      winner = state[i][0];
    }
    if (state[0][i] == state[1][i] && state[1][i] == state[2][i] && state[0][i] != ' ') {
      winner = state[0][i];
    }
  }
  if (state[0][0] == state[1][1] && state[1][1] == state[2][2] && state[0][0] != ' ') {
    winner = state[0][0];
  }
  if (state[0][2] == state[1][1] && state[1][1] == state[2][0] && state[0][2] != ' ') {
    winner = state[0][2];
  }
  return winner;
}

export type Mark = ' ' | 'x' | 'o'
export type Game = {
  turn: Mark,
  state: State
}
export type State = Mark[][]