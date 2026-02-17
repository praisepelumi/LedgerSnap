# LedgerSnap

AI-powered receipt scanner that extracts structured data from receipt photos using Claude's vision API. Snap a photo, get instant expense tracking.

**[Live Demo](https://ledgersnap-production-9a99.up.railway.app)**

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-22-339933)
![Claude AI](https://img.shields.io/badge/Claude_AI-Haiku_4.5-orange)

## Features

- **AI Receipt Parsing** — Take a photo or upload a receipt image and Claude Haiku 4.5 Vision extracts merchant, date, line items, totals, tax, tip, and payment method
- **Smart Categorization** — AI suggests expense categories with confidence scores; create custom categories on the fly
- **Duplicate Detection** — Automatically flags potential duplicate receipts based on vendor, amount, and date
- **Validation & Review** — Highlights fields that need attention (missing dates, mismatched totals, low confidence)
- **Dashboard** — Monthly spending overview with category breakdowns and receipt counts
- **CSV Export** — Export filtered receipts to CSV for accounting software
- **Google SSO** — Secure authentication with Google Sign-In; each user gets isolated data
- **Mobile Camera** — Capture receipts directly from your phone's camera via HTTPS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, TanStack Query, React Router, Headless UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | SQLite (better-sqlite3) with Drizzle ORM |
| **AI** | Anthropic Claude Haiku 4.5 Vision API |
| **Auth** | Google OAuth 2.0, JWT |
| **Architecture** | Monorepo with npm workspaces (client, server, shared) |

## Project Structure

```
ledgersnap/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios client with JWT interceptor
│   │   ├── components/     # UI components (layout, receipt, category, auth)
│   │   ├── contexts/       # Auth context provider
│   │   ├── hooks/          # Custom hooks (camera, receipts, categories)
│   │   ├── pages/          # Route pages
│   │   └── styles/         # Tailwind globals
│   └── .env                # VITE_GOOGLE_CLIENT_ID
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Environment config
│   │   ├── controllers/    # Route handlers
│   │   ├── db/             # Schema, connection, seed
│   │   ├── middleware/     # Auth, error handling, validation
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic (parsing, receipts, auth)
│   │   └── utils/          # API response helpers, logger
│   └── .env                # API keys, JWT secret, DB path
├── packages/shared/        # Shared types and Zod schemas
├── package.json            # Workspace root
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js 22+** (LTS recommended)
- **npm 10+**
- An [Anthropic API key](https://console.anthropic.com) (Claude Haiku 4.5)
- A [Google Cloud OAuth Client ID](https://console.cloud.google.com/apis/credentials)

### 1. Clone and Install

```bash
git clone https://github.com/praisepelumi/LedgerSnap.git
cd LedgerSnap
npm install
```

### 2. Set Up Environment Variables

**Server** (`server/.env`):
```env
ANTHROPIC_API_KEY=sk-ant-...your-key
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
JWT_SECRET=generate-a-random-64-char-string
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/receipts.db
UPLOAD_DIR=./uploads
```

**Client** (`client/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Configure the **OAuth consent screen** (External, add your email)
4. Create an **OAuth 2.0 Client ID** (Web application)
5. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://localhost:5173`
6. Copy the Client ID into both `.env` files above

### 4. Run

```bash
# Start both server and client
npm run dev

# Or start separately:
npm run dev:server   # Backend on port 3001
npm run dev:client   # Frontend on port 5173
```

Visit **https://localhost:5173** and sign in with Google.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/google` | Google OAuth login |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/receipts/parse` | Upload & parse receipt image |
| `GET` | `/api/receipts` | List receipts (filterable) |
| `GET` | `/api/receipts/:id` | Get receipt detail |
| `PUT` | `/api/receipts/:id` | Update receipt |
| `DELETE` | `/api/receipts/:id` | Delete receipt |
| `PUT` | `/api/receipts/:id/category` | Assign category |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |
| `GET` | `/api/export/csv` | Export receipts as CSV |

All endpoints except `/api/auth/google` and `/api/health` require a Bearer JWT token.

## Deployment

Deployed on [Railway](https://railway.com) as a single service. The Express server serves both the API and the built React frontend in production.

Environment variables needed on Railway:
- `ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_ID`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=3001`
- `DATABASE_PATH=/data/receipts.db`, `UPLOAD_DIR=/data/uploads`
- Attach a **Volume** mounted at `/data` for persistent storage

## How It Works

1. **User uploads a receipt photo** (camera or file picker)
2. **Image is sent to Claude Haiku 4.5 Vision** with a structured prompt
3. **Claude returns JSON** with merchant, date, line items, totals, tax, tip, payment method, and confidence scores
4. **Server validates and stores** the parsed data in SQLite
5. **Duplicate detection** checks against recent receipts
6. **User reviews** flagged items and assigns categories
7. **Dashboard** shows monthly spending breakdown
8. **Export to CSV** for accounting

## License

MIT
