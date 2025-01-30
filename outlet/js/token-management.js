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
const outletId = 'default-outlet';

// Utility Functions
function standardizeCylinderType(type) {
    return type.replace(/\s+/g, '').toUpperCase();
}
function calculateExpirationDate() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + TOKEN_EXPIRY_DAYS);
    return expirationDate.getTime();
}
const TOKEN_EXPIRY_DAYS = 14; // 2 weeks

function validateCustomerData(data) {
    const requiredFields = ['name', 'phoneNumber', 'nic', 'email', 'cylinderType', 'cylinderCount'];
    for (const field of requiredFields) {
        if (!data[field] || data[field] === undefined) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    data.cylinderType = standardizeCylinderType(data.cylinderType);
    return true;
}

function validateOrgData(data) {
    const requiredFields = ['orgName', 'orgPhoneNumber', 'busiRegNo', 'cylinderType', 'cylinderCount'];
    for (const field of requiredFields) {
        if (!data[field] || data[field] === undefined) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    data.cylinderType = standardizeCylinderType(data.cylinderType);
    return true;
}

function formatDate(timestamp) {
    return timestamp ? new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    }) : 'N/A';
}

function getStatusColor(status) {
    const colors = {
        'Approved': 'primary',
        'Completed': 'success',
        'Pending': 'warning'
    };
    return colors[status] || 'secondary';
}

// Statistics Management Class
class TokenStatisticsManager {
    constructor() {
        this.database = firebase.database();
        this.statsElements = {
            pendingRequests: document.getElementById('pendingRequestsCount'),
            approvedTokens: document.getElementById('approvedTokensCount'),
            availableStock: document.getElementById('todayTokensCount'),
            completedTokens: document.getElementById('completedTodayCount')
        };
    }

