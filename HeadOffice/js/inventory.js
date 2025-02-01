import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

// Flag to prevent infinite update loops
let isUpdating = false;

// Cylinder Types
const cylinderTypes = ['3-2', '5', '12-5', '37-5'];

// Function to setup real-time listeners for individual cylinder types
function setupRealtimeListeners() {
    cylinderTypes.forEach((type) => {
        const cylinderRef = ref(database, `cylinders/${type}kg`);
        
        onValue(cylinderRef, (snapshot) => {
            if (isUpdating) return; // Prevent loops
            const data = snapshot.val() || { filled: 0, empty: 0, produced: 0, total: 0 };
            updateCylinderDisplay(type, data);

            // Recalculate totals
            recalculateTotals();
        });
    });

    // Listen for last updated timestamp
    const lastUpdatedRef = ref(database, "lastUpdated");
    onValue(lastUpdatedRef, (snapshot) => {
        const lastUpdated = snapshot.val();
        if (lastUpdated) {
            document.getElementById("lastUpdated").textContent = `Last updated: ${new Date(lastUpdated).toLocaleString()}`;
        }
    });

    // Fetch overall stats when the page loads
    fetchOverallStats();
}

// Function to recalculate totals and update Firebase
function recalculateTotals() {
    let totalFilled = 0;
    let totalEmpty = 0;
    let totalProduced = 0;

    let promises = cylinderTypes.map((type) => {
        const cylinderRef = ref(database, `cylinders/${type}kg`);
        return get(cylinderRef).then((snapshot) => {
            const data = snapshot.val() || { filled: 0, empty: 0, produced: 0 };
            totalFilled += data.filled || 0;
            totalEmpty += data.empty || 0;
            totalProduced += data.produced || 0;
        });
    });

    Promise.all(promises).then(() => {
        const overallStats = {
            filled: totalFilled,
            empty: totalEmpty,
            produced: totalProduced,
            total: totalFilled + totalEmpty
        };

        // Update Firebase with the new overall stats
        const overallStatsRef = ref(database, "overallStats");
        update(overallStatsRef, overallStats)
            .then(() => console.log("Overall stats updated in Firebase"))
            .catch((error) => console.error("Error updating overall stats:", error));

        // Update UI
        updateOverallStats(overallStats);
    });
}

// Function to fetch overall stats from Firebase and update UI
function fetchOverallStats() {
    const overallStatsRef = ref(database, "overallStats");

    onValue(overallStatsRef, (snapshot) => {
        const data = snapshot.val() || { filled: 0, empty: 0, produced: 0, total: 0 };
        updateOverallStats(data);
    });
}

// Function to update individual cylinder type display
function updateCylinderDisplay(type, data) {
    document.getElementById(`${type}kg-filled`).textContent = data.filled || 0;
    document.getElementById(`${type}kg-empty`).textContent = data.empty || 0;
    document.getElementById(`${type}kg-produced`).textContent = data.produced || 0;
    document.getElementById(`${type}kg-total`).textContent = data.total || 0;
}

// Function to update overall stats display
function updateOverallStats(data) {
    document.getElementById("filledCount").textContent = data.filled || 0;
    document.getElementById("emptyCount").textContent = data.empty || 0;
    document.getElementById("producedCount").textContent = data.produced || 0;
    document.getElementById("totalCount").textContent = data.total || 0;
}

// Function to update inventory and store changes in Firebase
function updateInventory() {
    const cylinderType = document.getElementById("cylinderType").value.replace(".", "-");
    const filled = parseInt(document.getElementById("filled").value) || 0;
    const empty = parseInt(document.getElementById("empty").value) || 0;
    const produced = parseInt(document.getElementById("produced").value) || 0;

    const cylinderRef = ref(database, `cylinders/${cylinderType}kg`);

    // Set flag to prevent UI loop issues
    isUpdating = true;

    // Fetch existing data for this cylinder type
    get(cylinderRef).then((snapshot) => {
        const existingData = snapshot.val() || { filled: 0, empty: 0, produced: 0, total: 0 };

        // Merge new values with existing data
        const newData = {
            filled: existingData.filled + filled,
            empty: existingData.empty + empty,
            produced: existingData.produced + produced,
            total: (existingData.filled + filled) + (existingData.empty + empty)
        };

        // Update Firebase with the new cylinder data
        update(cylinderRef, newData)
            .then(() => {
                alert("Inventory updated successfully.");
                updateCylinderDisplay(cylinderType, newData);
                recalculateTotals(); // Ensure overall stats update
                updateLastUpdatedTime();
            })
            .catch((error) => {
                alert("Error updating Inventory:", error);
            })
            .finally(() => {
                isUpdating = false;
            });
    });

    // Update last updated timestamp in Firebase
    function updateLastUpdatedTime() {
        const lastUpdatedRef = ref(database, "lastUpdated");

        update(lastUpdatedRef, { timestamp: new Date().toISOString() })
            .then(() => console.log("Last updated timestamp saved successfully."))
            .catch((error) => console.error("Error updating last updated timestamp:", error));
    }

    // Clear form inputs after updating
    document.getElementById("filled").value = "";
    document.getElementById("empty").value = "";
    document.getElementById("produced").value = "";
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

// Initialize everything when the page loads
document.addEventListener("DOMContentLoaded", () => {
    setupRealtimeListeners();
});

window.updateInventory = updateInventory;
