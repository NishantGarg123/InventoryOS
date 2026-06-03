# Render backend deploy checklist

## Render dashboard settings

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Runtime | **Docker** |
| Branch | `main` |

## Required environment variable

| Key | Value |
|-----|--------|
| `DATABASE_URL` | **Internal Database URL** from Render PostgreSQL |

Do **not** set `USE_SQLITE` on Render.

## Files that **must** be in GitHub (`backend/`)

```
backend/
├── Dockerfile
├── requirements.txt
├── run.py
├── init_db.py          (optional; db_init is in app/)
└── app/
    ├── __init__.py
    ├── config.py
    ├── models.py
    ├── validators.py
    ├── db_init.py      ← REQUIRED (Docker runs python -m app.db_init)
    └── routes/
        ├── __init__.py
        ├── products.py
        ├── customers.py
        ├── orders.py
        └── dashboard.py
```

## Push and deploy

```powershell
cd D:\Assignment
git add backend/
git status
git commit -m "Fix Render deploy: db init in app package"
git push origin main
```

Then in Render: **Manual Deploy** → Deploy latest commit.

## Verify

1. Build log ends with: `All required backend files present.`
2. Runtime log: `Database connection OK — tables ready.`
3. Browser: `https://YOUR-SERVICE.onrender.com/health` → `{"status":"ok"}`