    initializeStatisticsTracking() {
        this.trackPendingRequests();
        this.trackApprovedTokens();
        this.trackAvailableStock();
        this.trackCompletedTokens();
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

            this.statsElements.pendingRequests.textContent = totalPending;
            document.getElementById('customerPendingCount').textContent = indCustPending;
            document.getElementById('orgPendingCount').textContent = orgPending;
        });
    }

    trackApprovedTokens() {
        const tokensRef = this.database.ref('tokens');
        tokensRef.orderByChild('status').equalTo('Approved').once('value', (snapshot) => {
            const approvedTokensCount = snapshot.numChildren();
            this.statsElements.approvedTokens.textContent = approvedTokensCount;
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

    updateStockBreakdown() {
        const inventoryRef = this.database.ref('inventory');
        inventoryRef.once('value', (snapshot) => {
            const inventoryData = snapshot.val();
            const stockByType = {
                '3.2KG': 0, 
                '5KG': 0, 
                '12.5KG': 0, 
                '37.5KG': 0
            };

            const totalStock = Object.values(inventoryData || {}).reduce((sum, item) => 
                sum + (parseInt(item.currentStock) || 0), 0);

            Object.values(inventoryData || {}).forEach(item => {
                const standardizedType = standardizeCylinderType(item.cylinderType);
                if (stockByType.hasOwnProperty(standardizedType)) {
                    stockByType[standardizedType] += parseInt(item.currentStock) || 0;
                }
            });

            this.updateStockBreakdownUI(stockByType, totalStock);
        });
    }

    updateStockBreakdownUI(stockByType, totalStock) {
        Object.entries(stockByType).forEach(([type, count]) => {
            const percentage = totalStock > 0 ? (count / totalStock) * 100 : 0;
            const countElement = document.getElementById(`stock-count-${type.replace('.', '-')}`);
            const progressElement = document.getElementById(`stock-progress-${type.replace('.', '-')}`);

            if (countElement) countElement.textContent = count;
            if (progressElement) progressElement.style.width = `${percentage}%`;
        });
    }
}

// Request Loading Functions
function loadCustomerPendingRequests() {
    const requestsRef = database.ref('IndCustGasRequests');
    const pendingList = document.getElementById('customerPendingRequestsList');
    const pendingCount = document.getElementById('customerPendingCount');
    
    requestsRef.orderByChild('status').equalTo('pending').on('value', (snapshot) => {
        pendingList.innerHTML = '';
        let count = 0;

        snapshot.forEach((child) => {
            const request = child.val();
            count++;
            
            const row = `
                <tr>
                    <td>${request.name || 'N/A'}</td>
                    <td>${request.cylinderType || 'N/A'}</td>
                    <td>${request.cylinderCount || 0}</td>
                    <td>${formatDate(request.requestDate)}</td>
                    <td>${request.nic || 'N/A'}</td>
                    <td>${request.phoneNumber || 'N/A'}</td>
                    <td>${request.email || 'N/A'}</td>
                    <td>
                        <button onclick="approveCustomerRequest('${child.key}')" class="btn btn-success btn-sm me-1">
                            Approve
                        </button>
                        <button onclick="rejectRequest('${child.key}', 'customer')" class="btn btn-danger btn-sm">
                            Reject
                        </button>
                    </td>
                </tr>
            `;
            pendingList.insertAdjacentHTML('beforeend', row);
        });

        pendingCount.textContent = count;
    });
}

function loadOrganizationPendingRequests() {
    const requestsRef = database.ref('OrgGasRequests');
    const pendingList = document.getElementById('orgPendingRequestsList');
    const pendingCount = document.getElementById('orgPendingCount');
    
    requestsRef.orderByChild('status').equalTo('pending').on('value', (snapshot) => {
        pendingList.innerHTML = '';
        let count = 0;

        snapshot.forEach((child) => {
            const request = child.val();
            count++;
            
            const row = `
                <tr>
                    <td>${request.orgName || 'N/A'}</td>
                    <td>${request.busiRegNo || 'N/A'}</td>
                    <td>${request.cylinderType || 'N/A'}</td>
                    <td>${request.cylinderCount || 0}</td>
                    <td>${formatDate(request.requestDate)}</td>
                    <td>${request.orgPhoneNumber || 'N/A'}</td>
                    <td>
                        <button onclick="approveOrgRequest('${child.key}')" class="btn btn-success btn-sm me-1">
                            Approve
                        </button>
                        <button onclick="rejectRequest('${child.key}', 'org')" class="btn btn-danger btn-sm">
                            Reject
                        </button>
                    </td>
                </tr>
            `;
            pendingList.insertAdjacentHTML('beforeend', row);
        });

        pendingCount.textContent = count;
    });
}

function loadApprovedTokens() {
    const tokensRef = database.ref('tokens');
    const tokensList = document.getElementById('approvedTokensList');
    const approvedCount = document.getElementById('approvedCount');

    tokensRef.orderByChild('outletId').equalTo(outletId).on('value', (snapshot) => {
        tokensList.innerHTML = '';
        let count = 0;

        snapshot.forEach((child) => {
            const token = child.val();
            if (token.status !== 'pending') {
                count++;
                const expiryDate = new Date(token.expiresAt).toLocaleDateString();
                const row = `
                    <tr>
                        <td>${token.token || 'N/A'}</td>
                        <td>${token.type === 'organization' ? token.orgName : token.name || 'N/A'}</td>
                        <td>${token.type || 'N/A'}</td>
                        <td>${token.cylinderType || 'N/A'}</td>
                        <td>${token.cylinderCount || 0}</td>
                        <td>${formatDate(token.createdAt)}</td>
                        <td>${expiryDate}</td>
                        <td><span class="badge bg-${getStatusColor(token.status)}">${token.status}</span></td>
                        <td>
                            <button onclick="markComplete('${child.key}')" 
                                    class="btn btn-primary btn-sm me-1" 
                                    ${token.status === 'Completed' ? 'disabled' : ''}>
                                Complete
                            </button>
                            <button onclick="sendReminder('${child.key}')" 
                                    class="btn btn-warning btn-sm me-1" 
                                    ${token.status === 'Completed' ? 'disabled' : ''}>
                                Remind
                            </button>
                            <button onclick="deleteToken('${child.key}')"
                                    class="btn btn-danger btn-sm">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
                tokensList.insertAdjacentHTML('beforeend', row);
            }
        });

        approvedCount.textContent = count;
    });
}


// Action Functions
async function approveCustomerRequest(requestId) {
    try {
        const requestRef = database.ref('IndCustGasRequests/' + requestId);
        const snapshot = await requestRef.get();
        const request = snapshot.val();

        if (!request) {
            throw new Error('Request not found');
        }

        validateCustomerData(request);

        const tokenNumber = 'TOK' + Date.now().toString().slice(-6);
        const tokenRef = database.ref('tokens/' + tokenNumber);
        
        const tokenData = {
            token: tokenNumber,
            name: request.name,
            type: 'customer',
            cylinderType: standardizeCylinderType(request.cylinderType),
            cylinderCount: request.cylinderCount,
            nic: request.nic,
            phoneNumber: request.phoneNumber,
            email: request.email,
            status: 'Approved',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            expiresAt: calculateExpirationDate(), // Add expiration date
            outletId: outletId
        };

        await tokenRef.set(tokenData);
        await requestRef.update({
            status: 'approved',
            tokenNumber: tokenNumber,
            approvedAt: firebase.database.ServerValue.TIMESTAMP
        });

        alert(`Token ${tokenNumber} has been generated successfully! Valid for ${TOKEN_EXPIRY_DAYS} days.`);
    } catch (error) {
        console.error('Error details:', error);
        alert('Error approving request: ' + error.message);
    }
}

async function approveOrgRequest(requestId) {
    try {
        const requestRef = database.ref('OrgGasRequests/' + requestId);
        const snapshot = await requestRef.get();
        const request = snapshot.val();

        if (!request) {
            throw new Error('Request not found');
        }

        validateOrgData(request);

        const tokenNumber = 'TOK' + Date.now().toString().slice(-6);
        const tokenRef = database.ref('tokens/' + tokenNumber);
        
        const tokenData = {
            token: tokenNumber,
            orgName: request.orgName,
            type: 'organization',
            busiRegNo: request.busiRegNo,
            cylinderType: standardizeCylinderType(request.cylinderType),
            cylinderCount: request.cylinderCount,
            orgPhoneNumber: request.orgPhoneNumber,
            status: 'Approved',
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            expiresAt: calculateExpirationDate(), // Add expiration date
            outletId: outletId
        };

        await tokenRef.set(tokenData);
        await requestRef.update({
            status: 'approved',
            tokenNumber: tokenNumber,
            approvedAt: firebase.database.ServerValue.TIMESTAMP
        });

        alert(`Token ${tokenNumber} has been generated successfully! Valid for ${TOKEN_EXPIRY_DAYS} days.`);
    } catch (error) {
        console.error('Error details:', error);
        alert('Error approving request: ' + error.message);
    }
}

// Add automatic token expiration check
function setupTokenExpirationCheck() {
    const tokensRef = database.ref('tokens');
    
    // Check for expired tokens every hour
    setInterval(async () => {
        const now = Date.now();
        
        const snapshot = await tokensRef
            .orderByChild('expiresAt')
            .endAt(now)
            .once('value');
        
        snapshot.forEach(async (childSnapshot) => {
            const token = childSnapshot.val();
            if (token.status !== 'Completed') {
                try {
                    // Log the expired token before deletion
                    const logRef = database.ref('expiredTokensLog').push();
                    await logRef.set({
                        tokenData: token,
                        expiredAt: now,
                        reason: 'Token expired after 2 weeks'
                    });

                    // Delete the expired token
                    await tokensRef.child(childSnapshot.key).remove();
                    console.log(`Token ${token.token} expired and removed`);
                } catch (error) {
                    console.error('Error handling expired token:', error);
                }
            }
        });
    }, 3600000); // Check every hour
}


async function rejectRequest(requestId, type) {
    if (!confirm('Are you sure you want to reject this request?')) return;

    try {
        const path = type === 'org' ? 'OrgGasRequests' : 'IndCustGasRequests';
        await database.ref(`${path}/${requestId}`).update({
            status: 'rejected',
            rejectedAt: firebase.database.ServerValue.TIMESTAMP
        });
        alert('Request rejected successfully');
    } catch (error) {
        alert('Error rejecting request: ' + error.message);
    }
}

async function markComplete(tokenId) {
    try {
        const tokenRef = database.ref('tokens/' + tokenId);
        const tokenSnapshot = await tokenRef.get();
        const token = tokenSnapshot.val();

        if (!token) {
            throw new Error('Token not found');
        }

        // Standardize cylinder type format
        const standardizedCylinderType = standardizeCylinderType(token.cylinderType);

        // Get all inventory items and find matching cylinder type
        const inventoryRef = database.ref('inventory');
        const inventorySnapshot = await inventoryRef.once('value');
        
        let inventoryId = null;
        let currentStock = 0;
        
        inventorySnapshot.forEach((child) => {
            const inventoryItem = child.val();
            if (standardizeCylinderType(inventoryItem.cylinderType) === standardizedCylinderType) {
                inventoryId = child.key;
                currentStock = parseInt(inventoryItem.currentStock) || 0;
            }
        });

        if (!inventoryId) {
            throw new Error(`Inventory record not found for cylinder type: ${token.cylinderType}`);
        }

        if (currentStock < token.cylinderCount) {
            throw new Error(`Insufficient stock available. Current stock: ${currentStock}`);
        }

        // Update inventory - reduce the stock
        const newStock = currentStock - parseInt(token.cylinderCount);
        await inventoryRef.child(inventoryId).update({
            currentStock: newStock,
            lastUpdated: firebase.database.ServerValue.TIMESTAMP
        });

        // Create inventory transaction log
        const transactionRef = database.ref('inventoryTransactions').push();
        await transactionRef.set({
            tokenId: tokenId,
            cylinderType: token.cylinderType,
            quantityDeducted: token.cylinderCount,
            previousStock: currentStock,
            newStock: newStock,
            type: 'delivery',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            outletId: outletId
        });

        // Update token status
        await tokenRef.update({
            status: 'Completed',
            completedAt: firebase.database.ServerValue.TIMESTAMP,
            inventoryUpdated: true,
            inventoryTransactionId: transactionRef.key
        });

        // Update statistics
        const statsManager = new TokenStatisticsManager();
        statsManager.trackAvailableStock();
        statsManager.trackCompletedTokens();

        alert('Token marked as completed and inventory updated successfully!');
    } catch (error) {
        console.error('Error completing token:', error);
        alert('Error: ' + error.message);
    }
}

async function sendReminder(tokenId) {
    try {
        const tokenSnapshot = await database.ref('tokens/' + tokenId).get();
        const token = tokenSnapshot.val();
        
        const contactInfo = token.type === 'organization' 
            ? `${token.orgName} at ${token.orgPhoneNumber}`
            : `${token.name} at ${token.email} and ${token.phoneNumber}`;
            
        alert(`Reminder would be sent to ${contactInfo}`);
        
        await database.ref('tokens/' + tokenId).update({
            lastReminder: firebase.database.ServerValue.TIMESTAMP,
            reminderCount: firebase.database.ServerValue.increment(1)
        });

        // Log the reminder
        const reminderLogRef = database.ref('reminderLogs').push();
        await reminderLogRef.set({
            tokenId: tokenId,
            sentTo: contactInfo,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            outletId: outletId
        });

    } catch (error) {
        console.error('Error sending reminder:', error);
        alert('Error sending reminder: ' + error.message);
    }
}

async function deleteToken(tokenId) {
    if (!confirm('Are you sure you want to delete this token? This action cannot be undone.')) {
        return;
    }

    try {
        const tokenRef = database.ref('tokens/' + tokenId);
        const tokenSnapshot = await tokenRef.get();
        const tokenData = tokenSnapshot.val();

        if (!tokenData) {
            throw new Error('Token not found');
        }

        // Log the deletion
        const logRef = database.ref('deletedTokensLog').push();
        await logRef.set({
            tokenData: tokenData,
            deletedAt: firebase.database.ServerValue.TIMESTAMP,
            deletedBy: outletId,
            reason: 'Manual deletion'
        });

        await tokenRef.remove();
        
        // Update statistics after deletion
        const statsManager = new TokenStatisticsManager();
        statsManager.trackApprovedTokens();
        statsManager.trackCompletedTokens();

        alert('Token deleted successfully');
    } catch (error) {
        console.error('Error deleting token:', error);
        alert('Error deleting token: ' + error.message);
    }
}

// Connection Monitoring
function monitorConnection() {
    const connectedRef = database.ref('.info/connected');
    const statusRef = database.ref('status/' + outletId);

    connectedRef.on('value', (snapshot) => {
        const connected = snapshot.val();
        
        if (connected) {
            console.log('Connected to Firebase');
            
            // Clear old status
            statusRef.onDisconnect().remove();
            
            // Set online status
            statusRef.set({
                status: 'online',
                lastSeen: firebase.database.ServerValue.TIMESTAMP,
                userAgent: navigator.userAgent
            });
        } else {
            console.log('Disconnected from Firebase');
            statusRef.remove();
        }
    });
}

// Navigation Initialization Function
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault(); // Prevent default if you want to handle navigation manually
                window.location.href = href;
            }
        });
    });

    // Set active link based on current page
    const currentPath = window.location.pathname;
    const currentLink = document.querySelector(`.nav-link[href="${currentPath}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
}

// Error Handler Function
function handleDatabaseError(error) {
    console.error('Database operation failed:', error);
    // Log to external error tracking service if available
    alert('Operation failed. Please try again later.');
}

// DOM Load Event Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize statistics tracking
    const statsManager = new TokenStatisticsManager();
    statsManager.initializeStatisticsTracking();
    statsManager.updateStockBreakdown();

    // Load data
    loadCustomerPendingRequests();
    loadOrganizationPendingRequests();
    loadApprovedTokens();
    
    // Monitor connection
    monitorConnection();
    // Initialize token expiration checking
    setupTokenExpirationCheck();

    // Setup error handling for failed database operations
    database.ref('.info/connected').on('value', (snapshot) => {
        if (!snapshot.val()) {
            console.warn('Database connection lost');
        }
    });
});

// Make functions available globally
window.approveCustomerRequest = approveCustomerRequest;
window.approveOrgRequest = approveOrgRequest;
window.rejectRequest = rejectRequest;
window.markComplete = markComplete;
window.sendReminder = sendReminder;
window.deleteToken = deleteToken;