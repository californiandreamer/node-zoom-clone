const socket = io("/");
const myVideo = document.createElement("video");
const videoGrid = document.getElementById("video-grid");
const messageItem = document.querySelector(".messages");
// myVideo.muted = true;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030",
});
// set peer.js parameters

let myVideoStream;
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("createMessage", (message) => {
            let node = document.createElement("LI");
            let textNode = document.createTextNode(message);
            node.appendChild(textNode);
            messageItem.appendChild(node);
            node.classList.add("message__item");
            scrollToBottom();
        });

        socket.on("user-connected", (userId) => {
            connectToNewUser(userId, stream);
        });
        // check user connection
    });
// getting an access to user media

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
    // gets ROOM_ID created in room.ejs
});

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};
// function on new user connection

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });
    videoGrid.append(video);
};
// renders stream to page

const message = document.getElementById("chatMessage");
message.addEventListener("keypress", (e) => {
    const text = e.target.value;
    const key = e.key;
    if (key === "Enter" && text !== "") {
        socket.emit("message", text);
        message.value = "";
    }
});

const chatWindow = document.querySelector(".main__chat__window");
const scrollToBottom = () => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
};

const muteToggle = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const setMuteButton = () => {
    const html = `<i class="fas fa-microphone"></i>
    <span>Mute</span>
    `;
    document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
    const html = `<i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `;
    document.querySelector(".main__mute__button").innerHTML = html;
};

const playToggle = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayButton();
    } else {
        setStopButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const setStopButton = () => {
    const html = `<i class="fas fa-video"></i>
    <span>Stop video</span>
    `;
    document.querySelector(".main__video__button").innerHTML = html;
};

const setPlayButton = () => {
    const html = `<i class="stop fas fa-video-slash"></i>
    <span>Play video</span>
    `;
    document.querySelector(".main__video__button").innerHTML = html;
};
