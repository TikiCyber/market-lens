-- run this once to set up the database
-- psql -U postgres -d marketlens -f schema.sql

CREATE TABLE IF NOT EXISTS sentiment_results (
    id          SERIAL PRIMARY KEY,
    ticker      VARCHAR(10) NOT NULL,
    score       INTEGER NOT NULL,
    signal      VARCHAR(20) NOT NULL,
    confidence  INTEGER NOT NULL,
    result_json JSONB,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticker_created ON sentiment_results (ticker, created_at DESC);
