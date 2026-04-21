# 🏥 Doctor Tracker — Medical Administration Portal

## Description

Doctor Tracker is a secure, full-stack medical administration portal built with Next.js 14 that empowers healthcare administrators to efficiently manage doctors and their patients in one centralized platform. The system features a real-time analytics dashboard with rich data visualizations, comprehensive CRUD operations with search, filter, and pagination, all protected behind JWT-based authentication — designed for performance, scalability, and a polished user experience.

---

## Setup Guide

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/doctor-tracker.git
cd doctor-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/doctor-tracker
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@doctortracker.com
ADMIN_PASSWORD=Admin@123456
```

### 4. Seed the admin user

Start the dev server, then visit:

```
http://localhost:3000/api/auth/seed
```

This creates the initial admin account using your `.env.local` credentials.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

### 6. Login

```
Email:    admin@doctortracker.com
Password: Admin@123456
```

### Production Build

```bash
npm run build
npm start
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                      │
│   Next.js App Router · React 18 · Recharts · Lucide      │
└────────────────────────┬────────────────────────────────-┘
                         │ HTTP / RSC
┌────────────────────────▼────────────────────────────────-┐
│                  Next.js Server (App Router)               │
│                                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Auth Layer │  │  API Routes  │  │  Server Pages  │   │
│  │  NextAuth   │  │  /api/*      │  │  (RSC)         │   │
│  │  JWT        │  │  REST        │  │                │   │
│  └──────┬──────┘  └──────┬───────┘  └────────────────┘   │
│         │                │                                 │
│  ┌──────▼────────────────▼──────────────────────────────┐ │
│  │               Business Logic / Mongoose ODM           │ │
│  │   Doctor Model · Patient Model · User Model           │ │
│  └─────────────────────────┬─────────────────────────────┘ │
└────────────────────────────│──────────────────────────────-┘
                             │ mongoose
┌────────────────────────────▼────────────────────────────-┐
│                       MongoDB Atlas                        │
│    doctors · patients · users collections                  │
│    Indexes: text, compound, single-field                   │
└───────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. Client makes request → Next.js middleware checks JWT session
2. Authenticated requests hit `/api/*` route handlers
3. Route handlers use Mongoose models to query MongoDB
4. Aggregation pipelines power the dashboard analytics
5. Results serialized as JSON and returned to client
6. Client updates React state → UI re-renders

---

## Technical Decisions

### 1. Next.js App Router with Route Groups over a Separate Express Server

**The problem:** The spec mentions Node.js + Express, but running a separate Express server alongside Next.js introduces operational complexity (two processes, two ports, CORS configuration, proxy setup).

**Decision:** We used Next.js App Router's built-in API Routes (`app/api/*`) which run as serverless functions and follow RESTful principles natively. Route groups (`(app)/`) cleanly separate the authenticated layout from the public login page without affecting URLs.

**Trade-off:** We lose some Express middleware ecosystem, but gain: zero-config deployment on Vercel, automatic code splitting, shared TypeScript types between frontend and backend, and a single deployable unit. For a project of this scale, the DX and ops simplicity wins.

### 2. MongoDB Aggregation Pipelines + Compound Indexes over Application-Level Joins

**The problem:** Dashboard analytics (patients per doctor, monthly admissions, condition distributions) could naively be done by fetching all records and computing in JavaScript — but this won't scale.

**Decision:** All analytics use MongoDB's `$aggregate` pipeline with `$group`, `$lookup`, `$project`, and `$sort` stages, running computation database-side. We defined strategic indexes:

```js
// Text search index on doctors
DoctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });

// Compound index for common patient queries
PatientSchema.index({ doctorId: 1, condition: 1 });
PatientSchema.index({ admittedAt: -1 });
```

**Trade-off:** Aggregation pipelines are harder to read than simple `.find()` queries, but this approach means dashboard queries run in a single round-trip regardless of data size. The compound indexes ensure search + filter + pagination queries use index scans instead of collection scans, keeping response times consistent at scale.

---

## Visual Evidence

### Desktop Views

| Dashboard | Doctors |
|-----------|---------|
| Analytics overview with 4 charts | Searchable, filterable doctor table |

| Doctor Detail | Patients |
|--------------|---------|
| Doctor profile with patient list | Full patient management with edit |

### Mobile Views
All layouts are responsive — sidebar collapses, tables scroll horizontally, modals fill viewport.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | Login / session |
| GET | `/api/doctors` | List doctors (search, filter, paginate) |
| POST | `/api/doctors` | Create doctor |
| GET | `/api/doctors/:id` | Get doctor + their patients |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor + patients |
| GET | `/api/patients` | List patients (search, filter, paginate) |
| POST | `/api/patients` | Create patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/dashboard` | Aggregated analytics data |

---

## Project Structure

```
doctor-tracker/
├── app/
│   ├── (app)/                    # Authenticated route group
│   │   ├── layout.tsx            # Sidebar + TopBar layout
│   │   ├── dashboard/page.tsx    # Analytics dashboard
│   │   ├── doctors/
│   │   │   ├── page.tsx          # Doctors list
│   │   │   └── [id]/page.tsx     # Doctor detail + patients
│   │   └── patients/page.tsx     # Patients list
│   ├── api/
│   │   ├── auth/                 # NextAuth + seed
│   │   ├── doctors/              # Doctor CRUD
│   │   ├── patients/             # Patient CRUD
│   │   └── dashboard/            # Analytics aggregations
│   ├── login/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                  # Root redirect
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   └── ui/
│       ├── Pagination.tsx
│       ├── ConditionBadge.tsx
│       └── ConfirmModal.tsx
├── lib/
│   ├── mongodb.ts                # DB connection with caching
│   └── auth.ts                   # NextAuth options
├── models/
│   ├── Doctor.ts
│   ├── Patient.ts
│   └── User.ts
├── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (JWT) |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Tailwind CSS + CSS Variables |
| Fonts | Sora + DM Sans (Google Fonts) |
| Dates | date-fns |

---

## License

MIT
