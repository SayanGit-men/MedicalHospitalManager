# **TROUBLESHOOTING & FAQ**

## Common Issues & Solutions

### 1. Backend Won't Start

**Error:** `Address already in use`

**Solution:**
```powershell
# Option 1: Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID {PID} /F

# Option 2: Change port in main.py
# Change the last line to:
# uvicorn.run(app, host="0.0.0.0", port=8001)
```

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```powershell
# Install dependencies
pip install -r requirements.txt

# Or install individually
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
```

---

### 2. Frontend Can't Connect to Backend

**Error:** `Failed to fetch` or API endpoints return error

**Solutions:**
```
1. Verify backend is running:
   - Check: http://localhost:8000/docs
   - If error, backend is not running

2. Check API URL in script.js:
   - Line 1 should be: const API_BASE_URL = 'http://localhost:8000/api';

3. Check CORS is enabled:
   - In main.py, confirm CORS middleware exists

4. Firewall issue:
   - Allow Python through Windows Defender Firewall
```

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
```python
# Verify CORS middleware in main.py (should be present):
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 3. Database Issues

**Error:** `database is locked`

**Solution:**
```powershell
# Delete database and restart
del backend\hospital_management.db
# Then restart backend: python main.py
```

**Error:** `No such table: patients`

**Solution:**
```
The database tables are created automatically on first run.
If tables don't exist:
1. Delete hospital_management.db
2. Restart backend
3. Tables will be recreated
```

---

### 4. Port Already in Use

**Check what's using the port:**
```powershell
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Kill the process
taskkill /PID {PID} /F

# Or use different ports in your setup
```

**Change frontend port:**
```powershell
python -m http.server 8002  # Use 8002 instead
# Then visit: http://localhost:8002
```

---

### 5. Data Not Saving

**Check 1:** Backend running?
```
http://localhost:8000/docs should load
```

**Check 2:** Browser console errors?
```
F12 → Console tab → Look for red errors
```

**Check 3:** Check network requests?
```
F12 → Network tab → Look for failed requests
Click on request → Response tab to see error details
```

---

### 6. Slow Performance

**Solution 1:** Increase browser cache
```javascript
// In script.js, reduce refresh frequency
setInterval(loadDashboard, 5000); // Change 5000 to higher number
```

**Solution 2:** Use pagination
```javascript
// Already supported, use:
fetch(`${API_BASE_URL}/patients?skip=0&limit=50`)
```

---

## FAQs

### Q: How do I access the system?
**A:** 
1. Start backend: `python main.py` (in backend folder)
2. Start frontend: Open `index.html` or run `python -m http.server 8001`
3. Access: `http://localhost:8001`

### Q: Can I change the database?
**A:** Yes! In `backend/database.py`, change `DATABASE_URL`:
```python
# PostgreSQL
DATABASE_URL = "postgresql://user:password@localhost/hospital_db"

# MySQL
DATABASE_URL = "mysql+pymysql://user:password@localhost/hospital_db"
```

### Q: How do I add more blood groups?
**A:** The blood groups are hardcoded in HTML dropdowns. To add more:
```html
<!-- In index.html, find bloodGroupSelect -->
<select id="bloodGroupSelect">
    <option value="O+">O+</option>
    <option value="O-">O-</option>
    <!-- Add more here -->
</select>
```

### Q: Can I customize the colors?
**A:** Yes! Edit `frontend/styles.css`:
```css
:root {
    --primary-color: #2c3e50;      /* Change these */
    --secondary-color: #3498db;
    --success-color: #27ae60;
}
```

### Q: How do I backup the database?
**A:** 
```powershell
# Simply copy the database file
copy backend\hospital_management.db backend\hospital_management_backup.db
```

### Q: Can I add user authentication?
**A:** Yes, this is a future enhancement. Add to main.py:
```python
from fastapi.security import HTTPBearer, HTTPAuthCredentials
# Implement JWT tokens for authentication
```

