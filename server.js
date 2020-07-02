const envConfig = require("dotenv").config();
const express = require("express");
const Ably = require("ably");
const app = express();
const ABLY_API_KEY = process.env.ABLY_API_KEY;
const gameChannelName = "flappy-game";
let gameChannel;
let birds = {};
let birdChannels = {};
let birdCount = 0;

//instantiate Ably
const realtime = Ably.Realtime({
  key: ABLY_API_KEY,
  echoMessages: false,
});

// create a uniqueId to assign to clients on auth
const uniqueId = function () {
  return "id-" + Math.random().toString(36).substr(2, 16);
};

app.use(express.static("public"));

app.get("/auth", (request, response) => {
  const tokenParams = { clientId: uniqueId() };
  realtime.auth.createTokenRequest(tokenParams, function (err, tokenRequest) {
    if (err) {
      response
        .status(500)
        .send("Error requesting token: " + JSON.stringify(err));
    } else {
      response.setHeader("Content-Type", "application/json");
      response.send(JSON.stringify(tokenRequest));
    }
  });
});

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/index.html");
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

realtime.connection.once("connected", () => {
  gameChannel = realtime.channels.get(gameChannelName);
  gameChannel.presence.subscribe("enter", (msg) => {
    if (++birdCount === 1) {
      startGameTick();
    }
    subscribeToPlayerInput(msg.clientId);
    birds[msg.clientId] = {
      id: msg.clientId,
      left: 220 - birdCount * 10,
      bottom: 350,
    };
  });
});

function subscribeToPlayerInput(id) {
  birdChannels[id] = realtime.channels.get("bird-position-" + id);
  birdChannels[id].subscribe("pos", (msg) => {
    birds[id].bottom = msg.data.bottom;
  });
}

function startGameTick() {
  setInterval(() => {
    gameChannel.publish("game-state", {
      birds: birds,
    });
  }, 100);
}
