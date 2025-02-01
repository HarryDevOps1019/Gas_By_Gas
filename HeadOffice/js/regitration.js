import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH0t1mi1lm6Yp5LbebrTBAigRa0yTYpcw",
    authDomain: "gas-cylinder-distribution.firebaseapp.com",
    databaseURL: "https://gas-cylinder-distribution-default-rtdb.firebaseio.com",
    projectId: "gas-cylinder-distribution",
    storageBucket: "gas-cylinder-distribution.appspot.com",
    messagingSenderId: "301628666815",
    appId: "1:301628666815:web:f2428054d652cfd1b6670a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", function () {
    const employeeForm = document.getElementById("employeeForm");
    const redirectButton = document.getElementById("redirectToLogin");

    // Email validation
    function validateEmail(email) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@company\.com$/;
        return emailPattern.test(email);
    }

    // Password validation
    function validatePassword(password) {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return passwordPattern.test(password);
    }

    // Handle redirection
    redirectButton.addEventListener("click", function() {
        window.location.href = "login.html";
    });

    // Form submission handler
    employeeForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get form values
        const employeeId = document.getElementById("employeeId").value;
        const employeeName = document.getElementById("employeeName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Basic validation
        if (!employeeId || !employeeName || !email || !password || !confirmPassword) {
            showError("All fields are required!");
            return;
        }

        // Email validation
        if (!validateEmail(email)) {
            showError("Please enter a valid company email address (@company.com)");
            return;
        }

        // Password validation
        if (!validatePassword(password)) {
            showError("Password must contain at least 8 characters, including uppercase, lowercase, number, and special character");
            return;
        }

        // Password match validation
        if (password !== confirmPassword) {
            showError("Passwords do not match!");
            return;
        }

        try {
            // Check for existing employee ID
            const employeeRef = ref(database, `employees/${employeeId}`);
            const employeeSnapshot = await get(employeeRef);

            if (employeeSnapshot.exists()) {
                showError("Employee ID already exists!");
                return;
            }

            // Check for existing email
            const employeesRef = ref(database, 'employees');
            const employeesSnapshot = await get(employeesRef);

            if (employeesSnapshot.exists()) {
                const employees = employeesSnapshot.val();
                for (const key in employees) {
                    if (employees[key].email === email) {
                        showError("Email address is already registered!");
                        return;
                    }
                }
            }

            // Hash password
            const hashedPassword = CryptoJS.SHA256(password).toString();

            // Create employee data object
            const employeeData = {
                employeeId,
                name: employeeName,
                email,
                password: hashedPassword,
                registrationDate: new Date().toISOString(),
                status: "active"
            };

            // Save to Firebase
            await set(employeeRef, employeeData);

            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById("successModal"));
            successModal.show();

            // Clear form
            employeeForm.reset();

            // Add event listener for modal hidden
            document.getElementById('successModal').addEventListener('hidden.bs.modal', function () {
                window.location.href = "login.html";
            });

        } catch (error) {
            showError(error.message);
        }
    });

    // Error handling
    function showError(message) {
        const errorMessageElement = document.getElementById("errorMessage");
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
            const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
            errorModal.show();
        }
    }

    // Password toggle functionality
    function setupPasswordToggle(buttonId, inputId) {
        const toggleButton = document.getElementById(buttonId);
        const passwordInput = document.getElementById(inputId);

        if (toggleButton && passwordInput) {
            toggleButton.addEventListener("click", function () {
                const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                passwordInput.setAttribute("type", type);
                this.querySelector("i").classList.toggle("fa-eye");
                this.querySelector("i").classList.toggle("fa-eye-slash");
            });
        }
    }

    // Setup password toggles
    setupPasswordToggle("togglePassword1", "newPassword");
    setupPasswordToggle("togglePassword2", "confirmPassword");
});