const messages: string[] = [
]
let mood = "happy"
let isThinking = false

/**
 * Take the messages in messages and push them to the html
 */
export function buildMessages() {
  const chat = document.getElementById('messages')
  chat.innerHTML = ''
  messages.forEach(message => {
    const messageElement = document.createElement('li')
    messageElement.innerHTML = `<span>R0</span>: ${message}`
    chat.appendChild(messageElement)
  })
}

const messageDelay = 30

const happyFace = "./Chessbot Faces/happy.svg"
const angryFace = "./Chessbot Faces/angry.svg"
const thinkingFace = "./Chessbot Faces/thinking.svg"

const talkingFaces = [
  "./Chessbot Faces/talking-open.svg",
  "./Chessbot Faces/talking-closed.svg",
  "./Chessbot Faces/talking-ooo.svg",
]

const talkingSoundPath = "./Chessbot Voice/ro-chatter-"

/**
 * Has R0 speak a message.
 * @param message The message to speak
 * @returns Promise that resolves when the message is done speaking
 */
export function talk(message: string) {
  messages.push(message)

  // Add the message to the chat
  const chat = document.getElementById('messages')
  const messageElement = document.createElement('li')
  messageElement.innerHTML = `<span>R0</span>: `
  chat.appendChild(messageElement)

  // Add the message to the chat one letter at a time
  let i = 0;
  const face = document.getElementById('face') as HTMLImageElement
  const interval = setInterval(() => {
    if (i < message.length) {
      messageElement.innerHTML += message[i]
      i++
      if (i % 5 == 0 && i < message.length) {
        face.src = talkingFaces[Math.floor(message.charCodeAt(i) % talkingFaces.length)]
      }
      if (i < message.length) {
        // play talking sound
        const sound = new Audio(talkingSoundPath + (message.charCodeAt(i) % 25 + 1).toString().padStart(2, "0") + ".wav")
        // set volume to 0.5
        sound.volume = 0.3
        sound.play()
      }
    }
  }, messageDelay)

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      setFaceAsMood()
      resolve()
      clearInterval(interval)
    }, message.length * messageDelay)
  })
}

const thinkingMessages = [
  "Hmm...",
  "Let me think...",
  "I'm thinking...",
  "Give me a moment...",
]

function think() {
  const face = document.getElementById('face') as HTMLImageElement
  isThinking = true
  face.src = thinkingFace
}

function stopThinking() {
  isThinking = false
  setFaceAsMood()
}

function changeMood(newMood: string) {
  mood = newMood
  setFaceAsMood()
}

function setFaceAsMood() {
  const face = document.getElementById('face') as HTMLImageElement
  if (isThinking) {
    face.src = thinkingFace
    return
  }
  switch (mood) {
    case "happy":
      face.src = happyFace
      break
    case "angry":
      face.src = angryFace
      break
  }
}

export default {
  think,
  stopThinking,
  changeMood,
  buildMessages,
  talk
}