# Hiring Presentation Guide (Test-First)

This guide helps you present this project professionally for hiring, with **testing as the main focus**.

---

## 1) Project One-Liner (Use in Intro)

`QA-first e-commerce app with robust backend validation, auth edge-case handling, API automation, UI end-to-end coverage, Dockerized local setup, and CI pipeline.`

---

## 2) What This Project Demonstrates

- Backend engineering with defensive API design
- QA engineering mindset (edge cases + repeatable automation)
- Test pyramid implementation:
  - **API tests**: Jest + Supertest
  - **E2E tests**: Selenium + Pytest + Page Object Model
- CI/CD reliability (GitHub Actions)
- Deployment-readiness docs for free-tier services

---

## 3) GitHub First (QA Portfolio Version)

## A. Project Title and Repository Name

Use a QA-focused title:

- **Project Title:** `E-commerce QA Automation Portfolio Project`
- **Suggested Repo Name:** `qa-ecommerce-automation-portfolio`

Optional subtitle for README:

- `API + UI test automation with CI/CD, Docker, and edge-case validation`

## B. Create Repository

1. Create a **public** GitHub repository (important for recruiter visibility).
2. Push this project as your initial commit.
3. Set branch protection for `main`:
   - Require pull request before merge
   - Require passing status checks (CI pipeline)

## C. Repository QA Setup

1. Enable GitHub Actions.
2. Confirm `.github/workflows/ci.yml` is detected and runs on push/PR.
3. Add deployment secrets later only if you publish demo URLs.
4. Pin a short project description in repo settings:
   - `QA-focused e-commerce test automation with Jest, Supertest, Selenium, and GitHub Actions`

## D. Suggested Branch Strategy

- `main` for stable, demo-ready QA portfolio state
- QA-focused feature branches:
  - `feature/api-validation-tests`
  - `feature/selenium-pom-suite`
  - `feature/ci-cd-pipeline`

---

## 4) Local Runbook (Quick)

## Non-Docker

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
pip install -r selenium-tests/requirements.txt
```

Create env files:

- `backend/.env` from `backend/.env.example`
- `frontend/.env.local` from `frontend/.env.example`
- `selenium-tests/.env` from `selenium-tests/.env.example`

Run app:

```bash
npm run dev
```

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:5000`

## Docker

```bash
docker compose up --build
```

---

## 5) Testing-First Demonstration Plan (Most Important)

Use this exact order in interviews and demos:

1. **Backend API tests** (show fast deterministic validation of edge cases)
2. **Frontend build** (show production readiness)
3. **Selenium E2E tests** (show business-flow confidence)
4. **GitHub Actions** (show automated quality gate)

---

## 6) Backend Test Commands (Jest + Supertest)

Run:

```bash
npm run test --prefix backend
```

What to emphasize:

- Input validation:
  - invalid email
  - weak password
  - invalid data types
- Auth failures:
  - missing token
  - expired token
- Business edge cases:
  - duplicate registration
  - empty cart checkout
  - out-of-stock product
  - mock order failure

Interview line:

`The backend suite protects critical business rules before UI automation starts.`

---

## 7) Frontend Build Validation

Run:

```bash
npm run build --prefix frontend
```

What to emphasize:

- Ensures no runtime-breaking regressions before deployment
- Confirms compatibility with current Next.js version

---

## 8) Selenium E2E Test Execution (Pytest + POM)

## Run all tests

```bash
pytest selenium-tests/tests --html=selenium-tests/reports/report.html --self-contained-html
```

## Run headed Chrome

```bash
HEADLESS=false BROWSER=chrome pytest selenium-tests/tests
```

## Run headless Firefox

```bash
HEADLESS=true BROWSER=firefox pytest selenium-tests/tests
```

## Run one critical test

```bash
pytest selenium-tests/tests/test_ecommerce_flow.py::test_checkout_flow_and_empty_cart_prevention
```

What to emphasize:

- POM pattern for maintainability
- Cross-browser support
- Failure screenshots auto-captured
- HTML report artifact for auditability

---

## 9) CI/CD Demo (GitHub Actions)

Workflow file:

- `.github/workflows/ci.yml`

Jobs:

1. Backend tests
2. Frontend build
3. Selenium tests (depends on first two)

What to show in GitHub UI:

- A successful run on push/PR
- Selenium artifacts uploaded (report + screenshots)
- Explain this as your quality gate before merge

---

## 10) Postman + API Automation Positioning

For API QA demo:

1. Import endpoints from README table.
2. Create environment:
   - `baseUrl = http://localhost:5000/api`
3. Build collection folders:
   - Auth
   - Products
   - Cart
   - Orders
4. Add test scripts for:
   - status code assertions
   - response schema keys
   - edge-case negative assertions

Recommended scenarios:

- Register invalid email -> `400`
- Register duplicate email -> `409`
- Login wrong password -> `401`
- Checkout empty cart -> `400`
- Out-of-stock add to cart -> `409`

---

## 11) Video Recording Guide (Portfolio-Ready)

Target: **6-10 minutes** total.

## Recording Structure

### Part 1 (0:00-1:00) — Architecture Snapshot

- Show folder structure quickly
- Explain test pyramid and why it matters

### Part 2 (1:00-3:00) — Backend QA

- Run `npm run test --prefix backend`
- Highlight edge-case coverage from output

### Part 3 (3:00-4:00) — Frontend Build

- Run `npm run build --prefix frontend`
- Mention production readiness

### Part 4 (4:00-7:00) — Selenium E2E

- Run one full suite command
- Open HTML report
- Show screenshot folder for failure diagnostics

### Part 5 (7:00-8:30) — GitHub Actions

- Show CI pipeline jobs and artifacts
- Explain PR quality gate

### Part 6 (8:30-10:00) — Wrap-up

- Mention deployment options (Vercel/Netlify + Render/Railway)
- Mention free-tier constraints (cold start/sleep)

## Video Tips

- Use 125-150% zoom for readability
- Keep terminal font large
- Prepare commands in advance
- Keep one failed test example ready, then show fix/re-run if possible

---

## 12) Interview Talking Points (Testing-Centric)

- `I designed the backend to fail predictably with machine-readable error codes.`
- `I validated edge cases first at API level before UI automation.`
- `I used Selenium POM for maintainable end-to-end business-flow testing.`
- `CI enforces backend + frontend + E2E checks before merge.`
- `The project is reproducible locally via Docker and documented for QA handoff.`

---

## 13) "How to Reproduce Everything" Script (Copy/Paste)

```bash
# 1) Install dependencies
npm install
npm install --prefix backend
npm install --prefix frontend
pip install -r selenium-tests/requirements.txt

# 2) Start services
npm run dev

# 3) Run backend tests
npm run test --prefix backend

# 4) Build frontend
npm run build --prefix frontend

# 5) Run E2E tests with HTML report
pytest selenium-tests/tests --html=selenium-tests/reports/report.html --self-contained-html
```

---

## 14) Final Hiring Pitch (Use as Closing)

`This project reflects how I work in production teams: backend contracts are validated, edge cases are automated, user journeys are tested end-to-end, and quality checks run continuously in CI before release.`