### Q: How many concurrent users can the system support?
**A:** SQLite is good for ~10-20 concurrent users. For more, migrate to PostgreSQL/MySQL.

### Q: Can I deploy this to the cloud?
**A:** Yes! Use:
- **Backend:** Heroku, PythonAnywhere, AWS, Azure, Google Cloud
- **Frontend:** Netlify, Vercel, GitHub Pages, AWS S3
- **Database:** PostgreSQL on Heroku or AWS RDS

### Q: How do I add more medicines quickly?
**A:** Run the sample data loader:
```powershell
cd backend
python load_sample_data.py
```

### Q: Can I export data?
**A:** Modify main.py to add export endpoint:
```python
@app.get("/api/export/patients")
def export_patients(db: Session = Depends(get_db)):
    patients = db.query(models.Patient).all()
    # Convert to CSV or Excel
    return patients
```

### Q: How do I add a new field to patients?
**A:** 
1. Edit `models.py` - add new column
2. Edit `schemas.py` - add field in schema
3. Edit `index.html` - add form field
4. Delete database to recreate tables

### Q: Is this production-ready?
**A:** It's good for learning and small deployments. For production:
- Add authentication
- Add input sanitization
- Add rate limiting
- Add logging
- Use PostgreSQL
- Add HTTPS
- Add monitoring

### Q: Can I add a doctor schedule feature?
**A:** Yes! Extend the models:
```python
class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    specialization = Column(String)
    phone = Column(String)
```

### Q: How do I debug API issues?
**A:** Use the interactive Swagger UI:
1. Start backend
2. Go to: `http://localhost:8000/docs`
3. Click any endpoint
4. Click "Try it out"
5. See responses and errors

---

## Performance Tips

1. **Reduce API calls:**
   ```javascript
   // Cache data instead of fetching every time
   let cachedPatients = null;
   let cacheTime = Date.now();
   
   if (Date.now() - cacheTime > 30000) { // Cache for 30 seconds
       loadPatients();
   }
   ```

2. **Use pagination:**
   ```javascript
   fetch(`${API_BASE_URL}/patients?skip=0&limit=20`)
   ```

3. **Lazy load tables:**
   ```javascript
   // Load only visible items
   ```

4. **Compress images:**
   ```bash
   # If using images
   ```

---

## Security Tips

1. **Never commit sensitive data:**
   ```bash
   git ignore *.db  # Don't version control database
   ```

2. **Use environment variables:**
   ```python
   # Load from .env file
   from dotenv import load_dotenv
   DATABASE_URL = os.getenv("DATABASE_URL")
   ```

3. **Validate all inputs:**
   ```python
   # Already done with Pydantic
   ```

4. **Use HTTPS in production:**
   ```bash
   # Use SSL certificates
   ```

---

## Useful Commands

```powershell
# Backend Commands
cd backend
python -m venv venv          # Create virtual environment
venv\Scripts\activate        # Activate environment
pip install -r requirements.txt
python main.py               # Start server

# Delete database to reset
Remove-Item hospital_management.db

# Frontend Commands
cd frontend
python -m http.server 8001   # Start server
python -m http.server 8002   # Use different port

# Testing
curl http://localhost:8000/docs     # View API docs
```

---

## Getting Help

1. **Check API Documentation:**
   - `http://localhost:8000/docs` - Interactive documentation
   - `http://localhost:8000/redoc` - Alternative documentation

2. **Check browser console:**
   - F12 → Console → Look for errors

3. **Check network tab:**
   - F12 → Network → See all API calls

4. **Enable debug logging:**
   ```python
   # In main.py
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

---

## Rollback/Reset

**Clear all data:**
```powershell
cd backend
del hospital_management.db
python main.py  # Creates fresh database
```

**Reset frontend:**
```javascript
// Clear browser storage
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## Version Information

- **FastAPI:** 0.104.1
- **Python:** 3.8+
- **SQLAlchemy:** 2.0.23
- **SQLite:** Included with Python

---

**If you encounter an issue not listed here, check the API Swagger documentation at http://localhost:8000/docs**
