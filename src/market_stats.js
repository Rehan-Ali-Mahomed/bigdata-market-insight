import db from "./db.js";
import { spawn } from 'child_process';

let CACHE = null;

async function compile(req, res) {
  if (CACHE !== null) {
    res.writeHead(200, {"Content-Type":"application/json"});
    res.write(JSON.stringify(CACHE));
    res.end();
  }

  let find = await db.findAll(db.coll.market);

  if (!find.result) {
    res.writeHead(500, {"Content-Type":"application/json"});
    res.write(JSON.stringify(find));
    res.end();
  }
  
  let marketStats = {
    entreprises: {}, secteurs: {}, prioritaires: {}, projet_besoins: {}, cities: {}, competences: {},
    tjm: { min: find.data[0].tjm, max: 0, average: 0 }, total : {}
  };
  
  let total_tjm = 0;
  for (let i = 0; i < find.data.length; i++) {
    let actual = find.data[i];
    compileItem(marketStats, actual);
    total_tjm += actual.tjm;
  }
  // compute average tjm by projet - besoin
  for (let i = 0; i < Object.keys(marketStats.projet_besoins).length; i++) {
    const key = Object.keys(marketStats.projet_besoins)[i];
    marketStats.projet_besoins[key].average = marketStats.projet_besoins[key].tjm / marketStats.projet_besoins[key].count;
  }

  // compute average tjm
  marketStats.tjm.average = total_tjm / find.data.length;

  marketStats.total = find.data.length;

  CACHE = marketStats;

  res.writeHead(200, {"Content-Type":"application/json"});
  res.write(JSON.stringify(marketStats));
  res.end();
}

function compileItem(marketStats, item) {
  // compute projet - besoin
  if (marketStats.projet_besoins.hasOwnProperty(item.projet_besoin)) {
    marketStats.projet_besoins[item.projet_besoin].count++;
    marketStats.projet_besoins[item.projet_besoin].tjm += item.tjm;
  } else {
    marketStats.projet_besoins[item.projet_besoin] = { count: 1, tjm: item.tjm }
  }

  // compute entreprise
  marketStats.entreprises.hasOwnProperty(item.entreprise) ? marketStats.entreprises[item.entreprise]++ : marketStats.entreprises[item.entreprise] = 1;

  // compute city
  marketStats.cities.hasOwnProperty(item.city) ? marketStats.cities[item.city]++ : marketStats.cities[item.city] = 1;

  // compute secteur
  marketStats.secteurs.hasOwnProperty(item.secteur) ? marketStats.secteurs[item.secteur]++ : marketStats.secteurs[item.secteur] = 1;
 
  // compute prioritaires
  marketStats.prioritaires.hasOwnProperty(item.prioritaire) ? marketStats.prioritaires[item.prioritaire]++ : marketStats.prioritaires[item.prioritaire] = 1;

  // compute tjm
  if (marketStats.tjm.min > item.tjm) marketStats.tjm.min = item.tjm;
  if (marketStats.tjm.max < item.tjm) marketStats.tjm.max = item.tjm;

  // compute competences
  for (let j = 0; j < item.prerequis.competences.length; j++) {
    marketStats.competences.hasOwnProperty(item.prerequis.competences[j]) ? marketStats.competences[item.prerequis.competences[j]]++ : marketStats.competences[item.prerequis.competences[j]] = 1;
  }
}

function refreshMarket(req, res) {
  CACHE = null;

  const process = spawn('node', ['script/generate_market.js', req.body.count]);
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
  refreshMarket: refreshMarket,
}