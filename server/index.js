"use strict";

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();

// initialize a simple http server
const server = http.createServer(app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({
    server
});

let wsA = null;
let wsB = null;

function a_onmessage(message) {
    if (wsB != null) {
        wsB.send(message);
    }
}

function b_onmessage(message) {
    if (wsA != null) {
        wsA.send(message);
    }
}

wss.on('connection', (ws) => {
    console.log('incoming connection...');

    function onmessage(message) {
        if (wsA == null && message == 'client-a') {
            console.log('register Client A');
            wsA = ws;
            wsA.removeListener('message', onmessage);
            wsA.on('message', a_onmessage);
            wsA.on('close', function() {
                console.log('unregister Client A');
                wsA = null;
            });
        } else if (wsB == null && message == 'client-b') {
            console.log('register Client B');
            wsB = ws;
            wsB.removeListener('message', onmessage);
            wsB.on('message', b_onmessage);
            wsB.on('close', function() {
                console.log('unregister Client B');
                wsB = null;
            });
        } else {
            console.log('received: %s', message);
        }
    }

    ws.on('message', onmessage);
    ////////////////////////////////////////////////
});

// start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});