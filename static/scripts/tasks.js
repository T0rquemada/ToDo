// PUT-request to update task
function updateTaskRequest(taskId, updated) {
    let body;

    if ('complete' in updated) {
        body = JSON.stringify({ complete: updated.complete });  // Update 'complete' of task
    } else if ('title' in updated && 'desc' in updated) {
        body = JSON.stringify({ title: updated.title, desc: updated.desc }); // Update 'title&desc' of task
    } else {
        console.error('Error: The updated object must contain either "complete" or both "title" and "desc".');
        return;
    }

    return fetch(`/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('status: ', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// DELETE-request on server
function deleteTaskRequest(taskID) {
   return fetch(`/tasks/${taskID}`, {
            method: 'DELETE'
        })
    .then(response => {
            if (response.ok) {
                console.log('Task deleted successfully!');
            } else {
                console.error('Failed to delete task')
            }
        })
    .catch(error => console.error('Error while deleting task: ', error));
}

// Make DELETE-request and generate tasks list
function deleteTask(taskID) {
    deleteTaskRequest(taskID)
        .then(() => generateTasks())
}

// send edited task to server -> generate tasks after editing
function editTask(editedTask) {
    updateTaskRequest(editedTask.task_id, {title: editedTask.title, desc: editedTask.desc})
        .then(() => {
            generateTasks();
            active(popup__screen, false);
            localStorage.removeItem('task_id'); // Clear localStorage
        })
}

// Return task in div element
function createTaskCard(x) {
    let { id, title, description, complete }= x;
    let task = document.createElement('div');
    task.id = `task__${id}`;
    task.className = "task";

    let leftPart = document.createElement('div');
    leftPart.className = 'task__left_part__container'

    let task_title = document.createElement('div');
    task_title.className = "task__title";
    task_title.textContent = title;

    let task_desc = document.createElement('div');
    task_desc.className = "task__desc";
    task_desc.textContent = description;

    leftPart.appendChild(task_title);
    leftPart.appendChild(task_desc);

    let rightPart = document.createElement('div');
    rightPart.className = 'task__right_part__container'

    let dots = document.createElement('div');
    dots.textContent = '...';
    dots.style.transform = 'rotate(180deg)';
    dots.style.userSelect = 'none';

    dots.addEventListener('click', () => {
        if (!taskSettings.classList.contains('active')) active(taskSettings);
        else active(taskSettings, false);
    });

    let taskSettingsContainer = document.createElement('div');
    taskSettingsContainer.className = 'task__settings__container'
    taskSettingsContainer.appendChild(dots);

    let taskSettings = document.createElement('div');
    taskSettings.className = 'task__settings'

    let editTaskDiv = document.createElement('div');
    editTaskDiv.textContent = 'Edit task';

    let deleteTaskDiv = document.createElement('div');
    deleteTaskDiv.textContent = 'Delete task';

    taskSettings.appendChild(editTaskDiv);
    taskSettings.appendChild(deleteTaskDiv);

    taskSettingsContainer.appendChild(taskSettings);

    deleteTaskDiv.addEventListener('click', () => {
        deleteTask(id);
        active(taskSettings, false);
    });

    editTaskDiv.addEventListener('click', () => {
        active(taskSettings, false);
        localStorage.setItem('task_id', id);
        popupTitle.textContent = 'Edit task';
        fillTaskPopup();
        active(popup__screen);
    });

    let task_complete = document.createElement('div');
    task_complete.className = "task__complete";
    task_complete.textContent = complete === 0 ? 'O': 'X';

    task_complete.addEventListener('click', () => {
        if (task_complete.textContent === 'X') {
            task_complete.textContent = 'O';
            task_complete.style.color = '#2a4549';
            complete = false;
        } else {
            task_complete.textContent = 'X';
            task_complete.style.color = '#000';
            complete = true;
        }
        updateTaskRequest(id, {complete: complete});
    });

    // Hide 'O' letter
    if (!x.complete) task_complete.style.color = '#2a4549';

    rightPart.appendChild(taskSettingsContainer);
    rightPart.appendChild(task_complete);

    task.appendChild(leftPart);
    task.appendChild(rightPart);

    return task;
}

async function addTask(task) {
    let res = await postRequest(task, 'createtask');

    switch (res) {
        case true:
            active(popup__screen, false);
            generateTasks();
            break;
        case false:
            console.log('Error while creating task');
            break;
        default:
            console.log()
            break;
    }
}

// Insert inputs for creating task in modal window
function fillTaskPopup() {
    // Insert input's div in pop-up
    popUp.insertBefore(titleDiv, popupFooter);
    popUp.insertBefore(descDiv, popupFooter);

    // Assign inputs
    titleInput = document.getElementById('my__tasks__title');
    descInput = document.getElementById('my__tasks__desc');
}

const myTasks = document.getElementById("my__tasks");
const myTasks__container = document.getElementById("tasks");
const addMyTasks = document.getElementById('add__my__tasks');

/*Task inputs part*/
// Div's
const titleDiv = createInput('Task title', 'my__tasks__title');
const descDiv = createInput('Description', 'my__tasks__desc');

// Input's
let titleInput, descInput;


/*Task groups section*/
function getTaskRequest(creator_id) {
    return fetch(`http://127.0.0.1:5000/tasks?creator_id=${creator_id}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch tasks');
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
           console.error('Error: ', error)
        });
}

// Fill task container with tasks
async function generateTasks() {
    // Check, that user signed in
    if (signed) {
        let userId = localStorage.getItem('id');
        myTasks__container.innerText = ''; // Clear task list
        const tasks = await getTaskRequest(userId);
        tasks.forEach(task => {
            const taskObj = {
                id: task[0],
                title: task[1],
                description: task[2],
                complete: task[3]

            }
            let taskCard = createTaskCard(taskObj);
            myTasks__container.appendChild(taskCard);
        });
    } else {
        return false;  // Return false, if user not signed
    }
}

addMyTasks.addEventListener('click', () => {
    if (signed) {
        popupTitle.textContent = 'Create task';
        active(popup__screen);
        removeInputsPopup();
        fillTaskPopup();
    } else {
        alert('You should sign in!');
    }
});

// Generate tasks list
myTasks.addEventListener('click', async () => {
    const result = await generateTasks();
    if (result === false) {
        alert('You should be signed in!');
    }
});