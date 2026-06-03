# Inventory & Order Management System

Full-stack application for managing products, customers, orders, and inventory. Built per the technical assessment requirements.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, **Flask**, SQLAlchemy |
| Frontend | React (Vite) |
| Database | PostgreSQL |
| Containers | Docker, Docker Compose |

## Features

- **Products** — CRUD with unique SKU, non-negative stock, price
- **Customers** — Create, list, view, delete with unique email
- **Orders** — Multi-line orders, automatic total calculation, stock deduction, insufficient-inventory checks
- **Dashboard** — Totals for products/customers/orders and low-stock alerts (≤ 10 units)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product |
| GET | `/products` | List products |
| GET | `/products/{id}` | Get product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |
| POST | `/customers` | Create customer |
| GET | `/customers` | List customers |
| GET | `/customers/{id}` | Get customer |
| DELETE | `/customers/{id}` | Delete customer |
| POST | `/orders` | Create order |
| GET | `/orders` | List orders |
| GET | `/orders/{id}` | Get order |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |
| GET | `/dashboard/summary` | Dashboard stats |
| GET | `/health` | Health check |

### Create Order Example

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```

## Quick Start (Docker)

1. Copy environment file:

```bash
cp .env.example .env
```

2. Build and run all services:

```bash
docker compose down
docker compose up --build
```

If the backend exits immediately, rebuild without cache:

```bash
docker compose build --no-cache backend
docker compose up
```

If you see `products_id_seq already exists`, reset the Postgres volume (removes all data):

```bash
docker compose down -v
docker compose up --build
```

3. Open the app:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health:** http://localhost:5000/health

## Local Development (without Docker)

### Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

By default, local dev uses **SQLite** (`backend/instance/inventory.db`) so you do not need PostgreSQL installed.

To use PostgreSQL locally instead:

```powershell
# PowerShell — only if PostgreSQL is running on your machine
$env:DATABASE_URL = "postgresql://inventory:inventory@localhost:5432/inventory_db"
python run.py
```

### Frontend

```bash
cd frontend
npm install
set VITE_API_URL=http://localhost:5000
npm run dev
```

## Deployment (Render + Vercel)

**Full step-by-step guide:** see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

| What | Where it runs |
|------|----------------|
| React UI | **Vercel** (`frontend/`) |
| Flask API | **Render Web Service** (`backend/`) |
| PostgreSQL | **Render PostgreSQL** (separate service — not on Vercel) |

Docker Compose on your PC is only for local dev; production uses Render’s managed database via `DATABASE_URL`.

## Project Structure

```
Assignment/
├── backend/
│   ├── app/
│   │   ├── routes/       # products, customers, orders, dashboard
│   │   ├── models.py
│   │   ├── validators.py
│   │   └── config.py
│   ├── Dockerfile
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Submission Checklist

- [ ] GitHub repository link
- [ ] Docker Hub image link (backend)
- [ ] Live frontend URL (Vercel/Netlify)
- [ ] Live backend API URL (Render/Railway/Fly.io)
