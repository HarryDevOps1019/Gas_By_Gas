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
const auth = firebase.auth();

class OutletSettings {
    constructor() {
        this.initializeModals();
        this.initializeEventListeners();
        this.checkAuthentication();
    }

    initializeModals() {
        this.successModal = new bootstrap.Modal(document.getElementById('successModal'));
        this.errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    }

    initializeEventListeners() {
        document.getElementById('profileUpdateForm').addEventListener('submit', this.handleProfileUpdate.bind(this));
        document.getElementById('securityForm').addEventListener('submit', this.handlePasswordChange.bind(this));
    }

    async checkAuthentication() {
        // Check if user is logged in via Firebase Auth
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in
                try {
                    // First try to get registration number from sessionStorage
                    let regNumber = sessionStorage.getItem('registrationNumber');
                    
                    if (!regNumber) {
                        // If not in sessionStorage, try to find it in the database using the email
                        const snapshot = await database.ref('gasOutletReg').orderByChild('email').equalTo(user.email).once('value');
                        const userData = snapshot.val();
                        
                        if (userData) {
                            // Get the first (and should be only) key
                            regNumber = Object.keys(userData)[0];
                            // Store it in sessionStorage for future use
                            sessionStorage.setItem('registrationNumber', regNumber);
                        } else {
                            throw new Error('No outlet found for this user');
                        }
                    }
                    
                    this.currentRegNumber = regNumber;
                    await this.loadRegisteredOutletDetails(regNumber);
                } catch (error) {
                    this.showErrorModal(error.message);
                    this.redirectToLogin();
                }
            } else {
                // No user is signed in, redirect to login
                this.redirectToLogin();
            }
        });
    }

    redirectToLogin() {
        window.location.href = '/out';
    }

    async loadRegisteredOutletDetails(regNumber) {
        try {
            const snapshot = await database.ref('gasOutletReg/' + regNumber).once('value');
            const outletData = snapshot.val();

            if (!outletData) {
                throw new Error('Outlet details not found');
            }

            // Update profile card
            this.updateProfileCard(outletData);
            
            // Update form fields
            this.updateFormFields(outletData);
        } catch (error) {
            this.showErrorModal(`Failed to load profile: ${error.message}`);
        }
    }

    updateProfileCard(data) {
        document.getElementById('profileOutletName').textContent = data.outletName;
        document.getElementById('profileManagerName').textContent = data.outletManagerName;
        document.getElementById('profileEmail').textContent = data.email;
        document.getElementById('profilePhone').textContent = data.phoneNumber;
        document.getElementById('profileRegNumber').textContent = data.registrationNumber;
    }

    updateFormFields(data) {
        document.getElementById('outletName').value = data.outletName || '';
        document.getElementById('outletManagerName').value = data.outletManagerName || '';
        document.getElementById('phoneNumber').value = data.phoneNumber || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('outletAddress').value = data.outletAddress || '';
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = {
            outletName: document.getElementById('outletName').value.trim(),
            outletManagerName: document.getElementById('outletManagerName').value.trim(),
            phoneNumber: document.getElementById('phoneNumber').value.trim(),
            email: document.getElementById('email').value.trim(),
            outletAddress: document.getElementById('outletAddress').value.trim(),
            lastUpdated: new Date().toISOString()
        };

        const validationErrors = this.validateProfileUpdate(formData);
        if (validationErrors.length > 0) {
            this.showErrorModal(validationErrors.join('\n'));
            return;
        }

        try {
            await database.ref('gasOutletReg/' + this.currentRegNumber).update(formData);
            this.showSuccessModal('Profile Updated Successfully!');
            await this.loadRegisteredOutletDetails(this.currentRegNumber);
        } catch (error) {
            this.showErrorModal(`Update Failed: ${error.message}`);
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            // Get current user
            const user = auth.currentUser;
            if (!user) {
                throw new Error('No user logged in');
            }

            // Reauthenticate user with current password
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email, 
                currentPassword
            );
            await user.reauthenticateWithCredential(credential);

            // Validate new password
            const passwordValidation = SecurityManager.validatePasswordStrength(newPassword);
            if (!passwordValidation.isValid) {
                throw new Error('New password does not meet security requirements');
            }

            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match');
            }

            // Update password in Firebase Auth
            await user.updatePassword(newPassword);

            // Update password hash in database
            const newSalt = SecurityManager.generateSalt();
            const newHash = SecurityManager.hashPassword(newPassword, newSalt);
            
            await database.ref('gasOutletReg/' + this.currentRegNumber).update({
                passwordHash: newHash,
                passwordSalt: newSalt,
                lastPasswordChange: new Date().toISOString()
            });

            this.showSuccessModal('Password Changed Successfully!');
            document.getElementById('securityForm').reset();
        } catch (error) {
            this.showErrorModal(`Password Change Failed: ${error.message}`);
        }
    }

    validateProfileUpdate(data) {
        const errors = [];
        if (!data.outletName) errors.push('Outlet Name is required');
        if (!data.outletManagerName) errors.push('Manager Name is required');
        if (!data.phoneNumber) errors.push('Phone Number is required');
        if (!data.outletAddress) errors.push('Outlet Address is required');
        if (!SecurityManager.validateEmail(data.email)) errors.push('Invalid email format');
        return errors;
    }

    showSuccessModal(message) {
        const modalBody = document.querySelector('#successModal .modal-body');
        modalBody.innerHTML = `
            <div class="text-center">
                <i class="fas fa-check-circle text-success fa-3x mb-3"></i>
                <p class="mb-0">${message}</p>
            </div>`;
        this.successModal.show();
    }

    showErrorModal(message) {
        const errorMessageElement = document.getElementById('errorMessage');
        errorMessageElement.innerHTML = `
            <div class="text-center">
                <i class="fas fa-exclamation-circle text-danger fa-3x mb-3"></i>
                <p class="mb-0">${message}</p>
            </div>`;
        this.errorModal.show();
    }
}

// Initialize settings page
document.addEventListener('DOMContentLoaded', () => {
    new OutletSettings();
});