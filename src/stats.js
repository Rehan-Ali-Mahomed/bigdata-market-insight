import db from "./db.js";

async function compile(req, res) {
  let find = await db.findAll(db.coll.data);
  if (!find.result) {
    res.writeHead(500, {"Content-Type":"application/json"});
    res.write(JSON.stringify(find));
    res.end();
  }
  
  let stats = {
    postes: {}, diplomes: {}, competences: {}, cities: {},
    tjm: { min: find.data[0].tjm, max: 0, average: 0 } 
  };
  
  let total_tjm = 0;
  for (let i = 0; i < find.data.length; i++) {
    let actual = find.data[i];
    // compute post
    stats.postes.hasOwnProperty(actual.poste) ? stats.postes[actual.poste]++ : stats.postes[actual.poste] = 1;
    // compute displome
    stats.diplomes.hasOwnProperty(actual.diplome) ? stats.diplomes[actual.diplome]++ : stats.diplomes[actual.diplome] = 1;
    // compute city
    stats.cities.hasOwnProperty(actual.city) ? stats.cities[actual.city]++ : stats.cities[actual.city] = 1;
    
    // compute tjm
    if (stats.tjm.min > actual.tjm) stats.tjm.min = actual.tjm;
    if (stats.tjm.max < actual.tjm) stats.tjm.max = actual.tjm;
    total_tjm += actual.tjm;
    
    // compute competences
    for (let j = 0; j < actual.competences.length; j++) {
      stats.competences.hasOwnProperty(actual.competences[j]) ? stats.competences[actual.competences[j]]++ : stats.competences[actual.competences[j]] = 1;
    }
    
  }
  stats.tjm.average = total_tjm / find.data.length;
  
  
  res.writeHead(200, {"Content-Type":"application/json"});
  res.write(JSON.stringify(stats));
  res.end();
}


export default {
  compile: compile
}