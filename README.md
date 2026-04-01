# E-commerce QA-Ready Stack (Next.js + Express)

![CI](https://github.com/your-org/your-repo/actions/workflows/ci.yml/badge.svg)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)

## Project Structure

```text
.
├── frontend/                  # Next.js 16 app
├── backend/                   # Express REST API + Jest/Supertest
├── selenium-tests/            # Python Selenium POM suite (pytest)
├── .github/workflows/ci.yml   # CI pipeline
├── docker-compose.yml
└── README.md
```

## Key Capabilities

- Strong backend validation + structured error codes
- Auth middleware with invalid/missing/expired token handling
- Checkout protections (empty cart, invalid cart product, out-of-stock)
- Mock order submission failure toggle (`MOCK_ORDER_FAILURE=true`)
- Backend unit/integration tests via Jest + Supertest
- Selenium end-to-end suite with:
  - Page Object Model
  - Headed/headless mode
  - Chrome/Firefox support
  - HTML reports + screenshots on failures
- CI pipeline for backend tests, frontend build, Selenium tests
- Dockerized backend/frontend + compose local orchestration

## Local Setup (Without Docker)

1. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Create env files:

- Copy `.env.example` to `.env` (optional root reference)
- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env.local`
- Copy `selenium-tests/.env.example` to `selenium-tests/.env` (for E2E)

3. Start app:

```bash
npm run dev
```

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:5000`

## Local Setup (Docker)

```bash
docker compose up --build
```

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:5000`

## Environment Variables

### Root `.env.example`

| Variable | Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api` | Frontend API base URL |
| `PORT` | `5000` | Backend port |
| `FRONTEND_URL` | `http://localhost:3000,http://localhost:3001` | CORS allowlist |
| `TOKEN_TTL_SECONDS` | `3600` | Mock JWT expiry seconds |
| `MOCK_ORDER_FAILURE` | `false` | Forces checkout failure when `true` |

### Backend `backend/.env.example`

| Variable | Example |
|---|---|
| `PORT` | `5000` |
| `FRONTEND_URL` | `http://localhost:3000,http://localhost:3001` |
| `TOKEN_TTL_SECONDS` | `3600` |
| `MOCK_ORDER_FAILURE` | `false` |

### Frontend `frontend/.env.example`

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:5000/api` |

### Selenium `selenium-tests/.env.example`

| Variable | Example | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:3001` | Frontend base URL |
| `API_URL` | `http://localhost:5000/api` | Backend API URL |
| `BROWSER` | `chrome` / `firefox` | Browser selection |
| `HEADLESS` | `true` / `false` | Headless mode |

## API Documentation (Postman/Automation Ready)

Base URL: `http://localhost:5000/api`

| Method | Route | Auth | Request Body | Success Response | Status Codes | Error Scenarios |
|---|---|---|---|---|---|---|
| `GET` | `/health` | No | - | `{ "status": "ok" }` | `200` | - |
| `POST` | `/auth/register` | No | `{ "name","email","password" }` | `{ "message","token","user" }` | `201`,`400`,`409`,`500` | Missing fields, invalid types, invalid email, weak password, duplicate email |
| `POST` | `/auth/login` | No | `{ "email","password" }` | `{ "message","token","user" }` | `200`,`400`,`401`,`500` | Missing fields, invalid email format, invalid credentials |
| `GET` | `/products` | No | Query: `q,category,minPrice,maxPrice` | `{ "products","total" }` | `200`,`400`,`500` | Invalid numeric query params |
| `GET` | `/products/:id` | No | - | `{ "product" }` | `200`,`400`,`404` | Invalid/non-existent product ID |
| `GET` | `/cart` | Bearer | - | `{ "userId","items","total" }` | `200`,`401` | Missing token, invalid token, expired token |
| `POST` | `/cart` | Bearer | `{ "productId","quantity?" }` | `{ "message" }` | `200`,`400`,`404`,`409`,`401`,`500` | Invalid type, missing productId, product not found, out-of-stock |
| `PATCH` | `/cart/:productId` | Bearer | `{ "quantity" }` | `{ "message" }` | `200`,`400`,`404`,`409`,`401` | Invalid product/quantity, item missing, out-of-stock |
| `DELETE` | `/cart/:productId` | Bearer | - | `{ "message" }` | `200`,`400`,`404`,`401` | Invalid ID, item missing |
| `POST` | `/orders/checkout` | Bearer | - | `{ "message","order" }` | `201`,`400`,`409`,`500`,`401` | Empty cart, invalid product in cart, stock issue, mock server failure |
| `GET` | `/orders` | Bearer | - | `{ "orders" }` | `200`,`401` | Auth failures |

### Common Error Response

```json
{
  "message": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

## Backend Testing (Jest + Supertest)

Run:

```bash
npm run test --prefix backend
```

Covered critical cases:

- Invalid email / weak password / duplicate registration
- Missing token and expired token
- Invalid product type and out-of-stock add-to-cart
- Empty cart checkout prevention
- Mock order submission failure

## Selenium E2E Testing (Python)

Install:

```bash
pip install -r selenium-tests/requirements.txt
```

Run all tests:

```bash
pytest selenium-tests/tests
```

Run headless Chrome:

```bash
HEADLESS=true BROWSER=chrome pytest selenium-tests/tests
```

Run headed Firefox:

```bash
HEADLESS=false BROWSER=firefox pytest selenium-tests/tests
```

Run single test:

```bash
pytest selenium-tests/tests/test_ecommerce_flow.py::test_checkout_flow_and_empty_cart_prevention
```

Outputs:

- HTML report: `selenium-tests/reports/report.html`
- Failure screenshots: `selenium-tests/reports/screenshots/`

### Selenium Test Scenarios

- Registration with valid data
- Registration with invalid (weak) password
- Login with valid and invalid credentials
- Product search/filter behavior
- Add/update/remove cart operations
- End-to-end checkout + empty-cart checkout prevention
- Authentication persistence across pages

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

Runs on push + pull request:

1. **Backend Tests Job**
   - Setup Node.js
   - Install backend dependencies
   - Run Jest/Supertest tests

2. **Frontend Build Job**
   - Setup Node.js
   - Install frontend dependencies
   - Run production build

3. **Selenium Tests Job**
   - Waits for backend + frontend jobs
   - Setup Node.js + Python
   - Start backend/frontend
   - Run Selenium suite in headless mode
   - Upload HTML report + screenshots as artifacts

## Deployment (Free Tier Guidance)

### Frontend

- **Vercel** (recommended): connect `frontend/` folder, set `NEXT_PUBLIC_API_BASE_URL`
- **Netlify**: use `frontend/netlify.toml` and same env variable
- Automatic deploy from GitHub supported by both platforms

### Backend

- **Render**: use root `render.yaml` and set env vars in dashboard
- **Railway**: use `backend/railway.json`; configure env vars in project settings
- Free-tier note: services may sleep after inactivity (cold starts expected)
- Health check endpoint: `GET /api/health`

## Notes

- Tokens are mock JWT-style base64 payloads with expiry (`exp`), not signed JWT.
- Data persistence is JSON-file based under `backend/data`.
