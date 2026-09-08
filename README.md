# BlazeUp HROS — Employee Offboarding Automation Engine

<p align="center">
  <a href="https://offboarding-automation-sreekar4.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_Portal-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://offboarding-automation.onrender.com/api/v1/health" target="_blank">
    <img src="https://img.shields.io/badge/API_Status-Online-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render API" />
  </a>
  <a href="https://www.mongodb.com/cloud/atlas" target="_blank">
    <img src="https://img.shields.io/badge/Cloud_DB-MongoDB_Atlas-00ED64?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  </a>
</p>

<p align="center">
  <b>Enterprise digital offboarding & clearance workflow engine with strict role isolation and automated certificate generation.</b>
  <br />
  <sub>Built strictly with <b>Node.js (Pure JavaScript ES Modules)</b>, <b>MongoDB</b>, and <b>React (Pure JavaScript JSX)</b>.</sub>
</p>

<p align="center">
  <a href="https://offboarding-automation-sreekar4.vercel.app"><strong>🔗 Launch Live Application »</strong></a>
</p>

---

## 🌐 Live Cloud Deployment

| Service | Cloud Platform | Status | Live Link |
|---|---|---|---|
| **Frontend UI** | **Vercel** | `Production` | [offboarding-automation-sreekar4.vercel.app](https://offboarding-automation-sreekar4.vercel.app) |
| **Backend API** | **Render** | `Active` | [offboarding-automation.onrender.com](https://offboarding-automation.onrender.com/api/v1/health) |
| **Database** | **MongoDB Atlas** | `Connected` | Multi-Tenant Cloud Cluster |

---

## 🏆 Key Architectural Highlights & Innovation

1. **Generic, Reusable Workflow Engine**
   - Implemented as an agnostic state machine (`workflowEngine.service.js`) decoupled from offboarding logic.
   - Capable of running any business process with sequential stages, parallel join synchronization, dynamic role-to-manager resolution, and automatic step transitions.
   - Uses an internal event-driven architecture (`eventBus.js`) to notify microservices without tight coupling.

2. **Strict Problem Statement Compliance (100% JavaScript)**
   - **Backend**: Pure Node.js (`.js`, ES Modules `"type": "module"`, Express). Zero TypeScript.
   - **Database**: MongoDB (Mongoose models for definitions, instances, clearance records, employees, audit trails, and notifications).
   - **Frontend**: React (`.jsx` / `.js`), Tailwind CSS, Lucide icons, Vite. Zero TypeScript.
   - **Audit Trail**: Complete, immutable audit log of all decisions, notes, access revocations, and reminders.

3. **Employee Self-Service Portal & Ticket Tracking**
   - **Ticket Initiation**: Employees log in to their private portal, submit formal resignation with notice period, requested Last Working Day (LWD), reason, and handover notes.
   - **Live Clearance Tracker**: Visual multi-department progress bar showing real-time sign-offs and approver remarks from each department.
   - **Resignation Withdrawal / Revocation**: Employees can cancel/withdraw their resignation ticket prior to final HR sign-off, immediately restoring active employment status.
   - **Digital Document Download Center**: Instant download of official generated PDF certificates (Resignation Acceptance, NOC, Relieving Letter).

4. **Strict Role-Based Access Control (RBAC) & View Isolation**
   - **Role Isolation**: Employees only see their own profile; Reporting Managers only see their direct reportees; Department Approvers only action their designated clearance stage; HR Admin has executive oversight.
   - **Action Locking**: Unauthorized cross-department actions are visually locked and rejected with `403 Forbidden` on the backend.
   - **Authentic SSO Session**: Eliminates arbitrary role-switching, enforcing authentic login/logout sessions.

5. **Complete Departmental Clearance Checklist Verification**
   - **Project / Reporting Manager**: Project deliverables verification, Knowledge Transfer (KT) documentation sign-off, client portal & repository access revocation.
   - **Admin & Systems**: Hardware return (laptop, charger, phone, data card, keys) + digital access deactivation (email deactivation & system access revocation with admin actor + timestamp).
   - **Accounts & Finance**: Travel advances reconciliation, staff loans clearance, salary advance deductions, imprest/petty cash settlement.
   - **Personnel & Facilities**: Physical employee ID card, facility RFID swipe access card, official business cards surrender.
   - **HR Directorate**: Exit interview questionnaire, Resignation Acceptance Letter (with Non-Compete & Non-Solicitation clauses), final settlement, and Experience & Relieving Certificate.

6. **Automated Vector PDF Generation**
   - Generates official, downloadable PDFs streamed directly to the browser via **PDFKit**:
     - **Resignation Acceptance Letter** (complete with restrictive covenants & effective LWD).
     - **No Objection Certificate (NOC)** (consolidating sign-offs and timestamps from all 5 departments).
     - **Experience & Relieving Certificate** (certifying employee tenure, designation, and conduct).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 1. Backend Service
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:3001`. On first startup, it automatically seeds 8 realistic employees/managers and 3 active offboarding cases across different workflow stages.*

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with automatic API proxying to port 3001.*

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status check |
| `GET` | `/api/v1/offboarding/dashboard` | Aggregated KPIs and department bottleneck metrics |
| `GET` | `/api/v1/offboarding/requests` | List offboarding requests with status & query filters |
| `POST` | `/api/v1/offboarding/initiate` | Initiate offboarding and spawn workflow instance |
| `POST` | `/api/v1/offboarding/requests/:id/clearance/:stageKey` | Submit approval / rejection for a department |
| `POST` | `/api/v1/offboarding/requests/:id/revoke-access` | Execute digital access revocation (email & SSO) |
| `POST` | `/api/v1/offboarding/requests/:id/remind` | Send reminder notification to pending department |
| `GET` | `/api/v1/offboarding/my-tasks` | Query pending tasks for a given role or user |
| `GET` | `/api/v1/documents/:id/resignation-acceptance` | Stream vector PDF for Resignation Acceptance |
| `GET` | `/api/v1/documents/:id/noc-certificate` | Stream vector PDF for No Objection Certificate |
| `GET` | `/api/v1/documents/:id/relieving-letter` | Stream vector PDF for Relieving & Experience Letter |
| `GET` | `/api/v1/audit/:entityType/:entityId` | Fetch chronological audit history |
| `POST` | `/api/v1/seed/reset` | Reset demo dataset to fresh state |

---

## 🔒 Security & Auditability
Every single action taken on an offboarding case—including stage approvals, rejections with reasons, access revocations, and reminder nudges—is captured in an immutable audit ledger with timestamps, actor roles, and IDs.
