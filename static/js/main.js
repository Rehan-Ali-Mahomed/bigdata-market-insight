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
  let input = prompt("Number of data to generate (ex: 10500)");
  let nb = parseInt(input);
  if (isNaN(nb)) {
    alert("Input not a number");
    return;
  }

  setLoading(true);
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      getStats();
      getMarketStats();
    }
  };
  xmlhttp.open("POST", "/refreshData", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.send(JSON.stringify({ count: nb }));

  let xmlhttp2 = new XMLHttpRequest();
  xmlhttp2.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      getStats();
      getMarketStats();
    }
  };
  xmlhttp2.open("POST", "/refreshMarketData", true);
  xmlhttp2.setRequestHeader("Content-Type", "application/json");
  xmlhttp2.send(JSON.stringify({ count: nb }));
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
  xmlhttp.open("GET", "/getStat", true);
  xmlhttp.send();
}

function buildCharts(body) {
  console.log(body);

  // buildChartPostes(body.postes);
  buildChartCities(body.cities);
  buildChartDiplomes(body.diplomes);
  // buildChartCompetences(body.competences);
  setLoading(false);
}

function buildChartPostes(postes) {
  let labels = Object.keys(postes);
  let min = postes[labels[0]].count, max = 0;
  labels.map(key => {
    if (postes[key].count > max) max = postes[key].count;
    if (postes[key].count < min) min = postes[key].count;
  });

  console.log("max", min, max);
  if (CHART1 !== null) CHART1.destroy();
  CHART1 = new Chart(document.getElementById("chart-2").getContext("2d"), {
    data: {
      labels: labels,
      datasets: [{
        type: "bar",
        label: "Offre par poste",
        yAxisID: "axis-postes",
        data: labels.map(key => postes[key].count)
      }, {
        type: "line",
        label: "TJM Moyen",
        yAxisID: "axis-tjm",
        data: labels.map(key => postes[key].average)
      }]
    },
    options: {
      responsive: true,
      stacked: false,
      aspectRatio: 1,
      interaction: {
        mode: "index",
        intersect: false
      },
      scales: {
        "axis-postes": {
          type: "linear",
          display: true,
          position: "left",
          min: min - (min / 10),
          max: max + (max / 20)
        },
        "axis-tjm": {
          type: "linear",
          display: true,
          position: "right",
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function buildChartCities(cities) {
  let labels = Object.keys(cities);

  if (CHART2 !== null) CHART2.destroy();
  CHART2 = new Chart(document.getElementById("chart-5").getContext("2d"), {
    type: "radar",
    data: {
      labels: labels,
      datasets: [{
        label: "Postes par ville",
        data: labels.map(key => cities[key])
      }]
    }
  });
}

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
        title: { display: true, text: "Nb Postes par diplome" }
      },
      scales: { r: { min: min - (min / 8), max: max } },
    }
  });
}

function buildChartCompetences(competences) {
  let labels = Object.keys(competences);
  let data = labels.map((key, i) => {
    return ({ x: i, y: competences[labels[i]] });
  });

  if (CHART4 !== null) CHART4.destroy();
  CHART4 = new Chart(document.getElementById("chart-4").getContext("2d"), {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Postes par competences",
        data: data
      }]
    },
    options: {
      scales: {
        x: { display: true }
      },
      
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              //console.log(context);
              return ` ${context.raw.y} Postes`;
            }
          }
        }
      }
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
  xmlhttp.open("GET", "/getMarketStat", true);
  xmlhttp.send();
}

function buildMarketCharts(body) {
  console.log(body);

  buildChartMarketPostes(DATASTAT.postes, body.projet_besoins);
  /* buildChartCities(body.cities);
  buildChartDiplomes(body.diplomes);*/
  buildMarketChartCompetences(body.topcompetences); 
  setLoading(false);
}

function buildChartMarketPostes(postes, marketPostes) {
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
      }
      /* , {
        type: "line",
        label: "Offre - TJM Moyen",
        yAxisID: "axis-tjm",
        data: labels.map(key => postes[key].average)
      },*/]
    },
    options: {
      responsive: true,
      stacked: false,
      aspectRatio: 1,
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
          max: Math.round(max + (max / 10))
        },
        /* 
        "axis-tjm-demande": {
          type: "linear",
          display: false,
          position: "right",
          grid: { drawOnChartArea: false }
        } */
      }
    }
  });
}

/* 
function buildChartCities(cities) {
  let labels = Object.keys(cities);

  if (CHART2 !== null) CHART2.destroy();
  CHART2 = new Chart(document.getElementById("chart-2").getContext("2d"), {
    type: "radar",
    data: {
      labels: labels,
      datasets: [{
        label: "Postes par ville",
        data: labels.map(key => cities[key])
      }]
    }
  });
}

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
        title: { display: true, text: "Nb Postes par diplome" }
      },
      scales: { r: { min: min - (min / 8), max: max } },
    }
  });
}*/

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
        label: "Compétences disponibles", 
        data: labels.map(key => competences[key])
      },
      {
        label: "Demandes du marché",
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
    /*type: "pie",
    data: {
      labels: labels,
      datasets: [{
        label: "Postes par competences",
        data: data
      }]
    },
    options: {
      responsive: true
       scales: {
        x: { display: false }
      }, 
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              //console.log(context);
              return `${context.raw.y} Postes`;
            }
          }
        }
      }*/
    }
  });
}