import { Game, Mark, State, move, winner } from "./tictactoe"

export type QMemory = {
  [state: string]: {
    [action: Action]: number
  }
}

export type Action = `${Mark}${number},${number}`

export function stateToString(state: State): string {
  return state.map(row => row.join('')).join('')
}

const learningRate = 0.5;
const discount = 0.9;
const epsilon = 0.2;

export function decideMove(qMem: QMemory, game: Game): Action {
  const stateStr = stateToString(game.state)
  const turn = game.turn;
  if (!qMem[stateStr]) {
    qMem[stateStr] = {}
  }
  const actions = game.state.flatMap((row, i) => row.map((cell, j) => cell == ' ' ? `${turn}${i},${j}` : null)).filter(action => action != null) as Action[]
  if (Math.random() < epsilon) {
    return actions[Math.floor(Math.random() * actions.length)]
  }

  if (actions.length == 0) {
    return null
  }
  // If we do not have any Q value for a given action, we assume it is a good action
  // This will cause the AI to explore more
  const qValues = actions.map(action => qMem[stateStr][action] || 100)
  const maxQValue = Math.max(...qValues)
  const bestActions = actions.filter((_, i) => qValues[i] == maxQValue)
  return bestActions[Math.floor(Math.random() * bestActions.length)]
}

/**
 * Update the Q value for a given state and action based on the before and after states.
 * @param qMem The memory of Q values.
 * @param action The action taken.
 * @param before The state before the action is taken.
 * @param after The state after the action is taken and the opponent has moved.
 */
export function updateQValue(qMem: QMemory, action: Action, before: Game, after?: Game) {
  const stateStr = stateToString(before.state)
  if (!qMem[stateStr]) {
    qMem[stateStr] = {}
  }
  if (!qMem[stateStr][action]) {
    qMem[stateStr][action] = 0
  }
  const newGame = JSON.parse(JSON.stringify(before))
  move(action, newGame)

  const rewardVal = reward(newGame, before.turn, after)
  const newQ = (1 - learningRate) * qMem[stateStr][action] + learningRate * (rewardVal + discount * maxQValue(qMem, after))
  
  console.log(`Updated Q value for ${stateStr} ${action} from ${qMem[stateStr][action]} to ${newQ}.`)
  console.log(`Reward: ${rewardVal}, Discounted max Q value: ${discount * maxQValue(qMem, after)}, resulting state: ${after?.state}`)

  qMem[stateStr][action] = newQ

}

function maxQValue(qMem: QMemory, game?: Game): number {
  if (!game) {
    return 0
  }
  const stateStr = stateToString(game.state)
  if (!qMem[stateStr]) {
    qMem[stateStr] = {}
  }
  const max = Math.max(...Object.values(qMem[stateStr]))
  if (max == -Infinity) {
    return 0
  }
  return max
}

function reward(game: Game, player: Mark, after?: Game): number {
  const win = winner(game)
  if (win == player) {
    return 10
  } else if (win == ' ') {
    // after is the state after the opponent goes so we need to check if the opponent won
    if (!after) {
      return 0
    }
    const newWin = winner(after);
    if (newWin == ' ') {
      return 1
    } else if (newWin != player) {
      return -10
    } else {
      // should be impossible for us to win on the opponent's turn
      return 10
    }
  } else {
    // should be impossible for us to lose on our turn
    return -10
  }
}