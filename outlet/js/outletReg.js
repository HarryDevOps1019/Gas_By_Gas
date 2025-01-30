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

// Initialize Modals
let successModal, errorModal;

// Security Utility Class
class SecurityManager {
    // Generate secure random salt
    static generateSalt() {
        return CryptoJS.lib.WordArray.random(128/8).toString();
    }

    // Advanced password hashing with PBKDF2
    static hashPassword(password, salt) {
        const iterations = 10000;
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256/32,
            iterations: iterations
        }).toString();
    }

    // Email validation
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password strength validation
    static validatePasswordStrength(password) {
        const minLength = 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength && 
                     hasUppercase && 
                     hasLowercase && 
                     hasNumbers && 
                     hasSpecialChar,
            errors: []
        };
    }
}

// Registration Handler Class
class OutletRegistration {
    constructor() {
        this.form = document.getElementById('gasOutletForm');
        this.initializeEventListeners();
        this.initializeModals();
    }

    initializeModals() {
        const successModalEl = document.getElementById('successModal');
        const errorModalEl = document.getElementById('errorModal');
        
        successModal = new bootstrap.Modal(successModalEl);
        errorModal = new bootstrap.Modal(errorModalEl);
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmission();
        });
    }

    collectFormData() {
        return {
            outletName: document.getElementById('outletName').value.trim(),
            outletManagerName: document.getElementById('outletManagerName').value.trim(),
            registrationNumber: document.getElementById('registrationNumber').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            outletAddress: document.getElementById('outletAddress').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('newPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };
    }

    validateForm(data) {
        const errors = [];

        // Check required fields
        Object.keys(data).forEach(key => {
            if (!data[key] && key !== 'confirmPassword') {
                errors.push(`${this.formatFieldName(key)} is required`);
            }
        });

        // Email validation
        if (!SecurityManager.validateEmail(data.email)) {
            errors.push('Invalid email format');
        }

        // Password strength validation
        const passwordValidation = SecurityManager.validatePasswordStrength(data.password);
        if (!passwordValidation.isValid) {
            errors.push('Password must be 8+ chars with uppercase, lowercase, numbers, and special characters');
        }

        // Password match
        if (data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }

        return errors;
    }

    formatFieldName(key) {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    async handleSubmission() {
        const formData = this.collectFormData();
        const validationErrors = this.validateForm(formData);

        if (validationErrors.length > 0) {
            this.showErrorModal(validationErrors.join('\n'));
            return;
        }

        try {
            // Generate unique salt for password
            const salt = SecurityManager.generateSalt();
            
            // Hash password with salt
            const hashedPassword = SecurityManager.hashPassword(formData.password, salt);

            // Prepare outlet data for storage
            const outletData = {
                outletName: formData.outletName,
                outletManagerName: formData.outletManagerName,
                registrationNumber: formData.registrationNumber,
                phoneNumber: formData.phoneNumber,
                outletAddress: formData.outletAddress,
                email: formData.email,
                passwordHash: hashedPassword,
                passwordSalt: salt,
                registeredAt: new Date().toISOString()
            };

            // Save to Firebase
            await database.ref('gasOutletReg/' + formData.registrationNumber).set(outletData);
            
            // Show success modal
            this.showSuccessModal('Registration Successful!');
            
            // Reset form
            this.form.reset();
        } catch (error) {
            this.showErrorModal(`Registration Failed: ${error.message}`);
        }
    }

    showSuccessModal(message) {
        const modalBody = document.querySelector('#successModal .modal-body');
        modalBody.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i>${message}`;
        successModal.show();
    }

    showErrorModal(message) {
        const errorMessageElement = document.getElementById('errorMessage');
        errorMessageElement.textContent = message;
        errorModal.show();
    }
}

// Initialize registration process
document.addEventListener('DOMContentLoaded', () => {
    new OutletRegistration();
});