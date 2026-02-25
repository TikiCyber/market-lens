from flask import Flask, jsonify, request
from flask_cors import CORS
import anthropic
import psycopg2
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# sample headlines — swap these out for a real news API (NewsAPI, Alpaca, etc.)
HEADLINES = {
    "AAPL": [
        "Apple reports record iPhone sales in emerging markets, beats Q3 estimates",
        "Apple faces EU antitrust probe over App Store payment practices",
        "Apple Vision Pro shipments disappoint analysts in first full quarter",
        "Warren Buffett reduces Berkshire Hathaway's Apple stake by 13%",
        "Apple announces $110B buyback, largest in company history",
        "Supply chain disruptions in Taiwan pose risk to Apple holiday lineup",
    ],
    "NVDA": [
        "Nvidia Blackwell chip demand exceeds supply, customers face long waits",
        "Nvidia CEO Jensen Huang: AI infrastructure buildout is just beginning",
        "China export restrictions threaten 25% of Nvidia data center revenue",
        "Microsoft commits to $10B in Nvidia H200 cluster purchases through 2026",
        "Nvidia stock hits all-time high as AI capex shows no signs of slowing",
        "AMD gains traction with hyperscalers, pressuring Nvidia GPU monopoly",
    ],
    "TSLA": [
        "Tesla Q2 deliveries fall short of Wall Street expectations for third quarter",
        "Elon Musk confirms Tesla robotaxi launch in Austin Texas this summer",
        "Tesla cuts prices again in China as BYD competition intensifies",
        "Tesla Full Self-Driving Version 13 shows dramatic improvement in safety metrics",
        "Tesla Energy division posts record quarter, Megapack backlog grows 3x",
        "Analyst downgrades Tesla citing CEO distraction from DOGE responsibilities",
    ],
    "MSFT": [
        "Microsoft Copilot reaches 1M paid enterprise seats ahead of schedule",
        "Microsoft Azure growth reaccelerates to 31%, topping cloud rival AWS",
        "Microsoft faces FTC scrutiny over Activision integration and cloud gaming",
        "OpenAI partnership deepens as Microsoft bakes GPT-5 into Office suite",
        "Microsoft beats Q4 estimates on strong cloud and AI subscription growth",
        "Microsoft Teams loses market share to Slack after controversial UI overhaul",
    ],
}

VALID_TICKERS = list(HEADLINES.keys())


def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "marketlens"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
    )


def save_result(ticker, result):
    """Persist analysis result to postgres so we can track sentiment over time."""
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO sentiment_results (ticker, score, signal, confidence, result_json, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                ticker,
                result["sentiment_score"],
                result["signal"],
                result["confidence"],
                json.dumps(result),
                datetime.utcnow(),
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        # don't blow up the request if db is down
        print(f"[warn] db write failed: {e}")


def build_prompt(ticker, headlines):
    formatted = "\n".join(f"{i+1}. {h}" for i, h in enumerate(headlines))
    return f"""You are a financial sentiment analysis engine. Analyze these {ticker} news headlines.

Headlines:
{formatted}

Return ONLY valid JSON with this structure (no markdown, no explanation):
{{
  "overall_sentiment": "Bullish" | "Bearish" | "Neutral",
  "sentiment_score": <integer -100 to 100>,
  "confidence": <integer 0 to 100>,
  "signal": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
  "headlines": [
    {{
      "text": "<headline>",
      "sentiment": "Positive" | "Negative" | "Neutral",
      "score": <integer -100 to 100>,
      "impact": "High" | "Medium" | "Low",
      "reasoning": "<one sentence>"
    }}
  ],
  "key_risks": ["<risk>", "<risk>"],
  "key_catalysts": ["<catalyst>", "<catalyst>"],
  "summary": "<2 sentence analyst-style summary>"
}}"""


@app.route("/api/analyze/<ticker>", methods=["POST"])
def analyze(ticker):
    ticker = ticker.upper()
    if ticker not in VALID_TICKERS:
        return jsonify({"error": f"Unsupported ticker. Valid options: {VALID_TICKERS}"}), 400

    headlines = HEADLINES[ticker]

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": build_prompt(ticker, headlines)}],
        )

        raw = response.content[0].text.strip()
        # strip markdown fences if model adds them anyway
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())

    except json.JSONDecodeError as e:
        return jsonify({"error": "Failed to parse LLM response", "detail": str(e)}), 500
    except anthropic.APIError as e:
        return jsonify({"error": "Anthropic API error", "detail": str(e)}), 502

    save_result(ticker, result)
    return jsonify(result)


@app.route("/api/history/<ticker>", methods=["GET"])
def history(ticker):
    """Return last 30 sentiment scores for a ticker — useful for charting trends."""
    ticker = ticker.upper()
    if ticker not in VALID_TICKERS:
        return jsonify({"error": "Invalid ticker"}), 400

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT score, signal, confidence, created_at
            FROM sentiment_results
            WHERE ticker = %s
            ORDER BY created_at DESC
            LIMIT 30
            """,
            (ticker,),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        data = [
            {"score": r[0], "signal": r[1], "confidence": r[2], "date": r[3].isoformat()}
            for r in rows
        ]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/tickers", methods=["GET"])
def tickers():
    return jsonify(VALID_TICKERS)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
