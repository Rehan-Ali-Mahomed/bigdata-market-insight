import url from "url";
import fs from "fs";
import stats from "./stats.js";

const INDEXES = [];

function indexFolder(prefix) {
  let files = fs.readdirSync(prefix);
  for (let i = 0; i < files.length; i++) {
    let path = prefix + files[i];
    let stat = fs.lstatSync(path);
    
    if (stat.isDirectory()) {
      indexFolder(path + "/");
    } else {
      INDEXES.push(path.replace("./static", "")); 
    }
  }
}

function fromRequest(req, res) {
  // do basic parsing
  parseBase(req);
  // check if asked ressource is static
  if (isPublic(req, res)) return;
  
  // handle the request
  console.log("query:", req.query);
  
  if (req.query.pathname === "/getStat") return stats.compile(req, res);
}

function parseBase(req) {
  // parse query object
  req.query = url.parse(req.url, true);
  // returned object does not have a constructor
  req.query = JSON.parse(JSON.stringify(req.query));
  
  // parse body (if json)
  // ...
  req.body = {}
}

function isPublic(req, res) {
  if (!INDEXES.includes(req.query.pathname)) return false;
  
  const path = "./static" + req.query.pathname;
  console.log("SEND PUBLIC", req.query.pathname, path);
  
  const file = fs.readFileSync(path);
  res.writeHead(200, {
    "Content-Length": Buffer.from(file).length,
    "Content-Type": getContentType(path.split(".").pop())
  });
  res.write(file);
  res.end();
  
  return true;
}

function getContentType(ext) {
  switch (ext) {
    case "css": return "text/css";
    case "js": return "application/javascript";
    case "html": return "text/html";
    default: return "text";
  }
}

export default {
  indexFolder: indexFolder,
  fromRequest: fromRequest
}