#!/usr/bin/node
import { fillInTable } from "./tools/fillTable.js";
import {
  goPiscine,
  jsPiscine,
  transactionRequest,
  OnlyDivPart,
  pointsRequestByObjectID,
  auditPointsRequest,
  userRequest,
} from "./tools/requests.js";

let grandTotalXP = 0;
let activePage = "go";
let dataList = [];
let total = 0;

window.addEventListener("load", async (event) => {
  preLoadData();
});

async function preLoadData() {
  getAuditPoints(0);
  //calculate total earned XP amount
  await piscineTransactions(0, goPiscine);
  dataList = [];
  await divRequest();
  dataList = [];
  await piscineTransactions(0, jsPiscine);
  grandTotalXP = Math.round((total + grandTotalXP) / 1000);
  start(grandTotalXP);
}

let userInput = document.getElementById("username");
userInput.addEventListener("click", () => {
  userInput.value = "";
});

let username = "austraalane";
let myUserId = 3439;
userInput.addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    let newUsername = userInput.value;
    let variables = { login: newUsername };
    return queryFetch(userRequest, variables).then((result) => {
      if (result.data.user.length != 0) {
        username = result.data.user[0].login;
        myUserId = result.data.user[0].id;
        grandTotalXP = 0;
        activePage = "go";
        dataList = [];
        total = 0;
        fullDiv = [];
        (auditDone = 0), (auditReceived = 0), (divTotalPoints = 0);
        preLoadData();
        let options = document.querySelectorAll(".piscine-choice");
        options.forEach((btn) => {
          if (btn.classList.contains("active")) {
            btn.classList.remove("active");
          }
          let part = btn.getAttribute("data-target");
          if (part == activePage) {
            btn.classList.add("active");
          }
        });
      }
    });
  }
});

async function start(grandTotalXP) {
  total = 0;
  dataList = [];
  switch (activePage) {
    case "go":
      dataList = await piscineTransactions(0, goPiscine);
      fillInTable(dataList, activePage);
      break;
    case "div":
      fillInTable(fullDiv, activePage);
      break;
    case "js":
      dataList = await piscineTransactions(0, jsPiscine);
      fillInTable(dataList, activePage);
      break;
  }

  //change points and transaction numbers depending on the section chosen
  let points = document.getElementById("points-number");
  points.innerHTML = `${Math.round(
    total / 1000
  )} <span style="color:var(--lightGrey1)">kB</span>`;

  let totalTransactions = document.getElementById("transactionsResult");
  totalTransactions.innerHTML = `${dataList.length}`;

  let current = Math.round(total / 1000);
  if (activePage == "div") {
    current = Math.round(divTotalPoints / 1000);
    totalTransactions.innerHTML = fullDiv.length - 1;
    points.innerHTML = `${current} <span style="color:var(--lightGrey1)">kB</span>`;
  }

  document.getElementById(
    "ratioPie"
  ).innerHTML = `Ratio "${activePage}" section points vs all my earned points`;
  document.getElementById("xpRatio").innerHTML = current + " / " + grandTotalXP;

  // SVG PIE
  // fill in % of XP ratio
  let value = (current * 100) / grandTotalXP;
  // Cap input between 0 and 100
  if (value > 100) {
    value = 100;
  } else if (value < 0) {
    value = 0;
  }

  var circle = document.querySelector(".svg #bar"),
    r = circle.getAttribute("r"),
    c = Math.PI * r * 2,
    pct = ((100 - value) / 100) * c; // Calculate the percentage of the svg dasharray length

  // Set progress stroke length in css
  circle.style.strokeDashoffset = pct;
  document.querySelector(".percentage").innerHTML = Math.round(value) + "%"; // Display the percentage figure
}

//CALCULATE "DIV" PART POINTS, AUDIT RATIO AND MAKE A LIST OF ALL TASKS
let fullDiv;
let auditDone = 0,
  auditReceived = 0,
  divTotalPoints = 0;

async function divRequest() {
  let variables = { userId: myUserId };
  return await queryFetch(OnlyDivPart, variables).then((data) => {
    fullDiv = new Array(data.data.progress.length);
    for (let i = 0; i < data.data.progress.length; i++) {
      let item = data.data.progress[i];
      let id = item.objectId;
      calculatePoints(id).then((result) => {
        item["points"] = result;
        // if (result[0]["points"] > 0) {
        fullDiv[i] = item;
        grandTotalXP += item.points[0]["points"];
        divTotalPoints += item.points[0]["points"];
        //  }
      });
    }
  });
}

