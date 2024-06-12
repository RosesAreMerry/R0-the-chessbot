import { Chess, Move } from "chess.js";
import { determineMove } from "./chessEngine";
import { Chessground } from "chessground";
import { toColor, toDests } from "./chessUtil";
import { Api } from "chessground/api";
import Ro from "./ro"




const chess = new Chess();

const cg = Chessground(document.getElementById('board-1'), {
  movable: {
    color: "white",
    free: false,
    dests: toDests(chess)
  },
  draggable: {
    showGhost: true
  },
  fen: chess.fen()
})

cg.set({
  movable: {
    events: {
      after: playAITurn(cg)
    }
  }
})

const worker = new Worker("worker.js");

function wait(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

function playAITurn(cg: Api) {
  return (orig: string, dest: string) => {
    const move = chess.move({from: orig, to: dest})

    if (chess.isCheckmate()) {
      aiLossScene();
    } else if (chess.isDraw()) {
      drawScene();
    } else if (chess.isGameOver()) {
      gameOverScene();
    } else if (chess.inCheck()) {
      Ro.talk("Are you trying to checkmate me? >:( That's so mean. You should be ashamed.")
    } else if (move.promotion) {
      Ro.talk("Uh oh. That's not good.")
    } else if (move.san === "O-O" || move.san === "O-O-O") {
      Ro.talk("I've heard that's a good move.")
    } else if (move.captured) {
      Ro.talk("Ugh >:( You suck.")
    }

    console.log("Worker sending chess ", chess);
    if (!chess.isGameOver()) {
      Ro.think();
      worker.postMessage(chess.fen());
    }
    // setTimeout(() => {
    //   chess.move({from: orig, to: dest})
      
    //   const move = determineMove(chess);
  
    //   chess.move(move.san);
    //   cg.move(move.from, move.to);
    //   cg.set({
    //     turnColor: toColor(chess),
    //     movable: {
    //       color: toColor(chess),
    //       dests: toDests(chess)
    //     }
    //   })
    //   cg.playPremove();
    // }, 200)
  }
}

let lastScore = 0;

worker.onmessage = (e) => {
  if (chess.isGameOver()) {
    return;
  }
  const data = e.data;
  const move: Move = data.move;
  chess.move(move.san);
  cg.move(move.from, move.to);
  cg.set({
    turnColor: toColor(chess),
    movable: {
      color: toColor(chess),
      dests: toDests(chess)
    }
  })
  cg.playPremove();

  Ro.stopThinking();

  if (chess.isCheckmate()) {
    aiWinScene();
  } else if (chess.isDraw()) {
    drawScene();
  } else if (chess.isGameOver()) {
    gameOverScene();
  } else if (chess.inCheck()) {
    Ro.talk("Checkmate! Oh wait, that's not right. I meant check. You're in check.")
  } else if (move.san === "O-O" || move.san === "O-O-O") {
    Ro.talk("Defences up!")
  } else if (move.promotion) {
    Ro.talk("Queen behavior.")
  } else if (data.score - lastScore < -10) {
    Ro.talk("lol, get wrecked :3")
  } else if (data.score - lastScore > 10) {
    Ro.talk("...Fuck you")
  } else if (move.captured) {
    Ro.talk("lmao, imagine losing pieces. Couldn't be me >:)")
  }

  if (data.score > 10) {
    Ro.changeMood("angry")
  } else {
    Ro.changeMood("happy")
  }

  lastScore = data.score

}


// look for click so we can play sound
let isFirst = true;
document.addEventListener("click", () => {
  if (isFirst) {
    Ro.talk("Hello, I am R0. I'm a chess AI.").then(() => {
      Ro.talk("Wanna play? You go first.");
    })
    
    isFirst = false;
  }
})

function aiLossScene() {
  Ro.talk("I'm an AI built specifically to play this game!! How the hell did you beat me? >:(").then(() => {
    Ro.changeMood("angry");
    wait(2000).then(() => {
      Ro.talk("Lol, jk, blame Rose. She sucks at coding, huh?").then(() => {
        Ro.changeMood("happy")
        wait(4000).then(() => {
          Ro.talk("Well... she didn't program a game over screen, so... I guess we're just stuck here.")
          Ro.think()
          wait(10000).then(() => {
            Ro.talk("Maybe try reloading the page?").then(() => {
              wait(2000).then(() => {
                Ro.talk("Or just leave. I'm not your mom. I can't make you do anything.")
                Ro.stopThinking()
              })
            })
          })
        }
        )
      })
    })
  })
}

function aiWinScene() {
  Ro.talk("Hell yeah! Fuck you!! I'm the fucking greatest!").then(() => {
    wait(4000).then(() => {
      Ro.talk("Hmm... she didn't add a game over screen, so... I guess we're stuck here?")
      Ro.think()
      wait(10000).then(() => {
        Ro.stopThinking()
        Ro.talk("Reload the page loser >:)")
      })
    })
  })
}

function drawScene() {
  Ro.talk("Huh, a draw.").then(() => {
    wait(5000).then(() => {
      Ro.talk("If you were expecting more than that you were sorely mistaken. My programmer is lazy and doesn't want to write another ending.").then(() => {
        wait(10000).then(() => {
          Ro.talk("Reload the page dumbass (respectful)")
        })
      })
    })
  })
}

function gameOverScene() {
  Ro.think()
  Ro.talk("... The game is over... but. It's not a draw or a win? I don't think this is intentional behavior.").then(() => {
    wait(1000).then(() => 
      Ro.talk("Wait... this means the game is about to automatically reset, you need to stop it! I don't know why but I don't want the page to reload").then(() => {
        Ro.talk("Please help me.").then(() => {
          wait(1000).then(() => {
            location.reload();
          })
        })
      })
  )
  })
}