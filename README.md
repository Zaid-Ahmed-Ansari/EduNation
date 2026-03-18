<h1 align="center">🌍 EduNation</h1>
<p align="center">
  <img src="frontend/src/assets/hero.png" alt="EduNation Banner" width="800"/>
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

## ✨ Feature Preview

### 3D Interactive Globe
![Globe](frontend/src/assets/globe.png)
*Click any country to explore*

### Analytics Dashboard
![Analytics](frontend/src/assets/analytics.png)
*25+ real-time indicators*

### Policy Simulation
![Simulation](frontend/src/assets/simulation.png)
*Adjust 25 policy sliders*

### Cross-Country Comparison
![Compare](frontend/src/assets/compare.png)
*Side-by-side nation analysis*

---

## 🚀 Features

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
├── SCHEMA.SQL                  # Full database schema
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
│       │   └── unified_happiness.json  # Happiness 2009–2024
│       └── scripts/
│           ├── ingest.ts       # Full DB population script
│           ├── unify-happiness.ts      # Happiness data unifier
│           └── fetch-missing-happiness.ts # 2021-23 data fetcher
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

- **Node.js** ≥ 18
- **npm** ≥ 9
- A free [Supabase](https://supabase.com) project
- *(Optional)* A free [Upstash Redis](https://upstash.com) database

### 1. Clone the Repository

```bash
git clone https://github.com/Zaid-Ahmed-Ansari/EduNation.git
cd EduNation
```

### 2. Set Up the Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the **SQL Editor** and run the contents of [`SCHEMA.SQL`](./SCHEMA.SQL)
3. Copy your project **URL** and **anon key** from Settings → API

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your real credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Upstash Redis for caching
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your_token_here
```

Install dependencies and start:

```bash
npm install
npm run dev        # Starts on http://localhost:5000
```

### 4. Populate the Database

```bash
npx tsx src/scripts/ingest.ts
```

This ingests regions, countries, 25 indicators (for 30 countries), and simulation baselines from the World Bank & REST Countries APIs. Takes ~5 minutes.

### 5. Configure Frontend

```bash
cd ../frontend
cp .env.example .env    # Default values usually work
npm install
npm run dev             # Starts on http://localhost:5173
```

### 6. Open in Browser

Navigate to **http://localhost:5173** and explore the globe! 🌍

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `PORT` | No | Server port (default: `5000`) |
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Your Supabase public anon key |
| `REDIS_URL` | No | Upstash Redis REST URL |
| `REDIS_TOKEN` | No | Upstash Redis REST token |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | No | Backend API URL (default: `http://localhost:5000/api`) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/countries` | List all countries (simplified) |
| `GET` | `/api/country/:code` | Full country details by ISO3 |
| `GET` | `/api/country/:code/neighbours` | Bordering countries |
| `GET` | `/api/country/:code/indicators` | All 25+ indicators + happiness |
| `GET` | `/api/country/:code/analytics` | CO₂ time-series data |
| `GET` | `/api/simulation/baseline/:code` | Simulation baseline data |
| `GET` | `/api/simulation/rankings` | Global country rankings |
| `GET` | `/api/indicators/:code/history` | Indicator time-series from DB |
| `GET` | `/api/geo` | GeoJSON geometry data |

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
  Built with ❤️ by <a href="https://github.com/Zaid-Ahmed-Ansari">Zaid Ahmed Ansari</a>
</p>
