# Xendit Dashboard

Open-source admin dashboard for routing [Xendit](https://www.xendit.co/) webhooks to multiple downstream apps, tracking transactions, and managing payment ops from one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Google OAuth** login with optional email whitelist
- **Multi-app routing** — register apps with a unique prefix and per-app webhook URL
- **Central Xendit webhook** — one URL in the Xendit dashboard; events are forwarded by `external_id` prefix
- **Transaction records** — stored per app with status and payload
- **Analytics overview** — totals and breakdown by app
- **Dashboard UI** — shadcn sidebar, JetBrains Mono, flat minimal styling

## How routing works

1. Set your **main webhook URL** in Xendit to `https://<your-host>/api/xendit/webhook`
2. Create apps in the dashboard, each with a **prefix** (e.g. `remit`) and **webhook URL**
3. When creating Xendit payments/invoices, set `external_id` to include the prefix:
   - `remit_order_123`
   - `remit-order-456`
4. Incoming webhooks are validated, forwarded to the matching app's webhook URL, and recorded in the database

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **API**: tRPC 11
- **Database**: PostgreSQL + Prisma 7
- **Auth**: better-auth (Google OAuth)
- **UI**: shadcn/ui (Base UI), Tailwind CSS 4

## Getting started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database
- Google OAuth credentials
- (Optional) ngrok or similar for local webhook testing

### 1. Clone and install

```bash
git clone https://github.com/devswithme/xendit-dashboard.git
cd xendit-dashboard
bun install   # or npm install / pnpm install
```

### 2. Environment

```bash
cp .env.example .env
```

Fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (runtime) |
| `DIRECT_URL` | PostgreSQL direct URL (migrations) |
| `BETTER_AUTH_SECRET` | Random secret for sessions |
| `BETTER_AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### 3. Database

```bash
bunx prisma generate
bunx prisma db push
```

### 4. Run

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, then:

1. Go to **Settings** — set Xendit webhook token and email whitelist
2. Go to **Apps** — create apps with prefix + webhook URL
3. Register `https://<your-host>/api/xendit/webhook` in the Xendit dashboard

### Local webhooks with ngrok

```bash
ngrok http 3000
```

Use the ngrok HTTPS URL + `/api/xendit/webhook` as your Xendit callback URL.

## API routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/xendit/webhook` | Main Xendit webhook receiver |
| `POST` | `/api/apps/:prefix/transactions` | Create a transaction record for an app |
| `*` | `/api/trpc/*` | tRPC API (dashboard) |
| `*` | `/api/auth/*` | better-auth endpoints |

## Project structure

```
src/
├── app/
│   ├── api/           # Webhook + tRPC + auth routes
│   └── dashboard/     # Protected admin UI
├── components/        # UI + dashboard components
└── lib/
    ├── trpc/          # tRPC routers
    ├── xendit-webhook.ts
    └── settings.ts
prisma/
└── schema.prisma
```

## Scripts

```bash
bun dev          # Start dev server
bun build        # Production build
bun start        # Start production server
bun lint         # ESLint
bunx prisma studio  # Browse database
```

## Contributing

Contributions are welcome. Please open an issue or pull request.

## License

[MIT](LICENSE)
