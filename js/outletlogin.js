// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDAO3etWS-qat1uFFLSjrslHAo0UJwtVa0",
    authDomain: "gas-c3c22.firebaseapp.com",
    databaseURL: "https://gas-c3c22-default-rtdb.firebaseio.com",
    projectId: "gas-c3c22",
    storageBucket: "gas-c3c22.firebasestorage.app",
    messagingSenderId: "334602451880",
    appId: "1:334602451880:web:24d017ddce0d1f84a83b9d",
    measurementId: "G-EZTE4CTZS2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Enhanced Session Manager with Page Access Control
class SessionManager {
    // Protected pages configuration
    static protectedPages = [
        '/dashboard.html',
        '/customer.html',
        '/delivery.html',
        '/inventory.html',
        '/setting.html',
        '/token-management.html'
    ];

    static setOutletSession(registrationNumber, outletData) {
        localStorage.setItem('currentRegNumber', registrationNumber);
        localStorage.setItem('outletName', outletData.outletName);
        localStorage.setItem('lastLogin', new Date().toISOString());
        localStorage.setItem('userRole', outletData.role || 'standard'); // Add role for future permission management
    }

    static clearSession() {
        localStorage.clear();
    }

    static getCurrentOutlet() {
        return {
            registrationNumber: localStorage.getItem('currentRegNumber'),
            outletName: localStorage.getItem('outletName'),
            lastLogin: localStorage.getItem('lastLogin'),
            userRole: localStorage.getItem('userRole')
        };
    }

    static isLoggedIn() {
        return !!localStorage.getItem('currentRegNumber');
    }

    static isProtectedPage(pathname) {
        return this.protectedPages.some(page => 
            pathname.toLowerCase().endsWith(page.toLowerCase())
        );
    }

    // Enhanced checkAuth with page-specific logic
    static checkAuth() {
        const currentPath = window.location.pathname;
        
        // If not logged in and trying to access protected page
        if (!this.isLoggedIn() && this.isProtectedPage(currentPath)) {
            this.redirectToLogin();
            return false;
        }

        // If logged in but on login page, redirect to dashboard
        if (this.isLoggedIn() && currentPath.toLowerCase().endsWith('outletlogin.html')) {
            window.location.href = '/dashboard.html';
            return false;
        }

        return true;
    }

    static redirectToLogin() {
        // Store the attempted page URL to redirect back after login
        const currentPath = window.location.pathname;
        if (this.isProtectedPage(currentPath)) {
            localStorage.setItem('redirectAfterLogin', currentPath);
        }
        window.location.href = '/outletlogin.html';
    }

    static verifyOutletAccess(targetRegNumber) {
        const currentRegNumber = localStorage.getItem('currentRegNumber');
        return currentRegNumber === targetRegNumber;
    }
}

// Enhanced Login Handler Class
class OutletLogin {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.loginResultModal = new bootstrap.Modal(document.getElementById('loginResultModal'));
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    async handleLogin() {
        const registrationNumber = document.getElementById('loginRegistrationNumber').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const snapshot = await database.ref(`gasOutletReg/${registrationNumber}`).get();

            if (!snapshot.exists()) {
                this.showLoginResult(false, 'Invalid Registration Number');
                return;
            }

            const outletData = snapshot.val();
            const hashedInputPassword = this.hashPassword(password, outletData.passwordSalt);

            if (hashedInputPassword === outletData.passwordHash) {
                // Set session data on successful login
                SessionManager.setOutletSession(registrationNumber, outletData);
                this.showLoginResult(true, 'Login Successful');
                
                // Handle redirect after successful login
                setTimeout(() => {
                    const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard.html';
                    localStorage.removeItem('redirectAfterLogin'); // Clear the stored path
                    window.location.href = redirectPath;
                }, 1500);
            } else {
                this.showLoginResult(false, 'Incorrect Password');
            }
        } catch (error) {
            this.showLoginResult(false, `Login Error: ${error.message}`);
        }
    }

    hashPassword(password, salt) {
        const iterations = 10000;
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256/32,
            iterations: iterations
        }).toString();
    }

    showLoginResult(isSuccess, message) {
        const modalHeader = document.getElementById('loginModalHeader');
        const modalTitle = document.getElementById('loginModalTitle');
        const modalBody = document.getElementById('loginModalBody');

        modalHeader.className = `modal-header ${isSuccess ? 'bg-success' : 'bg-danger'} text-white`;
        modalTitle.textContent = isSuccess ? 'Login Successful' : 'Login Failed';
        modalBody.innerHTML = message;

        this.loginResultModal.show();
    }
}

// Enhanced Protected Base Class for Outlet Features
class ProtectedOutletFeature {
    constructor() {
        if (!SessionManager.checkAuth()) {
            return;
        }
        this.currentOutlet = SessionManager.getCurrentOutlet();
        this.initializeProtectedFeature();
        this.initializeLogoutHandlers();
    }

    initializeProtectedFeature() {
        // Update UI with outlet information
        const outletNameElements = document.querySelectorAll('.outlet-name');
        const outletRegElements = document.querySelectorAll('.outlet-reg');
        
        outletNameElements.forEach(el => {
            el.textContent = this.currentOutlet.outletName;
        });
        
        outletRegElements.forEach(el => {
            el.textContent = this.currentOutlet.registrationNumber;
        });

        // Add active state to current page in navigation
        this.highlightCurrentPage();
    }

    highlightCurrentPage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    initializeLogoutHandlers() {
        const logoutButtons = document.querySelectorAll('.logout-button');
        logoutButtons.forEach(button => {
            button.addEventListener('click', () => this.handleLogout());
        });
    }

    handleLogout() {
        SessionManager.clearSession();
        window.location.href = '/outletlogin.html';
    }
}

// Initialize authentication check on all pages
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) {
        new OutletLogin();
    } else {
        new ProtectedOutletFeature();
    }
});