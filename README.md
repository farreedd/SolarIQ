# SolarIQ — Dev Server Commands

## Run in Background (persistent after terminal closes)

**Frontend** (Vite, port 5173):
```bash
cd frontend && nohup npm run dev > /tmp/solariq-frontend.log 2>&1 &
```

**Backend** (FastAPI/uvicorn, port 8000):
```bash
cd backend && conda run -n qgreen nohup uvicorn main:app --port 8000 > /tmp/solariq-backend.log 2>&1 &
```

## Run in Background (current shell session only)

**Frontend:**
```bash
cd frontend && npm run dev &
```

**Backend:**
```bash
cd backend && conda run -n qgreen uvicorn main:app --port 8000 &
```

## View Logs

```bash
tail -f /tmp/solariq-frontend.log
tail -f /tmp/solariq-backend.log
```

## Check Running Servers

```bash
ps aux | grep -E "(vite|uvicorn)" | grep -v grep
```

## Kill All Servers

```bash
pkill -f vite
pkill -f uvicorn
```

## URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs
