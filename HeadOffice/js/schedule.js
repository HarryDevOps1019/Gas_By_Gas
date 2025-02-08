import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Load schedule data from Firebase
function loadSchedule() {
    const scheduleTable = document.getElementById('scheduleTable');
    scheduleTable.innerHTML = ''; // Clear the table

    const distributionsRef = ref(db, 'OutletGasRequest');
    onValue(distributionsRef, (snapshot) => {
        scheduleTable.innerHTML = ''; // Clear table before appending new rows
        snapshot.forEach((childSnapshot) => {
            const request = childSnapshot.val();
            const outletRegNo = childSnapshot.key;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${outletRegNo}</td>
                <td>${request.outletName || 'N/A'}</td>
                <td>${request.requestDate || 'N/A'}</td>
                <td>
                    ${
                        request.cylinderTypes
                            ? request.cylinderTypes.map(
                                  (cylinder, index) =>
                                      `<div>${index + 1}: ${cylinder.type} - ${cylinder.quantity}</div>`
                              ).join('')
                            : 'No data available'
                    }
                </td>
                <td>${request.status || 'Pending'}</td>
                <td><input type="date" id="confirmDate-${outletRegNo}" value="${request.confirmDate || ''}"></td>
                <td>
                    <button class="btn btn-sm btn-confirm" onclick="confirmRequest('${outletRegNo}')">
                        Confirm
                    </button>
                    <button class="btn btn-sm btn-cancel" onclick="cancelRequest('${outletRegNo}')">
                        Cancel
                    </button>
                </td>
            `;
            scheduleTable.appendChild(row);
        });
    });
}

// Confirm and update the status and confirm date in Firebase
function confirmRequest(outletRegNo) {
    const confirmDateInput = document.getElementById(`confirmDate-${outletRegNo}`);
    const confirmDate = confirmDateInput.value;

    if (!confirmDate) {
        alert("Please select a confirm date.");
        return;
    }

    const requestRef = ref(db, `OutletGasRequest/${outletRegNo}`);
    update(requestRef, { confirmDate, status: 'Approved' })
        .then(() => {
            alert(`Request ID ${outletRegNo} has been Approved.`);
        })
        .catch((error) => {
            console.error(`Error confirming request: ${error.message}`);
        });
}

// Cancel Request
function cancelRequest(requestId) {
    const requestRef = ref(db, `OutletGasRequest/${requestId}`);
    update(requestRef, { status: 'cancelled' })
        .then(() => {
            alert(`Request ID ${requestId} cancelled successfully.`);
        })
        .catch((error) => {
            console.error(`Error cancelling request: ${error.message}`);
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

window.cancelRequest = cancelRequest;

// Load initial schedule data on page load
document.addEventListener('DOMContentLoaded', loadSchedule);

// Attach functions to the global scope for HTML button events
window.confirmRequest = confirmRequest;
