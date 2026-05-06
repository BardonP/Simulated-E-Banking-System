//-----------------------Nav bar active link highlighting-----------------------
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll('.nav-links a[href]');

navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (linkHref === 'customer.html' && currentPage === '')) {
        link.classList.add('active');
    }
});

//-----------------------Dark mode toggle-----------------------
const darkModeToggle = document.getElementById("darkModeToggle");

if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            darkModeToggle.innerText = "Light Mode";
        } else {
            darkModeToggle.innerText = "Dark Mode";
        }
    });
}

// Load saved dark mode state on every page
if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");

    if (darkModeToggle) {
        darkModeToggle.checked = true;
    }
}

// Save new state when toggle is clicked
if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
        if (darkModeToggle.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("darkMode", "enabled");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("darkMode", "disabled");
        }
    });
}

//-------------------Invalid login handling---------------------
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {

        const username = document.getElementById("username").value;
        const password = document.getElementById("pwd").value;

        const message = document.getElementById("loginMessage");

        //--------------- Fake credentials for testing --------------------------------------DELETE AND CALL TO BACKEND FOR USERNAME AND PWD----------------------
        if (username === "customer" && password === "1234") {
            window.location.href = "customer.html";
        }

        else if (username === "banker" && password === "1234") {
            window.location.href = "banker.html";
        }

        else if (username === "admin" && password === "1234") {
            window.location.href = "admin.html";
        }

        //Invalid credentials pop-up and reset password field
        else {
            message.innerText = "Error: Invalid credentials";

            document.getElementById("pwd").value = "";
            document.getElementById("pwd").focus();
        }
    });
}

//--------------------MFA functionality ------------------------
const sendCodeBtn = document.getElementById("sendCodeBtn");

if (sendCodeBtn) {

    sendCodeBtn.addEventListener("click", () => {

        const username = document.getElementById("mfaUsername").value;
        const message = document.getElementById("mfaMessage");

        //----------------------------------------------------------------------------------DELETE AND CALL TO BACKEND TO CHECK USERNAME----------------------
        if (username === "admin") {

            document.getElementById("usernameStep").style.display = "none";
            document.getElementById("codeStep").style.display = "block";

            message.style.color = "green";
            message.innerText = "Verification code sent successfully";
        }

        else{

            message.style.color = "red";
            message.innerText = "Error: Username does not exist";

            return;
        }
    });
}

const verifyMfaBtn = document.getElementById("verifyMfaBtn");

if (verifyMfaBtn) {

    verifyMfaBtn.addEventListener("click", () => {

        const code = document.getElementById("mfaCode").value;
        const message = document.getElementById("mfaMessage");

        // Temporary fake code---------------------------------------------------------------------CALL TO BACKEND----------------------
        if (code === "123456") {

            document.getElementById("codeStep").style.display = "none";

            message.style.color = "green";
            message.innerText = "Verification successful!";
            document.getElementById("resetStep").style.display = "block";

        } else {

            message.style.color = "red";

            message.innerText = "Error: Invalid verification code";

            document.getElementById("mfaCode").value = "";

            document.getElementById("mfaCode").focus();
        }
    });
}

const verifyPwdBtn = document.getElementById("verifypwdBtn");

if (verifyPwdBtn) {

    verifyPwdBtn.addEventListener("click", () => {

        const newPassword = document.getElementById("newPwd").value;
        const confirmNewPassword = document.getElementById("confirmPwd").value;

        const message = document.getElementById("mfaMessage");

        if (newPassword === "" || confirmNewPassword === "") {

            message.style.color = "red";
            message.innerText = "Error: Please fill in all fields";
        } else if (newPassword !== confirmNewPassword) {

            message.style.color = "red";
            message.innerText = "Error: Passwords do not match";
        } else {

            message.style.color = "green";
            message.innerText = "Password reset successful!"; //---------------------------------------UPDATE PWD IN BACKEND----------------------
            document.getElementById("resetStep").style.display = "none";
        }
    });
}

//------------------Customer Dashboard---------------------------
//ADD CUSTOMER NAME TO WELCOME MESSAGE
const welcomeMessage = document.getElementById("welcomeMsg");

if (welcomeMessage) {
    const username = "John Doe";
    welcomeMessage.innerText = `Welcome, ${username}!`;
}
