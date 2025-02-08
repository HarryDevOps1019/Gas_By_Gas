import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentTrackingId = null;

// Function to track delivery
function trackDelivery() {
    const trackingId = document.getElementById('trackingInput').value.trim();
    if (!trackingId) {
        alert('Tracking ID not found.');
        return;
    }

    currentTrackingId = trackingId;

    const trackingRef = ref(db, `OutletGasRequest/${trackingId}`);
    onValue(trackingRef, (snapshot) => {
        if (!snapshot.exists()) {
            alert('Please enter a valid Tracking ID.');
            return;
        }

        const data = snapshot.val();
        updateDeliveryDetails(data);
        
        // Restore previous status progression
        restoreStatusProgression(data);
    });
}

// Update the delivery details in the UI
function updateDeliveryDetails(data) {
    document.getElementById('trackingIdDisplay').textContent = currentTrackingId || 'N/A';
    document.getElementById('orderDateDisplay').textContent = data.requestDate || 'N/A';
    document.getElementById('cylindersDisplay').textContent =
        data.cylinderTypes?.map((cylinder) => `${cylinder.type}: ${cylinder.quantity}`).join('<br>') || 'N/A';

    document.getElementById('customerDisplay').textContent = data.outletName || 'N/A';
    document.getElementById('addressDisplay').textContent = data.address || 'N/A';
    document.getElementById('phoneDisplay').textContent = data.phone || 'N/A';
}

// Restore status progression from Firebase data
function restoreStatusProgression(data) {
    for (let step = 1; step <= 5; step++) {
        const stepKey = `step${step}Time`;
        const currentStep = document.getElementById(`step${step}`);
        
        if (data[stepKey]) {
            currentStep.classList.add('completed');
            currentStep.querySelector('.timestamp').textContent = data[stepKey];
            
            const button = currentStep.querySelector('.status-button');
            button.disabled = true;
            button.classList.remove('btn-primary');
            button.classList.add('btn-success');
        } else {
            // Disable all buttons for steps after the last completed step
            break;
        }
    }

    // Enable the next step's button if applicable
    const lastCompletedStep = Object.keys(data)
        .filter(key => key.startsWith('step') && key.endsWith('Time'))
        .length;
    
    if (lastCompletedStep < 5) {
        const nextButton = document.querySelector(`#step${lastCompletedStep + 1} .status-button`);
        if (nextButton) nextButton.disabled = false;
    }
}

// Function to update the status in Firebase
function updateStatus(step) {
    if (!currentTrackingId) {
        alert('No tracking ID found. Please track a delivery first.');
        return;
    }

    const statusUpdates = {
        1: 'Order Confirmed',
        2: 'Processing',
        3: 'Dispatched',
        4: 'Out for Delivery',
        5: 'Delivered'
    };

    const currentStep = document.getElementById(`step${step}`);
    currentStep.classList.add('completed');
    const timestamp = new Date().toLocaleString();
    currentStep.querySelector('.timestamp').textContent = timestamp;

    const button = currentStep.querySelector('.status-button');
    button.disabled = true;
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');

    if (step < 5) {
        const nextButton = document.querySelector(`#step${step + 1} .status-button`);
        nextButton.disabled = false;
    }

    // Update the status in Firebase
    const trackingRef = ref(db, `OutletGasRequest/${currentTrackingId}`);
    update(trackingRef, {
        status: statusUpdates[step],
        [`step${step}Time`]: timestamp
    })
        .then(() => {
            alert(`Delivery status updated to "${statusUpdates[step]}" successfully.`);
        })
        .catch((error) => {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        });
}

// Session Validation and Logout Handling
document.addEventListener('DOMContentLoaded', () => {
    // Check session on page load
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        // No valid session, redirect to login
        window.location.href = '/login.html';
    } else {
        // Optional: Display user name or role
        document.getElementById('userNameDisplay').textContent = currentUser.name;
    }

    // Logout Button Event Listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear session storage
            sessionStorage.clear();
            // Redirect to login page
            window.location.href = '/login.html';
        });
    }
});

// Attach functions to the global scope for HTML button events
window.trackDelivery = trackDelivery;
window.updateStatus = updateStatus;