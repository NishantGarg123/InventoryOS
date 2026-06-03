# Render backend deploy

## Critical: Root Directory

In Render → your Web Service → **Settings**:

| Setting | Must be |
|---------|---------|
| **Root Directory** | `backend` |

If Root Directory is empty (repo root), Docker copies the whole repo and paths like `app/db_init.py` will **not** exist at `/app/app/...` — deploy will fail.

## Environment

| Key | Value |
|-----|--------|
| `DATABASE_URL` | **Internal Database URL** from Render PostgreSQL |

## Project layout (this repo)

```
backend/
├── Dockerfile
├── requirements.txt
├── run.py
└── app/
    ├── __init__.py
    ├── db_init.py
    ├── models.py
    ├── config.py
    ├── validators.py
    └── routes/
        ├── products.py
        ├── customers.py
        ├── orders.py
        └── dashboard.py
```

## Push and deploy

```powershell
cd D:\Assignment
git add backend/ render.yaml
git commit -m "Fix Dockerfile for Render"
git push origin main
```

## Verify

- Logs: `Database connection OK — tables ready.`
- URL: `https://YOUR-SERVICE.onrender.com/health`
