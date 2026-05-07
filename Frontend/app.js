//-------------------------------Nav bar active link highlighting-----------------------
const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll('.nav-links a[href]');

navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (linkHref === 'customer.html' && currentPage === '')) {
        link.classList.add('active');
    }
});

//-----------------------------------------Dark mode toggle-----------------------
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

//----------------------------------Invalid login handling---------------------
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

//---------------------------------------MFA functionality ------------------------
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

//--------------------------------------------Customer Dashboard---------------------------
//add username dynamically to welcome message (temporary hardcoded username for testing)----------------------CALL TO BACKEND FOR USERNAME----------------------
const welcomeMessage = document.getElementById("welcomeMsg");

if (welcomeMessage) {
    const username = "John Doe";
    welcomeMessage.innerText = `Welcome, ${username}!`;
}

//account balances amounts (temporary hardcoded values for testing)----------------------CALL TO BACKEND FOR ACCOUNT BALANCES----------------------
const checkingBalance = document.getElementById("checkingBalance");
const savingsBalance = document.getElementById("savingsBalance");

if (checkingBalance && savingsBalance) {
    checkingBalance.innerText = "$5,000.00";
    savingsBalance.innerText = "$10,000.00";
}

//recent transactions (temporary hardcoded values for testing)----------------------CALL TO BACKEND FOR RECENT TRANSACTIONS----------------------
const transactionsTableBody = document.querySelector("#transactionsTable tbody");

if (transactionsTableBody) {
    const transactions = [
        { date: "2026-04-01", description: "Grocery Store", amount: "-$150.00" },
        { date: "2026-03-28", description: "Direct Deposit", amount: "+$3,000.00" },
        { date: "2026-03-25", description: "Electric Bill", amount: "-$120.00" },
        { date: "2026-03-20", description: "Birthday Gift", amount: "+$75.00" },
    ];
    transactions.forEach((tx) => {
        const row = document.createElement("tr");

        const amountClass = tx.amount.startsWith("+") ? "positive-amount" : "negative-amount";
        row.innerHTML = `
            <td>${tx.date}</td>
            <td>${tx.description}</td>
            <td class="${amountClass}">${tx.amount}</td>
        `;
        transactionsTableBody.appendChild(row);
    });
}

//------------------------------------------Transfer Page---------------------------
const transferForm = document.getElementById("submitTransfer");

if (transferForm) {
    
    transferForm.addEventListener("click", () => {
        
        document.getElementById("transferMessage").style.display = "block";

        const transferAmount = document.getElementById("transferAmount").value;
        const accountFrom = document.getElementById("accountFrom").value;
        const accountTo = document.getElementById("accountTo").value;
        const message = document.getElementById("transferMessageText");

        if (transferAmount === "" || accountFrom === "" || accountTo === "") {
            message.style.color = "red";
            message.innerText = "Error: Please Fill in All Fields";
        } else if (transferAmount <= 0 || transferAmount > 50000) {
            message.style.color = "red";
            message.innerText = "Error: Exceeds Limit";
        } else if (transferAmount < 5000) { //-----------------------temp------------------------------CALL TO BACKEND TO CHECK IF FUNDS ARE SUFFICIENT------------
            message.style.color = "red";
            message.innerText = "Error: Insufficient Funds";
        } else if (transferAmount > 10000) {
            message.style.color = "orange";
            message.innerText = "Pending, Requires Review";
        } else {
            message.style.color = "green";
            message.innerText = "Success, Transfer Complete!"; //-----------------------CALL TO BACKEND TO PROCESS TRANSFER----------------------
        }
    });
}

//-----------------------------------------Bill Pay Page---------------------------
//due date appears when payee is selected
const payeeInput = document.getElementById("payee");

if (payeeInput) {
    payeeInput.addEventListener("input", () => {

        document.getElementById("billDateMessage").style.display = "block";
        const selectedPayee = payeeInput.value;
        const billDueDate = document.getElementById("billDueDate");
        
        if (selectedPayee) {
            billDueDate.style.display = "block";
            billDueDate.innerText = "05/05/2026"; //----------------------------------------REPLACE WITH ACTUAL DUE DATE FROM BACKEND-----------------
        } else {
            billDueDate.style.display = "none";
        }
    });
}

