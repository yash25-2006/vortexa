# India Development Intelligence Platform (Phase 1 MVP)

> **"A citizen can report a development problem in their own language, Gemini converts that unstructured feedback into structured development intelligence, and a government user can see that information on a centralized dashboard."**

---

## 1. Project Overview

Governments across India receive thousands of fragmented, unstructured, multilingual citizen development requests every day (e.g., healthcare shortages, broken roads, drinking water outages, school classroom shortages). 

The **India Development Intelligence Platform** converts unstructured citizen complaints and requests into structured, categorized, evidence-based development intelligence for policymakers and public works departments.

In **Phase 1**, we have built the end-to-end working vertical slice:
1. **Citizen Portal**: Citizens submit development issues via **Voice Input** or **Text** in Marathi, Hindi, English, etc. with GPS or manual location.
2. **AI Structuring Engine**: Powered by **Google Gemini AI**, the system automatically detects the natural language, normalizes the issue into standardized infrastructure categories, assesses urgency, identifies affected groups, and produces an executive English summary.
3. **Database**: The structured records are stored in PostgreSQL / resilient SQL storage with timestamps, request codes (`REQ-XXXX`), and GPS coordinates.
4. **Government Development Dashboard**: Government officials view real-time KPI metrics, filterable categorized tables, urgency alerts, and interactive spatial map markers.

---

## 2. Phase 1 Architecture & Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                      CITIZEN PORTAL                         │
│  - Multilingual Text & Voice input (Web Speech API)         │
│  - Geolocation detection & District/Manual picker           │
│  - Instant feedback & Submission receipt                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ POST /api/requests
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    NODE.JS + EXPRESS API                    │
│  - Input validation & Sanitization                          │
│  - Rate limiting & Error handling                           │
│  - Extensible modular structure                             │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      GOOGLE GEMINI AI        │ │    POSTGRESQL DATABASE     │
│  - Structured JSON Output    │ │  - Schema with indexes     │
│  - Language detection        │ │  - Seed demo data          │
│  - Category & Urgency        │ │  - Extensible columns      │
│  - Summary & Affected group  │ └────────────────────────────┘
└──────────────────────────────┘               ▲
                                               │ GET /api/requests, /stats
┌──────────────────────────────────────────────┴──────────────┐
│                  GOVERNMENT DASHBOARD                       │
│  - Real-time Category & Urgency summary cards               │
│  - Interactive Filterable Data Table with Detail modal      │
│  - Interactive Map with markers & info popups (Leaflet)     │
│  - Status management & Synthetic Data labeling              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

```text
syverse/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CitizenForm.jsx         # Citizen input form & submission receipt
│   │   │   ├── LocationPicker.jsx      # GPS auto-detect & district quick-selector
│   │   │   ├── MapView.jsx             # Leaflet interactive map with urgency pins
│   │   │   ├── Navbar.jsx              # Civic tricolor header & tab navigation
│   │   │   ├── RequestDetailModal.jsx  # Inspection modal with Gemini extraction
│   │   │   ├── RequestTable.jsx        # Data table with search & multi-filters
│   │   │   ├── SummaryCards.jsx        # KPI metric cards from database
│   │   │   └── VoiceRecorder.jsx       # Web Speech API speech-to-text
│   │   ├── pages/
│   │   │   ├── CitizenPortal.jsx       # Citizen facing page
│   │   │   └── GovernmentDashboard.jsx # Government administrator dashboard
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API client
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   │   └── requestsController.js       # Handlers for POST, GET, and Stats
│   ├── db/
│   │   ├── index.js                    # PostgreSQL & SQLite database adapter
│   │   └── seed.js                     # Synthetic demonstration dataset
│   ├── middleware/
│   │   └── errorHandler.js             # User-friendly error handlers
│   ├── routes/
│   │   └── requests.js                 # API route definitions
│   ├── services/
│   │   └── gemini.js                   # Google Gemini AI structured intelligence
│   ├── server.js                       # Express application entry point
│   ├── test-e2e.js                     # Automated end-to-end test suite
│   ├── test-gemini.js                  # Gemini analyzer verification script
│   └── package.json
│
├── database/
│   └── schema.sql                      # PostgreSQL DDL table definitions
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- (Optional) PostgreSQL (v14+) — *Application includes automatic embedded database fallback for out-of-the-box local execution*.

### Step 1: Environment Configuration
Create `.env` in the root directory (or in `server/`):
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/indiadev_db
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

> **Note**: If `GEMINI_API_KEY` is omitted or quota-restricted, the platform automatically utilizes a built-in multilingual linguistic parser so development and testing never break.

### Step 2: Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 3: Run the Application

#### Option A: Unified Full-Stack Mode (Single Command)
Build the frontend and start the backend:
```bash
# In client/
npm run build

# In server/
npm start
```
Open **http://localhost:5000** in your browser.

#### Option B: Developer Mode (Hot Module Replacement)
Run server and client concurrently in two terminals:
- **Terminal 1 (Backend)**:
  ```bash
  cd server
  npm run dev
  ```
  API runs on `http://localhost:5000`.

- **Terminal 2 (Frontend)**:
  ```bash
  cd client
  npm run dev
  ```
  Client runs on `http://localhost:3000` with hot reload and automatic API proxy.

---

## 5. Seed Demonstration Data
To seed realistic multilingual demonstration requests into the database:
```bash
cd server
npm run seed
```
Or click the **"Seed Demo Data"** button directly on the Government Dashboard UI.

*(All demonstration records are explicitly labeled with `is_synthetic: true` to guarantee strict government data integrity).*

---

## 6. Verification & Automated Tests
Run the automated end-to-end test suite:
```bash
cd server
node test-e2e.js
```

This verifies:
1. API Health endpoint `/api/health`
2. Marathi Healthcare problem parsing & PostgreSQL insertion
3. Hindi Education problem parsing & PostgreSQL insertion
4. English Road Infrastructure problem parsing & PostgreSQL insertion
5. Filtered database retrieval `/api/requests?category=Healthcare`
6. Single request retrieval `/api/requests/:id`
7. Aggregated dashboard statistics `/api/stats`

---

## 7. Standardized Categories in Phase 1
- **Healthcare** (Hospitals, primary healthcare centers, doctors, medicines)
- **Education** (Schools, classrooms, teachers, learning materials)
- **Roads & Transport** (Potholes, washed away roads, bridges, public buses)
- **Water & Sanitation** (Piped drinking water, borewells, drainage canals)
- **Digital Connectivity** (Mobile network coverage, internet, broadband)
- **Electricity** (Load shedding, power outages, agricultural transformers)
- **Agriculture** (APMC grain storage, irrigation, fertilizers, seed markets)
- **Housing** (Rural housing, flood safety shelter)
- **Other** (General civic and municipal services)

---

## 8. Phase 2 Roadmap (Future Scope)
Phase 1 intentionally avoids complex predictive modeling to deliver a clean, robust vertical slice. In **Phase 2 & Phase 3**, the extensible schema and modular architecture will support:
- **Spatial Demand Hotspots**: Clustering algorithms (DBSCAN / HDBSCAN) to group hundreds of localized reports into unified infrastructure deficits.
- **Demographic & Census Correlation**: Overlaying village population, SC/ST demographics, and existing hospital/school radius datasets.
- **Automated Priority Scoring**: Weighted formula combining Urgency + Population Density + Distance to Nearest Facility.
- **WhatsApp Bot Integration**: Ingesting citizen voice notes and WhatsApp location pins directly via webhook.
- **Impact Measurement & Project Lifecycle Tracking**: From citizen request &rarr; budget sanction &rarr; contractor tendering &rarr; project completion.
