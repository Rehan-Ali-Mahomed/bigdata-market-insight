document.addEventListener("DOMContentLoaded", async () => {
  console.log("Page chargé !");
  await getStats();
});

let CHART = null;

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
  
  // build data
  let labels = Object.keys(body.postes);
  let data = labels.map(key => body.postes[key]);
  console.log(labels, data);
  
  CHART = new Chart(document.getElementById("chart").getContext("2d"), {
    type: "bar",
    options: {
      responsive:false,
      maintainAspectRatio: false
    },
    data: {
      labels: labels,
      dataset: [{
        label: "Offre par postes",
        data: data
      }]
    }
  });
}