//bill payment error and success messages
const billForm = document.getElementById("submitBill");

if (billForm) {
    billForm.addEventListener("click", () => {
        
        document.getElementById("billMessage").style.display = "block";

        const payee = document.getElementById("payee").value;
        const dueDate = new Date(billDueDate.innerText);
        const billAmount = document.getElementById("billAmount").value;
        const message = document.getElementById("billMessageText");

        if (payee === "" || dueDate === "" || billAmount === "") {
            message.style.color = "red";
            message.innerText = "Error: Please Fill in All Fields";
        } else if (billAmount <= 1000) { //-----------------------temp------------------------------CALL TO BACKEND TO CHECK IF FUNDS ARE SUFFICIENT------------
            message.style.color = "red";
            message.innerText = "Error: Insufficient Funds";
        } else if (dueDate < new Date()) { //-----------------temp-------------------CALL TO BACKEND TO CHECK IF DUE DATE IS VALID----------
            message.style.color = "red";
            message.innerText = "Error: Overdue";
        } else {
            message.style.color = "green";
            message.innerText = "Success, Payment Submitted!";
        }
    });
}

//bills table (temporary hardcoded values for testing)----------------------CALL TO BACKEND FOR BILLS----------------------
const billsTableBody = document.querySelector("#billsTable tbody");

if (billsTableBody) {
    const bills = [
        { payee: "Rent", amount: "$1,200.00", dueDate: "05/01/2026", status: "Late" },
        { payee: "Electricity", amount: "$200.00", dueDate: "05/09/2026", status: "Unpaid" },
        { payee: "Water", amount: "$110.00", dueDate: "01/01/2026", status: "Complete" },
        { payee: "Internet", amount: "$30.00", dueDate: "05/07/2026", status: "Pending" },
    ];
    bills.forEach((bill) => {
        const row = document.createElement("tr");

        const statusClass = bill.status === "Complete" ? "status-complete" : bill.status === "Pending" ? "status-pending" : bill.status === "Late" ? "status-late" : "status-unpaid";

        row.innerHTML = `
            <td>${bill.payee}</td>
            <td>${bill.amount}</td>
            <td>${bill.dueDate}</td>
            <td class="${statusClass}">${bill.status}</td>
        `;
        billsTableBody.appendChild(row);
    });
}

//-----------------------------------------------Profile Page-----------------------------
//populate profile form with user data
const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");

if (profileUsername && profileEmail) {
    profileUsername.value = "John Doe"; //--------------------------temp------------------------------CALL TO BACKEND TO GET USERNAME----------------------
    profileEmail.value = "johnD@example.com"; //--------------------------temp------------------------------CALL TO BACKEND TO GET USER EMAIL----------------------
}

//edit username or email
const saveChanges = document.getElementById("saveChanges");

if (saveChanges) {
    saveChanges.addEventListener("click", () => {
        const newUsername = profileUsername.value; //-----------------------------------------------------CALL TO BACKEND TO UPDATE USERNAME----------------------
        const newEmail = profileEmail.value; //-----------------------------------------------------CALL TO BACKEND TO UPDATE EMAIL----------------------
        const message = document.getElementById("profileUpdateMessageText");

        document.getElementById("profileUpdateMessage").style.display = "block";
        
        message.style.color = "green";
        message.innerText = "Profile Updated!";
    });
}

//--------------------------------------Banker Dashboard---------------------------------
//customer search autocomplete (temporary hardcoded values for testing)----------------------CALL TO BACKEND FOR CUSTOMER NAMES----------------------

//dashboard customer search button redirects to customer search page with query
const customerSearchDash = document.getElementById("customerSearchDash");

if (customerSearchDash) {
    customerSearchDash.addEventListener("click", () => {
        const input = document.getElementById("customerSearchInput");
        const query = input.value.trim();

        if (query === "") {
            alert("Please enter a customer name or ID to search.");
            return;
        }
        
        window.location.href = `customer_search.html?query=${encodeURIComponent(query)}`;

    });
}

const searchInput = document.getElementById("customerSearchInput");
const searchTables = document.getElementById("threeSearchTables");

    if (searchInput && searchTables) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("query");

        if (query) {
            searchInput.value = query;
            searchTables.style.display = "block";
        }
    }

