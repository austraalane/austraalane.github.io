let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
export function fillInTable(data, activePage) {
  let resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
  let title = document.createElement("h3");
  title.innerHTML = "Transactions history:";
  title.classList.add("tableTitle");
  title.classList.add("bottomBorder");
  resultDiv.appendChild(title);
  let tableWrapper = document.createElement("div");
  tableWrapper.classList.add("table_wrapper");
  let table = document.createElement("table");
  let rowName = document.createElement("tr");

  table.append(rowName);
  for (let oneElement of data) {
    if (oneElement.object["name"] != "Piscine Go 2021") {
      let row = document.createElement("tr");
      for (const key in oneElement) {
        if (
          key == "object" ||
          key == "createdAt" ||
          key == "points" ||
          key == "amount"
        ) {
          if (typeof oneElement[key] == "object") {
            if (oneElement[key].length != undefined) {
              let extraCell = document.createElement("td");
              let number = parseInt(oneElement[key][0]["points"]);
              if (number >= 1000) {
                number /= 1000;
                extraCell.innerText = `${number.toFixed(2)} kB`;
              } else {
                extraCell.innerText = `${oneElement[key]} B`;
              }
              row.append(extraCell);
            } else {
              for (const keyExtra in oneElement[key]) {
                let extraCell = document.createElement("td");
                extraCell.innerHTML = oneElement[key][keyExtra];
                row.append(extraCell);
              }
            }
          } else {
            let cell = document.createElement("td");
            if (key == "amount") {
              let number = parseInt(oneElement[key]);
              if (number >= 1000) {
                number /= 1000;
                cell.innerText = `${number.toFixed(2)} kB`;
              } else {
                cell.innerText = `${oneElement[key]} B`;
              }
            } else if (key == "createdAt") {
              let day = oneElement[key].charAt(8) + oneElement[key].charAt(9);
              let month =
                months[
                  parseInt(
                    oneElement[key].charAt(5) + oneElement[key].charAt(6)
                  ) - 1
                ];
              let year =
                oneElement[key].charAt(0) +
                oneElement[key].charAt(1) +
                oneElement[key].charAt(2) +
                oneElement[key].charAt(3);
              cell.innerText = `${day} ${month} ${year}`;
            } else {
              cell.innerText = oneElement[key];
            }
            row.appendChild(cell);
          }
          table.appendChild(row);
        }
      }
    }
  }
  tableWrapper.appendChild(table);
  let result = document.getElementById("result");
  result.appendChild(tableWrapper);

  if (data.length > 0){
    if (activePage == "div") {
      showChartDIV(data, activePage);
    } else {
      showChart(data, activePage);
    }
  } else {
    document.getElementById('go-timeline').style.display = "none"
  }
}

/* POINTS TIMELINE*/
function showChart(dataList, path) {
  document.getElementById(
    "timeline-title"
  ).innerHTML = `${path.toUpperCase()} part progress`;
  let startDay =
    dataList[0]["createdAt"].charAt(8) + dataList[0]["createdAt"].charAt(9);
  let startMonth =
    dataList[0]["createdAt"].charAt(5) + dataList[0]["createdAt"].charAt(6);
  let endDay =
    dataList[dataList.length - 1]["createdAt"].charAt(8) +
    dataList[dataList.length - 1]["createdAt"].charAt(9);
  let endMonth =
    dataList[dataList.length - 1]["createdAt"].charAt(5) +
    dataList[dataList.length - 1]["createdAt"].charAt(6);

  //collect all points by day to add to timeline
  let allPointsByDays = [];
  let pointsEarned = 0;
  for (let i = 0; i < dataList.length - 1; i++) {
    let day1 =
      dataList[i]["createdAt"].charAt(8) + dataList[i]["createdAt"].charAt(9);
    let day2 =
      dataList[i + 1]["createdAt"].charAt(8) +
      dataList[i + 1]["createdAt"].charAt(9);

    if (day1 == day2) {
      pointsEarned += dataList[i]["amount"];
    } else {
      allPointsByDays.push(Math.round(pointsEarned / 1000));
      pointsEarned += dataList[i]["amount"];
    }
  }
  //add the last day as well
  pointsEarned += dataList[dataList.length - 1]["amount"];
  allPointsByDays.push(Math.round(pointsEarned / 1000));

  let dateLine = document.getElementById("x-label");
  dateLine.innerHTML = `
      <text x="90" y="420">${startDay}.${startMonth}</text>
      <text x="890" y="420">${endDay}.${endMonth}</text>
      <text x="500" y="460" class="label-title">DATE</text>
    `;
  let resultLine = document.getElementById("y-label");
  resultLine.innerHTML = `
      <text x="40" y="50">${Math.round(pointsEarned / 1000)} kB</text>
      <text x="40" y="400">0 kB</text>
      <text x="10" y="200" class="label-title">XP</text>
    `;

  let startX = 90;
  let xStep = (890 - 90) / (allPointsByDays.length - 1);
  let onePointHeigh = 350 / (pointsEarned / 1000);

  var polyline = document.getElementById("polyline-id-go");
  let points = polyline.getAttribute("points");
  points = ``;
  for (let i = 0; i < allPointsByDays.length; i++) {
    let currentY = 400 - onePointHeigh * allPointsByDays[i];
    points += `${startX},${currentY} `;
    startX += xStep;
  }
  polyline.setAttribute("points", points);
}

