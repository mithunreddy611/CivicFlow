# CivicFlow — Smart Civic Issue Reporting & Resolution

CivicFlow is an intelligent civic reporting platform connecting citizens, field officers, and administrators with automatic department routing, officer work queues, photo-based verification, and a live control center.

---

## Quick Start (One-Click)

Simply double-click the **`run.bat`** file in the root directory (or run it from the command line):

```bat
run.bat
```

This single batch script will automatically:
1. Detect your Python & Node.js/npm environments.
2. Create and set up the Python virtual environment (`backend/venv`) with all dependencies.
3. Initialize the SQLite database and seed initial test accounts and departments.
4. Install frontend dependencies (`frontend/node_modules`) if needed.
5. Launch the FastAPI backend on `http://127.0.0.1:8000`.
6. Launch the React + Vite frontend on `http://localhost:5173`.
7. Automatically open `http://localhost:5173` in your default browser.

---

## Default Test Accounts

| Role | Email | Password |
|---|---|---|
| **Citizen** | `citizen@civicflow.com` | `citizen123` |
| **Field Officer** | `arjun@civicflow.com` | `arjun123` |
| **Administrator** | `admin@civicflow.com` | `admin123` |

---

## API & Docs
- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
