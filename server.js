// uuid module for creating a random ids

const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.set("view engine", "ejs");
// works like an import for ejs module

app.use(express.static("public"));
// loads the 'public' folder

app.use("/peerjs", peerServer);
//

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
// redirects to room with random generated id

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});
// renders room page.ejs html file

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit("user-connected", userId);

        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message);
        });
    });
});
// socket connection

server.listen(process.env.PORT || 3030);
// sets Port number of the server