/* POINTS TIMELINE*/
function showChartDIV(dataList, path) {
  document.getElementById(
    "timeline-title"
  ).innerHTML = `${path.toUpperCase()} part progress`;
  let startDay =
    dataList[1]["createdAt"].charAt(8) + dataList[1]["createdAt"].charAt(9);
  let startMonth =
    dataList[1]["createdAt"].charAt(5) + dataList[1]["createdAt"].charAt(6);
  let endDay =
    dataList[dataList.length - 1]["createdAt"].charAt(8) +
    dataList[dataList.length - 1]["createdAt"].charAt(9);
  let endMonth =
    dataList[dataList.length - 1]["createdAt"].charAt(5) +
    dataList[dataList.length - 1]["createdAt"].charAt(6);

  //collect all points by day to add to timeline
  let allPointsByDays = [];
  let pointsEarned = 0;
  for (let i = 1; i < dataList.length - 1; i++) {
    let day1 =
      dataList[i]["createdAt"].charAt(8) + dataList[i]["createdAt"].charAt(9);
    let day2 =
      dataList[i + 1]["createdAt"].charAt(8) +
      dataList[i + 1]["createdAt"].charAt(9);

    if (day1 == day2) {
      pointsEarned += dataList[i]["points"][0]["points"];
    } else {
      allPointsByDays.push(Math.round(pointsEarned / 1000));
      pointsEarned += dataList[i]["points"][0]["points"];
    }
  }
  //add the last day as well
  pointsEarned += dataList[dataList.length - 1]["points"][0]["points"];
  allPointsByDays.push(Math.round(pointsEarned / 1000));

  let dateLine = document.getElementById("x-label");
  dateLine.innerHTML = `
      <text x="90" y="420">${startDay}.${startMonth}</text>
      <text x="890" y="420">${endDay}.${endMonth}</text>
      <text x="500" y="460" class="label-title">DATES</text>
    `;
  let resultLine = document.getElementById("y-label");
  resultLine.innerHTML = `
      <text x="40" y="50">${Math.round(pointsEarned / 1000)} kB</text>
      <text x="40" y="400">0 kB</text>
      <text x="10" y="200" class="label-title">XP</text>
    `;

  let startX = 90;
  let xStep = (890 - 90) / (allPointsByDays.length - 1);
  let onePointHeigh = 350 / (pointsEarned / 1000);

  var polyline = document.getElementById("polyline-id-go");
  let points = polyline.getAttribute("points");
  points = ``;
  for (let i = 0; i < allPointsByDays.length; i++) {
    let currentY = 400 - onePointHeigh * allPointsByDays[i];
    points += `${startX},${currentY} `;
    startX += xStep;
  }
  polyline.setAttribute("points", points);
}
