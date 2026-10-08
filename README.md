# SymbioExchange 🔄🏭

A privacy-first, B2B industrial symbiosis and circular economy platform connecting manufacturing plants with surplus materials, by-products, and scrap to buyers who can reuse or recycle them.

---

## 🌟 Overview

Industrial symbiosis enables one company’s waste or by-product to become another company’s raw material. However, traditional B2B exchanges fail due to **trade secret leakage**, **supplier identity exposure**, and **complex freight calculations**.

**SymbioExchange** solves this through:
1. **Hub-Mediated Privacy:** Obscures precise factory addresses and corporate identities behind regional logistics hubs.
2. **Deterministic Multi-Criteria Matchmaking:** Evaluates material chemistry, state, quantity, freight costs, and geographic proximity.
3. **Automated Freight Logistics & Live Tracking:** Computes route economics and tracks shipments across the supply chain.
4. **Instant Real-Time Sync:** Uses Server-Sent Events (SSE) for instant cross-portal updates.

---

## 👥 Multi-Role Portals

| Role | Capabilities |
|---|---|
| **Seller / Donor** | List surplus raw materials, industrial scrap, chemical by-products, or secondary resources with physical state and pricing/donation tags. |
| **Buyer / Donee** | Post raw material requirements, acceptable physical states, ceiling prices, and discover algorithmically scored matches. |
| **Logistics Provider** | View unmasked pickup/delivery routes, calculate vehicle freight, assign dispatches, and update telemetry status. |
| **Platform Admin** | Platform-wide overview of active listings, material circularity metrics, transaction volumes, and privacy compliance. |

---

## 🧮 Algorithmic Matchmaking Engine

The platform evaluates compatibility between posted **Resources** and **Requirements** using a deterministic weighted scoring model ($0 - 100\%$ score):

```
Total Compatibility Score = (0.35 × Material) + (0.25 × Proximity) + (0.20 × Economics) + (0.20 × Quantity)
```

### 1. Material Compatibility (Weight: 35%)
- Checks category taxonomy and exact/substring name alignment.
- Validates acceptable physical states (`solid`, `liquid`, `gas`, `composite`).

### 2. Geographic Proximity & Distance Decay (Weight: 25%)
- Calculates Haversine distance between regional **Hub Zones**.
- Applies distance-decay penalty for non-local exchanges to minimize transit emissions and cost.

### 3. Economic Feasibility (Weight: 20%)
- Evaluates total unit cost: $\text{Material Cost} + \text{Unit Freight Transport Cost} \le \text{Buyer Max Budget}$.

### 4. Quantity Fit (Weight: 20%)
- Computes fulfillment ratio: $\min\left(1.0, \frac{\text{Available Qty}}{\text{Required Qty}}\right) \times 100\%$.

---

## 🛡️ Privacy Architecture (Hub Mediation)

```
[Seller Factory] ──────────▶ (Regional Hub Zone) ──────────▶ [Buyer Factory]
(Confidential Address)        "Bhiwandi Logistics Hub"        (Confidential Address)
                                         │
                         Cross-Party View Only Sees Hub
                         ──────────────────────────────
                         • Seller Org: HIDDEN
                         • Exact Address: REDACTED
                         • Buyer Org: HIDDEN
                                         │
                    Only Privileged Logistics Provider Sees
                    ───────────────────────────────────────
                    • Full Waybills & Exact Coordinates
```

- **Cross-Party Redaction:** Replaces proprietary pickup addresses with hub identifiers (e.g. `[Hub Mediated: Bhiwandi Hub, Mumbai Region]`).
- **Privacy Inspection Modal:** Allows participants to verify exactly what data is visible to counterparties before accepting a match.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React
- **Backend:** Node.js, Express.js (`server.ts` with `tsx`)
- **Real-Time Protocol:** Server-Sent Events (SSE) `/api/events`
- **AI Integration:** Google Gemini SDK (`@google/genai`) for match insights & material recommendations
- **State Management:** Reactive Observer Store (`src/services/store.ts`)

---

## 📁 Project Structure

```
SymbioExchange/
├── server.ts                    # Express backend & Vite middleware server
├── vite.config.ts
├── tsconfig.json
├── package.json
│
└── src/
    ├── App.tsx                  # Main layout & portal switcher
    ├── main.tsx
    ├── index.css
    │
    ├── components/              # Portal UI components
    │   ├── PlatformOverview.tsx # Metrics, circularity stats & exchange flow
    │   ├── SellerPortal.tsx     # Resource listing form & active surplus inventory
    │   ├── BuyerPortal.tsx      # Requirement creation & AI matched resources
    │   ├── LogisticsPortal.tsx  # Dispatch management, route maps & freight calculation
    │   ├── ShipmentTrackerView.tsx # Live milestone tracking & telemetry
    │   ├── PrivacyInspectionModal.tsx # Zero-leakage privacy verification
    │   └── Header.tsx           # Global navigation & active role selector
    │
    ├── lib/                     # Core computational algorithms
    │   ├── matching-engine.ts   # 4-factor deterministic scoring engine
    │   ├── logistics-engine.ts  # Freight pricing & transit estimation
    │   ├── geo-hub.ts           # Regional hub definitions & coordinates
    │   └── privacy-serializer.ts# Role-based payload sanitizer
    │
    ├── server/                  # API layer & database
    │   ├── db.ts                # In-memory relational dataset & operations
    │   └── routes.ts            # Express REST endpoints & SSE event broadcaster
    │
    ├── services/
    │   ├── api.ts               # Client-side API fetch layer
    │   └── store.ts             # Reactive pub/sub state manager
    │
    └── types/
        └── index.ts             # Core TypeScript domain definitions
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **bun** / **pnpm**
- **Gemini API Key** (optional, for AI-driven insights)

---

### 1. Clone the Repository

```bash
git clone https://github.com/rahilkm/SymbioExchange.git
cd SymbioExchange
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```env
# Port for the unified full-stack server
PORT=3000

# Google Gemini API Key (optional for AI insights)
GEMINI_API_KEY=your_gemini_api_key_here

# App URL
APP_URL=http://localhost:3000
```

---

### 4. Start Development Server

```bash
npm run dev
```

Open your browser and visit:
```
http://localhost:3000
```

---

## 📡 API Endpoints

### 👥 User & Role Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List all demo industrial actors and active user |
| `POST`| `/api/users/active` | Switch active persona (`SELLER`, `BUYER`, `LOGISTICS`, `ADMIN`) |

### 📦 Resource & Requirement Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resources` | List surplus resources (sanitized by requester role) |
| `POST`| `/api/resources` | Publish new industrial surplus listing |
| `GET` | `/api/requirements` | List buyer requirements |
| `POST`| `/api/requirements` | Post a material requirement |

### 🤝 Matches & Shipments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/matches` | Get algorithmic matches for active actor |
| `POST`| `/api/matches/propose` | Initiate transaction handshake |
| `POST`| `/api/matches/accept` | Accept match and generate shipment order |
| `GET` | `/api/shipments` | Retrieve active dispatch waybills |
| `PATCH`| `/api/shipments/:id/status` | Update logistics transit state |

### ⚡ Real-Time Streaming
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | Server-Sent Events (SSE) stream for live updates |
| `GET` | `/health` | Server health status |

---

## 📜 License

MIT
