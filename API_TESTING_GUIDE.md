# **API Testing Guide**

This guide shows how to test all API endpoints using curl or Postman.

## Starting the Backend

```powershell
cd backend
python main.py
```

API will be available at: `http://localhost:8000`
Interactive API Docs: `http://localhost:8000/docs`

---

## Using FastAPI Swagger UI (Easiest Method)

1. Start the backend
2. Open: `http://localhost:8000/docs`
3. Click on any endpoint
4. Click "Try it out"
5. Fill in parameters and click "Execute"

---

## Using cURL Commands

### PATIENTS

**Create Patient:**
```bash
curl -X POST "http://localhost:8000/api/patients" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P001",
    "name": "John Doe",
    "age": 45,
    "gender": "Male",
    "phone": "555-0101",
    "email": "john@example.com",
    "address": "123 Main St",
    "blood_group": "O+"
  }'
```

**Get All Patients:**
```bash
curl "http://localhost:8000/api/patients"
```

**Get Specific Patient:**
```bash
curl "http://localhost:8000/api/patients/P001"
```

**Update Patient:**
```bash
curl -X PUT "http://localhost:8000/api/patients/P001" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "age": 46
  }'
```

**Delete Patient:**
```bash
curl -X DELETE "http://localhost:8000/api/patients/P001"
```

---

### MEDICINES

**Create Medicine:**
```bash
curl -X POST "http://localhost:8000/api/medicines" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": "MED001",
    "name": "Paracetamol",
    "type": "Painkiller",
    "quantity": 500,
    "unit": "tablets",
    "price_per_unit": 0.50,
    "minimum_stock": 100,
    "expiry_date": "2025-12-31",
    "supplier": "Pharma Inc"
  }'
```

**Get All Medicines:**
```bash
curl "http://localhost:8000/api/medicines"
```

**Update Medicine Quantity:**
```bash
curl -X PUT "http://localhost:8000/api/medicines/MED001" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 450
  }'
```

---

### SYRINGES

**Create Syringe:**
```bash
curl -X POST "http://localhost:8000/api/syringes" \
  -H "Content-Type: application/json" \
  -d '{
    "syringe_id": "SYR001",
    "size_ml": 5,
    "quantity": 200,
    "minimum_stock": 50,
    "price_per_unit": 0.25
  }'
```

**Get All Syringes:**
```bash
curl "http://localhost:8000/api/syringes"
```

**Update Syringe:**
```bash
curl -X PUT "http://localhost:8000/api/syringes/SYR001" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 180
  }'
```

---

### BLOOD BANK

**Create Blood Group:**
```bash
curl -X POST "http://localhost:8000/api/blood-bank" \
  -H "Content-Type: application/json" \
  -d '{
    "blood_group": "O+",
    "quantity_units": 50,
    "minimum_stock": 20
  }'
```

**Get All Blood Groups:**
```bash
curl "http://localhost:8000/api/blood-bank"
```

**Get Specific Blood Group:**
```bash
curl "http://localhost:8000/api/blood-bank/O+"
```

**Update Blood Stock:**
```bash
curl -X PUT "http://localhost:8000/api/blood-bank/O+" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity_units": 45
  }'
```

---

### INVENTORY & ALERTS

**Get Inventory Analysis:**
```bash
curl "http://localhost:8000/api/inventory-analysis"
```

**Get Inventory Summary:**
```bash
curl "http://localhost:8000/api/inventory-summary"
```

**Get Stock Alerts:**
```bash
curl "http://localhost:8000/api/stock-alerts"
```

**Check and Generate New Alerts:**
```bash
curl -X POST "http://localhost:8000/api/stock-alerts/check"
```

---

## Using Python Requests

```python
import requests

API_BASE = "http://localhost:8000/api"

# Create patient
response = requests.post(f"{API_BASE}/patients", json={
    "patient_id": "P001",
    "name": "John Doe",
    "age": 45,
    "gender": "Male",
    "phone": "555-0101",
    "email": "john@example.com",
    "address": "123 Main St",
    "blood_group": "O+"
})
print(response.json())

# Get all patients
response = requests.get(f"{API_BASE}/patients")
print(response.json())

# Update patient
response = requests.put(f"{API_BASE}/patients/P001", json={
    "name": "John Updated"
})
print(response.json())

# Delete patient
response = requests.delete(f"{API_BASE}/patients/P001")
print(response.json())
```

---

## Using Postman

1. **Open Postman**
2. **Create Collection:** "Hospital Management"
3. **Add Requests:**

   - **POST /api/patients**
     - URL: `http://localhost:8000/api/patients`
     - Body (JSON): Patient data
   
   - **GET /api/patients**
     - URL: `http://localhost:8000/api/patients`
   
   - **GET /api/inventory-analysis**
     - URL: `http://localhost:8000/api/inventory-analysis`

---

## Response Examples

### Success Response (Patient Created)
```json
{
  "id": 1,
  "patient_id": "P001",
  "name": "John Doe",
  "age": 45,
  "gender": "Male",
  "phone": "555-0101",
  "email": "john@example.com",
  "address": "123 Main St",
  "blood_group": "O+",
  "medical_history": null,
  "created_at": "2025-04-15T10:30:00",
  "updated_at": "2025-04-15T10:30:00"
}
```

### Error Response (Not Found)
```json
{
  "detail": "Patient not found"
}
```

### Inventory Analysis
```json
{
  "total_items": 1254,
  "total_value": 8450.75,
  "low_stock_items": 3,
  "medicines_total": 500,
  "syringes_total": 350,
  "blood_units_total": 404
}
```

---

## Testing Low Stock Alerts

1. **Create a medicine with low quantity:**
   ```bash
   curl -X POST "http://localhost:8000/api/medicines" \
     -H "Content-Type: application/json" \
     -d '{
       "medicine_id": "MED_TEST",
       "name": "Test Medicine",
       "type": "Test",
       "quantity": 5,
       "unit": "tablets",
       "price_per_unit": 1.0,
       "minimum_stock": 50,
       "expiry_date": "2025-12-31",
       "supplier": "Test"
     }'
   ```

2. **Check for alerts:**
   ```bash
   curl -X POST "http://localhost:8000/api/stock-alerts/check"
   ```

3. **Get alerts:**
   ```bash
   curl "http://localhost:8000/api/stock-alerts"
   ```

---

## Status Codes

- **200** - OK (Success)
- **201** - Created (Successfully created)
- **400** - Bad Request (Invalid data)
- **404** - Not Found (Item doesn't exist)
- **422** - Unprocessable Entity (Validation error)
- **500** - Server Error

---

## Quick Checklist

- [ ] Backend running on port 8000
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Can create patients
- [ ] Can create medicines
- [ ] Can create syringes
- [ ] Can add blood groups
- [ ] Low stock alerts work (when quantities < minimum)
- [ ] Inventory analysis shows correct totals
- [ ] Frontend can fetch data from backend

---

Use the Swagger UI for the easiest testing experience!
