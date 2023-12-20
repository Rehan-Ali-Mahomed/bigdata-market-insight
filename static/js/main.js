document.addEventListener("DOMContentLoaded", async () => {
  console.log("Page chargé !");
  await getStats();
});

let CHART1 = null;
let CHART2 = null;
let CHART3 = null;
let CHART4 = null;

function getStats() {
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      let body = JSON.parse(this.responseText);
      buildCharts(body);
    }
  };
  xmlhttp.open("GET", "/getStat", true);
  xmlhttp.send();
}

function buildCharts(body) {
  console.log(body);

  buildChartPostes(body.postes);
  buildChartCities(body.cities);
  buildChartDiplomes(body.diplomes);
  buildChartCompetences(body.competences);
}

function buildChartPostes(postes) {
  let labels = Object.keys(postes);
  //let data = labels.map(key => postes[key]);

  CHART1 = new Chart(document.getElementById("chart-1").getContext("2d"), {
    data: {
      labels: labels,
      datasets: [{
        type: "bar",
        label: "Nb Offre par poste",
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

  CHART2 = new Chart(document.getElementById("chart-2").getContext("2d"), {
    type: "radar",
    data: {
      labels: labels,
      datasets: [{
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
      scales: { r: { min: min - (min/8), max: max } },
    }
  });
}

function buildChartCompetences(competences) {
  let labels = Object.keys(competences);

  CHART4 = new Chart(document.getElementById("chart-4").getContext("2d"), {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        label: "Postes par competences",
        data: labels.map(key => competences[key])
      }]
    }
  })
}