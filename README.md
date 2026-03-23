<h1 align="center">🌍 EduNation</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/zaid-ahmed-ansari/EduNation/main/frontend/src/assets/hero.png" alt="EduNation Banner" width="800"/>
</p>

<p align="center">
  <strong>An interactive geopolitical analytics & policy simulation platform</strong><br/>
  Explore real-time country data on a 3D globe, compare nations side-by-side, and simulate the impact of 25 policy levers on a country's future.
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Features-25%2B%20Indicators-E07B35?style=for-the-badge" alt="Features"/></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Stack-React%20%2B%20Express%20%2B%20Supabase-4190CC?style=for-the-badge" alt="Stack"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-27B08A?style=for-the-badge" alt="License"/></a>
</p>

---

## 📖 Table of Contents
- [🔗 Check it Live](#-check-it-live)
- [🎯 Why EduNation?](#-why-edunation)
- [👥 Who is this for?](#-who-is-this-for)
- [✨ Feature Preview](#-feature-preview)
- [🚀 Core Features](#-core-features)
- [🧠 Architecture Overview](#-architecture-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [🐳 Docker Services](#-docker-services)
- [🟢 Good First Issues](#-good-first-issues)
- [🤝 Contributing](#-contributing)
- [❤️ Support EduNation](#️-support-edunation)

---

## 🔗 Check it Live

**[🌐 Launch EduNation →](https://edu-nation-j4o5.vercel.app/)**

Explore the fully interactive 3D globe and simulate policy impacts directly from your browser.
*(Note: Initial load may be slow as we are currently using free-tier hosting for the API.)*

---

## 🎯 Why EduNation?

EduNation was built to make global policy and economic data interactive, intuitive, and exploratory — enabling students, researchers, and curious minds to simulate "what if" scenarios and understand how nations evolve over time.

## 👥 Who is this for?

- **Students** learning economics, geopolitics, or data analysis  
- **Developers** interested in data visualization and simulations  
- **Researchers** exploring country-level trends  
- **Anyone** curious about "what if" macro-policy scenarios  

---

## ✨ Feature Preview

### 3D Interactive Globe
![Globe](https://raw.githubusercontent.com/zaid-ahmed-ansari/EduNation/main/frontend/src/assets/globe.png)
*Click any country to explore*

### Analytics Dashboard
![Analytics](https://raw.githubusercontent.com/zaid-ahmed-ansari/EduNation/main/frontend/src/assets/analytics.png)
*25+ real-time indicators*

### Policy Simulation
![Simulation](https://raw.githubusercontent.com/zaid-ahmed-ansari/EduNation/main/frontend/src/assets/simulation.png)
*Adjust 25 policy sliders*

### Cross-Country Comparison
![Compare](https://raw.githubusercontent.com/zaid-ahmed-ansari/EduNation/main/frontend/src/assets/compare.png)
*Side-by-side nation analysis*

---

## 🚀 Core Features

### 🌐 Interactive 3D Globe
- Photorealistic Earth rendered with **Three.js** & **React Three Fiber**
- Click any country to navigate directly to its analytics dashboard
- Smooth camera transitions and hover-to-label interactivity

### 📊 Analytics Dashboard
- **25+ real-time economic indicators** sourced from the World Bank API
- **Happiness Index** from the official World Happiness Report (2009–2024)
- **Data Year selector** — lock all metrics to any year from 2000–2024
- **Progressive loading** — dashboard shell loads instantly, individual metrics show spinners
- Category filters: Economy, Health, Education, Trade, Energy, Demographics, Environment
- GDP trend charts (nominal & inflation-adjusted), bar comparisons, and raw data inspector

### ⚖️ Policy Simulation Engine
- **25 policy sliders** including tax rate, healthcare, UBI, carbon tax, space program, and more
- Projects GDP, life expectancy, CO₂ emissions, population, and happiness over 10 years
- Baseline alignment warning ensures data consistency across all simulated metrics
- Real-time interactive charts update as you drag sliders

### 🔍 Cross-Country Comparison
- Compare any two nations side-by-side across all 25+ indicators
- Visual polarity cues — better values are highlighted in bold
- Respects the selected Data Year for both countries

### 🏗️ Three-Tier Caching Architecture
- **Redis (Upstash)** → **PostgreSQL (Supabase)** → **External API** waterfall
- Once any user fetches a country's data, it's cached in Redis for instant access
- Persistent fallback in Supabase's `api_cache` table
- Dramatically reduces API calls and improves response times

---

## 🧠 Architecture Overview

`Frontend (React) → Backend (Express) → Redis Cache → PostgreSQL → External APIs`

1. **User Request**: The React frontend requests country data.
2. **Tier 1 (Redis)**: The Express backend checks Upstash Redis. If a hit, data is returned instantly (~50ms).
3. **Tier 2 (PostgreSQL)**: On a Redis miss, it queries the Supabase `api_cache` table. If found, it backfills Redis and returns data (~200ms).
4. **Tier 3 (External API)**: If no database record exists, it fetches from the World Bank/REST Countries external APIs, parses the data, saves to Supabase, sets Redis, and returns it.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Three.js](https://threejs.org/) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | 3D globe rendering |
| [TanStack Query](https://tanstack.com/query) | Async state management & caching |
| [Zustand](https://zustand-demo.pmnd.rs/) | Global state (lightweight) |
| [Recharts](https://recharts.org/) | Charts & data visualization |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Icons |
| [GSAP](https://greensock.com/gsap/) | Scroll animations |

### Backend
| Technology | Purpose |
|---|---|
| [Express 5](https://expressjs.com/) | REST API server |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Supabase](https://supabase.com/) | PostgreSQL database + auth |
| [Upstash Redis](https://upstash.com/) | Serverless Redis caching |
| [Axios](https://axios-http.com/) | HTTP client for external APIs |

### Data Sources
| Source | Data |
|---|---|
| [World Bank API](https://data.worldbank.org/) | 25 economic/social indicators |
| [REST Countries](https://restcountries.com/) | Country metadata, flags, borders |
| [World Happiness Report](https://worldhappiness.report/) | Happiness Index (2009–2024) |
| [Our World in Data](https://ourworldindata.org/) | CO₂ emissions history |

---

## 📁 Project Structure

```
edunation/
├── .gitignore                  # Root gitignore
├── LICENSE                     # MIT License
├── CONTRIBUTING.md             # Contribution guidelines
├── CODE_OF_CONDUCT.md          # Contributor Covenant
├── README.md                   # ← You are here
├── schema.sql                  # Full database schema
├── DATABASE_SCHEMA.MD          # Schema documentation
│
├── backend/
│   ├── .env.example            # Environment variable template
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Express server entry point
│       ├── config/
│       │   ├── supabase.ts     # Supabase client init
│       │   └── redis.ts        # Upstash Redis client init
│       ├── controllers/
│       │   ├── countryController.ts    # Country + indicators endpoints
│       │   └── simulationController.ts # Simulation + rankings endpoints
│       ├── routes/
│       │   ├── index.ts        # Route aggregator
│       │   └── countryRoutes.ts# All API route definitions
│       ├── services/
│       │   ├── worldBank.service.ts    # WB API (Redis→DB→API flow)
│       │   ├── restCountries.service.ts# REST Countries API
│       │   ├── owid.service.ts         # Our World in Data API
│       │   └── geo.service.ts          # GeoJSON service
│       ├── utils/
│       │   └── cache.ts        # Multi-tier caching utility
│       ├── data/
│       │   ├── unified_happiness.json  # Happiness 2009–2024
│       │   └── owid_co2.json           # Pre-cached CO₂ emissions
│       └── scripts/
│           └── ingest.ts               # Full DB population script
│
└── frontend/
    ├── .env.example            # Environment variable template
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    └── src/
        ├── main.tsx            # React entry point
        ├── App.tsx             # Root component + routing
        ├── index.css           # Global styles
        ├── api/
        │   └── index.ts        # Axios API client
        ├── components/
        │   ├── 3d/Globe.tsx            # Three.js globe component
        │   ├── layout/SearchOverlay.tsx # Country search UI
        │   ├── simulation/
        │   │   ├── PolicyPanel.tsx      # 25-slider policy panel
        │   │   └── ProjectionChart.tsx  # Simulation result charts
        │   └── ui/                     # Reusable UI primitives
        ├── pages/
        │   ├── LandingPage.tsx         # Hero + 3D globe landing
        │   ├── AnalyticsDashboard.tsx   # Full analytics view
        │   ├── SimulationDashboard.tsx  # Policy simulation view
        │   └── ReferencePage.tsx        # Reference/about page
        ├── simulation/
        │   └── engine.ts       # Simulation computation engine
        ├── store/
        │   ├── uiStore.ts      # UI state (Zustand)
        │   └── simulationStore.ts # Simulation state (Zustand)
        └── utils/
            └── formatters.ts   # Number/currency formatters
```

---

## ⚡ Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/zaid-ahmed-ansari/EduNation.git
cd EduNation
```

### 2. Start the Full Stack (Docker)

```bash
docker compose up -d --build
```

This starts all required containers (frontend, backend, postgres, redis) and runs schema initialization automatically before the backend starts.

Note: For local Docker development, you do not need to create or edit backend .env.
Development environment variables (including NODE_ENV=development) are already provided in docker-compose.yml.

### 3. (Optional) Seed Data

If you want local Postgres to contain preloaded indicator data:

```bash
docker compose exec backend npx tsx src/scripts/ingest.ts
```

### 4. Open in Browser

Navigate to **http://localhost:5173** and explore the globe! 🌍

### 5. Useful Docker Commands

```bash
# View running services
docker compose ps

# View backend logs
docker compose logs -f backend

# Stop everything
docker compose down

# Stop and remove volumes (fresh DB/Redis)
docker compose down -v
```

---

## 🐳 Docker Services

EduNation runs with these services in [docker-compose.yml](./docker-compose.yml):

- `frontend` (`edunation-frontend`): Vite React app on `http://localhost:5173`
- `backend` (`edunation-backend`): Express API on `http://localhost:5000`
- `postgres` (`edunation-postgres`): PostgreSQL 16 on `localhost:5432`
- `redis` (`edunation-redis`): Redis 7 on `localhost:6379`
- `db-init` (`edunation-db-init`): one-time schema bootstrap job that applies [SCHEMA.SQL](./SCHEMA.SQL) if tables are missing

Schema bootstrap logic lives in [scripts/init-db.sh](./scripts/init-db.sh).

---

## 🟢 Good First Issues

- Improve UI responsiveness on smaller mobile screens
- Add more countries to the simulation baseline dataset
- Enhance React chart performance for large datasets
- Improve caching strategy documentation inside the codebase

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md) before getting started.

1. Fork the project
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

## 🙏 Acknowledgments

- [World Bank Open Data](https://data.worldbank.org/) for economic indicators
- [World Happiness Report](https://worldhappiness.report/) for happiness index data
- [REST Countries](https://restcountries.com/) for country metadata
- [Our World in Data](https://ourworldindata.org/) for environmental data
- [Supabase](https://supabase.com/) for the database platform
- [Upstash](https://upstash.com/) for serverless Redis

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/zaid-ahmed-ansari">Zaid Ahmed Ansari</a>
</p>
<h2 align="center">❤️ Support EduNation</h2>

<p align="center">
  If you find this project useful, you can support its development:
</p>

<h3 align="center">🇮🇳 UPI Support</h3>

<p align="center">
  <img src="https://raw.githubusercontent.com/zaid-ahmed-ansari/EduNation/main/frontend/public/donate.jpeg" width="200" />
</p>



<p align="center">
  <em>Your support helps cover API & server costs and keeps EduNation free for everyone.</em>
</p>