//pending transactions table (temporary hardcoded values for testing)----------------------CALL TO BACKEND FOR PENDING TRANSACTIONS----------------------
const pendingTableBody = document.querySelector("#pendingTable tbody");

if (pendingTableBody) {
    const pendingTransactions = [
        { from: "Jim Bean", to: "John Doe", amount: "$11,000.00", actions: "Approve/Deny" },
        { from: "Jim Bean", to: "Tim Bob", amount: "$33,000.00", actions: "Approve/Deny" },
        { from: "Michael Brown", to: "Ray Allen", amount: "$47,000.00", actions: "Approve/Deny" },
    ];
    pendingTransactions.forEach((transaction) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${transaction.from}</td>
            <td>${transaction.to}</td>
            <td>${transaction.amount}</td>
            <td class="button-col"><div class="banker-actions-buttons"><button class="approve-button">Approve</button><button class="deny-button">Deny</button></div></td>
        `;
        pendingTableBody.appendChild(row);
    });
}

//approve and deny buttons (temporary functionality for testing)----------------------CALL TO BACKEND TO APPROVE OR DENY TRANSFER----------------------
if (pendingTableBody) {
    pendingTableBody.addEventListener("click", (event) => {

        // Approve
        if (event.target.classList.contains("approve-button")) {

            alert("Transfer Approved!");

            // Remove row
            event.target.closest("tr").remove();
        }

        // Deny
        if (event.target.classList.contains("deny-button")) {

            alert("Transfer Denied!");

            // Remove row
            event.target.closest("tr").remove();
        }
    });
}

//------------------------------------------------Customer Search---------------------------------
//customer search button on customer search page displays tables with results 
const customerSearch = document.getElementById("customerSearchSearch");

if (customerSearch) {
    customerSearch.addEventListener("click", () => {
        if (customerSearchInput.value === "") {
            alert("Please enter a customer name or ID to search.");
            return;
        } else {
            //-------------------------------------------------------------------------------------------------CALL TO BACKEND TO QUERY----------------------
            document.getElementById("threeSearchTables").style.display = "block";
        }
    });
}

//customer search results tables
const customerAccountTableBody = document.querySelector("#customerAccountTable tbody");

if (customerAccountTableBody) {
    const customerAccounts = [
        { accountType: "Checking", balance: "$1,000.00" },
        { accountType: "Savings", balance: "$5,000.00" },
    ];
    customerAccounts.forEach((account) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${account.accountType}</td>
            <td>${account.balance}</td>
        `;
        customerAccountTableBody.appendChild(row);
    });
}

const customerTransactionHistoryTableBody = document.querySelector("#customerTransactionHistoryTable tbody");

if (customerTransactionHistoryTableBody) {
    const customerTransactionHistory = [
        { date: "05/01/2026", to: "John Doe", type: "Sent", amount: "$1,000.00" },
        { date: "05/03/2026", to: "Jane Smith", type: "Received", amount: "$500.00" },
    ];
    customerTransactionHistory.forEach((custTransaction) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${custTransaction.date}</td>
            <td>${custTransaction.to}</td>
            <td>${custTransaction.type}</td>
            <td>${custTransaction.amount}</td>
        `;
        customerTransactionHistoryTableBody.appendChild(row);
    });
}
const customerBillsTableBody = document.querySelector("#customerBillsTable tbody");

if (customerBillsTableBody) {
    const customerBills = [
        { payee: "Rent", amount: "$1,200.00", deadline: "05/01/2026", status: "Late" },
        { payee: "Electricity", amount: "$200.00", deadline: "05/09/2026", status: "Unpaid" },
        { payee: "Water", amount: "$110.00", deadline: "01/01/2026", status: "Complete" },
        { payee: "Internet", amount: "$30.00", deadline: "05/07/2026", status: "Pending" },
    ];
    customerBills.forEach((bill) => {
        const row = document.createElement("tr");

        const statusClass = bill.status === "Complete" ? "status-complete" : bill.status === "Pending" ? "status-pending" : bill.status === "Late" ? "status-late" : "status-unpaid";

        row.innerHTML = `
            <td>${bill.payee}</td>
            <td>${bill.amount}</td>
            <td>${bill.deadline}</td>
            <td class="${statusClass}">${bill.status}</td>
        `;
        customerBillsTableBody.appendChild(row);
    });
}

