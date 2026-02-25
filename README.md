# MarketLens

LLM-powered sentiment analysis for stock news. Feeds financial headlines into Claude to generate directional signals, per-article scoring, and risk/catalyst extraction for AAPL, NVDA, TSLA, and MSFT.

## Stack

- **Backend**: Python, Flask, PostgreSQL, Anthropic API
- **Frontend**: React, Tailwind CSS, Vite

## How it works

1. News headlines are passed to Claude via the Anthropic API with a structured JSON prompt
2. The model returns sentiment scores (-100 to +100), a directional signal, confidence rating, and per-headline breakdowns
3. Results are persisted to PostgreSQL so sentiment trends can be tracked over time
4. The Flask API exposes `/api/analyze/<ticker>` and `/api/history/<ticker>` endpoints
5. The React frontend calls the API and renders the results

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# fill in ANTHROPIC_API_KEY and DB credentials

# create the database
createdb marketlens
psql -U postgres -d marketlens -f schema.sql

python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

## API

```
POST /api/analyze/:ticker   — run sentiment analysis
GET  /api/history/:ticker   — last 30 results for a ticker
GET  /api/tickers           — list of supported tickers
```

## Notes

The current version uses hardcoded headlines. To use live data, swap the `HEADLINES` dict in `app.py` for a call to a news API (NewsAPI, Alpaca Markets, or Yahoo Finance RSS feeds work well).
