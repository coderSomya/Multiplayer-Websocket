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
        let client;
        let gameId;
        let conn;
        let payload;

        switch(result.method){
            case "create":
               //a user wants to create a new game
               client = result.clientId;
               gameId = generateRandomId(len);
               games[gameId] = {
                 "id": gameId,
                 "clients" : [],
                 "balls": 20,
               }

               payload = {
                "method": "create",
                "game" : games[gameId],
               }
               console.log("game created with id "+ payload.game.id);

               conn = clients[clientId].connection;
               conn.send(JSON.stringify(payload));
               break;
            
            case "join":
                // a user wants to join a game 
                client = result.clientId;
                gameId = result.gameId;
                const game = games[gameId];

                if(!game){
                    console.log("game not found...");
                }
                
                if(game.clients.length>=3){
                    console.log("too many players in this room already...")
                    return;
                }

                const mycolor = {"0": "red", "1":"green", "2":"blue"}[game.clients.length]

                game.clients.push({
                   "clientId": client,
                   "color": mycolor,
                })

                if(game.clients.length==3){
                    updateGameState();
                }

                payload = {
                    "method": "join",
                    "game": game,
                }

                game.clients.forEach((c)=>{
                    let hisConn = clients[c.clientId].connection;
                    hisConn.send(JSON.stringify(payload))
                })

                console.log("gonna join game", result.gameId);
                break;
            case "play":
                clientId = result.clientId;
                gameId = result.gameId;
                const ballId = result.ballId;
                let color = result.color;

                let state = games[gameId].state;

                if(!state){
                    state = {}
                }

                state[ballId] = color;
                games[gameId].state = state;
                break;

        }
    })

    //generate a new client id
    let clientId = generateRandomId(len);
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
  

function updateGameState(){
 
    for (const g of Object.keys(games)){
        const game = games[g];
        const payload = {
            "method": "update",
            "game": game
        }
        game.clients.forEach(c=>{
            clients[c.clientId].connection.send(JSON.stringify(payload));
        })
    }

    setTimeout(updateGameState, 500);
}