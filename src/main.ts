import { Chess, Move } from "chess.js";
import { determineMove } from "./chessEngine";
import { Chessground } from "chessground";
import { toColor, toDests } from "./chessUtil";
import { Api } from "chessground/api";
import Ro from "./ro"




const chess = new Chess("rnbqk2r/pppp2pp/4pp1n/2b5/4P3/3P1P2/PPP3PP/RNBQKBNR w KQkq - 1 5");

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

let waitingForPromotion: {orig: string, dest: string} = null;

function playAITurn(cg: Api) {
  return (orig: string, dest: string) => {
    const moves = chess.moves({verbose: true}).filter(m => m.from === orig && m.to === dest);

    let move = moves[0];
    if (move.promotion) {
      waitingForPromotion = {orig: orig, dest: dest};
      Ro.talk("What piece would you like to promote to? Type it in the chat!")
      return;
    }

    humanMove(move);
  }
}

function humanMove(move: Move) {
  // we are getting this move from chessground, it's already been validated
  // if its a promotion we already validated and asked the user for the promotion
  // so we can just make the move
  chess.move(move.san);
  

  // Ai dialog for user moves
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

  if (!chess.isGameOver()) {
    Ro.think();
    worker.postMessage(chess.fen());
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
  } else if (data.score - lastScore < -5) {
    Ro.talk("You're getting worse at this. What's up with that?")
  } else if (data.score - lastScore > 10) {
    Ro.talk("...Fuck you")
  } else if (data.score - lastScore > 5) {
    Ro.talk("Ugh, you've put me in a tough position :(")
  } else if (move.captured) {
    Ro.talk("lmao, imagine losing pieces. Couldn't be me >:)")
  } else {
    Ro.talk("Your turn!")
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

const chat = document.getElementById('chat') as HTMLInputElement

let numberOfChats = 1;

chat.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (waitingForPromotion) {
      const promotion = chat.value.toLowerCase();
      let promLetter = "";
      switch (promotion) {
        case "queen":
        case "q":
          Ro.talk("Hmm, that's not good for me.")
          promLetter = "q";
          break;
        case "rook":
        case "r":
          Ro.talk("You know the queen is the best piece right? Why would you choose the rook?")
          promLetter = "r";
          break;
        case "bishop":
        case "b":
          Ro.talk("You know the queen is the best piece right? Why would you choose the bishop?")
          promLetter = "b";
          break;
        case "knight":
        case "n":
          Ro.talk("Wow, big brain over here thinks they can outsmart me by choosing the knight. Pathetic.")
          promLetter = "n";
          break;
        case "king":
        case "k":
          Ro.talk("You can't promote to a king, you idiot.")
          break;
        case "pawn":
        case "p":
          Ro.talk("... You're an idiot.")
          break;
        case "rose":
          Ro.talk("mm, no, she sucks at chess. I'm better than her.")
          break;
        case "r0":
          Ro.talk("Aww, you're so sweet. But I can't let you do that.")
          break;
        default:
          if (promotion.length === 1) {
            Ro.talk("That's... not a piece.").then(() => {
              Ro.talk("Dumbass.")
            })
          } else {
            Ro.talk("I don't know if you're trying to talk to me, but I'm basically a big switch statement, not magic or a GPT. So, uh, you've hit my default case. Congrats.")
          }
          break;
        }
        if (promLetter != "") {
          chess.move({
            from: waitingForPromotion.orig,
            to: waitingForPromotion.dest,
            promotion: promLetter
          })
          cg.set({
            fen: chess.fen()
          })
          
          if (!chess.isGameOver()) {
            Ro.think();
            worker.postMessage(chess.fen());
          }
        }
    } else {
      switch (numberOfChats) {
        case 1:
          Ro.talk("I'm not a GPT or magic. That's just there for chosing promotions.")
          break;
        case 2:
          Ro.talk("I can't tell what you're saying, so I don't know what you're trying to do here.")
          break;
        case 4:
          Ro.talk("In case you're wondering, yes I did make the last one long to be annoying :)")
          break
        default:
          Ro.talk("Woah, it's just like those things in video games where you talk to something three times and then it repeats its last dialogue!")
          break
      }
      numberOfChats++;
    }
    chat.value = "";
  }
})

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