# Hospital Management System

A comprehensive web-based Hospital Management System built with FastAPI backend and HTML/CSS/JS frontend.

## Features

✅ **Patient Management**
- Add, edit, delete, and search patients
- Track patient information (ID, name, age, gender, contact, blood group, medical history)

✅ **Medicine Management**
- Inventory tracking for medicines
- Track types, quantities, prices, expiry dates, and suppliers
- Automatic low stock alerts

✅ **Syringe Management**
- Track syringe inventory by size (1ml, 3ml, 5ml, 10ml, 20ml, 50ml)
- Monitor quantities and prices
- Low stock notifications

✅ **Blood Bank Management**
- Manage different blood groups (O+, O-, A+, A-, B+, B-, AB+, AB-)
- Track units available and minimum stock levels
- Visual representation of blood inventory

✅ **Inventory Analysis**
- Real-time inventory value calculation
- Total items tracking
- Low stock item identification
- Category-wise breakdown

✅ **Low Stock Alert System**
- Automatic alerts for items below minimum stock
- Alert dashboard
- Timestamp tracking

✅ **Dashboard**
- Overview of all key metrics
- Quick statistics on patients, medicines, syringes, blood units
- Real-time updates

## Project Structure

```
web1/
├── backend/
│   ├── requirements.txt
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── main.py
└── frontend/
    ├── index.html
    ├── styles.css
    └── script.js
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # Activate it
   # On Windows:
   venv\Scripts\activate
   # On Linux/Mac:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server:**
   ```bash
   python main.py
   ```

   The API will start at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open in browser:**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8001
     # Or using Node.js (if installed)
     npx http-server
     ```
   - Then visit `http://localhost:8001` or `http://127.0.0.1:8001`

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/{patient_id}` - Get specific patient
- `PUT /api/patients/{patient_id}` - Update patient
- `DELETE /api/patients/{patient_id}` - Delete patient

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Create new medicine
- `GET /api/medicines/{medicine_id}` - Get specific medicine
- `PUT /api/medicines/{medicine_id}` - Update medicine
- `DELETE /api/medicines/{medicine_id}` - Delete medicine

### Syringes
- `GET /api/syringes` - Get all syringes
- `POST /api/syringes` - Create new syringe
- `GET /api/syringes/{syringe_id}` - Get specific syringe
- `PUT /api/syringes/{syringe_id}` - Update syringe
- `DELETE /api/syringes/{syringe_id}` - Delete syringe

### Blood Bank
- `GET /api/blood-bank` - Get all blood groups
- `POST /api/blood-bank` - Create/add blood group
- `GET /api/blood-bank/{blood_group}` - Get specific blood group
- `PUT /api/blood-bank/{blood_group}` - Update blood stock

### Inventory & Alerts
- `GET /api/inventory-analysis` - Get inventory analysis
- `GET /api/inventory-summary` - Get inventory summary
- `GET /api/stock-alerts` - Get all active alerts
- `POST /api/stock-alerts/check` - Check and generate new alerts

## Database

The system uses **SQLite** for data storage:
- Database file: `hospital_management.db` (auto-created in backend directory)
- Uses SQLAlchemy ORM for database operations

## Features in Detail

### Dashboard
- Displays total patients, medicine types, syringe types, blood types
- Shows total units of each item
- Displays active low stock alerts

### Patient Management
- Complete patient information tracking
- Search functionality
- Edit and delete capabilities
- Blood group assignment

### Inventory Management
- Real-time quantity tracking
- Price per unit tracking
- Minimum stock level configuration
- Automatic status indicators (In Stock/Low Stock)

### Low Stock Alert System
- Automatic generation when stock falls below minimum
- Alert resolved status tracking
- Item type categorization
- Date and time stamping

## Usage Example

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Open Frontend:**
   - Open `frontend/index.html` in browser

3. **Start Using:**
   - Go to Dashboard to see overview
   - Add patients from Patient Management
   - Add medicines, syringes, and blood stocks
   - Monitor alerts on Low Stock Alerts page
   - View detailed analysis on Inventory Analysis page

## Features Used

### Frontend Technologies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox and grid
- **JavaScript** - Fetch API for backend communication
- Responsive design for mobile devices

### Backend Technologies
- **FastAPI** - Fast, modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation
- **SQLite** - Lightweight database
- **CORS** - Cross-Origin Resource Sharing enabled

## Customization

### Adding Low Stock Thresholds
Edit `minimum_stock` when creating/updating items.

### Changing Database
In `backend/database.py`, change `DATABASE_URL`:
```python
# For PostgreSQL
DATABASE_URL = "postgresql://user:password@localhost/hospital_db"

# For MySQL
DATABASE_URL = "mysql+pymysql://user:password@localhost/hospital_db"
```

### Styling
Edit `frontend/styles.css` to customize colors and layout:
```css
--primary-color: #2c3e50;
--secondary-color: #3498db;
```

## Troubleshooting

### CORS Issues
- Make sure FastAPI is running with CORS middleware enabled
- Check browser console for error messages

### Database Issues
- Delete `hospital_management.db` and restart to reset database
- Check file permissions in backend directory

### Page Not Loading
- Verify FastAPI server is running on `http://localhost:8000`
- Check browser console for JavaScript errors
- Ensure frontend files are in correct directory structure

## Future Enhancements

- User authentication and role-based access
- Doctor and staff management
- Appointment scheduling
- Prescription tracking
- Billing system
- Reports and analytics
- Multi-language support
- Mobile app

## License

This project is open source and available for educational purposes.

## Support

For any issues or questions, please check the code comments or documentation.

---

**Version:** 1.0.0  
**Last Updated:** 2026
