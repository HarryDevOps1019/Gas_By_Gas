import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, get} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH0t1mi1lm6Yp5LbebrTBAigRa0yTYpcw",
    authDomain: "gas-cylinder-distribution.firebaseapp.com",
    databaseURL: "https://gas-cylinder-distribution-default-rtdb.firebaseio.com",
    projectId: "gas-cylinder-distribution",
    storageBucket: "gas-cylinder-distribution.firebasestorage.app",
    messagingSenderId: "301628666815",
    appId: "1:301628666815:web:f2428054d652cfd1b6670a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class OutletTable {
    constructor() {
        this.currentPage = 1;
        this.entriesPerPage = 10;
        this.currentSort = { field: null, direction: 'asc' };
        this.filteredData = [];
        this.allData = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header.dataset.sort));
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Entries per page
        document.getElementById('entriesPerPage').addEventListener('change', (e) => {
            this.entriesPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.renderTable();
        });

        // Pagination
        document.getElementById('prevPage').addEventListener('click', () => this.changePage('prev'));
        document.getElementById('nextPage').addEventListener('click', () => this.changePage('next'));

        // Manager filter
        document.getElementById('filterManager').addEventListener('change', (e) => {
            this.handleManagerFilter(e.target.value);
        });
    }

    initializeData() {
        const outletsRef = ref(database, 'gasOutletReg');
        onValue(outletsRef, (snapshot) => {
            this.allData = [];
            snapshot.forEach((childSnapshot) => {
                this.allData.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            this.filteredData = [...this.allData];
            this.updateManagerFilter();
            this.renderTable();
        });
    }

    handleSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = { field, direction: 'asc' };
        }

        this.updateSortIndicators(field);
        this.sortData();
        this.renderTable();
    }

    sortData() {
        const { field, direction } = this.currentSort;
        this.filteredData.sort((a, b) => {
            let comparison = 0;
            if (a[field] > b[field]) comparison = 1;
            if (a[field] < b[field]) comparison = -1;
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    handleSearch(searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        this.filteredData = this.allData.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );
        });
        this.currentPage = 1;
        this.renderTable();
    }

    handleManagerFilter(manager) {
        if (!manager) {
            this.filteredData = [...this.allData];
        } else {
            this.filteredData = this.allData.filter(item => 
                item.outletManagerName === manager
            );
        }
        this.currentPage = 1;
        this.renderTable();
    }

    updateManagerFilter() {
        const managers = [...new Set(this.allData.map(item => item.outletManagerName))];
        const select = document.getElementById('filterManager');
        select.innerHTML = '<option value="">Filter by Manager</option>';
        managers.forEach(manager => {
            const option = document.createElement('option');
            option.value = manager;
            option.textContent = manager;
            select.appendChild(option);
        });
    }

    changePage(direction) {
        const totalPages = Math.ceil(this.filteredData.length / this.entriesPerPage);
        if (direction === 'prev' && this.currentPage > 1) {
            this.currentPage--;
        } else if (direction === 'next' && this.currentPage < totalPages) {
            this.currentPage++;
        }
        this.renderTable();
    }

    renderTable() {
        const table = document.getElementById('requestsTable');
        const start = (this.currentPage - 1) * this.entriesPerPage;
        const end = start + this.entriesPerPage;
        const paginatedData = this.filteredData.slice(start, end);

        table.innerHTML = '';
        paginatedData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.registrationNumber}</td>
                <td>${item.outletName}</td>
                <td>${item.outletManagerName}</td>
                <td>${item.outletAddress}</td>
                <td>${item.phoneNumber}</td>
                <td>${item.email}</td>
            `;
            table.appendChild(row);
        });

        this.updatePaginationInfo();
    }

    updatePaginationInfo() {
        const start = (this.currentPage - 1) * this.entriesPerPage + 1;
        const end = Math.min(start + this.entriesPerPage - 1, this.filteredData.length);
        document.getElementById('startEntry').textContent = start;
        document.getElementById('endEntry').textContent = end;
        document.getElementById('totalEntries').textContent = this.filteredData.length;

        // Update pagination buttons
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = 
            end === this.filteredData.length;
    }

    updateSortIndicators(activeField) {
        document.querySelectorAll('.sortable').forEach(header => {
            const icon = header.querySelector('i');
            if (header.dataset.sort === activeField) {
                icon.className = `fas fa-sort-${this.currentSort.direction === 'asc' ? 'up' : 'down'}`;
                header.classList.add('active');
            } else {
                icon.className = 'fas fa-sort';
                header.classList.remove('active');
            }
        });
    }
}

// Function to retrieve and count pending requests
function fetchPendingRequests() {
    const requestsRef = ref(database, 'OutletGasRequest'); // Change to your database path
    onValue(requestsRef, (snapshot) => {
        let pendingCount = 0;

        snapshot.forEach((childSnapshot) => {
            const request = childSnapshot.val();
            if (request.status === 'Pending') {
                pendingCount++;
            }
        });

        // Update the UI with the pending count
        document.getElementById('pendingRequestsCount').textContent = pendingCount;
    });
}

function fetchAvailableStock() {
    const stockRef = ref(database, 'overallStats'); // Correct database path

    get(stockRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.error("No data found in overallStats");
                return;
            }

            let totalStock = 0;
            const stockData = snapshot.val();

            if (stockData) {
                // Assuming stockData contains filled counts
                totalStock = parseInt(stockData.filled || 0);
            }

            // Ensure element exists before updating
            const stockElement = document.getElementById('availableStockCount');
            if (stockElement) {
                stockElement.textContent = totalStock;
            } else {
                console.error("Element with ID 'availableStockCount' not found.");
            }
        })
        .catch((error) => {
            console.error("Error fetching available stock:", error);
        });
}

document.getElementById('logoutBtn').addEventListener('click', function() {
    // Clear session storage
    sessionStorage.clear();
    // Redirect to login page
    window.location.href = '/login.html';
});

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

// Call the function on page load
document.addEventListener('DOMContentLoaded', fetchPendingRequests);
document.addEventListener('DOMContentLoaded', fetchAvailableStock);


// Initialize the table
document.addEventListener('DOMContentLoaded', () => {
    const outletTable = new OutletTable();
    outletTable.initializeData();
});
