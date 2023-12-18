import 'dotenv/config';
import db from '../src/db.js';

const POSTES = [
  "Ingenieur PDT",
  "Ingenieur Reseau",
  "Ingenieur Infrastructure",
  "Chef de projet (lol)",
  "Developpeur backend",
  "Developpeur frontend",
  "Developpeur full stack",
  "DevOps",
  "Pentesteur",
  "Habibi"
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


async function run() {
  // generate data
  let data = generateData(200);
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

// init db
await db.start();
// run
await run()