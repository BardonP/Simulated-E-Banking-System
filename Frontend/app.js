console.log("Frontend app is running");

const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll('.nav-links a[href]');

navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (linkHref === 'customer.html' && currentPage === '')) {
        link.classList.add('active');
    }
});

// Invalid login handling
document.getElementById("loginBtn").addEventListener("click", () => {

    const username = document.getElementById("username").value;
    const password = document.getElementById("pwd").value;

    const message = document.getElementById("loginMessage");

    //--------------- Fake credentials for testing ----------------------------------------------DELETE LATER----------------------
    if (username === "customer" && password === "1234") {
        window.location.href = "customer.html";
    }

    else if (username === "banker" && password === "1234") {
        window.location.href = "banker.html";
    }

    else if (username === "admin" && password === "1234") {
        window.location.href = "admin.html";
    }

    else {
        message.innerText = "Error: Invalid credentials";

        document.getElementById("pwd").value = "";
        document.getElementById("pwd").focus();
    }
});
