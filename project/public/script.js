const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const API_URL = "http://localhost:3000/tasks"; // FIXED URL

// Fetch tasks on page load
async function fetchTasks() {
  const res = await fetch(API_URL);
  const tasks = await res.json();
  renderTasks(tasks);
}

// Render tasks
function renderTasks(tasks) {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";

    li.innerHTML = `
      <span>${task.title}</span>
      <div>
        <button onclick="toggleTask(${task.id}, ${task.done ? 0 : 1})">
          ${task.done ? "Undo" : "Done"}
        </button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Add new task
async function addTask() {
  const title = taskInput.value.trim();
  if (!title) return alert("Enter a task");

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });

  fetchTasks();
  taskInput.value = "";
}

// Toggle task done/undone
async function toggleTask(id, done) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done })
  });
  fetchTasks();
}

// Delete task
async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchTasks();
}

// Load tasks initially
fetchTasks();
