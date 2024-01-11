import db from "./db.js";
import { spawn } from 'child_process';

let CACHE = null;

async function compile(req, res) {
  if (CACHE !== null) {
    res.writeHead(200, {"Content-Type":"application/json"});
    res.write(JSON.stringify(CACHE));
    res.end();
  }

  let find = await db.findAll(db.coll.data);
  if (!find.result) {
    res.writeHead(500, {"Content-Type":"application/json"});
    res.write(JSON.stringify(find));
    res.end();
  }
  
  let stats = {
    postes: {}, diplomes: {}, competences: {}, cities: {},
    tjm: { min: find.data[0].tjm, max: 0, average: 0 }, total: {}, availables: 0
  };
  
  let total_tjm = 0;
  for (let i = 0; i < find.data.length; i++) {
    let actual = find.data[i];
    compileItem(stats, actual);
    total_tjm += actual.tjm;
  }
  // compute average tjm by poste
  for (let i = 0; i < Object.keys(stats.postes).length; i++) {
    const key = Object.keys(stats.postes)[i];
    stats.postes[key].average = stats.postes[key].tjm / stats.postes[key].count;
  }

  // compute average tjm
  stats.tjm.average = total_tjm / find.data.length;
  stats.total = find.data.length;

  CACHE = stats;

  res.writeHead(200, {"Content-Type":"application/json"});
  res.write(JSON.stringify(stats));
  res.end();
}

function compileItem(stats, item) {
  // compute post
  if (stats.postes.hasOwnProperty(item.poste)) {
    stats.postes[item.poste].count++;
    stats.postes[item.poste].tjm += item.tjm;
  } else {
    stats.postes[item.poste] = { count: 1, tjm: item.tjm }
  }

  // compute diplome
  stats.diplomes.hasOwnProperty(item.diplome) ? stats.diplomes[item.diplome]++ : stats.diplomes[item.diplome] = 1;
  // compute city
  stats.cities.hasOwnProperty(item.city) ? stats.cities[item.city]++ : stats.cities[item.city] = 1;

  // compute available
  if(item.available) stats.availables = stats.availables + 1
  
  // compute tjm
  if (stats.tjm.min > item.tjm) stats.tjm.min = item.tjm;
  if (stats.tjm.max < item.tjm) stats.tjm.max = item.tjm;

  // compute competences
  for (let j = 0; j < item.competences.length; j++) {
    stats.competences.hasOwnProperty(item.competences[j]) ? stats.competences[item.competences[j]]++ : stats.competences[item.competences[j]] = 1;
  }
}

function refresh(req, res) {
  CACHE = null;

  const process = spawn('node', ['script/generate_data.js', req.body.count]);
  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  process.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  process.on('exit', (code) => {
    console.log(code === 0 ? "Data Refreshed" : "Error refreshing data");
    res.writeHead(200, {"Content-Type":"application/json"});
    res.write(JSON.stringify({}));
    res.end();
  });
}


export default {
  compile: compile,
  refresh: refresh,
}