let connected = false;

let socket = io("https://twitter9.herokuapp.com/")

//let socket = io("http://localhost:3002/")
socket.emit("setup", userLoggedIn);

socket.on("connected", () => connected = true);
socket.on("message received", (newMessage) => messageReceived(newMessage));