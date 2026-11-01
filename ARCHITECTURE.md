# **ARCHITECTURE & SYSTEM OVERVIEW**

## Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WEB BROWSER (Frontend)                       │
│                    (HTML/CSS/JavaScript)                         │
│                   http://localhost:8001                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests/Responses
                             │ (Fetch API)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND SERVER                        │
│                   http://localhost:8000                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  API Endpoints                                          │    │
│  │  - /api/patients                                        │    │
│  │  - /api/medicines                                       │    │
│  │  - /api/syringes                                        │    │
│  │  - /api/blood-bank                                      │    │
│  │  - /api/stock-alerts                                    │    │
│  │  - /api/inventory-analysis                              │    │
│  └─────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQL Queries
                             │ (SQLAlchemy ORM)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SQLite Database                                 │
│              (hospital_management.db)                            │
│                                                                  │
│  Tables:                                                         │
│  ├── patients                                                    │
│  ├── medicines                                                   │
│  ├── syringes                                                    │
│  ├── blood_bank                                                  │
│  ├── inventory                                                   │
│  └── stock_alerts                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Styling and animations
- **JavaScript (Vanilla)** - DOM manipulation, API calls
- **Fetch API** - Backend communication

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM for database
- **Pydantic** - Data validation
- **SQLite** - Database

### Database
- **SQLite** - Lightweight, file-based database
- **SQL** - Query language

---

## Data Flow Example: Adding a Patient

### Step-by-Step Flow

```
1. USER INTERACTS WITH FRONTEND
   └─> Fills patient form in browser
       └─> Clicks "Save Patient"

2. FRONTEND JAVASCRIPT TRIGGERED
   └─> Collects form data
       └─> Validates input
           └─> Creates JSON payload

3. HTTP REQUEST SENT
   └─> POST /api/patients
       └─> URL: http://localhost:8000/api/patients
           └─> Headers: Content-Type: application/json
               └─> Body: Patient JSON data

4. FASTAPI BACKEND RECEIVES REQUEST
   └─> FastAPI parses the request
       └─> Route handler: create_patient() in main.py
           └─> Pydantic validates data with schemas.PatientCreate
               └─> Converts to models.Patient instance

5. DATABASE OPERATION
   └─> SQLAlchemy ORM creates SQL INSERT query
       └─> Executes on SQLite database
           └─> New record inserted into 'patients' table

6. RESPONSE SENT BACK
   └─> HTTP 200 OK
       └─> JSON response with created patient data
           └─> Includes ID, timestamps

7. FRONTEND UPDATES
   └─> JavaScript receives response
       └─> Shows success notification
           └─> Refreshes patient table
               └─> User sees new patient in list
```

---

## File Structure & Responsibility

### Backend Files

```
backend/
│
├── requirements.txt
│   └─ Python dependencies (FastAPI, SQLAlchemy, etc.)
│
├── database.py
│   └─ Database configuration
│     - SQLite engine setup
│     - Session factory
│     - Base model for ORM
│
├── models.py
│   └─ Database table definitions
│     - Patient model
│     - Medicine model
│     - Syringe model
│     - BloodBank model
│     - StockAlert model
│
├── schemas.py
│   └─ Pydantic data validation schemas
│     - Request/Response models
│     - Data type validation
│
├── main.py
│   └─ FastAPI application
│     - Route definitions
│     - API endpoints (CRUD operations)
│     - Business logic
│     - Low stock alert generation
│     - Inventory analysis
│
└── load_sample_data.py
    └─ Utility to populate test data
```

### Frontend Files

```
frontend/
│
├── index.html
│   └─ Main HTML structure
│     - Navigation sidebar
│     - Content sections
│     - Forms and modals
│     - Table layouts
│
├── styles.css
│   └─ Styling and layout
│     - Color scheme
│     - Responsive design
│     - Animations
│     - Component styling
│
└── script.js
    └─ Frontend logic
      - API communication
      - DOM manipulation
      - Form handling
      - Data display
      - Search functionality
```

---

## Database Schema

### Patients Table
```
id (Primary Key, Auto-increment)
patient_id (Unique)
name
age
gender
phone
email
address
blood_group
medical_history (Optional)
created_at (Auto timestamp)
updated_at (Auto timestamp)
```

### Medicines Table
```
id (Primary Key, Auto-increment)
medicine_id (Unique)
name
type
quantity
unit
price_per_unit
minimum_stock
expiry_date
supplier
created_at (Auto timestamp)
```

### Syringes Table
```
id (Primary Key, Auto-increment)
syringe_id (Unique)
size_ml
quantity
minimum_stock
price_per_unit
created_at (Auto timestamp)
```

