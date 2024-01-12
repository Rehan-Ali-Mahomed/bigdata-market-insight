document.addEventListener("DOMContentLoaded", async () => {
  console.log("Page chargé !");
  document.querySelector("#refresh-btn").addEventListener("click", (e) => {
    refreshData();
  });

  Chart.defaults.backgroundColor = "#000000";
  Chart.defaults.borderColor = "#757575";
  Chart.defaults.color = "#FFFFFF";
  Chart.defaults.font.family = "Hack"

  await getStats();
  await getMarketStats();
});

let MARKETSTAT = null; // To remove
let DATASTAT = null; // To remove

let CHART1 = null;
let CHART2 = null;
let CHART3 = null;
let CHART4 = null;
let CHART5 = null;
let CHART6 = null;
let CHART_POSTES = null;

let DISPLAY_TJM = false;

function setLoading(show) {
  if (show) {
    document.querySelector("#refresh-btn img").classList.add("rotate");
  } else {
    document.querySelector("#refresh-btn img").classList.remove("rotate");
  }
}

function refreshData() {
  let input = prompt("DONNEES CONSULTANTS. \nEntrer un nombre (ex: 350) pour générer les données de consultants. Note : Plus le nombre est élevée, plus le temps de traitement le sera ainsi que l'homogéinisation des données aléatoires.");
  let nb = parseInt(input);
  if (isNaN(nb)) {
    alert("Input not a number");
    return;
  }

  let input2 = prompt("DONNEES MARCHE. \nEntrer un nombre (ex: 550) pour générer les données de marché. Note : Plus le nombre est élevée, plus le temps de traitement le sera ainsi que l'homogéinisation des données aléatoires.");
  let nb2 = parseInt(input2);
  if (isNaN(nb)) {
    alert("Input not a number");
    return;
  }

  setLoading(true);
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      getMarketStats();
    }
  };
  xmlhttp.open("POST", "/api/refreshData", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.send(JSON.stringify({ count: nb }));

  let xmlhttp2 = new XMLHttpRequest();
  xmlhttp2.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      getMarketStats();
    }
  };
  xmlhttp2.open("POST", "/api/refreshMarketData", true);
  xmlhttp2.setRequestHeader("Content-Type", "application/json");
  xmlhttp2.send(JSON.stringify({ count: nb2 }));
}

/* ------- Data Charts ------- */

function getStats() {
  setLoading(true)
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let body = JSON.parse(this.responseText);
      DATASTAT = body;
      buildCharts(body);
    }
  };
  xmlhttp.open("GET", "/api/getStat", true);
  xmlhttp.send();
}

function buildCharts(stats) {
  console.log(stats);

  setStatsValues(stats.total, stats.availableMarkets.count)
  buildChartDiplomes(stats.diplomes);
  setLoading(false);
}

// Nombre de Consulttants | Consultants Disponibles | Consultants Placés
function setStatsValues(total, available) {
  let availableRatio = (total - available) * 100 / total;

  document.getElementById("consultants-total").innerText = total;
  document.getElementById("consultants-places").innerText = availableRatio.toFixed() + " %";
  document.getElementById("consultants-disponibles").innerText = available;
}

// Consultant par Diplôme
function buildChartDiplomes(diplomes) {
  let labels = Object.keys(diplomes);
  let min = diplomes[labels[0]], max = 0;

  labels.map(key => {
    if (diplomes[key] > max) max = diplomes[key];
    if (diplomes[key] < min) min = diplomes[key];
  });

  if (CHART3 !== null) CHART3.destroy();
  CHART3 = new Chart(document.getElementById("chart-3").getContext("2d"), {
    type: 'polarArea',
    data: {
      labels: labels,
      datasets: [{
        data: labels.map(key => diplomes[key])
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Consultant par Diplôme" }
      },
      scales: { r: { min: min - (min / 8), max: max } },
    }
  });
}

/* ------- Market Charts ------- */

function getMarketStats() {
  setLoading(true)
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let body = JSON.parse(this.responseText);
      MARKETSTAT = body; // To remove
      buildMarketCharts(body);
    }
  };
  xmlhttp.open("GET", "/api/getMarketStat", true);
  xmlhttp.send();
}

function buildMarketCharts(marketStats) {
  console.log(marketStats);

  setMarketValues(marketStats.total, marketStats.prioritaires, (marketStats.tjm.average).toFixed(2));

  buildMarketChartCities(DATASTAT.cities, marketStats.cities);
  buildMarketChartPostes(DATASTAT.postes, marketStats.projet_besoins);
  buildMarketChartSecteurs(marketStats.secteurs);
  buildMarketChartCompetences(marketStats.topcompetences);
  buildMarketCompetencesByCity(DATASTAT.postes, marketStats.projet_besoins);
  setLoading(false);
}

// Demandes Totales | Demandes Prioritaires | TJM Moyen du Marché
function setMarketValues(total, prioritaires, tjm_moyen) {
  document.getElementById("demandes-totales").innerText = total;
  document.getElementById("demandes-prioritaires").innerText = prioritaires;
  document.getElementById("demandes-tjm-moyen").innerText = tjm_moyen + " €";
}

