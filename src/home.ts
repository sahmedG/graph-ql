import {
  getAuditData,
  getLatestFinishedAudit,
  getLatestFinishedProject,
  getTitleData,
  getXpForProjects,
  getAuditsWithEvents,
  getSkills,
  getWorkingOn,
} from "./network.js";
import { getRandomItem, isPossiblyLoggedIn, parseJwt } from "./helpers.js";
import Navbar from "./navbar.js";
import router from "./router.js";
import pieMaker from "./pie.js";
import { DonutSlice } from "types.js";
import { Audit } from "types.js";

export default function homeHandler() {
  if (!isPossiblyLoggedIn()) {
    console.log("not logged in");
    router.navigateTo("/login");
    return;
  }

  document.body.append(
    Navbar([
      { title: "My Profile", slug: "/" },
      { title: "Logout", slug: "/logout" },
    ]),
    renderTitle(),
    renderStats(),
    renderBottom()
  );
}

function renderTitle(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "space-between";
  // to space the title and navbar
  container.style.marginTop = "16px";

  const title = document.createElement("h2");
  title.innerText = "Loading...";

  const level = document.createElement("h3");
  level.innerText = "Loading...";
  level.style.color = "var(--gray-11)";

  container.append(title, level);

  getTitleData(parseJwt().userId)
    .then((data) => {
      title.innerText = `Welcome, ${data.firstName}!`;
      level.innerText = `Level ${data.level}`;
    })
    .catch((error) => {
      title.innerText = "Error";
      level.innerText = error;
    });

  return container;
}

function renderStats(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  // container.style.alignItems = "stretch";
  container.style.gap = "13px";
  container.style.justifyContent = "space-between";
  container.append(leftStats(), renderSkills(), rightStats());

  return container;
}

function leftStats(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.width = "44%";
  container.style.border = "2px solid var(--pink-6)";
  container.style.borderRadius = "8px";

  container.append(leftStatsTopView(), leftStatsBottomView());

  return container;
}

function leftStatsTopView(): HTMLElement {
  const container = document.createElement("div");

  // take full width
  container.style.width = "100%";
  // grow to take all height
  container.style.flexGrow = "1";

  container.style.display = "flex";
  container.style.flexDirection = "column";

  container.style.gap = "16px";

  container.style.padding = "30px";
  container.style.backgroundColor = "var(--pink-3)";
  // if not background will overlap
  // round top corners
  container.style.borderTopLeftRadius = "8px";
  container.style.borderTopRightRadius = "8px";

  container.style.borderBottom = "2px solid var(--pink-6)";

  const title = document.createElement("h5");
  title.innerText = "Audits Ratio";

  const doneDiv = document.createElement("div");

  const doneTitle = document.createElement("p");

  doneTitle.innerText = "Done";
  doneTitle.style.color = "var(--pink-11)";
  doneTitle.style.fontWeight = "bold";
  // make it near the line
  doneTitle.style.marginBottom = "-12px";

  const receivedTitle = document.createElement("p");

  receivedTitle.style.marginTop = "8px";
  receivedTitle.innerText = "Received";
  receivedTitle.style.color = "var(--pink-12)";
  receivedTitle.style.fontWeight = "bold";
  // make it near the line
  receivedTitle.style.marginBottom = "-12px";

  const doneLine = makeLine(100, "var(--pink-11)");
  const receivedLine = makeLine(50, "var(--pink-12)");

  doneDiv.append(doneTitle, doneLine, receivedTitle, receivedLine);

  const ratio = document.createElement("h5");
  ratio.innerText = "Loading...";
  ratio.style.color = "var(--pink-12)";
  ratio.style.textAlign = "end";

  container.append(title, doneDiv, ratio);

  getAuditData(parseJwt().userId)
    .then((data) => {
      ratio.innerText = data.auditRatio.toFixed(1);

      if (data.totalUp > data.totalDown) {
        doneLine.style.width = "100%";
        receivedLine.style.width = `${(data.totalDown / data.totalUp) * 100}%`;
      } else {
        receivedLine.style.width = "100%";
        doneLine.style.width = `${(data.totalUp / data.totalDown) * 100}%`;
      }
    })
    .catch((error) => {
      console.log(error);
      ratio.innerText = error;
    });

  return container;
}

