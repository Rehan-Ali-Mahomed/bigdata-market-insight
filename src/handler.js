import url from "url";
import fs from "fs";
import stats from "./stats.js";
import market_stats from "./market_stats.js";

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
  let body = "";

  // wait end of request
  req.on('data', (chunk) => {
    // append chunk of data to body
    body += chunk;
  });

  req.on('end', () => {
    // process request
    process(req, res, body);
  });
}

function process(req, res, body) {
  // do basic parsing
  parseBase(req, body);
  // check if asked ressource is static
  if (isPublic(req, res)) return;

  // handle the request
  console.log("query:", req.query);

  if (req.query.pathname === "/getStat") return stats.compile(req, res);
  if (req.query.pathname === "/getMarketStat") return market_stats.compile(req, res);
  if (req.query.pathname === "/refreshData") return stats.refresh(req, res);

  res.writeHead(302, {'Location': "/dashboard.html"});
  res.end();
}

function parseBase(req, body) {
  // parse query object
  req.query = url.parse(req.url, true);
  // returned object does not have a constructor
  req.query = JSON.parse(JSON.stringify(req.query));
  
  // parse body (if json)
  req.body = {}
  if (req.headers.hasOwnProperty("content-type") && req.headers['content-type'] === "application/json") {
    // parse json
    req.body = JSON.parse(body);
  }

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