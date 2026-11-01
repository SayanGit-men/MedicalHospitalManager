const API_BASE_URL = 'http://localhost:8000/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    showSection('dashboard');
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});

// Update current time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString();
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Load data for specific sections
    if (sectionId === 'dashboard') {
        loadDashboard();
    } else if (sectionId === 'patients') {
        loadPatients();
    } else if (sectionId === 'medicines') {
        loadMedicines();
    } else if (sectionId === 'syringes') {
        loadSyringes();
    } else if (sectionId === 'blood-bank') {
        loadBloodBank();
    } else if (sectionId === 'inventory') {
        loadInventoryAnalysis();
    } else if (sectionId === 'alerts') {
        loadAlerts();
    }
}

// Notification System
function showNotification(message, type = 'success', duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Turn a failed API response into a readable message
async function getErrorMessage(response, fallback) {
    try {
        const data = await response.json();
        if (typeof data.detail === 'string') return data.detail;
        if (Array.isArray(data.detail)) {
            return data.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
        }
    } catch (e) {
        // Response body was not JSON
    }
    return `${fallback} (HTTP ${response.status})`;
}

// Show a clear message when the backend server cannot be reached
function showFetchError(error, fallback) {
    console.error(fallback, error);
    if (error instanceof TypeError) {
        showNotification('Cannot reach the server. Start the backend: cd backend → python main.py', 'error', 6000);
    } else {
        showNotification(fallback, 'error');
    }
}

function formatMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
    return value ? new Date(value).toLocaleDateString() : '-';
}

function apiUrl(path, id) {
    return id === undefined ? `${API_BASE_URL}/${path}` : `${API_BASE_URL}/${path}/${encodeURIComponent(id)}`;
}

// Send JSON to the API and show the result
async function sendJson(url, method, data, successMessage, errorMessage) {
    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        showNotification(successMessage, 'success');
        return true;
    }
    showNotification(await getErrorMessage(response, errorMessage), 'error', 5000);
    return false;
}

// Load a list from the API, or show why it failed
async function fetchList(path, errorMessage) {
    const response = await fetch(apiUrl(path));
    if (!response.ok) {
        showNotification(await getErrorMessage(response, errorMessage), 'error', 5000);
        return null;
    }
    return response.json();
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

// Closing a modal clears its form, so "Add New" never edits the last opened record
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        const form = modal.querySelector('form');
        if (form) form.reset();
        modal.querySelectorAll('input[type="hidden"]').forEach(input => input.value = '');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}

// =====================
// DASHBOARD FUNCTIONS
// =====================
async function loadDashboard() {
    try {
        const data = await fetchList('inventory-summary', 'Error loading dashboard');
        if (data) {
            document.getElementById('total-patients').textContent = data.total_patients ?? 0;
            document.getElementById('medicine-types').textContent = data.medicine_types ?? 0;
            document.getElementById('syringe-types').textContent = data.syringe_types ?? 0;
            document.getElementById('blood-types').textContent = data.blood_types ?? 0;
            document.getElementById('total-blood-units').textContent = data.total_blood_units ?? 0;
            document.getElementById('total-medicines').textContent = data.total_medicines_units ?? 0;
            document.getElementById('total-syringes').textContent = data.total_syringes ?? 0;
            document.getElementById('low-stock-count').textContent = data.low_stock_items_count ?? 0;
        }
    } catch (error) {
        showFetchError(error, 'Error loading dashboard');
    }
}

// =====================
// PATIENT FUNCTIONS
// =====================
async function loadPatients() {
    try {
        const patients = await fetchList('patients', 'Error loading patients');
        if (patients) displayPatients(patients);
    } catch (error) {
        showFetchError(error, 'Error loading patients');
    }
}

