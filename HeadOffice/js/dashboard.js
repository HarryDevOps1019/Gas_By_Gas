import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

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

// Dynamic data container
let outletsData = [];

// Function to fetch cylinder trade data from Firebase
function fetchOutletData() {
    const outletsRef = ref(db, 'OutletGasRequest'); // Assuming 'OutletGasRequest' stores trade data

    onValue(outletsRef, (snapshot) => {
        outletsData = []; // Clear existing data
        snapshot.forEach((childSnapshot) => {
            const outlet = childSnapshot.val();
            outletsData.push({
                outletName: outlet.outletName || 'N/A',
                outletRegNo: outlet.outletRegNo || 'N/A',
                cylinders: outlet.cylinderTypes || [],
                requestDate: outlet.requestDate || 'N/A',
                notes: outlet.notes || ' try to approve soon because multiple request pending',
            });
        });

        // Update UI with fetched data
        createOutletCards();
        createCylinderTradeChart();
    }, (error) => {
        console.error('Error fetching outlet data:', error);
    });
}

// Create outlet cards to display cylinder details
function createOutletCards() {
    const container = document.getElementById('outletCards');
    container.innerHTML = ''; // Clear the container before adding new cards

    outletsData.forEach((outlet) => {
        const card = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${outlet.outletName} (${outlet.outletRegNo})</span>
                </div>
                <div class="metric">
                    <span class="metric-label">📅 Request Date:</span>
                    <span class="metric-value">${outlet.requestDate}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">📋 Notes:</span>
                    <span class="metric-value">${outlet.notes}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">🛒 Cylinders:</span>
                    <div>
                        ${outlet.cylinders
                            .map(
                                (cylinder) =>
                                    `<div>${cylinder.type}: ${cylinder.quantity}</div>`
                            )
                            .join('')}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Create cylinder trade trend chart
function createCylinderTradeChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');

    // Aggregate cylinder quantities across all outlets
    const cylinderTradeData = {};
    outletsData.forEach((outlet) => {
        outlet.cylinders.forEach((cylinder) => {
            if (!cylinderTradeData[cylinder.type]) {
                cylinderTradeData[cylinder.type] = 0;
            }
            cylinderTradeData[cylinder.type] += parseInt(cylinder.quantity);
        });
    });

    const labels = Object.keys(cylinderTradeData);
    const quantities = Object.values(cylinderTradeData);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Cylinder Trade (Quantity)',
                    data: quantities,
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantity'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Monthly Cylinder Trade Report'
                }
            }
        }
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

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    fetchOutletData();
});
