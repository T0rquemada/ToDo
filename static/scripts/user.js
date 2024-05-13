let signed = false;

const signinBtn = document.getElementById('sign_inBtn');
const signupBtn = document.getElementById('sign_upBtn');


/*Pop up part*/
// Insert inputs for sign in/up in modal window
function fillSignPopup(signIn = false) {

    // Add nickname div with input while Sign up
    if (!signIn) {
        popUp.insertBefore(nickDiv, popupFooter);
        nicknameInput = document.getElementById('nickname');
    }

    // Insert input's div in pop-up
    popUp.insertBefore(emailDiv, popupFooter);
    popUp.insertBefore(passDiv, popupFooter);

    // Assign inputs
    emailInput = document.getElementById('email');
    passInput = document.getElementById('password');
    passInput.setAttribute('type', 'password');
}


/*inputs part*/
// Init input containers
const emailDiv = createInput('Email', 'email');
const passDiv = createInput('Password', 'password');
let nickDiv = createInput('Nickname', 'nickname');

let emailInput, passInput, nicknameInput;   // Init inputs

// Save user email & password in localStorage
function saveUser(email, password, id) {
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('id', id.toString());
}


/*Sign up part*/
function signUp(user) {
    // Send user's data on server while register
    postRequest(user, 'signup')
        .then(response => {
            if (response[0]) {
                userSigned();
                let userDB = JSON.parse(response[1]);
                saveUser(userDB.email, userDB.password, userDB.id);
            } else if ('User already exist!') {
                alert('User already exist!');
            } else {
                console.log('Something get wrong while sign up');
            }
        });
}

// Activate Pop-up screen with pop-up container
signupBtn.addEventListener('click', () => {
    removeInputsPopup();
    fillSignPopup();
    popupTitle.textContent = 'Sign Up';
    nickDiv.style.display = 'flex'; // Show nickname input
    active(popup__screen);
});


/*Sign in part*/
// Change UI in case that user signed
function userSigned() {
    signoutBtn.style.display = "inline-block";
    hideSigninBtns();
    active(popup__screen, false);
    removeInputsPopup();
    signed = true;
}

async function checkSigned() {
    let userEmail = localStorage.getItem('email');
    let userPass = localStorage.getItem('password');

    // If user credentials stored in localStorage
    if (userEmail !== null && userPass !== null) {
        let user = {
            email: userEmail,
            password: userPass
        }

        try {
            // const result = await signinRequest(user);    to remove
            const result = await postRequest(user, 'signin');
            if (result) {
                userSigned();
            } else {
                showSigninBtns();
                console.log("User credentials incorrect, received false from server.")
            }
        } catch (e) {
            console.error(e);
            showSigninBtns();
        }
    } else {
        console.log("Localstorage empty");
        showSigninBtns();
    }
    return false;
}

function signIn(user) {
    postRequest(user, 'signin')
        .then((response) => {
            if (response[0]) {
                userSigned();
                let userDB = JSON.parse(response[1]);
                saveUser(userDB[3], userDB[2], userDB[0]);
                generateTasks();
            } else {
                alert('Something get wrong! Look console logs');
            }
        })
}

signinBtn.addEventListener('click', () => {
    removeInputsPopup();
    fillSignPopup(true);
    popupTitle.textContent = 'Sign In';
    nickDiv.style.display = 'none'; // Hide nickname input
    active(popup__screen);
});


/*Sign out part*/
const signoutBtn = document.getElementById('sign_outBtn');
signoutBtn.style.display = "none";

signoutBtn.addEventListener('click', () => {
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    localStorage.removeItem('id');
    location.reload();  // Reload page
});