function makeLine(length: number, color: string): SVGElement {
  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("height", "10px");
  svgElement.setAttribute("width", `${length}%`);

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line"
  );
  pathElement.setAttribute("x1", "0");
  pathElement.setAttribute("y1", "100%");
  pathElement.setAttribute("x2", "100%");
  pathElement.setAttribute("y2", "100%");

  pathElement.style.stroke = color;
  pathElement.style.strokeWidth = "10px";

  svgElement.appendChild(pathElement);

  return svgElement;
}

function leftStatsBottomView(): HTMLElement {
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.flexDirection = "row";

  const leftView = document.createElement("div");
  leftView.style.width = "50%";
  leftView.style.minHeight = "100%";

  leftView.style.display = "flex";
  leftView.style.flexDirection = "column";
  leftView.style.justifyContent = "space-between";
  leftView.style.gap = "26px";

  leftView.style.padding = "30px";
  leftView.style.backgroundColor = "var(--pink-1)";

  // if not background will overlap
  // round top corners
  leftView.style.borderBottomLeftRadius = "8px";

  leftView.style.borderRight = "2px solid var(--pink-6)";

  const leftViewTitle = document.createElement("h5");
  leftViewTitle.innerText = "Your Last Audit";
  leftViewTitle.style.color = "var(--pink-11)";

  const leftViewProjectName = document.createElement("h5");
  leftViewProjectName.style.color = "var(--pink-12)";
  leftViewProjectName.innerText = "Loading...";

  leftView.append(leftViewTitle, leftViewProjectName);

  // Right view

  const rightView = document.createElement("div");
  rightView.style.width = "50%";
  rightView.style.minHeight = "100%";

  rightView.style.display = "flex";
  rightView.style.flexDirection = "column";
  rightView.style.justifyContent = "space-between";
  rightView.style.gap = "26px";

  rightView.style.padding = "30px";
  rightView.style.backgroundColor = "var(--pink-1)";

  rightView.style.borderBottomRightRadius = "8px";

  const rightViewTitle = document.createElement("h5");
  rightViewTitle.innerText = "You Just Finished";
  rightViewTitle.style.color = "var(--pink-11)";

  const rightViewProjectName = document.createElement("h5");
  rightViewProjectName.style.color = "var(--pink-12)";
  rightViewProjectName.innerText = "Loading...";

  rightView.append(rightViewTitle, rightViewProjectName);

  container.append(leftView, rightView);

  getLatestFinishedAudit(parseJwt().userId)
    .then((data) => {
      leftViewProjectName.innerHTML = `${
        data.projectName
      } <span style="color: var(--pink-11);font-weight:normal">- ${
        data.captain
      }</span> ${data.didPass ? "✅" : "❌"}`;
    })
    .catch((error) => {
      leftViewProjectName.innerText = error;
    });

  getLatestFinishedProject(parseJwt().userId)
    .then((project) => {
      rightViewProjectName.innerText = project;
    })
    .catch((error) => {
      rightViewProjectName.innerText = error;
    });
  return container;
}

function rightStats(): HTMLElement {
  const container = document.createElement("div");
  container.style.flexGrow = "1";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "16px";
  container.style.backgroundColor = "var(--pink-1)";
  container.style.border = "2px solid var(--pink-6)";
  container.style.borderRadius = "8px";
  container.style.padding = "30px";

  const title = document.createElement("h5");
  title.style.display = "flex";
  title.style.flexDirection = "column";
  title.style.alignItems = "center";

  title.innerText = "Your Projects";

  const xpDiv = document.createElement("div");
  xpDiv.style.display = "flex";
  xpDiv.style.justifyContent = "space-between";

  const workingOnDiv = document.createElement("div");
  workingOnDiv.style.display = "flex";
  workingOnDiv.style.flexDirection = "column";
  workingOnDiv.style.alignItems = "center";

  container.append(title, xpDiv, workingOnDiv, workingOn());

  getXpForProjects(parseJwt().userId)
    .then((projects) => {
      // sort array by amount
      projects.sort((a, b) => b.amount - a.amount);

      // Calculate the total sum of all project amounts
      const totalAmount = projects.reduce((acc, d) => acc + d.amount, 0);

      const pieData: DonutSlice[] = [];
      const colors = ["#37a8b9", "#43bcce", "#54d4e8", "#75ffda", "#6bffed"];

      let lastColor = "";

      projects.forEach((project) => {
        // Get a random color from the colors array
        let color = getRandomItem(colors);
        while (color === lastColor) {
          color = getRandomItem(colors);
        }
        lastColor = color;

        pieData.push({
          id: project.amount,
          percent: (project.amount / totalAmount) * 100, // Calculate percentage
          color: color,
          label: `${project.name} - ${(
            (project.amount / totalAmount) *
            100
          ).toFixed(1)}%`,
        });
      });

      const pie = pieMaker(pieData, 20, 40, 3, (slice) => {
        console.log(slice.label);
      });
      pie.style.width = "150px";

      const topOnesDiv = document.createElement("div");
      topOnesDiv.style.textAlign = "right";

      const topOnesTitle = document.createElement("h5");
      topOnesTitle.innerText = "Top 5 Projects";
      topOnesTitle.style.color = "var(--pink-11)";

      topOnesDiv.append(topOnesTitle);

      projects.slice(0, 5).forEach((project) => {
        const p = document.createElement("p");
        // amount is bytes converted to KB
        p.innerText = `${project.name} - ${project.amount / 1000} KB`;

        p.style.color = "var(--pink-10)";
        topOnesDiv.append(p);
      });

      xpDiv.innerHTML = "";
      xpDiv.append(pie, topOnesDiv);
    })
    .catch((error) => {
      console.log(error);
    });

  return container;
}

