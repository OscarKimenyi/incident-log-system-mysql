# Incident & Operations Log System

A full-stack web application for reporting, tracking, and resolving operational incidents
with role-based access control, status workflow enforcement, and a complete audit trail.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Running the Application](#running-the-application)
8. [Default Users & Credentials](#default-users--credentials)
9. [Role Permissions](#role-permissions)
10. [Incident Status Workflow](#incident-status-workflow)
11. [API Reference](#api-reference)
12. [Database Schema](#database-schema)
13. [Key Design Decisions](#key-design-decisions)

---

## System Overview

IncidentOps is an operations management tool that allows teams to:

- **Report incidents** with severity levels (low, medium, high, critical)
- **Track status changes** through an enforced workflow (open → investigating → resolved → closed)
- **Maintain a full audit trail** of every status change, comment, and assignment
- **Enforce role-based permissions** so each user type can only perform allowed actions
- **Filter and search** incidents by status and severity

---

## Technology Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Framework | Laravel 11 |
| Authentication | Laravel Sanctum (token-based) |
| Database | MySQL 8+ |
| API Style | RESTful JSON API |

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | React 18 (Vite) |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Routing | React Router v6 |
| State | React Context API |

---

## Prerequisites

Install the following before proceeding:

- **PHP 8.2+** — https://windows.php.net/download/
- **Composer** — https://getcomposer.org/
- **Node.js 20+ & npm** — https://nodejs.org/
- **MySQL 8+** — https://dev.mysql.com/downloads/mysql/ or via XAMPP or Laragon
- **Git** (optional) — https://git-scm.com/

Verify your environment:
```bash
php --version       # PHP 8.2.x
composer --version  # Composer 2.x
node --version      # v20.x
npm --version       # 10.x
mysql --version     # 8.x
```

---

## Project Structure
```bash
incident-log-system
  ├── backend/ # Laravel API
  │ ├── app/
  │ │ ├── Http/
  │ │ │ ├── Controllers/
  │ │ │ │ ├── AuthController.php
  │ │ │ │ ├── IncidentController.php
  │ │ │ │ └── UserController.php
  │ │ │ └── Middleware/
  │ │ │ └── RoleMiddleware.php
  │ │ └── Models/
  │ │ ├── User.php
  │ │ ├── Incident.php
  │ │ └── IncidentUpdate.php
  │ ├── database/
  │ │ ├── migrations/ # 4 migration files
  │ │ └── seeders/
  │ │ └── DatabaseSeeder.php
  │ ├── routes/
  │ │ └── api.php
  │ ├── config/
  │ │ └── cors.php
  │ └── .env
  │
  └── frontend/ # React SPA
  ├── src/
  │ ├── api/
  │ │ └── axios.js # Axios instance + interceptors
  │ ├── context/
  │ │ └── AuthContext.jsx # Auth state provider
  │ ├── components/
  │ │ └── Layout.jsx # Sidebar + topbar shell
  │ ├── pages/
  │ │ ├── Login.jsx
  │ │ ├── Dashboard.jsx
  │ │ ├── IncidentList.jsx
  │ │ ├── IncidentDetail.jsx
  │ │ ├── CreateIncident.jsx
  │ │ └── UserManagement.jsx
  │ ├── App.jsx # Router + route guards
  │ ├── main.jsx
  │ └── index.css # Tailwind import
  └── vite.config.js
```
---

## Backend Setup

```bash
# 1. Clone or extract backend folder
cd incident-log-backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Configure database in .env
#    DB_DATABASE=incident_log
#    DB_USERNAME=root
#    DB_PASSWORD=your_password

# 5. Generate application key
php artisan key:generate

# 6. Create MySQL database
mysql -u root -p -e "CREATE DATABASE incident_log;"

# 7. Run migrations and seed
php artisan migrate:fresh --seed

# 8. Start the server
php artisan serve
```

The API will be available at: `http://localhost:8000`

---

## Frontend Setup

```bash
# 1. Navigate to frontend folder
cd incident-log-frontend

# 2. Install Node dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be available at: `http://localhost:5173`

---

## Running the Application

You need **two terminals** running simultaneously:

**Terminal 1 — Backend:**
```bash
cd incident-log-backend
php artisan serve
```

**Terminal 2 — Frontend:**
```bash
cd incident-log-frontend
npm run dev
```

Open your browser at `http://localhost:5173`

---

## Default Users & Credentials

All seeded users share the password: `password`

| Name | Email | Role |
|------|-------|------|
| System Admin | admin@incidentlog.com | admin |
| Alice Operator | alice@incidentlog.com | operator |
| Bob Operator | bob@incidentlog.com | operator |
| Charlie Reporter | charlie@incidentlog.com | reporter |
| Diana Reporter | diana@incidentlog.com | reporter |

The login page includes quick-fill buttons for the three primary demo accounts.

---

## Role Permissions

| Action | Reporter | Operator | Admin |
|--------|----------|----------|-------|
| Login | ✅ | ✅ | ✅ |
| View own incidents | ✅ | ✅ | ✅ |
| View all incidents | ❌ | ✅ | ✅ |
| Create incident | ✅ | ✅ | ✅ |
| Update incident status | ❌ | ✅ | ✅ |
| Add comment | ✅ (own) | ✅ | ✅ |
| Assign incident | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Incident Status Workflow

Status transitions are strictly enforced in sequence:
open → investigating → resolved → closed


- **Skipping steps is not allowed.** An `open` incident cannot jump directly to `resolved`.
- Every status change is recorded in `incident_updates` with the old status, new status, user, timestamp, and an optional note.
- Once `closed`, no further status changes are permitted.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Sign in, receive token |
| POST | `/api/logout` | Revoke current token |
| GET | `/api/me` | Get authenticated user |

### Incidents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/incidents` | All roles | List incidents (filtered for reporters) |
| POST | `/api/incidents` | All roles | Create incident |
| GET | `/api/incidents/{id}` | All roles | Get incident detail + updates |
| PATCH | `/api/incidents/{id}/status` | Operator, Admin | Advance status |
| POST | `/api/incidents/{id}/comment` | All roles | Add comment |
| PATCH | `/api/incidents/{id}/assign` | Admin only | Assign to operator |
| GET | `/api/dashboard` | All roles | Dashboard stats |

### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/operators` | List operators + admins |
| POST | `/api/users` | Create user |
| PATCH | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

**Filtering incidents:**
GET /api/incidents?status=open&severity=critical


---

## Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | |
| email | varchar unique | |
| password | varchar | bcrypt hashed |
| role | enum | reporter, operator, admin |
| is_active | boolean | default true |
| timestamps | | created_at, updated_at |

### `incidents`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| title | varchar | |
| description | text | |
| severity | enum | low, medium, high, critical |
| status | enum | open, investigating, resolved, closed |
| reported_by | FK → users | |
| assigned_to | FK → users nullable | |
| timestamps | | |

### `incident_updates`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| incident_id | FK → incidents | |
| user_id | FK → users | actor |
| type | enum | status_change, comment, assignment |
| old_status | varchar nullable | |
| new_status | varchar nullable | |
| comment | text nullable | |
| timestamps | | |

### `personal_access_tokens`
Standard Laravel Sanctum table for API token storage.

---

## Key Design Decisions

**1. Sanctum token authentication (not session)**
The frontend is a separate SPA on a different port, so token-based auth via `Authorization: Bearer` headers is simpler and more portable than cookie-based sessions.

**2. Status transition enforced at model level**
`Incident::canTransitionTo()` encapsulates the flow logic in the model so it cannot be bypassed regardless of which controller calls it.

**3. Reporters see only their own incidents**
The `index` and `show` endpoints filter by `reported_by` for reporter-role users. This is enforced server-side, not just in the UI.

**4. Every change creates an `incident_update` record**
Status changes, comments, and assignments all append a row to `incident_updates`. This gives a complete, immutable audit trail displayed as an activity timeline.

**5. Role middleware via named alias**
The `role` middleware is registered as an alias and applied per-route, making permissions readable directly in `api.php` without cluttering controllers.

**6. Vite + Tailwind v4**
Using the new `@tailwindcss/vite` plugin (Tailwind v4) which requires only `@import "tailwindcss"` in CSS — no `tailwind.config.js` needed.

---

# FINAL CHECKLIST — Run in Order
## BACKEND 
```bash
cd incident-log-backend
composer install
php artisan key:generate
# edit .env with your DB password
php artisan migrate:fresh --seed
php artisan serve
```
## FRONTEND (new terminal)
```bash 
cd incident-log-frontend
npm install
npm run dev
```
Then open http://localhost:5173 and log in with admin@incidentlog.com / password.