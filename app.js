(function () {
  "use strict";

  var STORAGE_KEY = "todo.tasks.v1";

  var listEl = document.getElementById("task-list");
  var emptyStateEl = document.getElementById("empty-state");
  var formEl = document.getElementById("new-task-form");
  var inputEl = document.getElementById("new-task-input");

  var DRAG_HANDLE_ICON =
    '<svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="2" cy="2" r="1.4" fill="currentColor"/>' +
    '<circle cx="8" cy="2" r="1.4" fill="currentColor"/>' +
    '<circle cx="2" cy="8" r="1.4" fill="currentColor"/>' +
    '<circle cx="8" cy="8" r="1.4" fill="currentColor"/>' +
    '<circle cx="2" cy="14" r="1.4" fill="currentColor"/>' +
    '<circle cx="8" cy="14" r="1.4" fill="currentColor"/>' +
    "</svg>";

  var DELETE_ICON =
    '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M2 2L12 12M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
    "</svg>";

  /** @type {{id: string, text: string, completed: boolean, createdAt: number}[]} */
  var tasks = loadTasks();

  var draggingId = null;

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (t) {
        return (
          t &&
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.completed === "boolean" &&
          typeof t.createdAt === "number"
        );
      });
    } catch (e) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      /* localStorage unavailable or full — fail gracefully */
    }
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function addTask(text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    tasks.push({
      id: makeId(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    });
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) {
      return t.id !== id;
    });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    var task = tasks.find(function (t) {
      return t.id === id;
    });
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    render();
  }

  function editTask(id, newText) {
    var task = tasks.find(function (t) {
      return t.id === id;
    });
    if (!task) return;
    var trimmed = newText.trim();
    if (trimmed) {
      task.text = trimmed;
      saveTasks();
    }
    render();
  }

  function reorderTask(sourceId, targetId, placeAfter) {
    var fromIndex = tasks.findIndex(function (t) {
      return t.id === sourceId;
    });
    if (fromIndex === -1) return;
    var moved = tasks.splice(fromIndex, 1)[0];

    var toIndex = tasks.findIndex(function (t) {
      return t.id === targetId;
    });
    if (toIndex === -1) {
      tasks.push(moved);
    } else {
      tasks.splice(placeAfter ? toIndex + 1 : toIndex, 0, moved);
    }
    saveTasks();
    render();
  }

  function render() {
    listEl.innerHTML = "";
    emptyStateEl.hidden = tasks.length !== 0;

    tasks.forEach(function (task) {
      listEl.appendChild(buildTaskRow(task));
    });
  }

  function buildTaskRow(task) {
    var li = document.createElement("li");
    li.className = "task-row" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    // Drag handle
    var handle = document.createElement("span");
    handle.className = "drag-handle";
    handle.innerHTML = DRAG_HANDLE_ICON;
    handle.setAttribute("aria-hidden", "true");
    handle.addEventListener("mousedown", function () {
      li.draggable = true;
    });
    handle.addEventListener("touchstart", function () {
      li.draggable = true;
    }, { passive: true });
    li.appendChild(handle);

    // Checkbox
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Toggle task complete");
    checkbox.addEventListener("change", function () {
      toggleTask(task.id);
    });
    li.appendChild(checkbox);

    // Text / edit field
    var textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;
    textSpan.tabIndex = 0;
    textSpan.addEventListener("click", function () {
      beginEdit(li, task);
    });
    li.appendChild(textSpan);

    // Delete control
    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delete-btn";
    delBtn.innerHTML = DELETE_ICON;
    delBtn.setAttribute("aria-label", "Delete task");
    delBtn.addEventListener("click", function () {
      deleteTask(task.id);
    });
    li.appendChild(delBtn);

    // Drag events (row only becomes draggable via handle mousedown)
    li.addEventListener("dragstart", function (e) {
      draggingId = task.id;
      li.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", task.id);
      } catch (err) {
        /* some browsers require this for drag to work */
      }
    });

    li.addEventListener("dragend", function () {
      li.draggable = false;
      li.classList.remove("dragging");
      clearDragOverStyles();
      draggingId = null;
    });

    li.addEventListener("dragover", function (e) {
      if (!draggingId || draggingId === task.id) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      var rect = li.getBoundingClientRect();
      var isAfter = e.clientY - rect.top > rect.height / 2;
      li.classList.toggle("drag-over-bottom", isAfter);
      li.classList.toggle("drag-over-top", !isAfter);
    });

    li.addEventListener("dragleave", function () {
      li.classList.remove("drag-over-top", "drag-over-bottom");
    });

    li.addEventListener("drop", function (e) {
      e.preventDefault();
      if (!draggingId || draggingId === task.id) return;
      var rect = li.getBoundingClientRect();
      var isAfter = e.clientY - rect.top > rect.height / 2;
      reorderTask(draggingId, task.id, isAfter);
      clearDragOverStyles();
    });

    return li;
  }

  function clearDragOverStyles() {
    var rows = listEl.querySelectorAll(".task-row");
    rows.forEach(function (row) {
      row.classList.remove("drag-over-top", "drag-over-bottom");
    });
  }

  function beginEdit(li, task) {
    if (li.querySelector(".task-edit-input")) return; // already editing

    var textSpan = li.querySelector(".task-text");
    var originalText = task.text;

    var input = document.createElement("input");
    input.type = "text";
    input.className = "task-edit-input";
    input.value = originalText;
    input.maxLength = 500;

    li.replaceChild(input, textSpan);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    var committed = false;

    function commit() {
      if (committed) return;
      committed = true;
      editTask(task.id, input.value);
    }

    function cancel() {
      if (committed) return;
      committed = true;
      render();
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        commit();
        input.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
        input.blur();
      }
    });

    input.addEventListener("blur", function () {
      commit();
    });
  }

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    addTask(inputEl.value);
    inputEl.value = "";
  });

  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask(inputEl.value);
      inputEl.value = "";
    } else if (e.key === "Escape") {
      inputEl.value = "";
      inputEl.blur();
    }
  });

  render();
})();
