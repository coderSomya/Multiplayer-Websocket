const http = require("http");
const WebSocket = require("websocket").server;
const express = require("express");
const app = express();

app.get("/", (req,res)=> res.sendFile(__dirname + "/index.html"));
app.listen(9091, ()=> console.log("Web server listening on port 9091"));

const httpServer  = http.createServer();

const port = 3000;

httpServer.listen(port, ()=>{
    console.log(`Socket server listening on port ${port}`);
})
const websocket = new WebSocket({
    "httpServer": httpServer,
})
//hashmap
const clients = {};
const games = {};

websocket.on("request", (request)=>{
    const connection = request.accept(null, request.origin);

    connection.on("open", ()=>{
        console.log("connection opened...!");
    })

    connection.on("close", ()=>{
        console.log("connection closed...!");
    })

    connection.on("message", (message)=>{
        //received a msg from the client
        const result = JSON.parse(message.utf8Data);

        console.log("received a message "+result);

        switch(result.method){
            case "create":
               //a user wants to create a new game
               const client = result.clientId;
               const gameId = generateRandomId(len);
               games[gameId] = {
                 "id": gameId,
                 "clients" : [client],
                 "balls": 20,
               }

               const payload = {
                "method": "create",
                "game" : games[gameId],
               }

               const conn = clients[clientId].connection;
               conn.send(JSON.stringify(payload));
               break;
            case "play":
                break;
            case defualt:
                console.log("unknown method received ");
                break;

        }
    })

    //generate a new client id
    const clientId = generateRandomId(len);
    clients[clientId]={
        "connection": connection,
    }

    const payload = {
        "method": "connect",
        "client": clientId,
    }

    connection.send(JSON.stringify(payload));
})

const len = 8;

function generateRandomId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}
  