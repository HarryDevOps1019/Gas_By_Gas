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
// Initialize Firebase with enhanced error handling
function initializeFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        return firebase.database();
    } catch (error) {
        console.error('Firebase initialization error:', error);
        alert('Failed to connect to database. Please contact support.');
        return null;
    }
}

const database = initializeFirebase();

class InventoryManager {
    constructor() {
        this.inventoryData = {};
        this.approvedRequests = {};
        this.outlets = {};
        this.tokenData = {};
        this.initializeDOM();
    }

    initializeDOM() {
        this.elements = {
            loadingOverlay: document.getElementById('loadingOverlay'),
            inventoryList: document.getElementById('inventoryList'),
            addItemForm: document.getElementById('addItemForm'),
            saveItemBtn: document.getElementById('saveItem'),
            outletRegNoSelect: null,
            stats: {
                totalStock: document.getElementById('totalStock'),
                availableCylinders: document.getElementById('availableCylinders'),
                lowStockCount: document.getElementById('lowStockCount'),
                totalTokenRequests: document.getElementById('totalTokenRequests')
            },
            stockBreakdown: {
                '3.2KG': { 
                    count: document.getElementById('stock3_2KG'), 
                    progress: document.getElementById('stock3_2KGProgress') 
                },
                '5KG': { 
                    count: document.getElementById('stock5KG'), 
                    progress: document.getElementById('stock5KGProgress') 
                },
                '12.5KG': { 
                    count: document.getElementById('stock12_5KG'), 
                    progress: document.getElementById('stock12_5KGProgress') 
                },
                '37.5KG': { 
                    count: document.getElementById('stock37_5KG'), 
                    progress: document.getElementById('stock37_5KGProgress') 
                }
            }
        };
        
        this.elements.refreshButton = document.getElementById('refreshButton');
        if (this.elements.refreshButton) {
            this.elements.refreshButton.addEventListener('click', () => {
                this.loadComprehensiveData();
            });
        }

        this.bindEvents();
    }

    bindEvents() {
        if (this.elements.saveItemBtn) {
            this.elements.saveItemBtn.addEventListener('click', this.handleSaveItem.bind(this));
        }
    }

    showLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.remove('d-none');
        }
    }

    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('d-none');
        }
    }

    async populateOutletDropdown() {
        try {
            const outletSnapshot = await database.ref('gasOutletReg').once('value');
            this.outlets = outletSnapshot.val() || {};
            
            const outletRegNoSelect = document.createElement('select');
            outletRegNoSelect.id = 'outletRegNo';
            outletRegNoSelect.className = 'form-control';
            outletRegNoSelect.required = true;

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Outlet Registration Number';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            outletRegNoSelect.appendChild(defaultOption);

            Object.entries(this.outlets).forEach(([regNo, outletData]) => {
                const option = document.createElement('option');
                option.value = regNo;
                option.textContent = `${regNo} - ${outletData.outletName}`;
                outletRegNoSelect.appendChild(option);
            });

            outletRegNoSelect.addEventListener('change', (e) => {
                const selectedRegNo = e.target.value;
                const outletData = this.outlets[selectedRegNo];
                document.getElementById('outletName').value = outletData ? outletData.outletName : '';
            });

            const outletRegNoContainer = document.getElementById('outletRegNoContainer');
            const existingInput = document.getElementById('outletRegNo');
            outletRegNoContainer.replaceChild(outletRegNoSelect, existingInput);
            
            this.elements.outletRegNoSelect = outletRegNoSelect;
        } catch (error) {
            console.error('Error populating outlet dropdown:', error);
            alert('Failed to load outlet information');
        }
    }

    async loadComprehensiveData() {
        this.showLoading();
    
        try {
            const [requestSnapshot, inventorySnapshot, outletSnapshot, tokenSnapshot] = await Promise.all([
                database.ref('OutletGasRequest').orderByChild('status').equalTo('Approved').once('value'),
                database.ref('inventory').once('value'),
                database.ref('gasOutletReg').once('value'),
                database.ref('tokens').once('value')  // Changed to fetch all tokens
            ]);
    
            this.approvedRequests = requestSnapshot.val() || {};
            this.inventoryData = inventorySnapshot.val() || {};
            this.outlets = outletSnapshot.val() || {};
            this.tokenData = tokenSnapshot.val() || {};
    
            this.updateInventoryFromApprovedRequests();
            this.updateInventoryTable();
            this.updateStockBreakdown();
            this.updateStats();
            await this.populateOutletDropdown();
    
            this.showRefreshNotification();
        } catch (error) {
            console.error('Data loading error:', error);
            alert('Failed to load data. Check database connection.');
        } finally {
            this.hideLoading();
        }
    }

    showRefreshNotification() {
        const toast = document.getElementById('refreshToast');
        if (toast) {
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
            toastBootstrap.show();
        }
    }

    updateInventoryFromApprovedRequests() {
        Object.entries(this.approvedRequests).forEach(([, request]) => {
            if (request.status === 'Approved' && request.cylinderTypes) {
                request.cylinderTypes.forEach(cylinderType => {
                    const existingItem = Object.values(this.inventoryData).find(
                        item => item.outletRegNo === request.outletRegNo && 
                               item.cylinderType === cylinderType.type
                    );

                    const updatedItem = {
                        outletRegNo: request.outletRegNo,
                        outletName: request.outletName,
                        cylinderType: cylinderType.type,
                        currentStock: parseInt(cylinderType.quantity) || 0,
                        minimumStock: 10,
                        capacity: cylinderType.type,
                        lastUpdated: new Date().toISOString().split('T')[0]
                    };

                    if (existingItem) {
                        const existingKey = Object.keys(this.inventoryData).find(
                            key => this.inventoryData[key] === existingItem
                        );
                        database.ref(`inventory/${existingKey}`).update(updatedItem);
                    } else {
                        database.ref('inventory').push(updatedItem);
                    }
                });
            }
        });
    }

    updateInventoryTable() {
        if (!this.elements.inventoryList) return;
        
        this.elements.inventoryList.innerHTML = '';
        
        Object.entries(this.inventoryData).forEach(([id, item]) => {
            const isLowStock = parseInt(item.currentStock || 0) <= parseInt(item.minimumStock || 0);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${item.outletRegNo}</td>
                <td>${item.outletName || 'N/A'}</td>
                <td>${item.cylinderType || 'N/A'}</td>
                <td>${item.capacity || 'N/A'}</td>
                <td class="${isLowStock ? 'low-stock' : ''}">${item.currentStock || 0}</td>
                <td>${item.minimumStock || 0}</td>
                <td>${item.lastUpdated || 'N/A'}</td>
                <td>
                    <span class="badge ${parseInt(item.currentStock || 0) > 0 ? 'bg-success' : 'bg-danger'}">
                        ${parseInt(item.currentStock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="inventoryManager.deleteItem('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            this.elements.inventoryList.appendChild(row);
        });
    }
    async loadComprehensiveData() {
        this.showLoading();
    
        try {
            const [requestSnapshot, inventorySnapshot, outletSnapshot, tokenSnapshot] = await Promise.all([
                database.ref('OutletGasRequest').orderByChild('status').equalTo('Approved').once('value'),
                database.ref('inventory').once('value'),
                database.ref('gasOutletReg').once('value'),
                database.ref('tokens/TOK088054').once('value')  // Add tokens reference
            ]);
    
            this.approvedRequests = requestSnapshot.val() || {};
            this.inventoryData = inventorySnapshot.val() || {};
            this.outlets = outletSnapshot.val() || {};
            this.tokenData = tokenSnapshot.val() || {};  // Store token data
    
            this.updateInventoryFromApprovedRequests();
            this.updateInventoryTable();
            this.updateStockBreakdown();
            this.updateStats();
            await this.populateOutletDropdown();
    
            this.showRefreshNotification();
        } catch (error) {
            console.error('Data loading error:', error);
            alert('Failed to load data. Check database connection.');
        } finally {
            this.hideLoading();
        }
    }

    
    updateStockBreakdown() {
        const lowStockItems = Object.entries(this.inventoryData)
            .filter(([, item]) => {
                const currentStock = parseInt(item.currentStock) || 0;
                const capacity = parseInt(item.capacity) || 0;
                return currentStock < (capacity * 0.2);
            });

        // Calculate total tokens from both organization and customer records
        const totalTokens = Object.values(this.tokenData).reduce((total, tokenObj) => {
            // Check if the token object exists and has cylinderCount
            if (tokenObj && typeof tokenObj.cylinderCount !== 'undefined') {
                // For both organization and customer types
                if ((tokenObj.type === 'organization' && tokenObj.status === 'Completed') ||
                    (tokenObj.type === 'customer' && tokenObj.status === 'Approved')) {
                    return total + (parseInt(tokenObj.cylinderCount) || 0);
                }
            }
            return total;
        }, 0);

        const lowStockCard = document.getElementById('lowStockItemsCard');
        if (lowStockCard) {
            lowStockCard.innerHTML = lowStockItems.map(([id, item]) => `
                <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">${item.outletName}</h5>
                        <p class="card-text">
                            Type: ${item.cylinderType}<br>
                            Current Stock: ${item.currentStock}<br>
                            Capacity: ${item.capacity}
                        </p>
                    </div>
                </div>
            `).join('') || '<p class="text-muted">No low stock items</p>';
        }

        const tokenRequestsCard = document.getElementById('tokenRequestsCard');
        if (tokenRequestsCard) {
            tokenRequestsCard.textContent = totalTokens;
        }
        const stockByType = {
            '3.2KG': 0, '5KG': 0, '12.5KG': 0, '37.5KG': 0
        };

        const totalStock = Object.values(this.inventoryData).reduce((sum, item) => 
            sum + (parseInt(item.currentStock) || 0), 0);

        Object.values(this.inventoryData).forEach(item => {
            if (stockByType.hasOwnProperty(item.cylinderType)) {
                stockByType[item.cylinderType] += parseInt(item.currentStock) || 0;
            }
        });

        Object.entries(this.elements.stockBreakdown).forEach(([type, elements]) => {
            const count = stockByType[type];
            const percentage = totalStock > 0 ? (count / totalStock) * 100 : 0;

            if (elements.count) elements.count.textContent = count;
            if (elements.progress) elements.progress.style.width = `${percentage}%`;
        });
    }

    updateStats() {
        const lowStockCount = Object.values(this.inventoryData)
            .filter(item => {
                const currentStock = parseInt(item.currentStock) || 0;
                const capacity = parseInt(item.capacity) || 0;
                return currentStock < (capacity * 0.2);
            }).length;

        const totalStock = Object.values(this.inventoryData).reduce((sum, item) => 
            sum + (parseInt(item.currentStock) || 0), 0);
        
        const availableCylinders = Object.values(this.inventoryData).reduce((sum, item) => 
            sum + (parseInt(item.currentStock) > 0 ? parseInt(item.currentStock) : 0), 0);

        // Calculate total tokens considering both types
        const totalTokens = Object.values(this.tokenData).reduce((total, tokenObj) => {
            if (tokenObj && typeof tokenObj.cylinderCount !== 'undefined') {
                // Include only Completed organization tokens and Approved customer tokens
                if ((tokenObj.type === 'organization' && tokenObj.status === 'Completed') ||
                    (tokenObj.type === 'customer' && tokenObj.status === 'Approved')) {
                    return total + (parseInt(tokenObj.cylinderCount) || 0);
                }
            }
            return total;
        }, 0);

        this.updateStatsUI({
            totalStock, 
            availableCylinders, 
            lowStockCount
        }, totalTokens);
    }

    updateStatsUI(statsData, totalTokenRequestCount) {
        const { totalStock, availableCylinders, lowStockCount } = statsData;
        
        if (this.elements.stats.totalStock) this.elements.stats.totalStock.textContent = totalStock;
        if (this.elements.stats.availableCylinders) this.elements.stats.availableCylinders.textContent = availableCylinders;
        if (this.elements.stats.lowStockCount) this.elements.stats.lowStockCount.textContent = lowStockCount;
        if (this.elements.stats.totalTokenRequests) this.elements.stats.totalTokenRequests.textContent = totalTokenRequestCount;
    }

    handleSaveItem() {
        const outletRegNo = document.getElementById('outletRegNo').value.trim();
        const outletName = document.getElementById('outletName').value.trim();
        
        if (!this.validateSaveItemForm(outletRegNo, outletName)) return;

        const cylinderTypes = this.getCylinderTypes();
        if (cylinderTypes.length === 0) {
            alert('Please enter quantity for at least one cylinder type');
            return;
        }

        this.submitTokenRequest(outletRegNo, outletName, cylinderTypes);
    }

    validateSaveItemForm(outletRegNo, outletName) {
        if (!outletRegNo || !outletName) {
            alert('Please select an Outlet');
            return false;
        }
        return true;
    }
    
    getCylinderTypes() {
        return [
            { type: '3.2KG', quantity: document.getElementById('quantity-3.2').value || 0 },
            { type: '5KG', quantity: document.getElementById('quantity-5').value || 0 },
            { type: '12.5KG', quantity: document.getElementById('quantity-12.5').value || 0 },
            { type: '37.5KG', quantity: document.getElementById('quantity-37.5').value || 0 }
        ].filter(ct => parseInt(ct.quantity) > 0);
    }
    
    async submitTokenRequest(outletRegNo, outletName, cylinderTypes) {
        this.showLoading();
        
        // Calculate total cylinders requested
        const totalCylindersRequested = cylinderTypes.reduce((sum, ct) => 
            sum + parseInt(ct.quantity), 0);
        
        // Check monthly limit
        const currentMonthRequests = this.calculateMonthlyRequests(outletRegNo);
        const proposedTotalRequests = currentMonthRequests + totalCylindersRequested;
        
        if (proposedTotalRequests > 100) {
            alert(`Monthly cylinder limit exceeded. You can only request ${100 - currentMonthRequests} more cylinders this month.`);
            this.hideLoading();
            return;
        }
        
        const tokenRequest = {
            outletRegNo,
            outletName,
            cylinderTypes,
            requestDate: document.getElementById('requestDate').value || 
                         new Date().toISOString().split('T')[0],
            notes: document.getElementById('requestNotes').value,
            status: 'Pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
    
        try {
            // Save data directly using outletRegNo as the key
            await database.ref(`OutletGasRequest/${outletRegNo}`).set(tokenRequest);
            this.handleSuccessfulSubmission();
        } catch (error) {
            this.handleSubmissionError(error);
        }
    }
    


    
    calculateMonthlyRequests(outletRegNo) {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return Object.values(this.approvedRequests)
            .filter(request => 
                request.outletRegNo === outletRegNo &&
                new Date(request.requestDate).getMonth() === currentMonth &&
                new Date(request.requestDate).getFullYear() === currentYear
            )
            .reduce((total, request) => {
                return total + request.cylinderTypes.reduce((sum, ct) => 
                    sum + parseInt(ct.quantity), 0);
            }, 0);
    }
    
    handleSuccessfulSubmission() {
        this.hideLoading();
        const addItemModal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        if (addItemModal) addItemModal.hide();
        this.elements.addItemForm.reset();
        alert('Request sent to Head Office. Waiting for approval.');
    }
    
    handleSubmissionError(error) {
        console.error('Request submission error:', error);
        alert('Failed to submit request. Please try again.');
        this.hideLoading();
    }

    async editItem(itemId) {
        const item = this.inventoryData[itemId];
        if (!item) return;

        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
        
        document.getElementById('outletRegNo').value = item.outletRegNo || '';
        document.getElementById('outletName').value = item.outletName || '';

        // Populate cylinder quantities if needed
        document.getElementById('quantity-3.2').value = item.cylinderType === '3.2KG' ? item.currentStock : '';
        document.getElementById('quantity-5').value = item.cylinderType === '5KG' ? item.currentStock : '';
        document.getElementById('quantity-12.5').value = item.cylinderType === '12.5KG' ? item.currentStock : '';
        document.getElementById('quantity-37.5').value = item.cylinderType === '37.5KG' ? item.currentStock : '';

        this.elements.saveItemBtn.onclick = () => this.updateItem(itemId, modal);
        modal.show();
    }

    async updateItem(itemId, modal) {
        const cylinderTypes = this.getCylinderTypes();
        const updatedItem = {
            ...this.inventoryData[itemId],
            outletRegNo: document.getElementById('outletRegNo').value,
            outletName: document.getElementById('outletName').value,
            cylinderType: cylinderTypes[0]?.type || this.inventoryData[itemId].cylinderType,
            currentStock: cylinderTypes[0]?.quantity || this.inventoryData[itemId].currentStock,
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        try {
            this.showLoading();
            await database.ref(`inventory/${itemId}`).update(updatedItem);
            this.hideLoading();
            modal.hide();
            await this.loadComprehensiveData();
        } catch (error) {
            console.error('Edit error:', error);
            alert('Failed to update item');
            this.hideLoading();
        }
    }

    async deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this item?')) return;
    
        try {
            this.showLoading();
            
            // Get the item details before deleting
            const itemToDelete = this.inventoryData[itemId];
            
            // Remove from inventory
            await database.ref(`inventory/${itemId}`).remove();
            
            // Remove related requests
            const requestsRef = database.ref('OutletGasRequest');
            const snapshot = await requestsRef
                .orderByChild('outletRegNo')
                .equalTo(itemToDelete.outletRegNo)
                .once('value');
            
            // Remove matching requests
            snapshot.forEach((childSnapshot) => {
                childSnapshot.ref.remove();
            });
    
            this.hideLoading();
            await this.loadComprehensiveData();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete item');
            this.hideLoading();
        }
    }

    init() {
        this.loadComprehensiveData();
        
        const addItemModal = document.getElementById('addItemModal');
        if (addItemModal) {
            addItemModal.addEventListener('hidden.bs.modal', () => {
                this.elements.addItemForm.reset();
                this.bindEvents();
            });
        }
    }
}

// Global instance and initialization
const inventoryManager = new InventoryManager();
document.addEventListener('DOMContentLoaded', () => inventoryManager.init());

// Global Error Handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    inventoryManager.hideLoading();
    alert('An unexpected error occurred. Please try again.');
});