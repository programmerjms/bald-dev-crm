# Bald Dev CRM

A personal CRM built for developers — manage your projects, tasks, time, finances, invoices, and goals, with an AI assistant powered by Claude.

## Features

- **Dashboard** — live metrics, project overview, revenue chart, goal progress
- **Projects** — track projects with budgets, progress, tags, due dates
- **Tasks** — kanban-style task management with priorities and estimates
- **Time Tracker** — log hours per project, see weekly totals and billable estimates
- **Finance** — track income and expenses, category breakdowns
- **Invoices** — generate professional invoices with live preview and print/PDF export
- **Goals** — set and track developer goals with progress bars
- **AI Assistant** — powered by Claude, uses your real CRM data to give personalized advice

## Setup

### 1. Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Visit `https://YOUR_USERNAME.github.io/bald-dev-crm`

### 2. Add Your Anthropic API Key

The AI Assistant requires an Anthropic API key:

1. Get your key at [console.anthropic.com](https://console.anthropic.com)
2. Click the **🔑 API Key** button in the top right of the app
3. Paste your key and click **Save**

Your key is stored in your browser's `localStorage` only — it never leaves your device.

## Files

```
index.html   — app structure and markup
styles.css   — all styles and theming (light + dark mode)
app.js       — all logic, state management, AI integration
README.md    — this file
```

## Data Persistence

All your data is saved in your browser's `localStorage`. It persists between sessions on the same device/browser. To back up your data, open the browser console and run:

```js
console.log(JSON.stringify(localStorage.getItem('baldcrm_state')));
```

## Local Development

No build step required. Just open `index.html` in a browser, or run a local server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## License

MIT — use it however you want.
