
// npm install -g nodemon
var express = require("express");
var morgan = require('morgan');
var http = require('http');
var app = express();
var sio = require('socket.io');
app.use(morgan('tiny'));

// Other modules
var fs = require('fs');

// -------------------------------------------------

// Set view directory
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

// Handle static files
app.use(express.static(__dirname + '/public'));

// Hook up socket io
var httpServer = http.Server(app);
var io = sio(httpServer);
httpServer.listen(50000, function() {console.log('Listening on 50000');});

// -------------------------------------------------
// ROUTES / SOCKETIO

var libRoutes = require('./routes/libRoutes.js');
var gameRoutes = require('./routes/gameRoutes.js');
var gameSockets = require('./routes/serverSocket.js');

// Load in the lib templates from the JSON file once when server starts
libRoutes.loadTemplates(fs);

// Initialize serverside sockets to keep track of players
gameSockets.init(io);

// Set root to a game lobby
app.get("/", gameRoutes.renderLobby);

app.get("/makeGame", gameRoutes.prepGame);

// app.get("/makeGame", gameRoutes.makeGame);
app.get("/lib/", libRoutes.getAllLibs);