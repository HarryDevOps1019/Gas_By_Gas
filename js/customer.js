
// function initializeNavigation() {
//     const navLinks = document.querySelectorAll('.nav-link');
//     navLinks.forEach(link => {
//         link.addEventListener('click', function(e) {
//             const href = this.getAttribute('href');
//             if (href && href !== '#') {
//                 window.location.href = href;
//             }
//         });
//     });
// }

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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Utility Functions
function getModal(modalId) {
    return new bootstrap.Modal(document.getElementById(modalId));
}

function resetForm(formId) {
    document.getElementById(formId).reset();
}

// Customer Card Creation Functions
function createIndividualCard(customer, customerId) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
        <div class="card customer-card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">
                    <i class="fas fa-user me-2 text-primary"></i>
                    ${customer.name}
                </h6>
                <div class="customer-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="prepareIndividualEdit('${customerId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteCustomer('${customerId}', 'individual')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <p class="mb-1"><i class="fas fa-id-card me-2"></i>NIC: ${customer.nic}</p>
                <p class="mb-1"><i class="fas fa-phone me-2"></i>${customer.phoneNumber}</p>
                <p class="mb-0"><i class="fas fa-envelope me-2"></i>${customer.email}</p>
            </div>
        </div>
    `;
    return col;
}

function createOrganizationCard(org, orgId) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
        <div class="card customer-card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">
                    <i class="fas fa-building me-2 text-success"></i>
                    ${org.orgName}
                </h6>
                <div class="customer-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="prepareOrganizationEdit('${orgId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="deleteCustomer('${orgId}', 'organization')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <p class="mb-1"><i class="fas fa-registered me-2"></i>Reg: ${org.busiRegNo}</p>
                <p class="mb-1"><i class="fas fa-phone me-2"></i>${org.orgPhoneNumber}</p>
                <p class="mb-0"><i class="fas fa-envelope me-2"></i>${org.email}</p>
            </div>
        </div>
    `;
    return col;
}

// Load Customers
async function loadCustomers() {
    const customersList = document.getElementById('customersList');
    customersList.innerHTML = '';

    try {
        const individualSnapshot = await db.ref('CustomerRegistration').once('value');
        const organizationSnapshot = await db.ref('OrganizationRegistration').once('value');

        if (individualSnapshot.exists()) {
            individualSnapshot.forEach((childSnapshot) => {
                const customer = childSnapshot.val();
                const customerCard = createIndividualCard(customer, childSnapshot.key);
                customersList.appendChild(customerCard);
            });
        }

        if (organizationSnapshot.exists()) {
            organizationSnapshot.forEach((childSnapshot) => {
                const org = childSnapshot.val();
                const orgCard = createOrganizationCard(org, childSnapshot.key);
                customersList.appendChild(orgCard);
            });
        }
    } catch (error) {
        console.error("Error loading customers:", error);
        alert("Error loading customers. Please try again.");
    }
}

// Individual Customer Operations
async function addIndividualCustomer(event) {
    event.preventDefault();
    const form = document.getElementById('addIndividualForm');
    const formData = new FormData(form);
    
    const customerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        nic: formData.get('nic'),
        phoneNumber: formData.get('phoneNumber')
    };

    try {
        const newCustomerRef = db.ref('CustomerRegistration').push();
        await newCustomerRef.set(customerData);
        resetForm('addIndividualForm');
        getModal('addIndividualModal').hide();
        loadCustomers();
    } catch (error) {
        console.error("Error adding customer:", error);
        alert("Error adding customer. Please try again.");
    }
}

async function prepareIndividualEdit(customerId) {
    try {
        const snapshot = await db.ref(`CustomerRegistration/${customerId}`).once('value');
        if (snapshot.exists()) {
            const customer = snapshot.val();
            const form = document.getElementById('editIndividualForm');
            
            form.querySelector('[name="name"]').value = customer.name;
            form.querySelector('[name="email"]').value = customer.email;
            form.querySelector('[name="nic"]').value = customer.nic;
            form.querySelector('[name="phoneNumber"]').value = customer.phoneNumber;
            
            form.setAttribute('data-customer-id', customerId);
            
            getModal('editIndividualModal').show();
        }
    } catch (error) {
        console.error("Error loading customer data:", error);
        alert("Error loading customer data. Please try again.");
    }
}

