class queueManager {
  constructor() {
    this.queue = []
    this.masterConnection = null
  }

  addConnection(connection) {
    this.queue.push(connection)
  }

  removeConnection(connectionId) {
    this.queue.find(connection === connectionId)
    // Remove connection when websocket is closed
  }

  setMaster() {
    //When master connection force closes/times out
    this.masterConnection = this.queue.shift()
    // Create JWT for this connection and pass to master connection
  }
}

/*
var stack = [];
stack.push(2);       // stack is now [2]
stack.push(5);       // stack is now [2, 5]
var i = stack.pop(); // stack is now [2]
alert(i);            // displays 5

var queue = [];
queue.push(2);         // queue is now [2]
queue.push(5);         // queue is now [2, 5]
var i = queue.shift(); // queue is now [5]
alert(i);              // displays 2
*/