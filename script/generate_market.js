import 'dotenv/config';
import db from '../src/db.js';

const ENTREPRISE_PAR_SECTEUR = {
  "Banque - Assurance": ["HSBC", "Allianz", "BNP Paribas", "Axa", "Goldman Sachs"],
  "Transports - Logistique": ["FedEx", "DHL", "Maersk", "UPS", "Ryder"],
  "Pharmaceutique": ["Pfizer", "Sanofi", "Roche", "Novartis", "Johnson & Johnson"],
  "Agriculture": ["Monsanto", "Cargill", "Syngenta", "Bayer CropScience", "DuPont"],
  "Grande Distribution": ["Carrefour", "Walmart", "Amazon", "Costco", "Tesco"],
  "Secteur Public": ["La Poste", "EDF", "SNCF", "NASA", "BBC"],
  "Hôtellerire - Restauration": ["Marriott", "McDonald's", "Hilton", "Starbucks", "Yum! Brands"],
  "Santé": ["Kaiser Permanente", "Mayo Clinic", "Cleveland Clinic", "Johns Hopkins Hospital", "Massachusetts General Hospital"],
  "Télécommunications": ["Orange", "Vodafone", "AT&T", "Verizon", "Deutsche Telekom"]
};

const SECTEURS = Object.keys(ENTREPRISE_PAR_SECTEUR);

const PROJET_BESOIN = [
  "Ingenieur PDT",
  "Ingenieur Reseau",
  "Ingenieur Infrastructure",
  "Chef de projet Informatique",
  "Developpeur backend",
  "Developpeur frontend",
  "Developpeur full stack",
  "Ingénieur DevOps",
  "Pentesteur",
  "Administrateur de Base de Données",
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

const EXPERIENCE_MIN = [
  "",
  "2 ans",
  "3 ans",
  "5 ans"
]

const TJM_MIN = 300;
const TJM_MAX = 750;


async function run(count) {
  console.log("Generating Market Data");
  // generate data
  let data = generateData(count);
  // push it to db
  let push = await db.insertMultiple(db.coll.market, data);
  // log and exit
  console.log(push);
  process.exit(0);
}

function generateData(count) {
  let data = [];
  for (let i = 0; i < count; i++) {
    if (i % (count * 0.2) === 0) console.log(`${i}/${count} ...`);
    let randomEntreprise = getRandomEntreprise();
    let actual = {
      entreprise: randomEntreprise.entreprise,
      secteur: randomEntreprise.secteur,
      prioritaire: (Math.random() < 0.2),
      projet_besoin: PROJET_BESOIN[getRandom(0, PROJET_BESOIN.length)],
      prerequis: generatePrerequis(),
      city: CITY[getRandom(0, CITY.length)],
      tjm: getRandom(TJM_MIN, TJM_MAX),
    }
    data.push(actual);
  }
  return (data);
}

function generatePrerequis(){
  let prerequis = {
    competences: generateCompetences(getRandom(2, 8)),
    diplome: DIPLOMES[getRandom(0, DIPLOMES.length)],
    experience_min: EXPERIENCE_MIN[getRandom(0, EXPERIENCE_MIN.length)]
  };

  return prerequis;
}

function generateCompetences(count) {
  let competences = [];
  for (let i = 0; i < count; i++) {
    competences.push(COMPETENCES[getRandom(0, COMPETENCES.length)]);
  }
  return competences;
}

function getRandomEntreprise(){
  let randomSecteur = SECTEURS[getRandom(0, SECTEURS.length)];
  let randomEntreprise = ENTREPRISE_PAR_SECTEUR[randomSecteur][getRandom(0, ENTREPRISE_PAR_SECTEUR[randomSecteur].length)];

  return { secteur: randomSecteur, entreprise: randomEntreprise };
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
await db.drop(db.coll.market);
// run
await run(nb);