async function updateIndividualCustomer(event) {
    event.preventDefault();
    const form = document.getElementById('editIndividualForm');
    const customerId = form.getAttribute('data-customer-id');
    const formData = new FormData(form);
    
    const updatedData = {
        name: formData.get('name'),
        email: formData.get('email'),
        nic: formData.get('nic'),
        phoneNumber: formData.get('phoneNumber')
    };

    try {
        await db.ref(`CustomerRegistration/${customerId}`).update(updatedData);
        resetForm('editIndividualForm');
        getModal('editIndividualModal').hide();
        loadCustomers();
    } catch (error) {
        console.error("Error updating customer:", error);
        alert("Error updating customer. Please try again.");
    }
}

// Organization Operations
async function addOrganization(event) {
    event.preventDefault();
    const form = document.getElementById('addOrganizationForm');
    const formData = new FormData(form);
    
    const orgData = {
        orgName: formData.get('orgName'),
        email: formData.get('email'),
        busiRegNo: formData.get('busiRegNo'),
        orgPhoneNumber: formData.get('orgPhoneNumber'),
        address: formData.get('address')
    };

    try {
        const newOrgRef = db.ref('OrganizationRegistration').push();
        await newOrgRef.set(orgData);
        resetForm('addOrganizationForm');
        getModal('addOrganizationModal').hide();
        loadCustomers();
    } catch (error) {
        console.error("Error adding organization:", error);
        alert("Error adding organization. Please try again.");
    }
}

async function prepareOrganizationEdit(orgId) {
    try {
        const snapshot = await db.ref(`OrganizationRegistration/${orgId}`).once('value');
        if (snapshot.exists()) {
            const org = snapshot.val();
            const form = document.getElementById('editOrganizationForm');
            
            form.querySelector('[name="orgName"]').value = org.orgName;
            form.querySelector('[name="email"]').value = org.email;
            form.querySelector('[name="busiRegNo"]').value = org.busiRegNo;
            form.querySelector('[name="orgPhoneNumber"]').value = org.orgPhoneNumber;
            form.querySelector('[name="address"]').value = org.address || '';
            
            form.setAttribute('data-org-id', orgId);
            
            getModal('editOrganizationModal').show();
        }
    } catch (error) {
        console.error("Error loading organization data:", error);
        alert("Error loading organization data. Please try again.");
    }
}

async function updateOrganization(event) {
    event.preventDefault();
    const form = document.getElementById('editOrganizationForm');
    const orgId = form.getAttribute('data-org-id');
    const formData = new FormData(form);
    
    const updatedData = {
        orgName: formData.get('orgName'),
        email: formData.get('email'),
        busiRegNo: formData.get('busiRegNo'),
        orgPhoneNumber: formData.get('orgPhoneNumber'),
        address: formData.get('address')
    };

    try {
        await db.ref(`OrganizationRegistration/${orgId}`).update(updatedData);
        resetForm('editOrganizationForm');
        getModal('editOrganizationModal').hide();
        loadCustomers();
    } catch (error) {
        console.error("Error updating organization:", error);
        alert("Error updating organization. Please try again.");
    }
}

// Delete Customer
async function deleteCustomer(id, type) {
    const confirmDelete = confirm("Are you sure you want to delete this customer?");
    if (confirmDelete) {
        try {
            const path = type === 'individual' ? 'CustomerRegistration' : 'OrganizationRegistration';
            await db.ref(`${path}/${id}`).remove();
            loadCustomers();
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Error deleting customer. Please try again.");
        }
    }
}

// Search Functionality
function setupSearch() {
    const searchInput = document.getElementById('searchCustomer');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.customer-card');
        
        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardParent = card.closest('.col-md-6');
            cardParent.style.display = cardText.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCustomers();
    setupSearch();

    // Add form submissions
    document.getElementById('addIndividualForm').addEventListener('submit', addIndividualCustomer);
    document.getElementById('addOrganizationForm').addEventListener('submit', addOrganization);

    // Edit form submissions
    document.getElementById('editIndividualForm').addEventListener('submit', updateIndividualCustomer);
    document.getElementById('editOrganizationForm').addEventListener('submit', updateOrganization);

    // Refresh button
    document.getElementById('refreshList').addEventListener('click', loadCustomers);
});