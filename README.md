# SiteIQ

> AI-powered SEO analyzer and rank tracker. Get instant SEO scores, Google rank positions, competitor insights, and actionable recommendations for any website.

🔗 **Live:** [site-iq-nine.vercel.app](https://site-iq-nine.vercel.app)

---

## ✨ Features

### 🔍 AI SEO Analysis
- Enter any URL → get a comprehensive SEO audit in seconds
- Powered by Google Gemini AI
- Returns 4 sub-scores + overall score:
  - **SEO** — On-page SEO quality
  - **Perf** — Performance
  - **ATly** — Accessibility
  - **BP** — Best Practices
- Actionable recommendations for every issue found

### 📊 Google Rank Tracking
- Track keyword rankings for any domain
- Uses Browserbase (cloud Chromium) + Playwright to scrape Google SERPs
- Stores: current position, page number, best-ever position, position change
- Competitor analysis — see who's ranking above you (top 10)
- Daily automated checks via cron (runs at 6:00 AM)
- Manual refresh per keyword

### 🔐 Auth & Plans
- JWT-based authentication
- Free plan with daily scan quota
- Per-user data isolation

### 🎨 UI
- Modern dark theme (light mode supported)
- Responsive design
- Real-time score gauges and history tracking

---

## 🛠 Tech Stack

### Frontend (`client/`)
- **React** + **TypeScript**
- **Vite** — fast build tooling
- **Tailwind CSS** — styling
- **React Router** — routing
- **Axios** — HTTP client
- **Context API** — auth + theme state

### Backend (`server/`)
- **Node.js** + **Express**
- **MongoDB** + **Mongoose** — database
- **JWT** — authentication
- **node-cron** — scheduled rank checks
- **Playwright** + **Browserbase** — headless browser scraping
- **Google Gemini API** — AI analysis

### Infrastructure
- **Vercel** — frontend hosting
- **Render** — backend hosting
- **MongoDB Atlas** — database hosting
- **Browserbase** — cloud browser sessions

---

## 📁 Project Structure

```
SiteIQ/
├── client/                          # Frontend (React + Vite + TypeScript)
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── assets.tsx
│   │   ├── components/
│   │   │   ├── AnalysesCard.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   └── home/
│   │   │       ├── Features.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── Hero.tsx
│   │   │       ├── HowItWorks.tsx
│   │   │       └── Pricing.tsx
│   │   ├── context/
│   │   │   ├── AppContext.tsx       # Auth + axios setup
│   │   │   └── ThemeContext.tsx     # Dark/light theme
│   │   ├── pages/
│   │   │   ├── Analyze.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── History.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── RankDetail.tsx
│   │   │   ├── RankTracker.tsx
│   │   │   └── Report.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vercel.json
│
└── server/                          # Backend (Node + Express)
    ├── config/
    │   └── db.js                    # MongoDB connection
    ├── controllers/
    │   ├── analysisController.js    # SEO analysis logic
    │   ├── authController.js        # Signup/login
    │   └── rankController.js        # Rank tracking logic
    ├── cron/
    │   └── rankTrackingCron.js      # Daily 6 AM rank check
    ├── middleware/
    │   └── auth.js                  # JWT verification
    ├── models/
    │   ├── Analysis.js
    │   ├── User.js
    │   └── keywordTracking.js
    ├── routes/
    │   ├── analysisRoutes.js
    │   ├── authRoutes.js
    │   └── rankRoutes.js
    ├── services/
    │   ├── geminiService.js         # Gemini AI calls
    │   ├── keywordTrackingSevice.js # Rank save logic
    │   ├── rankTrackerService.js    # Google SERP scraper
    │   └── scraperService.js        # Page content scraper
    ├── package.json
    ├── server.js                    # Entry point
    └── vercel.json
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- Browserbase account + API key

### 1. Clone

```bash
git clone https://github.com/imbatman0203/SiteIQ.git
cd SiteIQ
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=any-random-long-string
GEMINI_API_KEY=your-gemini-api-key
BROWSERBASE_API_KEY=your-browserbase-api-key
PORT=8000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

Runs on **http://localhost:8000**

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Runs on **http://localhost:5173**

---

## 🌐 Deployment

### Backend (Render)

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
4. Add environment variables (same keys as `.env` above)
5. Deploy

### Frontend (Vercel)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set:
   - **Framework:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:
   ```
   VITE_BACKEND_URL=https://your-render-backend.onrender.com
   ```
4. Deploy

---

## 📡 API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login, returns JWT |

### Analysis

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analysis/analyze` | Analyze a URL with AI |
| `GET` | `/api/analysis/list` | Get user's past analyses |
| `GET` | `/api/analysis/:id` | Get single analysis |
| `DELETE` | `/api/analysis/:id` | Delete an analysis |

### Rank Tracking

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rank/add` | Add keyword to track |
| `GET` | `/api/rank/list` | List tracked keywords |
| `GET` | `/api/rank/:id` | Get single keyword + history |
| `POST` | `/api/rank/:id/refresh` | Trigger a manual rank check |
| `PUT` | `/api/rank/:id/toggle` | Pause/resume tracking |
| `DELETE` | `/api/rank/:id` | Delete a keyword |

All `/api/analysis/*` and `/api/rank/*` routes require `Authorization: Bearer <token>`.

---

## 🔑 Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `GEMINI_API_KEY` | Google Gemini API key |
| `BROWSERBASE_API_KEY` | Browserbase API key |
| `PORT` | Server port (default: 8000) |
| `NODE_ENV` | `development` or `production` |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Backend API base URL |

---

## ⚠️ Free Tier Notes

- **Render** sleeps services after 15 min of inactivity. First request may take 30–50 seconds to wake up.
- **Browserbase** free tier has monthly session-minute limits. Heavy rank tracking may hit this.
- **Gemini** free tier has rate limits. You may occasionally see `503 UNAVAILABLE` during peak hours.

---

## 📄 License

Private project. All rights reserved.

---

Built with ❤️ by [Tushar Chadha](https://github.com/imbatman0203)