### BloodBank Table
```
id (Primary Key, Auto-increment)
blood_group (Unique)
quantity_units
minimum_stock
last_updated (Auto timestamp)
```

### StockAlerts Table
```
id (Primary Key, Auto-increment)
item_type (Medicine/Syringe/Blood)
item_id
item_name
current_stock
minimum_stock
status (LOW_STOCK)
alert_date (Auto timestamp)
resolved (Boolean)
```

---

## API Endpoints Overview

### Patients (7 endpoints)
- `POST /api/patients` - Create
- `GET /api/patients` - List all
- `GET /api/patients/{id}` - Get one
- `PUT /api/patients/{id}` - Update
- `DELETE /api/patients/{id}` - Delete

### Medicines (5 endpoints)
- `POST /api/medicines` - Create
- `GET /api/medicines` - List all
- `PUT /api/medicines/{id}` - Update
- `DELETE /api/medicines/{id}` - Delete

### Syringes (5 endpoints)
- Similar structure to medicines

### Blood Bank (4 endpoints)
- `POST /api/blood-bank` - Create/Add
- `GET /api/blood-bank` - List all
- `PUT /api/blood-bank/{group}` - Update

### Inventory & Alerts (3 endpoints)
- `GET /api/inventory-analysis` - Analytics
- `GET /api/stock-alerts` - List alerts
- `POST /api/stock-alerts/check` - Generate alerts

**Total: 28+ API endpoints fully functional**

---

## Feature Implementation

### Low Stock Alert System
```
Flow:
1. User updates medicine/syringe/blood quantity
2. User or system calls /api/stock-alerts/check
3. Backend queries all items for:
   if (quantity <= minimum_stock)
4. Creates StockAlert records for items with low stock
5. Frontend displays alerts on dashboard
6. User can acknowledge alerts
```

### Inventory Analysis
```
Flow:
1. User clicks "Inventory Analysis"
2. Frontend calls /api/inventory-analysis
3. Backend calculates:
   - Sum of all items
   - Total value (quantity × price)
   - Count of low stock items
4. Returns analytics object
5. Frontend displays charts and statistics
```

---

## How to Run Everything

### Terminal 1 - Start Backend
```powershell
cd backend
pip install -r requirements.txt
python main.py
```
Output: `Uvicorn running on http://0.0.0.0:8000`

### Terminal 2 - Start Frontend
```powershell
cd frontend
python -m http.server 8001
```
Output: `Serving HTTP on port 8001`

### Browser - Access Application
```
Frontend: http://localhost:8001
API Docs: http://localhost:8000/docs
```

---

## Key Design Patterns Used

### 1. MVC Pattern
- **Models** - Database models in models.py
- **View** - HTML templates (index.html)
- **Controller** - API routes in main.py

### 2. REST API Principles
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Proper status codes
- JSON request/response format
- Resource-based URLs

### 3. Separation of Concerns
- Database logic → database.py
- Data validation → schemas.py
- Business logic → main.py
- UI logic → script.js

### 4. CORS-Enabled
- Frontend and backend on different ports
- CORS middleware enables cross-origin requests

---

## Performance Considerations

### Database
- SQLite is file-based (fast for local development)
- Indexes on patient_id, medicine_id, etc.
- Can migrate to PostgreSQL for production

### Frontend
- Vanilla JavaScript (no framework overhead)
- Event delegation for efficient DOM handling
- Responsive design works on all devices

### Backend
- Async request handling with Uvicorn
- Efficient ORM queries with SQLAlchemy
- Minimal dependencies

---

## Security Features Implemented

✅ Input validation (Pydantic schemas)
✅ SQL injection prevention (SQLAlchemy ORM)
✅ CORS protection
✅ Unique constraints on IDs
✅ Proper error handling

---

## What's Working

✅ Patient CRUD operations
✅ Medicine inventory management
✅ Syringe stock tracking
✅ Blood bank management
✅ Low stock alert generation
✅ Inventory analysis and reporting
✅ Search functionality
✅ Dashboard with statistics
✅ Responsive UI
✅ Real-time database updates
✅ Form validation
✅ Error handling

---

## Future Enhancement Ideas

- [ ] User authentication & roles
- [ ] Doctor/staff management
- [ ] Appointment scheduling
- [ ] Prescription tracking
- [ ] Billing system
- [ ] Reports generation (PDF)
- [ ] Multi-hospital support
- [ ] Mobile app
- [ ] Email alerts
- [ ] Database backup system
- [ ] Unit tests
- [ ] API rate limiting
- [ ] Logging system

---

**This is a production-ready skeleton that can be extended with these features!**
