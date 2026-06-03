# Deployment Guide (Render + Vercel)

## Where does the database live?

| Environment | Where PostgreSQL runs |
|-------------|------------------------|
| **Docker on your PC** | Inside the `inventory_db` container (`docker-compose.yml`) |
| **Render (production)** | **Render PostgreSQL** — a separate managed database in Render’s cloud |
| **Vercel** | **No database** — only hosts the React static site |

```text
┌─────────────┐      HTTPS API calls       ┌──────────────────┐
│   Vercel    │  ───────────────────────►  │  Render Web      │
│  (React UI) │                            │  (Flask API)     │
└─────────────┘                            └────────┬─────────┘
                                                    │ DATABASE_URL
                                                    ▼
                                           ┌──────────────────┐
                                           │ Render PostgreSQL │
                                           │ (your real DB)    │
                                           └──────────────────┘
```

**Important:** The `db` service in `docker-compose.yml` is **only for local development**. It is **not** used when you deploy to Render/Vercel.

On Render you create **two resources**:

1. **PostgreSQL** — stores products, customers, orders  
2. **Web Service** — runs your Flask backend and connects using `DATABASE_URL`

---

## Step 0 — Push code to GitHub

```bash
cd D:\Assignment
git init
git add .
git commit -m "Inventory management system"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Step 1 — Create PostgreSQL on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. **New +** → **PostgreSQL**
3. Name: `inventory-db` (any name is fine)
4. Plan: **Free**
5. Create database
6. Open the database → copy **Internal Database URL** (use this if backend is on Render too)  
   Or **External Database URL** if needed from outside Render

You do **not** install Postgres yourself — Render hosts it.

---

## Step 2 — Deploy backend on Render

### Option A — Docker (matches your assignment)

1. **New +** → **Web Service**
2. Connect your GitHub repo
3. Settings:

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Docker |
| **Instance type** | Free |

4. **Environment** → add:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Paste from Render Postgres (**Internal** URL recommended) |
| `FLASK_ENV` | `production` |

   Render often sets `DATABASE_URL` automatically if you use **Blueprint** (`render.yaml`) or link the database in the UI.

5. **Create Web Service**

6. Wait until deploy is live. Test:

   `https://YOUR-BACKEND.onrender.com/health`  
   → should return `{"status":"ok"}`

### Option B — Python (no Docker)

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python init_db.py && gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 60 run:app` |

Same `DATABASE_URL` env var as above.

### Optional — Blueprint (one click for DB + API)

**New +** → **Blueprint** → select repo → Render reads `render.yaml` and creates Postgres + backend together.

---

## Step 3 — Deploy frontend on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the same GitHub repo
3. Settings:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment Variables** (required):

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com` |

   Use your **real Render URL**, no trailing slash.  
   Example: `https://inventory-backend-abc123.onrender.com`

5. **Deploy**

6. Open your Vercel URL (e.g. `https://your-app.vercel.app`)

### If API calls fail after deploy

- Redeploy Vercel **after** setting `VITE_API_URL` (Vite bakes it in at build time)
- Confirm backend health URL works in the browser
- Free Render services sleep after ~15 min — first request may take 30–60 seconds

---

## Step 4 — Docker Hub (assignment submission)

Build and push the **backend** image from your machine:

```bash
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest .
docker login
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

Submit: `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/inventory-backend`

---

## Submission checklist

| Deliverable | Example |
|-------------|---------|
| GitHub repo | `https://github.com/you/inventory-app` |
| Docker Hub (backend) | `https://hub.docker.com/r/you/inventory-backend` |
| Live frontend | `https://your-app.vercel.app` |
| Live backend API | `https://your-api.onrender.com/health` |

---

## Common questions

### Do I need Docker Compose in production?

**No.** Compose runs frontend + backend + Postgres on your laptop. In production:

- **Vercel** = frontend only  
- **Render Web Service** = backend only  
- **Render PostgreSQL** = database only  

### Can I use SQLite on Render?

**No** for production — Render’s filesystem is ephemeral. Use **Render PostgreSQL** (free tier).

### What is `DATABASE_URL`?

A connection string Flask uses to reach Postgres, for example:

```text
postgresql://user:password@hostname:5432/inventory_db
```

Your `backend/app/config.py` converts it automatically for SQLAlchemy/psycopg.

### Render free tier notes

- Backend may **spin down** when idle; wake it by visiting `/health`
- Postgres free tier has storage limits and expires after 90 days on some plans — check Render docs

---

## Quick test after everything is deployed

1. `https://YOUR-BACKEND.onrender.com/health` → OK  
2. Open Vercel site → Dashboard loads counts  
3. Add a product → refresh → still there (proves DB works on Render)
