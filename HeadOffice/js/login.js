// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH0t1mi1lm6Yp5LbebrTBAigRa0yTYpcw",
    authDomain: "gas-cylinder-distribution.firebaseapp.com",
    databaseURL: "https://gas-cylinder-distribution-default-rtdb.firebaseio.com",
    projectId: "gas-cylinder-distribution",
    storageBucket: "gas-cylinder-distribution.firebasestorage.app",
    messagingSenderId: "301628666815",
    appId: "1:301628666815:web:f2428054d652cfd1b6670a"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ✅ Function to show modal with custom message
function showModal(success, message) {
    const modal = new bootstrap.Modal(document.getElementById("loginResultModal"));
    const modalHeader = document.getElementById("loginModalHeader");
    const modalTitle = document.getElementById("loginModalTitle");
    const modalBody = document.getElementById("loginModalBody");

    modalHeader.className = "modal-header " + (success ? "bg-success" : "bg-danger");
    modalTitle.textContent = success ? "Success" : "Error";
    modalTitle.className = "modal-title text-white";
    modalBody.textContent = message;

    modal.show();

    // ✅ If login is successful, redirect after 1.5s
    if (success) {
        setTimeout(() => {
            window.location.href = "/index.html";
        }, 1500);
    }
}

// ✅ Function to hash password (SHA-256)
function hashPassword(password) {
    return CryptoJS.SHA256(password).toString();
}

// ✅ Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // ✅ Get user input values
    const registrationNumber = document.getElementById("loginRegistrationNumber").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const loginButton = document.querySelector("button[type='submit']");

    // ✅ Validate empty input
    if (!registrationNumber || !password) {
        showModal(false, "Please enter both Registration Number and Password.");
        return;
    }

    // ✅ Disable button to prevent multiple clicks
    loginButton.disabled = true;
    loginButton.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Logging in...`;

    const hashedPassword = hashPassword(password);
    const employeesRef = database.ref("employees");

    // ✅ Query Firebase for the employee with matching registration number
    employeesRef.child(registrationNumber).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();

                // ✅ Check if password matches
                if (userData.password === hashedPassword) {
                    // ✅ Store user session (excluding sensitive data)
                    sessionStorage.setItem("currentUser", JSON.stringify({
                        registrationNumber: userData.registrationNumber,
                        name: userData.name,
                        role: userData.role
                    }));

                    showModal(true, "Login successful! Redirecting...");
                } else {
                    showModal(false, "Invalid password. Please try again.");
                    loginButton.disabled = false;
                    loginButton.innerHTML = "Login";
                }
            } else {
                showModal(false, "Registration number not found. Please check and try again.");
                loginButton.disabled = false;
                loginButton.innerHTML = "Login";
            }
        })
        .catch((error) => {
            console.error("Error during login:", error);
            showModal(false, "An error occurred. Please try again.");
            loginButton.disabled = false;
            loginButton.innerHTML = "Login";
        });
});

sessionStorage.setItem("currentUser", JSON.stringify({
    registrationNumber: userData.registrationNumber,
    name: userData.name,
    role: userData.role
}));

// ✅ Clear session storage on page load (optional)
window.addEventListener("load", () => {
    sessionStorage.clear();
});
