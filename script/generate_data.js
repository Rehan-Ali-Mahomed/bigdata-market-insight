import 'dotenv/config';
import db from '../src/db.js';

const POSTES = [
  "Ingenieur PDT",
  "Ingenieur Reseau",
  "Ingenieur Infrastructure",
  "Chef de projet",
  "Developpeur backend",
  "Developpeur frontend",
  "Developpeur full-stack",
  "Ingénieur DevOps",
  "Pentesteur",
  "Administrateur BDD",
  "Architecte Cloud"
];

const DIPLOMES = [
  "Bac",
  "Bac+1",
  "BTS",
  "Bac+2",
  "Bac+3",
  "License",
  "Bac+4",
  "Master"
];

const COMPETENCES = [
  "nodejs", "pyhton", "javascript", "html", "css", "rust", "C", "C++", "C#", "Java",
  "React", "Vue.JS", "Angular", "Flutter", "Gradle", "Nest",
  "PostgreSQL", "MariaDB", "MySQL", "SQLite", "MongoDB", "Oracle",
  "VPN", "IPSec", "BGP", "OSPF", "WAN", "LAN", "DCHP", "DNS", "DNSSEC", "Routing", "Firewall",
  "Cisco", "Windows", "Mac", "Linux", "Arista", "Palo Alto", "PFSense", "OPNSense", "ESXi", "vSphere", "Proxmox", "Docker", "Podman",
  "AD", "ADDS", "WDS", "WSUS", "GPO", "ADCS", "SCCM"
];

const CITY = [
  "Paris", "Lille", "Lyon", "Marseille", "Bordeaux", "Nantes", "Metz", "Saint-Denis", "Toulon", "Dijon", "Toulouse", "Rennes", "Versaille", "Nanterre", "La Defense"
];

const TJM_MIN = 100;
const TJM_MAX = 850;


async function run(count) {
  // generate data
  let data = generateData(count);
  //console.log(data);
  // push it to db
  let push = await db.insertMultiple(db.coll.data, data);
  // log and exit
  console.log(push);
  process.exit(0);
}

function generateData(count) {
  let data = [];
  for (let i = 0; i < count; i++) {
    if (i % 10000 === 0) console.log(`${i}/${count} ...`);
    let actual = {
      poste: POSTES[getRandom(0, POSTES.length)],
      diplome: DIPLOMES[getRandom(0, DIPLOMES.length)],
      city: CITY[getRandom(0, CITY.length)],
      tjm: getRandom(TJM_MIN, TJM_MAX),
      competences: generateCompetences(getRandom(2, 10))
    }
    data.push(actual);
  }
  return (data);
}
function generateCompetences(count) {
  let competences = [];
  for (let i = 0; i < count; i++) {
    competences.push(COMPETENCES[getRandom(0, COMPETENCES.length)]);
  }
  return competences;
}

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


// check argument
if (process.argv.length < 3) {
  console.error("Please provide a number of data to generate");
  process.exit(1);
}

// parse argument
let nb = parseInt(process.argv[2]);
if (isNaN(nb)) {
  console.error("Argument is not a number");
  process.exit(2);
}

// init db
await db.start();
// drop collection
await db.drop(db.coll.data);
// run
await run(nb);