function displayPatients(patients) {
    const tableBody = document.getElementById('patientTable');

    if (patients.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No patients found</td></tr>';
        return;
    }

    tableBody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.patient_id ?? '-'}</td>
            <td>${patient.name ?? '-'}</td>
            <td>${patient.age ?? '-'}</td>
            <td>${patient.gender ?? '-'}</td>
            <td>${patient.phone ?? '-'}</td>
            <td>${patient.blood_group ?? '-'}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editPatient('${patient.id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deletePatient('${patient.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function savePatient(event) {
    event.preventDefault();

    // patientId holds the internal id of the patient being edited (empty when adding)
    const patientId = document.getElementById('patientId').value;

    const patientData = {
        patient_id: document.getElementById('patientIdInput').value.trim(),
        name: document.getElementById('patientName').value.trim(),
        age: parseInt(document.getElementById('patientAge').value),
        gender: document.getElementById('patientGender').value,
        phone: document.getElementById('patientPhone').value.trim(),
        email: document.getElementById('patientEmail').value.trim(),
        address: document.getElementById('patientAddress').value.trim(),
        blood_group: document.getElementById('patientBloodGroup').value,
        medical_history: document.getElementById('patientMedicalHistory').value
    };

    try {
        const saved = patientId
            ? await sendJson(apiUrl('patients', patientId), 'PUT', patientData, 'Patient updated successfully', 'Error saving patient')
            : await sendJson(apiUrl('patients'), 'POST', patientData, 'Patient saved successfully', 'Error saving patient');

        if (saved) {
            closeModal('patientModal');
            loadPatients();
            document.querySelector('#patientModal form').reset();
            document.getElementById('patientId').value = '';
        }
    } catch (error) {
        showFetchError(error, 'Error saving patient');
    }
}

async function editPatient(patientId) {
    try {
        const response = await fetch(apiUrl('patients', patientId));
        if (!response.ok) {
            showNotification(await getErrorMessage(response, 'Error loading patient'), 'error');
            return;
        }
        const patient = await response.json();

        document.getElementById('patientId').value = patient.id;
        document.getElementById('patientIdInput').value = patient.patient_id ?? '';
        document.getElementById('patientName').value = patient.name ?? '';
        document.getElementById('patientAge').value = patient.age ?? '';
        document.getElementById('patientGender').value = patient.gender ?? '';
        document.getElementById('patientPhone').value = patient.phone ?? '';
        document.getElementById('patientEmail').value = patient.email ?? '';
        document.getElementById('patientAddress').value = patient.address ?? '';
        document.getElementById('patientBloodGroup').value = patient.blood_group ?? '';
        document.getElementById('patientMedicalHistory').value = patient.medical_history ?? '';

        showModal('patientModal');
    } catch (error) {
        showFetchError(error, 'Error loading patient');
    }
}

async function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
        const response = await fetch(apiUrl('patients', patientId), { method: 'DELETE' });

        if (response.ok) {
            showNotification('Patient deleted successfully', 'success');
            loadPatients();
        } else {
            showNotification(await getErrorMessage(response, 'Error deleting patient'), 'error');
        }
    } catch (error) {
        showFetchError(error, 'Error deleting patient');
    }
}

function searchPatients() {
    const searchInput = document.getElementById('searchPatient').value.toLowerCase();
    const rows = document.querySelectorAll('#patientTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchInput) ? '' : 'none';
    });
}

// =====================
// MEDICINE FUNCTIONS
// =====================
async function loadMedicines() {
    try {
        const medicines = await fetchList('medicines', 'Error loading medicines');
        if (medicines) displayMedicines(medicines);
    } catch (error) {
        showFetchError(error, 'Error loading medicines');
    }
}