document.addEventListener("DOMContentLoaded", () => {
  const mainContainer = document.getElementById("mainContainer"); // Assuming there's an element with this id in your HTML
  if (mainContainer) {
    mainContainer.appendChild(renderBottom());
  }
});

function renderSkills(): HTMLElement {
  // const container = document.createElement("div");

  const skillsDiv = document.createElement("div");
  skillsDiv.style.display = "flex";
  skillsDiv.style.flexDirection = "column";
  skillsDiv.style.padding = "inherit";
  skillsDiv.style.alignItems = "center";
  skillsDiv.style.justifyContent = "space-evenly";
  skillsDiv.style.border = "2px solid var(--pink-6)";
  skillsDiv.style.borderRadius = "8px";
  skillsDiv.style.width = "25%";

  const skillsTitle = document.createElement("div");
  skillsTitle.innerHTML = "<h5>Best skills</h5>";
  skillsTitle.style.display = "flex";
  skillsTitle.style.flexDirection = "row";
  skillsTitle.style.justifyContent = "center";
  skillsTitle.style.padding = "inherit";

  getSkills(parseJwt().userId)
    .then((skills) => {
      // Clear existing content
      skillsDiv.innerHTML = "";
      // Create a container for the graph
      const graphContainer = document.createElement("div");
      graphContainer.classList.add("graph-container");
      graphContainer.style.display = "flex";
      graphContainer.style.flexDirection = "row";
      graphContainer.style.justifyContent = "center";
      graphContainer.style.padding = "inherit";
      // Define the dimensions and radius for the radar chart
      const width = 200;
      const height = 200;
      const radius = Math.min(width, height) / 2;
      // Create an SVG element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", width.toString());
      svg.setAttribute("height", height.toString());
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("overflow", "visible");
      // Create a group element to hold the radar chart
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${width / 2},${height / 2})`);
      svg.appendChild(g);

      const angleSlice = (2 * Math.PI) / skills.length;

      // Create radial axes (only for y-axis and diagonals)
      for (let i = 0; i < skills.length; i++) {
        const angle = i * angleSlice - Math.PI / 2; // Adjust to start from y-axis

        // Draw lines only for y-axis and diagonals

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        const dotX = radius * Math.cos(angle);
        const dotY = radius * Math.sin(angle);
        line.setAttribute("y1", "0");
        line.setAttribute("x1", "0");
        line.setAttribute("x2", dotX.toString());
        line.setAttribute("y2", dotY.toString());
        line.setAttribute("stroke", "rgb(32,178,170)");
        line.setAttribute("stroke-width", "0.9");
        g.appendChild(line);

        // Add dots along the line
        for (let j = 0; j <= 10; j++) {
          const dotX = (radius * j * Math.cos(angle)) / 10;
          const dotY = (radius * j * Math.sin(angle)) / 10;
          const dot = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          dot.setAttribute("cx", dotX.toString());
          dot.setAttribute("cy", dotY.toString());
          dot.setAttribute("r", "2");
          dot.setAttribute("fill", "rgb(170, 170, 170)");
          g.appendChild(dot);
        }
      }

      // Create the radar area
      const radarPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      const radarCoords = skills
        .map((skill: { amount: number }, i: number) => {
          const angle = i * angleSlice - Math.PI / 2; // Adjust to start from y-axis
          const x = radius * (skill.amount / 100) * Math.cos(angle);
          const y = radius * (skill.amount / 100) * Math.sin(angle);
          return `${x},${y}`;
        })
        .join(" ");
      radarPath.setAttribute("d", `M${radarCoords}Z`);
      radarPath.setAttribute("fill", "var(--pink-3)");
      radarPath.setAttribute("stroke-width", "0");
      radarPath.setAttribute("stroke", "none");
      radarPath.setAttribute("fill-opacity", "0.9");
      g.appendChild(radarPath);

      // Create circular bordert it is and if it is still valid as it's loading time is high, or should we remove it? The same goes for Cookiebot—is it still valid, or should we remove it?
      const borderCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      borderCircle.setAttribute("cx", "0");
      borderCircle.setAttribute("cy", "0");
      borderCircle.setAttribute("r", radius.toString());
      borderCircle.setAttribute("stroke", "white");
      borderCircle.setAttribute("stroke-width", "1");
      borderCircle.setAttribute("fill", "none");
      g.appendChild(borderCircle);

      // Add skill labels around the border
      skills.forEach((skill: { type: string }, i: number) => {
        const skillName = skill.type.split("_");
        const angle = i * angleSlice - Math.PI / 2; // Adjust to start from y-axis
        const x = (radius + 10) * Math.cos(angle);
        const y = (radius + 10) * Math.sin(angle);
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", x.toString());
        text.setAttribute("y", y.toString());
        text.setAttribute("fill", "white");
        text.setAttribute("font-family", "IBM Plex Mono");
        text.setAttribute("font-size", "12");
        text.setAttribute("text-anchor", x < 0 ? "end" : "start");
        text.setAttribute("alignment-baseline", "middle");
        text.textContent = skillName[1];
        g.appendChild(text);
      });

      // Append the radar chart SVG to the graph container
      graphContainer.appendChild(svg);

      // Append the graph container to the skillsDiv
      skillsDiv.append(skillsTitle, graphContainer);
    })
    .catch((error) => {
      console.error(error);
      // Handle error
    });
  // container.append(skillsDiv);
  return skillsDiv;
}

function renderBottom(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  // container.style.alignItems = "center";
  container.style.justifyContent = "space-between";

  container.style.marginTop = "16px";
  container.append(bottomTitle());

  setTimeout(() => {
    container.append(bottomTable());
  }, 0);

  return container;
}

export function bottomTitle(): HTMLElement {
  const container = document.createElement("div-main");
  container.style.display = "flex";
  container.style.justifyContent = "space-between";
  container.style.alignItems = "center";
  const LeftSide = document.createElement("div-left");
  const RightSide = document.createElement("div-right");
  RightSide.style.backgroundColor = "var(--pink-3)";
  RightSide.style.padding = "10px";
  const title = document.createElement("h3");
  title.innerText = "All Audits";
  title.style.color = "var(--pink-12)";

  // Filter by dropdown
  const List = document.createElement("select");
  List.id = "auditFilterList";
  const Label = document.createElement("label");
  Label.innerText = "Filter by: ";
  Label.style.color = "var(--pink-11)";
  List.add(new Option("All", "all"));
  List.add(new Option("TO DO", "null"));
  List.add(new Option("PASS", "1"));
  List.add(new Option("FAIL", "0"));
  List.style.backgroundColor = "var(--pink-3)";
  List.style.color = "var(--pink-12)";
  List.style.fontWeight = "bold";
  List.style.fontSize = "16px";
  // End of Filter by dropdown

  LeftSide.append(title);
  RightSide.append(Label, List);
  container.append(LeftSide, RightSide);

  return container;
}

function bottomTable(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.justifyContent = "space-between";
  container.style.backgroundColor = "var(--pink-1)";
  container.style.border = "2px solid var(--pink-6)";
  container.style.borderRadius = "8px";
  container.style.padding = "30px";
  container.style.height = "100%";
  container.style.marginTop = "16px";

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const thead = document.createElement("thead");
  thead.style.textAlign = "Justify";
  thead.style.borderBottom = "4px solid var(--pink-6)";
  thead.style.padding = "10px";

  const tr = document.createElement("tr");
  const th1 = document.createElement("th");
  th1.innerText = "Project (Captain)";
  const th2 = document.createElement("th");
  th2.innerText = "XP Gained KB";
  const th3 = document.createElement("th");
  th3.innerText = "Expires In";
  const th4 = document.createElement("th");
  th4.innerText = "Status";

  tr.append(th1, th2, th3, th4);
  thead.append(tr);

  const tbody = document.createElement("tbody");

  table.append(thead, tbody);

  container.append(table);

  let auditsData: Audit[] = [];

  const renderTable = (filteredAudits: Audit[]) => {
    tbody.innerHTML = "";
    filteredAudits.forEach((audit) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--pink-6)";

      // project name (captain name)
      const td1 = document.createElement("td");
      const projects = audit.group.path.split("/");
      td1.innerText = `${audit.group.captainLogin} \n ${
        projects[projects.length - 1]
      }`;

      // xp gained
      const td2 = document.createElement("td");
      let value_xp = "";
      if (audit.xpGained === 0 && audit.grade !== null && audit.grade >= 1) {
        value_xp = "No Access to get data";
      } else if (
        (audit.grade !== null && audit.grade < 1) ||
        audit.grade === null
      ) {
        value_xp = "0";
      } else {
        const xp = audit.xpGained / 1000;
        value_xp = xp.toString();
      }
      td2.innerText = value_xp;

      // expires in days
      const td3 = document.createElement("td");
      const currentDate = new Date();
      const endDate = new Date(audit.endAt);
      const differenceInMilliseconds =
        endDate.getTime() - currentDate.getTime();
      const differenceInDays = Math.ceil(
        differenceInMilliseconds / (1000 * 60 * 60 * 24)
      );
      if (audit.grade !== null && audit.grade >= 0) {
        td3.innerText = "Done";
      } else {
        td3.innerText =
          differenceInDays < 0 ? "Expired" : `${differenceInDays} days`;
      }

      // status
      const td4 = document.createElement("td");
      td4.innerText =
        audit.grade === null ? "TO DO" : audit.grade < 1 ? "FAIL" : "PASS";

      tr.append(td1, td2, td3, td4);
      tbody.append(tr);
    });
  };

  const filterAudits = (status: string) => {
    if (status === "all") {
      renderTable(auditsData);
    } else if (status === "null") {
      renderTable(auditsData.filter((audit) => audit.grade === null));
    } else if (parseInt(status) < 1) {
      renderTable(
        auditsData.filter((audit) => audit.grade !== null && audit.grade < 1)
      );
    } else {
      renderTable(
        auditsData.filter((audit) => audit.grade !== null && audit.grade >= 1)
      );
    }
  };
  const listElement = document.getElementById("auditFilterList");

  if (listElement) {
    listElement.addEventListener("change", (event: Event) => {
      const selectedValue = (event.target as HTMLSelectElement).value;
      filterAudits(selectedValue);
    });
  } else {
    console.error("List element not found");
  }

  getAuditsWithEvents(parseJwt().userId)
    .then((data) => {
      auditsData = data;
      renderTable(auditsData);
    })
    .catch((error) => {
      console.error(error);
    });

  return container;
}

function workingOn(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "space-between";
  // to space the title and navbar
  container.style.marginTop = "16px";

  const workingOnTitle = document.createElement("div");
  const projectTitle = document.createElement("h5");
  projectTitle.style.color = "var(--pink-11)";
  const projectName = document.createElement("h5");
  projectName.style.color = "var(--pink-12)";
  workingOnTitle.append(projectTitle, projectName);

  const workingOnDate = document.createElement("div");
  const startedOnTitle = document.createElement("h5");
  startedOnTitle.style.color = "var(--pink-11)";
  const startedOnDate = document.createElement("h5");
  startedOnDate.style.color = "var(--pink-12)";
  workingOnDate.append(startedOnTitle, startedOnDate);

  container.append(workingOnTitle, workingOnDate);

  getWorkingOn(parseJwt().userId).then((data) => {
    projectTitle.innerText = `Working on \n `;
    projectName.innerHTML = `${data.data.workingGroup[0].path
      .split("/")
      .pop()}`;
    startedOnTitle.innerText = `Started on \n `;
    startedOnDate.innerHTML = `${new Date(
      data.data.workingGroup[0].updatedAt
    ).toLocaleDateString()}`;
  });

  return container;
}
