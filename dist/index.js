"use strict";
let form = document.querySelector("#form");
const todoItem = localStorage.getItem("todo");
const activities = todoItem ? JSON.parse(todoItem) : [];
let isEditMode = false;
let currentEditId = null;
const showData = (activities) => {
    const listElement = document.querySelector("#list");
    if (activities.length > 0) {
        listElement.innerHTML = activities
            .map((activity) => `
        <div>
            <div class="list-detail ${activity.done ? "strike-through" : ""}">
                <h3>${activity.title}</h3>
                <p>${activity.detail}</p>
                <p>Start date: ${activity.dateStart}</p>
            </div>
            <div class="action">
                <input type="checkbox" ${activity.done ? "checked" : ""} id="check-${activity.id}" onclick="toggleDone('${activity.id}')">
                <i class="fa-solid fa-pen-to-square" id="edit-${activity.id}" onclick="editTask('${activity.id}')" ${activity.done ? 'style="pointer-events: none; opacity: 0.5;"' : ""}></i>
                <i class="fa-solid fa-trash" id="delete-${activity.id}" onclick="deleteTask('${activity.id}')"></i>
            </div>
        </div>
        `)
            .join("");
    }
    else {
        listElement.innerHTML = `<h2>Add task to the list!</h2>`;
    }
};
const countPendingActivities = (activities) => {
    return activities.filter((activity) => !activity.done).length;
};
const countCompletedActivities = (activities) => {
    return activities.filter((activity) => activity.done).length;
};
const writePendingAndCompleted = (activities) => {
    const pendingCount = countPendingActivities(activities);
    const completedCount = countCompletedActivities(activities);
    document.getElementById("pending-count").innerText =
        pendingCount.toString();
    document.getElementById("completed-count").innerText =
        completedCount.toString();
};
showData(activities);
writePendingAndCompleted(activities);
form.addEventListener("submit", (e) => {
    e.preventDefault();
    let title = document.querySelector("#title");
    let detail = document.querySelector("#detail");
    let dateStart = document.querySelector("#dateStart");
    let submitButton = document.querySelector(".btn");
    if (isEditMode) {
        const activityIndex = activities.findIndex((activity) => activity.id === currentEditId);
        activities[activityIndex].title = title.value;
        activities[activityIndex].detail = detail.value;
        activities[activityIndex].dateStart = dateStart.value;
        isEditMode = false;
        currentEditId = null;
        submitButton.textContent = "Add Task";
    }
    else {
        const newTodo = {
            title: title.value,
            detail: detail.value,
            dateStart: dateStart.value,
            id: crypto.randomUUID(),
            done: false,
        };
        activities.push(newTodo);
    }
    localStorage.setItem("todo", JSON.stringify(activities));
    showData(activities);
    writePendingAndCompleted(activities);
    title.value = "";
    detail.value = "";
    dateStart.value = "";
});
const toggleDone = (id) => {
    const activity = activities.find((activity) => activity.id === id);
    if (activity) {
        activity.done = !activity.done;
        localStorage.setItem("todo", JSON.stringify(activities));
        showData(activities);
        writePendingAndCompleted(activities);
    }
};
const deleteTask = (id) => {
    const index = activities.findIndex((activity) => activity.id === id);
    if (index > -1) {
        activities.splice(index, 1);
        localStorage.setItem("todo", JSON.stringify(activities));
        showData(activities);
        writePendingAndCompleted(activities);
    }
};
const editTask = (id) => {
    const activity = activities.find((activity) => activity.id === id);
    if (activity) {
        document.querySelector("#title").value =
            activity.title;
        document.querySelector("#detail").value =
            activity.detail;
        document.querySelector("#dateStart").value =
            activity.dateStart;
        document.querySelector(".btn").textContent =
            "Edit Task";
        isEditMode = true;
        currentEditId = id;
    }
};
