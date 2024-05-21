window.onload = () => {
    checkSigned() // Check user credentials in localStorage
        .then(() => generateTasks())    // Generate user tasks
}


// Add/remove 'active' class for HTML element
function active(element, status= true) {
    if (status === true) {
        element.classList.add('active');
    } else if (status === false) {
         element.classList.remove('active');
    } else {
        throw new Error(`Unexpected argument for function 'active': expected true or false, received '${typeof(status)}' with value ${status}`);
    }
}

function hideSigninBtns() {
    signinBtn.style.display = "none";
    signupBtn.style.display = "none";
}

function showSigninBtns() {
    signupBtn.style.display = "inline-block";
    signinBtn.style.display = "inline-block";
}

// Make POST-request on server with endpoint, sending object
function postRequest(object, endpoint) {
    return fetch(`http://127.0.0.1:5000/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Fail while request on server');
            }
            return response.text();
        })
        .then(data => {
            let response = data;

            // In sign in/up case, return true and array with user data
            const userIndex = response.indexOf('user');
            if (userIndex !== -1) {
                let user = response.slice(response.indexOf('=')+1);
                // Cut off user part from response
                response = response.substring(0, userIndex);
                console.log("Response from server: ", response);

                return [true, user];
            }

            console.log("Response from server: ", response);

            if (response.includes('User with this email does not exist!') || response.includes('Wrong password!')) {
                return false;
            }

            if (response.includes('User already exist!')) {
                return 'User already exist!';
            }

            return true;
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
}


/*Pop up part*/
const popup__screen = document.getElementById('pop_up__screen');
const popUp = document.getElementById('pop_up__container');
const popupClose = document.getElementById('pop_up__close');
const popupCancel = document.getElementById('pop_up__cancel');
const popupSubmit = document.getElementById('pop_up__submit');
const popupTitle = document.getElementById('pop_up__title');
const popupFooter = document.getElementById('pop_up__footer');

// Hide pop up on Close
popupClose.addEventListener('click', () => {
    active(popup__screen, false);
    removeInputsPopup();
});

// Hide pop-up when user press 'Escape'
window.addEventListener('keydown', (key) => {
    if (key.key === 'Escape') {
        active(popup__screen, false);
        removeInputsPopup();
    }
});

popupCancel.addEventListener('click', () => {
    active(popup__screen, false);
    removeInputsPopup();
});

popupSubmit.addEventListener('click', () => {
    if (checkPopupInputs() === false) {
        alert('All fields must be filled!');
    } else {
        switch (popupTitle.textContent) {
            case 'Sign Up':
                submitUser(signUp);
                break;
            case 'Sign In':
                submitUser(signIn, true);
                break;
            case 'Create task':
                submitTask(addTask);
                break;
            case 'Edit task':
                submitTask(editTask, true);
                break;
            default:
                throw new Error('Error while submitting...');
        }
    }
});


/*Popup input part*/
// Submit user in pop up
function submitUser(func, signin=false) {
    if (!emailInput.value.includes('@')) {
        alert('Email must contain "@"!');
    } else {
        // Form user to send on server
        let user = {
            email: emailInput.value,
            password: passInput.value
        };

        if (!signin) user = {nickname: nicknameInput.value, ...user}

        func(user);
    }
}

// Submit task in pop up
function submitTask(func, edit=false) {
    // Form task to send on server
    let task = {};

    if (!edit) {
        task = {
            title: titleInput.value,
            desc: descInput.value,
            complete: false,
            creator_id: Number(localStorage.getItem('id'))
        };
    } else if (edit) {
        task = {
            task_id: Number(localStorage.getItem('task_id')),
            title: titleInput.value,
            desc: descInput.value
        };
    }

    func(task);
}

// If even one input Pop-up empty, return false
function checkPopupInputs() {
    const inputsDiv = document.querySelectorAll('.label_input__container');
    let inputs = [];
    inputsDiv.forEach(div => inputs.push(div.querySelector('input')));

    let correct = true;

    inputs.forEach((x) => {
        if (x.tagName !== 'INPUT') {    // Check that arr correct
            throw new Error(`Unexpected element: expect inputs, receive: ${x}`);
        }

        if (x.value === '' || x.value === ' ') {
            correct = false;
        }
    });

    return correct;
}

// Return div, with label + input pair
function createInput(inputTitle, id) {
    let container = document.createElement('div');
    container.className = 'label_input__container';
    container.id = id + '_container';

    let label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = inputTitle;
    container.append(label);

    let input = document.createElement('input');
    input.id = id;
    input.setAttribute('placeholder', `Enter ${inputTitle.toLowerCase()}...`);
    input.setAttribute('autocomplete', 'off');
    container.append(input);

    return container;
}

// Remove all inputs from popUp and clear their values
function removeInputsPopup() {
    const inputContainers = document.querySelectorAll('.label_input__container');

    // Clear input values
    inputContainers.forEach((container) => {
        const inputs = container.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    });

    inputContainers.forEach(element => element.remove());
}