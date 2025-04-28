export const types = {
  OPEN: "open",
  MSG: "message",
  CLOSE: "close"
}

export function open() {
  console.log("Websocket connection opened")
}

export function message(msg, ws) {
  if (msg == "client message...") {
    ws.send("You pressed that button didn't you...")
  } else {
    ws.send("THIS IS A MESSAGE FROM YOUR SERVER dude...")
  }
}