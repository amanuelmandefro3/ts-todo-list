let form = document.querySelector('#form') as HTMLFormElement;
const todoItem = localStorage.getItem('todo');
const activities: Data[] = todoItem ? JSON.parse(todoItem) : [];

let isEditMode: boolean = false;
let currentEditId: string | null = null;

type Data = {
    title: string,
    detail: string,
    dateStart: string,
    id: string,
    done: boolean
}

// Pagination variables
let currentPage: number = 1;
const itemsPerPage: number = 5;

const paginate = (activities: Data[], pageNumber: number, itemsPerPage: number) => {
    const start = (pageNumber - 1) * itemsPerPage;
    const end = pageNumber * itemsPerPage;
    return activities.slice(start, end);
}

const showPaginationControls = (totalItems: number, itemsPerPage: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationElement = document.querySelector('#pagination') as HTMLElement;

    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="pagination-button" data-page="${i}">${i}</button>`;
    }

    paginationElement.innerHTML = paginationHTML;

    const buttons = paginationElement.querySelectorAll('.pagination-button') as NodeListOf<HTMLButtonElement>;
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            currentPage = parseInt(button.getAttribute('data-page')!);
            showData(activities);
        });
    });
}

const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
};

const toSentenceCase = (str: string): string => {
    // Regular expression to match the beginning of a sentence
    const sentenceRegEx = /(^\s*\w|[.!?]\s*\w)/g;

    return str.replace(sentenceRegEx, (match) => {
        return match.toUpperCase();
    });
};
const showData = (activities: Data[]) => {
    const paginatedActivities = paginate(activities, currentPage, itemsPerPage);
    const listElement = document.querySelector('#list') as HTMLElement;

    if (paginatedActivities.length > 0) {
        listElement.innerHTML = paginatedActivities.map((activity) => `
        <div>
            <div class="list-detail ${activity.done ? 'strike-through' : ''}">
                <h3>${activity.title}</h3>
                <p>${activity.detail}</p>
                <p>Start date: ${activity.dateStart}</p>
            </div>
            <div class="action">
                <input type="checkbox" ${activity.done ? 'checked' : ''} id="check-${activity.id}" onclick="toggleDone('${activity.id}')">
                <i class="fa-solid fa-pen-to-square" id="edit-${activity.id}" onclick="editTask('${activity.id}')" ${activity.done ? 'style="pointer-events: none; opacity: 0.5;"' : ''}></i>
                <i class="fa-solid fa-trash" id="delete-${activity.id}" onclick="deleteTask('${activity.id}')"></i>
            </div>
        </div>
        `).join('');
    } else {
        listElement.innerHTML = `<h2>Add task to the list!</h2>`;
    }

    showPaginationControls(activities.length, itemsPerPage);
}

const countPendingActivities = (activities: Data[]): number => {
    return activities.filter(activity => !activity.done).length;
}

const countCompletedActivities = (activities: Data[]): number => {
    return activities.filter(activity => activity.done).length;
}

const writePendingAndCompleted = (activities: Data[]) => {
    const pendingCount = countPendingActivities(activities);
    const completedCount = countCompletedActivities(activities);

    (document.getElementById('pending-count') as HTMLElement).innerText = pendingCount.toString();
    (document.getElementById('completed-count') as HTMLElement).innerText = completedCount.toString();
}

showData(activities);
writePendingAndCompleted(activities);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let title = (document.querySelector("#title") as HTMLInputElement);
    let detail = (document.querySelector("#detail") as HTMLInputElement);
    let dateStart = (document.querySelector('#dateStart') as HTMLInputElement);
    let submitButton = (document.querySelector('.btn') as HTMLButtonElement);

    if (isEditMode) {
        const activityIndex = activities.findIndex(activity => activity.id === currentEditId);
        activities[activityIndex].title = toTitleCase(title.value);
        activities[activityIndex].detail = toSentenceCase(detail.value);
        activities[activityIndex].dateStart = dateStart.value;

        isEditMode = false;
        currentEditId = null;
        submitButton.textContent = 'Add Task';
    } else {
        const newTodo: Data = {
            title: toTitleCase(title.value),
            detail: toSentenceCase(detail.value),
            dateStart: dateStart.value,
            id: crypto.randomUUID(),
            done: false
        };

        activities.push(newTodo);
    }

    localStorage.setItem('todo', JSON.stringify(activities));
    showData(activities);
    writePendingAndCompleted(activities);

    title.value = '';
    detail.value = '';
    dateStart.value = '';
});

const toggleDone = (id: string) => {
    const activity = activities.find(activity => activity.id === id);
    if (activity) {
        activity.done = !activity.done;
        localStorage.setItem('todo', JSON.stringify(activities));
        showData(activities);
        writePendingAndCompleted(activities);
    }
}

const deleteTask = (id: string) => {
    const index = activities.findIndex(activity => activity.id === id);
    if (index > -1) {
        activities.splice(index, 1);
        localStorage.setItem('todo', JSON.stringify(activities));
        showData(activities);
        writePendingAndCompleted(activities);
    }
}

const editTask = (id: string) => {
    const activity = activities.find(activity => activity.id === id);
    if (activity) {
        (document.querySelector("#title") as HTMLInputElement).value = activity.title;
        (document.querySelector("#detail") as HTMLInputElement).value = activity.detail;
        (document.querySelector('#dateStart') as HTMLInputElement).value = activity.dateStart;
        (document.querySelector('.btn') as HTMLButtonElement).textContent = 'Edit Task';

        isEditMode = true;
        currentEditId = id;
    }
}
