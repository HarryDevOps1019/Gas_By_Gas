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

class GasDashboard {
    constructor() {
        this.database = firebase.database();
        this.statsElements = {
            pendingRequests: document.getElementById('pendingRequestsCount'),
            availableStock: document.getElementById('availableStockCount'),
            completedTokens: document.getElementById('todayDeliveriesCount')
        };
        this.setupEventListeners();
    }

    trackPendingRequests() {
        const indCustRef = this.database.ref('IndCustGasRequests');
        const orgRequestsRef = this.database.ref('OrgGasRequests');

        Promise.all([
            indCustRef.orderByChild('status').equalTo('pending').once('value'),
            orgRequestsRef.orderByChild('status').equalTo('pending').once('value')
        ]).then(([indCustSnapshot, orgSnapshot]) => {
            const indCustPending = indCustSnapshot.numChildren();
            const orgPending = orgSnapshot.numChildren();
            const totalPending = indCustPending + orgPending;

            if (this.statsElements.pendingRequests) {
                this.statsElements.pendingRequests.textContent = totalPending;
            }
            
            const customerPendingCount = document.getElementById('customerPendingCount');
            const orgPendingCount = document.getElementById('orgPendingCount');
            
            if (customerPendingCount) customerPendingCount.textContent = indCustPending;
            if (orgPendingCount) orgPendingCount.textContent = orgPending;
        }).catch(error => {
            console.error("Error tracking pending requests:", error);
        });
    }

    trackAvailableStock() {
        const inventoryRef = this.database.ref('inventory');
        inventoryRef.once('value', (snapshot) => {
            const inventoryData = snapshot.val();
            let availableCylinders = 0;
            
            if (inventoryData) {
                Object.values(inventoryData).forEach(item => {
                    const currentStock = parseInt(item.currentStock) || 0;
                    availableCylinders += currentStock > 0 ? currentStock : 0;
                });
            }
            
            this.statsElements.availableStock.textContent = availableCylinders;
        });
    }

    trackCompletedTokens() {
        const tokensRef = this.database.ref('tokens');
        const today = new Date().toDateString();
        
        tokensRef.orderByChild('status').equalTo('Completed').once('value', (snapshot) => {
            let deliveredCount = 0;
            
            snapshot.forEach((childSnapshot) => {
                const token = childSnapshot.val();
                if (token.completedAt && new Date(token.completedAt).toDateString() === today) {
                    deliveredCount += parseInt(token.cylinderCount) || 0;
                }
            });
            
            this.statsElements.completedTokens.textContent = deliveredCount;
        });
    }

    setupEventListeners() {
        const statusFilter = document.getElementById('statusFilter');
        const cylinderTypeFilter = document.getElementById('cylinderTypeFilter');
        const searchInput = document.getElementById('searchInput');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }
        if (cylinderTypeFilter) {
            cylinderTypeFilter.addEventListener('change', () => this.applyFilters());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const cylinderTypeFilter = document.getElementById('cylinderTypeFilter').value;
        const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();

        const rows = document.querySelectorAll('#requestsTable tr:not(:first-child)'); // Skip header row
        
        rows.forEach(row => {
            // Get all cell values for searching
            const cells = Array.from(row.getElementsByTagName('td'));
            const rowData = {
                status: cells[5]?.querySelector('.status-badge')?.textContent.trim() || '',
                cylinderType: cells[4]?.textContent.trim() || '',
                id: cells[0]?.textContent.trim() || '',        // NIC/RegNo
                name: cells[1]?.textContent.trim() || '',      // Name
                date: cells[2]?.textContent.trim() || '',      // Date
                type: cells[3]?.textContent.trim() || ''       // Type
            };

            // Hide completed status rows
            if (rowData.status.toLowerCase() === 'completed') {
                row.style.display = 'none';
                return;
            }

            const matchesStatus = !statusFilter || rowData.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesCylinderType = !cylinderTypeFilter || rowData.cylinderType === cylinderTypeFilter;
            
            // Search in all relevant fields
            const matchesSearch = !searchQuery || 
                rowData.id.toLowerCase().includes(searchQuery) ||
                rowData.name.toLowerCase().includes(searchQuery) ||
                rowData.date.toLowerCase().includes(searchQuery) ||
                rowData.type.toLowerCase().includes(searchQuery) ||
                rowData.cylinderType.toLowerCase().includes(searchQuery) ||
                rowData.status.toLowerCase().includes(searchQuery);

            row.style.display = matchesStatus && matchesCylinderType && matchesSearch ? '' : 'none';
        });
    }

    loadRecentRequests() {
        const requestsTableBody = document.getElementById('requestsTable');
        if (!requestsTableBody) return;

        const indCustRef = this.database.ref('IndCustGasRequests');
        const orgRequestsRef = this.database.ref('OrgGasRequests');

        Promise.all([
            indCustRef.limitToLast(10).once('value'),
            orgRequestsRef.limitToLast(10).once('value')
        ]).then(([indCustSnapshot, orgSnapshot]) => {
            requestsTableBody.innerHTML = '';

            const requests = [];
            
            indCustSnapshot.forEach(childSnapshot => {
                const request = childSnapshot.val();
                // Skip completed requests
                if (request.status !== 'Completed') {
                    request.id = childSnapshot.key;
                    request.type = 'Individual';
                    // For individual customers, use name field
                    request.displayName = request.name || 'Unknown';
                    requests.push(request);
                }
            });

            orgSnapshot.forEach(childSnapshot => {
                const request = childSnapshot.val();
                // Skip completed requests
                if (request.status !== 'Completed') {
                    request.id = childSnapshot.key;
                    request.type = 'Organization';
                    // For organizations, use orgName field
                    request.displayName = request.orgName || 'Unknown';
                    requests.push(request);
                }
            });

            // Sort by request date (most recent first)
            requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

            requests.forEach(request => {
                this.appendRequestToTable(request, requestsTableBody);
            });
        }).catch(error => {
            console.error('Error loading requests:', error);
            requestsTableBody.innerHTML = '<tr><td colspan="6">Error loading requests</td></tr>';
        });
    }

    appendRequestToTable(request, tableBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.nic || request.orgRegNo || 'N/A'}</td>
            <td>${request.displayName}</td>
            <td>${request.requestDate || 'N/A'}</td>
            <td>${request.type}</td>
            <td>${request.cylinderType || 'N/A'}</td>
            <td>
                <span class="badge status-badge status-${(request.status || 'pending').toLowerCase()}">
                    ${request.status || 'Pending'}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    }

    initializeDashboard() {
        this.trackPendingRequests();
        this.trackAvailableStock();
        this.trackCompletedTokens();
        this.loadRecentRequests();
    }
}

// Initialize Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gasDashboard = new GasDashboard();
    window.gasDashboard.initializeDashboard();
});

// Utility function for resetting filters
window.resetFilters = function() {
    document.getElementById('statusFilter').selectedIndex = 0;
    document.getElementById('cylinderTypeFilter').selectedIndex = 0;
    document.getElementById('searchInput').value = '';
    window.gasDashboard.applyFilters();
};

// Logout function
function handleLogout(event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        firebase.auth().signOut()
            .then(() => {
                // Logout successful
                console.log('User logged out successfully');
                window.location.href = '/outletlogin.html';
            })
            .catch((error) => {
                // An error happened
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            });
    }
}