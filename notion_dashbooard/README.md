# Notion Revision Dashboard

Dark Notion-style dashboard that auto-discovers databases shared with your integration, tracks revision status / next review dates, and supports adding real Notion columns.

## Setup

1. Put your integration token in `.env.local`:

```
NOTION_TOKEN=ntn_...
```

2. In Notion, open each database → **Share** → invite the integration.

3. Run (use portable Node if needed):

```bash
export PATH="/c/Users/sameer20.khan/Downloads/node-v24.12.0-win-x64/node-v24.12.0-win-x64:$PATH"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Note: `next.config.ts` disables TLS cert verification for local corporate proxy environments. Do not deploy that setting to production as-is.

## Features

- **Databases** — list every data source shared with the integration
- **Per-database table** — edit Status and Next review; **New column** creates a Notion property
- **To Revise** — combined view of items that are not Done or whose Next review is due
- Tracking properties (`Status` / `Next review`, or existing aliases like `stat`) are ensured automatically