// Tendance des postes du marché
function buildMarketChartPostes(postes, marketPostes) {
  let labels = Object.keys(postes);
  let min = postes[labels[0]].count, max = 0;
  labels.map(key => {
    if (postes[key].count > max) max = postes[key].count;
    if (postes[key].count < min) min = postes[key].count;
  });

  if (CHART_POSTES !== null) CHART_POSTES.destroy();
  CHART_POSTES = new Chart(document.getElementById("chart-1").getContext("2d"), {
    data: {
      labels: labels,
      datasets: [{
        type: "bar",
        label: "Consultants disponibles",
        yAxisID: "axis-postes",
        data: labels.map(key => postes[key].count)
      }, {
        type: "bar",
        label: "Demandes du marché",
        yAxisID: "axis-postes-demande",
        data: labels.map(key => marketPostes[key].count)
      }, {
        type: "line",
        label: "TJM Moyen du marché",
        yAxisID: "axis-tjm",
        data: labels.map(key => marketPostes[key].average)
      }]
    },
    options: {
      responsive: true,
      stacked: false,
      aspectRatio: 1,
      plugins: {
        title: { display: true, text: "Tendance des postes du marché" },
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      scales: {
        "axis-postes": {
          type: "linear",
          display: true,
          position: "left",
          min: 0,
          max: Math.round(max + (max / 10))
        },
        "axis-tjm": {
          type: "linear",
          display: true,
          position: "right",
          grid: { drawOnChartArea: false }
        },
        "axis-postes-demande": {
          type: "linear",
          display: false,
          position: "left",
          min: 0,
          //max: Math.round(max + (max / 10))
        },
      }
    }
  });
}

// Tendance des compétences du marché
function buildMarketChartCompetences(competences) {
  let labels = Object.keys(competences);

  let min = competences[labels[0]], max = 0;

  labels.map(key => {
    if (competences[key] > max) max = competences[key];
    if (competences[key] < min) min = competences[key];
  });

  if (CHART4 !== null) CHART4.destroy();
  CHART4 = new Chart(document.getElementById("chart-2").getContext("2d"), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: "Demandes du marché",
        data: labels.map(key => competences[key])
      },
      {
        label: "Compétences disponibles",
        data: labels.map(key => DATASTAT.competences[key])
      }
      ]
    },
    options: {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Tendance des compétences du marché" },
        // scales: { r: { min: min - (min / 2), max: max } },
      }
    }
  });
}

// Classement par Secteur d'activité
function buildMarketChartSecteurs(secteurs) {
  let labels = Object.keys(secteurs);
  let min = secteurs[labels[0]], max = 0;

  labels.map(key => {
    if (secteurs[key] > max) max = secteurs[key];
    if (secteurs[key] < min) min = secteurs[key];
  });

  if (CHART5 !== null) CHART5.destroy();
  CHART5 = new Chart(document.getElementById("chart-4").getContext("2d"), {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: labels.map(key => secteurs[key])
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Classement par Secteur d'activité" }
      },
    }
  });
}

// Classement par Ville
function buildMarketChartCities(cities, marketCities) {
  let labels = Object.keys(cities);

  if (CHART2 !== null) CHART2.destroy();
  CHART2 = new Chart(document.getElementById("chart-5").getContext("2d"), {
    type: "radar",
    data: {
      labels: labels,
      datasets: [{
        label: "Consultants disponibles",
        data: labels.map(key => cities[key])
      }, {
        label: "Demandes du marché",
        data: labels.map(key => marketCities[key])
      }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: "Classement par Ville" },
      }
    }
  });
}

// Tendance des postes du marché
function buildMarketChartPostes(postes, marketPostes) {
  let labels = Object.keys(postes);
  let min = postes[labels[0]].count, max = 0;
  labels.map(key => {
    if (postes[key].count > max) max = postes[key].count;
    if (postes[key].count < min) min = postes[key].count;
  });

  if (CHART_POSTES !== null) CHART_POSTES.destroy();
  CHART_POSTES = new Chart(document.getElementById("chart-1").getContext("2d"), {
    data: {
      labels: labels,
      datasets: [{
        type: "bar",
        label: "Consultants disponibles",
        yAxisID: "axis-postes",
        data: labels.map(key => postes[key].count)
      }, {
        type: "bar",
        label: "Demandes du marché",
        yAxisID: "axis-postes-demande",
        data: labels.map(key => marketPostes[key].count)
      }, {
        type: "line",
        label: "TJM Moyen du marché",
        yAxisID: "axis-tjm",
        data: labels.map(key => marketPostes[key].average)
      }]
    },
    options: {
      responsive: true,
      stacked: false,
      aspectRatio: 1,
      plugins: {
        title: { display: true, text: "Tendance des postes du marché" },
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      scales: {
        "axis-postes": {
          type: "linear",
          display: true,
          position: "left",
          min: 0,
          max: Math.round(max + (max / 10))
        },
        "axis-tjm": {
          type: "linear",
          display: true,
          position: "right",
          grid: { drawOnChartArea: false }
        },
        "axis-postes-demande": {
          type: "linear",
          display: false,
          position: "left",
          min: 0,
          //max: Math.round(max + (max / 10))
        },
      }
    }
  });
}

function buildMarketCompetencesByCity(postesDisponibles, postesDemandes) {
  // Préparation des données pour le graphique à barres groupées
  const labels = Object.keys(postesDisponibles);
  const dataTjmDisponibles = labels.map(label => postesDisponibles[label].average);
  const dataTjmDemandes = labels.map(label => postesDemandes[label] ? postesDemandes[label].average : 0);

  // Configuration du graphique à barres groupées
  const data = {
    labels: labels,
    datasets: [{
      label: 'TJM Consultants Disponibles',
      data: dataTjmDisponibles,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }, {
      label: 'TJM du Marché',
      data: dataTjmDemandes,
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  const options = {
    plugins: { title: { text: "Différence entre les TJM du marchés et disponibles", display: true} },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Création du graphique à barres groupées
  const config = {
    type: 'bar',
    data: data,
    options: options
  };

  // Affichage du graphique
  const myGroupedBarChart = new Chart(
    document.getElementById('chart-6'),
    config
  );
}