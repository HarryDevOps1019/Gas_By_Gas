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

// **Reference to inventory stats in Firebase**
const inventoryStatsRef = ref(database, "inventoryStats");

// **Function to update inventory in Firebase**
function updateInventory() {
    const filled = parseInt(document.getElementById("filled").value) || 0;
    const empty = parseInt(document.getElementById("empty").value) || 0;
    const produced = parseInt(document.getElementById("produced").value) || 0;

    // Fetch existing stats
    get(inventoryStatsRef).then((snapshot) => {
        const existingData = snapshot.val() || { filled: 0, empty: 0, produced: 0, total: 0 };

        // **Merge new values with existing ones (increment values)**
        const updatedData = {
            filled: existingData.filled + filled,
            empty: existingData.empty + empty,
            produced: existingData.produced + produced,
            total: (existingData.filled + filled) + (existingData.empty + empty),
            lastUpdated: new Date().toISOString() // Store timestamp
        };

        // **Update Firebase**
        update(inventoryStatsRef, updatedData)
            .then(() => {
                console.log("✅ Inventory updated successfully.");
            })
            .catch((error) => {
                console.error("❌ Error updating inventory:", error);
            });

        // **Update the UI immediately**
        updateInventoryUI(updatedData);
    });

    // **Clear input fields**
    document.getElementById("filled").value = "";
    document.getElementById("empty").value = "";
    document.getElementById("produced").value = "";
}

// **Function to update inventory UI**
function updateInventoryUI(data) {
    document.getElementById("filledCount").textContent = data.filled || 0;
    document.getElementById("emptyCount").textContent = data.empty || 0;
    document.getElementById("producedCount").textContent = data.produced || 0;
    document.getElementById("totalCount").textContent = data.total || 0;

    // **Update Last Updated Timestamp**
    if (data.lastUpdated) {
        document.getElementById("lastUpdated").textContent = `Last updated: ${new Date(data.lastUpdated).toLocaleString()}`;
    }
}

// **Real-time listener for inventory updates**
onValue(inventoryStatsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        updateInventoryUI(data);
    }
});

// **Initialize UI updates on page load**
document.addEventListener("DOMContentLoaded", () => {
    get(inventoryStatsRef).then((snapshot) => {
        if (snapshot.exists()) {
            updateInventoryUI(snapshot.val());
        }
    });
});

// **Expose function for button click**
window.updateInventory = updateInventory;
