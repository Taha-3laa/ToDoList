let btnAdd = document.querySelector("form input[type='button']");
let input = document.querySelector("form input[type='text']");
let Tasks = document.querySelector(".tasks");
let sounds = [
  new Audio("sounds/add.wav"),
  new Audio("sounds/del.wav"),
  new Audio("sounds/done.mp3"),
  new Audio("sounds/error.wav"),
];

let txtColor = localStorage.getItem("txtColor");
let bgColor = localStorage.getItem("bgColor");

let gradientBackgrounds = document.querySelectorAll(".gradients li");
let textColors = document.querySelectorAll(".colors li");
let colorPicker = document.querySelector(".colors li:last-child input");

colorPicker.addEventListener("input", changeTxtColor);

if (txtColor) changeTxtColor();

textColors.forEach((c) => {
  c.addEventListener("click", changeTxtColor);
});

function changeTxtColor(event) {
  if (event) {
    if (event.target == colorPicker) {
      txtColor = event.target.value;
      event.target.parentElement.dataset.txtcolor = txtColor;
    } else {
      txtColor = event.target.dataset.txtcolor;
    }
    localStorage.setItem("txtColor", txtColor);
  }
  document.documentElement.style.setProperty("--txtColor", txtColor);
  markElementAsActive("txt");
}

function markElementAsActive(type) {
  if (type == "txt") {
    textColors.forEach((el) => {
      el.classList.toggle("active", el.dataset.txtcolor === txtColor);
    });
  } else {
    gradientBackgrounds.forEach((el) => {
      el.classList.toggle("active", el.dataset.bgColor === bgColor);
    });
  }
}

if (bgColor) {
  changeBackgroundColor();
}
gradientBackgrounds.forEach((el) => {
  el.addEventListener("click", changeBackgroundColor);
});

function changeBackgroundColor(event) {
  if (event) {
    bgColor = event.target.dataset.bgColor;
    localStorage.setItem("bgColor", bgColor);
  }
  document.documentElement.style.setProperty("--backgroundColor", bgColor);
  markElementAsActive("bg");
}

let togglebtn = document.getElementById("toggle-btn");
let sidebar = document.querySelector(".settings");

togglebtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// add tasks already in local storage with its status
let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];
if (tasks.length != 0) {
  tasks.forEach((task) => {
    appendTaskToTasks(task.id, task.title, task.status);
  });
}
function playSound(sound) {
  sounds.forEach((s) => {
    if (s.src.includes(sound)) {
      s.currentTime = 0;
      s.play();
    }
  });
}
playSound();
// append Task To div Tasks
function appendTaskToTasks(...taskData) {
  let taskAdded = createTaskComponent();
  taskAdded.setAttribute("id", taskData[0]);
  taskAdded.children[1].textContent = taskData[1];
  taskAdded.setAttribute("status", taskData[2]);
  Tasks.append(taskAdded);
}

// when press enter will add task directly
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  addTask();
});

btnAdd.addEventListener("click", addTask);

function updateTaskStatus(task) {
  let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];
  tasks.forEach((t) => {
    if (t.id == task.id) {
      t.status = task.getAttribute("status");
    }
  });
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}

function compelteTask(event) {
  let task = event.target.parentElement;
  if (task.getAttribute("status") == "to-do")
    task.setAttribute("status", "done");
  else task.setAttribute("status", "to-do");
  updateTaskStatus(task);
  playSound("done");
}

function removeTask(event) {
  event.target.parentElement.remove();
  removeTaskFromLocalStorage(event.target.parentElement);
  playSound("del");
}

function createTaskComponent() {
  let task = document.createElement("div");
  task.classList.add("task");

  let checkSpan = document.createElement("span");
  checkSpan.className = "fa-solid fa-check";
  checkSpan.addEventListener("click", compelteTask);
  task.append(checkSpan);

  let tasktitle = document.createElement("p");
  tasktitle.addEventListener("click", compelteTask);
  task.append(tasktitle);

  let delSpan = checkSpan.cloneNode();
  delSpan.className = "fa-solid fa-trash";
  delSpan.addEventListener("click", removeTask);
  task.append(delSpan);

  return task;
}

function getTaskObject(title) {
  let taskObj = {};
  taskObj.id = Date.now() % 10e6;
  taskObj.title = title;
  taskObj.status = "to-do";
  return taskObj;
}

function isTaskAddable(title) {
  let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].title == title && tasks[i].status == "to-do") return true;
  }
  return false;
}

let error = document.querySelector(".error");

function showErrorMess(errorMess) {
  error.innerHTML =`<i class="fa-solid fa-exclamation"></i> ${errorMess}`;
  error.classList.toggle("show");
  setTimeout(()=>{
    error.classList.remove("show");
  },3000);
}

function addTask() {
  if (input.value == "" || input.value.length < 4) {
    playSound("error");
    showErrorMess(`task (${input.value}) has length less than 4`);
    return;
  }

  let tasks = [];
  if (input.value.includes(","))
    tasks = input.value.split(",").map((t) => {
      return t.toLowerCase().trim();
    });
  else tasks.push(input.value.toLowerCase().trim());

  tasks.forEach((task) => {
    if (!isTaskAddable(task)) {
      let taskObj = getTaskObject(task);
      appendTaskToTasks(taskObj.id, taskObj.title, taskObj.status);
      addTaskToLocalStorage(taskObj);
      playSound("add");
    } else {
      playSound("error");
      showErrorMess(`"${task}" is Already Added and not compeleted`);
    }
  });
  input.value = "";
  input.focus();
}

function addTaskToLocalStorage(taskObj) {
  let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];
  tasks.push(taskObj);
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskRemoved) {
  let tasks = JSON.parse(localStorage.getItem("Tasks")) || [];
  // now you hold array of tasks
  tasks = tasks.filter((task) => {
    return task.id != taskRemoved.getAttribute("id");
  });
  localStorage.setItem("Tasks", JSON.stringify(tasks));
}
