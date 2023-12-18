import "dotenv/config";
import http from "http";
import db from "./src/db.js";
import handler from "./src/handler.js";

// init static file indexing
console.log("Indexing static files ...");
handler.indexFolder("./static/");

// init DB Connection
await db.start();

// create server
const server = http.createServer(handler.fromRequest);
// listen to given port
server.listen(process.env.HTTP_PORT);

console.log("Server listening on port:", process.env.HTTP_PORT);