function displayMedicines(medicines) {
    const tableBody = document.getElementById('medicineTable');

    if (medicines.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="11" class="text-center">No medicines found</td></tr>';
        return;
    }

    tableBody.innerHTML = medicines.map(medicine => {
        const isLow = medicine.quantity <= medicine.min_stock;
        const status = isLow ? 'danger' : 'good';
        const statusText = isLow ? 'Low Stock' : 'In Stock';

        return `
            <tr>
                <td>${medicine.medicine_id ?? '-'}</td>
                <td>${medicine.name ?? '-'}</td>
                <td>${medicine.type ?? '-'}</td>
                <td>${medicine.quantity ?? 0}</td>
                <td>${medicine.unit ?? '-'}</td>
                <td>${formatMoney(medicine.price_per_unit)}</td>
                <td>${medicine.min_stock ?? 0}</td>
                <td>${medicine.expiry_date ?? '-'}</td>
                <td>${medicine.supplier ?? '-'}</td>
                <td><span class="status-badge status-${status}">${statusText}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editMedicine('${medicine.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMedicine('${medicine.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveMedicine(event) {
    event.preventDefault();

    // medicineId holds the internal id of the medicine being edited (empty when adding)
    const medicineId = document.getElementById('medicineId').value;

    const medicineData = {
        medicine_id: document.getElementById('medicineIdInput').value.trim(),
        name: document.getElementById('medicineName').value.trim(),
        type: document.getElementById('medicineType').value,
        quantity: parseInt(document.getElementById('medicineQuantity').value),
        unit: document.getElementById('medicineUnit').value,
        price_per_unit: parseFloat(document.getElementById('medicinePricePerUnit').value),
        min_stock: parseInt(document.getElementById('medicineMinStock').value),
        expiry_date: document.getElementById('medicineExpiryDate').value,
        supplier: document.getElementById('medicineSupplier').value.trim()
    };

    try {
        const saved = medicineId
            ? await sendJson(apiUrl('medicines', medicineId), 'PUT', medicineData, 'Medicine updated successfully', 'Error saving medicine')
            : await sendJson(apiUrl('medicines'), 'POST', medicineData, 'Medicine saved successfully', 'Error saving medicine');

        if (saved) {
            closeModal('medicineModal');
            loadMedicines();
            document.querySelector('#medicineModal form').reset();
            document.getElementById('medicineId').value = '';
        }
    } catch (error) {
        showFetchError(error, 'Error saving medicine');
    }
}

async function editMedicine(medicineId) {
    try {
        const response = await fetch(apiUrl('medicines', medicineId));
        if (!response.ok) {
            showNotification(await getErrorMessage(response, 'Error loading medicine'), 'error');
            return;
        }
        const medicine = await response.json();

        document.getElementById('medicineId').value = medicine.id;
        document.getElementById('medicineIdInput').value = medicine.medicine_id ?? '';
        document.getElementById('medicineName').value = medicine.name ?? '';
        document.getElementById('medicineType').value = medicine.type ?? '';
        document.getElementById('medicineQuantity').value = medicine.quantity ?? '';
        document.getElementById('medicineUnit').value = medicine.unit ?? '';
        document.getElementById('medicinePricePerUnit').value = medicine.price_per_unit ?? '';
        document.getElementById('medicineMinStock').value = medicine.min_stock ?? '';
        document.getElementById('medicineExpiryDate').value = medicine.expiry_date ?? '';
        document.getElementById('medicineSupplier').value = medicine.supplier ?? '';

        showModal('medicineModal');
    } catch (error) {
        showFetchError(error, 'Error loading medicine');
    }
}

async function deleteMedicine(medicineId) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
        const response = await fetch(apiUrl('medicines', medicineId), { method: 'DELETE' });

        if (response.ok) {
            showNotification('Medicine deleted successfully', 'success');
            loadMedicines();
        } else {
            showNotification(await getErrorMessage(response, 'Error deleting medicine'), 'error');
        }
    } catch (error) {
        showFetchError(error, 'Error deleting medicine');
    }
}

function searchMedicines() {
    const searchInput = document.getElementById('searchMedicine').value.toLowerCase();
    const rows = document.querySelectorAll('#medicineTable tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchInput) ? '' : 'none';
    });
}

// =====================
// SYRINGE FUNCTIONS
// =====================
async function loadSyringes() {
    try {
        const syringes = await fetchList('syringes', 'Error loading syringes');
        if (syringes) displaySyringes(syringes);
    } catch (error) {
        showFetchError(error, 'Error loading syringes');
    }
}

function displaySyringes(syringes) {
    const tableBody = document.getElementById('syringeTable');

    if (syringes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No syringes found</td></tr>';
        return;
    }

    tableBody.innerHTML = syringes.map(syringe => {
        const isLow = syringe.quantity <= syringe.min_stock;
        const status = isLow ? 'danger' : 'good';
        const statusText = isLow ? 'Low Stock' : 'In Stock';

        return `
            <tr>
                <td>${syringe.syringe_id ?? '-'}</td>
                <td>${syringe.size_ml ?? '-'} ml</td>
                <td>${syringe.quantity ?? 0}</td>
                <td>${syringe.min_stock ?? 0}</td>
                <td>${formatMoney(syringe.price_per_unit)}</td>
                <td><span class="status-badge status-${status}">${statusText}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editSyringe('${syringe.id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSyringe('${syringe.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveSyringe(event) {
    event.preventDefault();

    // syringeId holds the internal id of the syringe being edited (empty when adding)
    const syringeId = document.getElementById('syringeId').value;

    const syringeData = {
        syringe_id: document.getElementById('syringeIdInput').value.trim(),
        size_ml: parseInt(document.getElementById('syringeSizeMl').value),
        quantity: parseInt(document.getElementById('syringeQuantity').value),
        min_stock: parseInt(document.getElementById('syringeMinStock').value),
        price_per_unit: parseFloat(document.getElementById('syringePricePerUnit').value)
    };

    try {
        const saved = syringeId
            ? await sendJson(apiUrl('syringes', syringeId), 'PUT', syringeData, 'Syringe updated successfully', 'Error saving syringe')
            : await sendJson(apiUrl('syringes'), 'POST', syringeData, 'Syringe saved successfully', 'Error saving syringe');

        if (saved) {
            closeModal('syringeModal');
            loadSyringes();
            document.querySelector('#syringeModal form').reset();
            document.getElementById('syringeId').value = '';
        }
    } catch (error) {
        showFetchError(error, 'Error saving syringe');
    }
}

async function editSyringe(syringeId) {
    try {
        const response = await fetch(apiUrl('syringes', syringeId));
        if (!response.ok) {
            showNotification(await getErrorMessage(response, 'Error loading syringe'), 'error');
            return;
        }
        const syringe = await response.json();

        document.getElementById('syringeId').value = syringe.id;
        document.getElementById('syringeIdInput').value = syringe.syringe_id ?? '';
        document.getElementById('syringeSizeMl').value = syringe.size_ml ?? '';
        document.getElementById('syringeQuantity').value = syringe.quantity ?? '';
        document.getElementById('syringeMinStock').value = syringe.min_stock ?? '';
        document.getElementById('syringePricePerUnit').value = syringe.price_per_unit ?? '';

        showModal('syringeModal');
    } catch (error) {
        showFetchError(error, 'Error loading syringe');
    }
}

async function deleteSyringe(syringeId) {
    if (!confirm('Are you sure you want to delete this syringe?')) return;

    try {
        const response = await fetch(apiUrl('syringes', syringeId), { method: 'DELETE' });

        if (response.ok) {
            showNotification('Syringe deleted successfully', 'success');
            loadSyringes();
        } else {
            showNotification(await getErrorMessage(response, 'Error deleting syringe'), 'error');
        }
    } catch (error) {
        showFetchError(error, 'Error deleting syringe');
    }
}

// =====================
// BLOOD BANK FUNCTIONS
// =====================
async function loadBloodBank() {
    try {
        const bloodBank = await fetchList('blood-bank', 'Error loading blood bank');
        if (bloodBank) {
            displayBloodBank(bloodBank);
            displayBloodCards(bloodBank);
        }
    } catch (error) {
        showFetchError(error, 'Error loading blood bank');
    }
}

function displayBloodCards(bloodBank) {
    const container = document.getElementById('bloodCardsContainer');

    if (bloodBank.length === 0) {
        container.innerHTML = '<p class="text-center">No blood groups found</p>';
        return;
    }

    container.innerHTML = bloodBank.map(blood => {
        const status = blood.quantity <= blood.min_stock ? 'Low' : 'Good';

        return `
            <div class="blood-card">
                <h3>${blood.blood_group}</h3>
                <p>${blood.quantity ?? 0} units</p>
                <small>${status} Stock</small>
            </div>
        `;
    }).join('');
}

function displayBloodBank(bloodBank) {
    const tableBody = document.getElementById('bloodTable');

    if (bloodBank.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No blood groups found</td></tr>';
        return;
    }

    tableBody.innerHTML = bloodBank.map(blood => {
        const isLow = blood.quantity <= blood.min_stock;
        const status = isLow ? 'danger' : 'good';
        const statusText = isLow ? 'Low Stock' : 'In Stock';

        return `
            <tr>
                <td>${blood.blood_group}</td>
                <td>${blood.quantity ?? 0}</td>
                <td>${blood.min_stock ?? 0}</td>
                <td><span class="status-badge status-${status}">${statusText}</span></td>
                <td>${formatDate(blood.last_updated)}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editBloodBank('${blood.blood_group}')">Edit</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function saveBloodBank(event) {
    event.preventDefault();

    const bloodData = {
        blood_group: document.getElementById('bloodGroupSelect').value,
        quantity: parseInt(document.getElementById('bloodQuantity').value),
        min_stock: parseInt(document.getElementById('bloodMinStock').value)
    };

    try {
        // The backend creates the blood group if it is new, or updates it if it exists
        const saved = await sendJson(apiUrl('blood-bank'), 'POST', bloodData, 'Blood stock updated successfully', 'Error updating blood stock');

        if (saved) {
            closeModal('bloodModal');
            loadBloodBank();
            document.querySelector('#bloodModal form').reset();
        }
    } catch (error) {
        showFetchError(error, 'Error saving blood bank');
    }
}

async function editBloodBank(bloodGroup) {
    try {
        const response = await fetch(apiUrl('blood-bank', bloodGroup));
        if (!response.ok) {
            showNotification(await getErrorMessage(response, 'Error loading blood group'), 'error');
            return;
        }
        const blood = await response.json();

        document.getElementById('bloodGroupSelect').value = blood.blood_group;
        document.getElementById('bloodQuantity').value = blood.quantity ?? '';
        document.getElementById('bloodMinStock').value = blood.min_stock ?? '';

        showModal('bloodModal');
    } catch (error) {
        showFetchError(error, 'Error loading blood group');
    }
}

// =====================
// INVENTORY ANALYSIS FUNCTIONS
// =====================
async function loadInventoryAnalysis() {
    try {
        const data = await fetchList('inventory-summary', 'Error loading inventory analysis');
        if (!data) return;

        document.getElementById('inv-total-value').textContent = formatMoney(data.total_inventory_value);
        document.getElementById('inv-total-items').textContent = data.total_items_count ?? 0;
        document.getElementById('inv-low-stock').textContent = data.low_stock_items_count ?? 0;

        // Detailed breakdown
        const tableBody = document.getElementById('inventoryTable');
        tableBody.innerHTML = `
            <tr>
                <td>Medicines</td>
                <td>${data.total_medicines_units ?? 0}</td>
                <td>${formatMoney(data.total_medicines_value)}</td>
            </tr>
            <tr>
                <td>Syringes</td>
                <td>${data.total_syringes ?? 0}</td>
                <td>${formatMoney(data.total_syringes_value)}</td>
            </tr>
            <tr>
                <td>Blood Units</td>
                <td>${data.total_blood_units ?? 0}</td>
                <td>N/A</td>
            </tr>
        `;
    } catch (error) {
        showFetchError(error, 'Error loading inventory analysis');
    }
}

// =====================
// STOCK ALERTS FUNCTIONS
// =====================
async function loadAlerts() {
    try {
        // The backend rebuilds alerts from current stock every time they are requested
        const alerts = await fetchList('stock-alerts', 'Error loading alerts');
        if (alerts) displayAlerts(alerts);
    } catch (error) {
        showFetchError(error, 'Error loading alerts');
    }
}

function displayAlerts(alerts) {
    const tableBody = document.getElementById('alertsTable');

    if (alerts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No low stock alerts</td></tr>';
        return;
    }

    tableBody.innerHTML = alerts.map(alert => {
        const statusClass = alert.current_stock <= (alert.minimum_stock * 0.5) ? 'danger' : 'warning';
        return `
            <tr>
                <td>${alert.item_type}</td>
                <td>${alert.item_id}</td>
                <td>${alert.item_name}</td>
                <td>${alert.current_stock ?? 0}</td>
                <td>${alert.minimum_stock ?? 0}</td>
                <td><span class="status-badge status-${statusClass}">${alert.status}</span></td>
                <td>${formatDate(alert.alert_date)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="dismissAlert(${alert.id})">Acknowledge</button>
                </td>
            </tr>
        `;
    }).join('');
}

function refreshAlerts() {
    loadAlerts();
    showNotification('Alerts refreshed', 'success');
}

function dismissAlert(alertId) {
    // In a real scenario, this would update the database
    showNotification('Alert acknowledged', 'success');
    loadAlerts();
}