async function calculatePoints(id) {
  let variables = { objectId: id, userId: myUserId };
  return queryFetch(pointsRequestByObjectID, variables).then((data2) => {
    
    let maxNumber = 0;
    let maxSkill = { name: "max", points: maxNumber };
    let skills = [maxSkill];
    if (data2.data.transaction.length > 0) {
      data2.data.transaction.forEach((oneElement) => {
        if (
          oneElement.type == "up" ||
          oneElement.type == "down" ||
          oneElement.type == "xp"
        ) {
          if (maxNumber < oneElement.amount) {
            maxNumber = oneElement.amount;
            maxSkill["points"] = maxNumber;
          }
        } else if (oneElement.type.includes("_")) {
          let name = oneElement.type.split("_")[1];
          let oneSkill = { skill: name, level: oneElement.amount };
          skills.push(oneSkill);
        }
      });
    }
    return skills;
  });
}

//CALCULATE AUDIT POINTS
async function getAuditPoints(startNumber) {
  let number = startNumber;
  let variables = { offset: startNumber, userId: myUserId };
  return queryFetch(auditPointsRequest, variables)
    .then((result) => {
      result.data.transaction.forEach((item) => {
        if (item.type == "down") {
          auditDone += item.amount;
        }
        if (item.type == "up") {
          auditReceived += item.amount;
        }
      });
      if (result.data.transaction.length == 50) {
        number += 50;
        return getAuditPoints(number);
      } else {
        return;
      }
    })
    .then(() => {
      //fill in audit information
      let auditDoneBox = document.getElementById("audit-done");
      let rounded1 = auditDone / 1000000;
      auditDoneBox.innerHTML = `RECEIVED: ${rounded1.toFixed(2)} MB audits`;
      let auditRecBox = document.getElementById("audit-received");
      let rounded2 = auditReceived / 1000000;
      auditRecBox.innerHTML = `DONE: ${rounded2.toFixed(2)} MB audits`;

      //adjust the width
      let ratio = auditReceived / auditDone;
      document.getElementById("audit-ratio").innerHTML = `${ratio.toFixed(
        2
      )} %`;
      document.getElementById("auditDoneRect").style.width = 200 * ratio;
    });
}

//GET PISCINE TRANSACTION POINTS
async function piscineTransactions(startNumber, String) {
  let number = startNumber;
  let variables = { offset: startNumber, path: String, userId: myUserId };
  return queryFetch(transactionRequest, variables).then((data) => {
    data.data.transaction.forEach((item) => {
      dataList.push(item);
      total += item.amount;
    });
    if (dataList.length % 50 == 0 && data.data.transaction.length > 0) {
      number += 50;
      return piscineTransactions(number, String);
    } else {
      return dataList;
    }
  });
}

// show/hide transaction detailed table
let detailsButton = document.getElementById("seeDetails");
detailsButton.addEventListener("click", () => {
  let result = document.getElementById("result");
  let arrow = document.querySelector(".fas");
  if (result.classList.contains("hide")) {
    result.classList.remove("hide");
    arrow.classList.add("down");
    detailsButton.classList.add("opened");
  } else {
    result.classList.add("hide");
    arrow.classList.remove("down");
    detailsButton.classList.remove("opened");
  }
});

/* GO / DIV SELECTOR */
let options = document.querySelectorAll(".piscine-choice");
options.forEach((btn) => {
  if (btn.classList.contains("active")) {
    activePage = btn.getAttribute("data-target");
  }
  btn.addEventListener("click", (e) => {
    total = 0;
    dataList = [];
    let clickedBtn = e.currentTarget;
    options.forEach((btn) => {
      btn.classList.remove("active");
    });
    if (!clickedBtn.classList.contains("active")) {
      clickedBtn.classList.add("active");
      activePage = btn.getAttribute("data-target");
    }
    start(grandTotalXP);
  });
});

async function queryFetch(queryText, variables) {
  return fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: queryText,
      variables,
    }),
  }).then((res) => res.json());
}
