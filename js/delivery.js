// // Import Firebase modules using ES modules syntax
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue, update, get } from "firebase/database";

// class DeliveryTracker {
//     constructor() {
//         // Firebase configuration
//         const firebaseConfig = {
//             apiKey: "AIzaSyDAO3etWS-qat1uFFLSjrslHAo0UJwtVa0",
//             authDomain: "gas-c3c22.firebaseapp.com",
//             databaseURL: "https://gas-c3c22-default-rtdb.firebaseio.com",
//             projectId: "gas-c3c22",
//             storageBucket: "gas-c3c22.firebasestorage.app",
//             messagingSenderId: "334602451880",
//             appId: "1:334602451880:web:24d017ddce0d1f84a83b9d",
//             measurementId: "G-EZTE4CTZS2"
//         };

//         // Initialize Firebase using compat version
//         firebase.initializeApp(firebaseConfig);
//         this.db = firebase.database();
        
//         // Initialize UI elements
//         this.initializeUI();
//         // Set up event listeners
//         this.setupEventListeners();
//     }

//     initializeUI() {
//         this.ui = {
//             trackingInput: document.querySelector('#tracking-input'),
//             trackingDetails: document.querySelector('#tracking-details'),
//             registrationDisplay: document.querySelector('#registration-display'),
//             completeDeliveryBtn: document.querySelector('#complete-delivery'),
//             progressSteps: document.querySelectorAll('#progressbar li'),
//             timelineStepTimes: Array.from({ length: 4 }, (_, i) => 
//                 document.querySelector(`#step${i + 1}-time`)),
//             expectedArrival: document.querySelector('#expected-arrival')
//         };

//         this.STATUS_MAP = {
//             'Order Confirmed': 1,
//             'Processing': 2,
//             'Out for Delivery': 3,
//             'Delivered': 4
//         };
//     }

//     setupEventListeners() {
//         // Complete delivery button handler
//         this.ui.completeDeliveryBtn.addEventListener('click', () => this.completeDelivery());
        
//         // Enter key support for tracking input
//         this.ui.trackingInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') {
//                 this.trackDelivery();
//             }
//         });

//         // Initialize tooltips if Bootstrap is available
//         if (typeof bootstrap !== 'undefined') {
//             const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
//             tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
//         }
//     }

//     calculateExpectedArrival(status) {
//         const now = new Date();
//         let arrivalTime = new Date(now);

//         switch(status) {
//             case 'Order Confirmed':
//                 arrivalTime.setHours(now.getHours() + 4);
//                 break;
//             case 'Processing':
//                 arrivalTime.setHours(now.getHours() + 3);
//                 break;
//             case 'Out for Delivery':
//                 arrivalTime.setHours(now.getHours() + 1);
//                 break;
//             case 'Delivered':
//                 return 'Delivered';
//         }

//         return arrivalTime.toLocaleTimeString();
//     }

//     updateProgress(status) {
//         const currentStep = this.STATUS_MAP[status] || 0;
        
//         this.ui.progressSteps.forEach((step, index) => {
//             const icon = step.querySelector('.icon');
//             const statusLabel = step.querySelector('.status-label');
            
//             if (index < currentStep) {
//                 step.classList.add('active');
//                 if (icon) {
//                     icon.style.color = '#651FFF';
//                     icon.style.opacity = '1';
//                 }
//                 if (statusLabel) {
//                     statusLabel.style.color = '#651FFF';
//                 }
//             } else {
//                 step.classList.remove('active');
//                 if (icon) {
//                     icon.style.color = '#C5CAE9';
//                     icon.style.opacity = '0.6';
//                 }
//                 if (statusLabel) {
//                     statusLabel.style.color = '#2c3e50';
//                 }
//             }
//         });

//         this.ui.expectedArrival.textContent = this.calculateExpectedArrival(status);
//     }

//     resetProgress() {
//         this.ui.progressSteps.forEach(step => {
//             step.classList.remove('active');
//             const icon = step.querySelector('.icon');
//             const statusLabel = step.querySelector('.status-label');
            
//             if (icon) {
//                 icon.style.color = '#C5CAE9';
//                 icon.style.opacity = '0.6';
//             }
//             if (statusLabel) {
//                 statusLabel.style.color = '#2c3e50';
//             }
//         });

//         this.ui.timelineStepTimes.forEach(timeElement => {
//             timeElement.textContent = 'Pending';
//         });
//     }

//     formatTimestamp(timestamp) {
//         if (!timestamp) return 'Pending';
//         const date = new Date(timestamp);
//         return date.toLocaleTimeString();
//     }

//     async trackDelivery() {
//         const registrationNumber = this.ui.trackingInput.value.trim();
        
//         if (!registrationNumber) {
//             alert('Please enter a valid registration number');
//             return;
//         }

//         try {
//             this.resetProgress();
            
//             const snapshot = await this.db.ref(`OutletGasRequest/${registrationNumber}`).once('value');

//             if (!snapshot.exists()) {
//                 alert('Registration number not found');
//                 return;
//             }

//             const data = snapshot.val();
            
//             this.ui.trackingDetails.classList.remove('hidden');
//             this.ui.registrationDisplay.textContent = registrationNumber;
            
//             this.updateProgress(data.status);
            
//             const timestamps = {
//                 'Order Confirmed': data.step1Time,
//                 'Processing': data.step2Time,
//                 'Out for Delivery': data.step3Time,
//                 'Delivered': data.step4Time
//             };

//             Object.entries(timestamps).forEach(([_, time], index) => {
//                 this.ui.timelineStepTimes[index].textContent = this.formatTimestamp(time);
//             });

//             this.setupRealtimeUpdates(registrationNumber);

//         } catch (error) {
//             console.error('Error tracking delivery:', error);
//             alert('Failed to fetch tracking information');
//         }
//     }

//     async completeDelivery() {
//         const registrationNumber = this.ui.registrationDisplay.textContent;
        
//         if (!registrationNumber) {
//             alert('Please track a delivery first');
//             return;
//         }

//         try {
//             const confirmed = confirm('Are you sure you want to mark this delivery as complete?');
//             if (!confirmed) return;

//             await this.db.ref(`OutletGasRequest/${registrationNumber}`).update({
//                 status: 'Delivered',
//                 step4Time: new Date().toISOString()
//             });
            
//             alert('Delivery completed successfully!');
//             this.updateProgress('Delivered');
            
//         } catch (error) {
//             console.error('Error completing delivery:', error);
//             alert('Failed to complete delivery');
//         }
//     }

//     setupRealtimeUpdates(registrationNumber) {
//         const trackingRef = this.db.ref(`OutletGasRequest/${registrationNumber}`);
//         trackingRef.on('value', (snapshot) => {
//             if (snapshot.exists()) {
//                 const data = snapshot.val();
//                 this.updateProgress(data.status);
                
//                 if (data.status === 'Delivered' && data.step4Time) {
//                     this.ui.timelineStepTimes[3].textContent = this.formatTimestamp(data.step4Time);
//                 }
//             }
//         });
//     }
// }

// // Initialize the tracker when the DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     const tracker = new DeliveryTracker();
//     // Make trackDelivery available globally
//     window.trackDelivery = () => tracker.trackDelivery();
// });