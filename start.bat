@echo off
echo ============================================
echo  StadiumOps AI - Startup Script
echo ============================================
echo.

echo [1/2] Starting Backend (FastAPI)...
start "StadiumOps Backend" cmd /k "cd /d %~dp0backend && pip install -r requirements.txt && python app\db\seed.py && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (Vite)...
start "StadiumOps Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo  Services starting...
echo  Frontend: http://localhost:5173
echo  Backend API: http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo ============================================
echo.
echo Login credentials:
echo  admin / admin123  (Administrator)
echo  security / security123  (Security Officer)
echo  medical / medical123  (Medical Staff)
echo  operations / ops123  (Operations Manager)
echo  volunteer / vol123  (Volunteer)
echo.
pause
