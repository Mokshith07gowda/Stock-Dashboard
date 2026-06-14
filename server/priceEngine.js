const { EventEmitter } = require("events");

const STOCKS = [
  { ticker: "GOOG", company: "Alphabet Inc.", price: 175.24 },
  { ticker: "TSLA", company: "Tesla Inc.", price: 248.5 },
  { ticker: "AMZN", company: "Amazon.com Inc.", price: 192.1 },
  { ticker: "META", company: "Meta Platforms Inc.", price: 527.8 },
  { ticker: "NVDA", company: "NVIDIA Corporation", price: 132.45 },
  { ticker: "AAPL", company: "Apple Inc.", price: 198.11 },
  { ticker: "MSFT", company: "Microsoft Corp.", price: 442.57 },
  { ticker: "NFLX", company: "Netflix Inc.", price: 685.2 },
  { ticker: "BTC", company: "Bitcoin", price: 68420.0 },
  { ticker: "ETH", company: "Ethereum", price: 3842.5 },
  { ticker: "SOL", company: "Solana", price: 172.3 },
  { ticker: "DOGE", company: "Dogecoin", price: 0.162 },
  { ticker: "JPM", company: "JPMorgan Chase", price: 205.67 },
  { ticker: "DIS", company: "Walt Disney Co.", price: 112.84 },
  { ticker: "AMD", company: "AMD Inc.", price: 164.32 },
];

const NEWS_TEMPLATES = {
  gain: [
    "{company} shares surge after strong quarterly earnings beat",
    "{ticker} rallies {pct}% on institutional buying pressure",
    "Analysts upgrade {company} citing robust growth outlook",
    "{company} jumps on news of strategic partnership deal",
    "{ticker} hits session highs amid bullish market sentiment",
    "Breaking: {company} announces $2B share buyback program",
    "{ticker} climbs as sector rotation favours big tech",
    "Options activity surges in {ticker} calls ahead of catalyst",
  ],
  loss: [
    "{company} drops on weaker-than-expected guidance",
    "{ticker} slides {pct}% as profit-taking kicks in",
    "Bearish note: Analyst downgrades {company} to Hold",
    "{company} dips on macroeconomic headwind concerns",
    "{ticker} pulls back from overbought technical levels",
    "Sell-off deepens in {ticker} after insider stock sale",
    "{company} falls as supply chain concerns resurface",
    "{ticker} retreats amid broader market volatility",
  ],
  neutral: [
    "Market watch: {ticker} consolidates near key support level",
    "{company} trading flat as investors await Fed decision",
    "Volume spike detected in {ticker} — no clear catalyst yet",
    "Sector analysis: Where does {company} fit in 2026?",
  ],
};

class PriceEngine extends EventEmitter {
  constructor() {
    super();
    this._stocks = STOCKS.map((s) => ({
      ...s,
      open: s.price,
      high: s.price,
      low: s.price,
    }));
    this._history = {};
    this._interval = null;
    this._tickCount = 0;
    this._newsInterval = null;

    for (const s of this._stocks) {
      this._history[s.ticker] = [s.price];
    }
  }

  start(ms = 1000) {
    if (this._interval) return;
    this._interval = setInterval(() => this._tick(), ms);
    this._scheduleNews();
    console.log(`[PriceEngine] ticking every ${ms}ms`);
  }

  stop() {
    clearInterval(this._interval);
    clearTimeout(this._newsInterval);
    this._interval = null;
  }

  getSnapshot() {
    const snap = {};
    for (const s of this._stocks) {
      snap[s.ticker] = parseFloat(s.price.toFixed(2));
    }
    return snap;
  }

  getStockList() {
    return this._stocks.map((s) => ({ ticker: s.ticker, company: s.company }));
  }

  getStockDetails() {
    return this._stocks.map((s) => ({
      ticker: s.ticker,
      company: s.company,
      price: parseFloat(s.price.toFixed(2)),
      open: parseFloat(s.open.toFixed(2)),
      high: parseFloat(s.high.toFixed(2)),
      low: parseFloat(s.low.toFixed(2)),
    }));
  }

  getHistory(ticker) {
    return (this._history[ticker] || []).map((p) => parseFloat(p.toFixed(2)));
  }

  getAllHistory() {
    const out = {};
    for (const t of Object.keys(this._history)) {
      out[t] = this._history[t].map((p) => parseFloat(p.toFixed(2)));
    }
    return out;
  }

  getSessionStats() {
    const stats = {};
    for (const s of this._stocks) {
      stats[s.ticker] = {
        open: parseFloat(s.open.toFixed(2)),
        high: parseFloat(s.high.toFixed(2)),
        low: parseFloat(s.low.toFixed(2)),
        current: parseFloat(s.price.toFixed(2)),
      };
    }
    return stats;
  }

  

  _tick() {
    this._tickCount++;
    const alerts = [];

    for (const stock of this._stocks) {
      const prevPrice = stock.price;
      const direction = Math.random() < 0.5 ? -1 : 1;
      const pct = (0.5 + Math.random() * 2.0) / 100;
      stock.price *= 1 + direction * pct;

      if (stock.price > stock.high) stock.high = stock.price;
      if (stock.price < stock.low) stock.low = stock.price;

      this._history[stock.ticker].push(stock.price);

      const changePct = ((stock.price - prevPrice) / prevPrice) * 100;
      if (Math.abs(changePct) >= 2) {
        alerts.push({
          ticker: stock.ticker,
          company: stock.company,
          changePct: parseFloat(changePct.toFixed(2)),
          price: parseFloat(stock.price.toFixed(2)),
        });
      }
    }

    this.emit("tick", this.getSnapshot());

    if (alerts.length > 0) {
      this.emit("alerts", alerts);
    }
  }

  _scheduleNews() {
    const delay = 8000 + Math.random() * 12000;
    this._newsInterval = setTimeout(() => {
      this._generateNews();
      this._scheduleNews();
    }, delay);
  }

  _generateNews() {
    const stock = this._stocks[Math.floor(Math.random() * this._stocks.length)];
    const changePct = ((stock.price - stock.open) / stock.open) * 100;
    const absPct = Math.abs(changePct).toFixed(1);

    let pool;
    if (changePct > 0.5) pool = NEWS_TEMPLATES.gain;
    else if (changePct < -0.5) pool = NEWS_TEMPLATES.loss;
    else pool = NEWS_TEMPLATES.neutral;

    const template = pool[Math.floor(Math.random() * pool.length)];
    const headline = template
      .replace("{company}", stock.company)
      .replace("{ticker}", stock.ticker)
      .replace("{pct}", absPct);

    const article = {
      id: Date.now(),
      headline,
      ticker: stock.ticker,
      sentiment: changePct > 0.5 ? "gain" : changePct < -0.5 ? "loss" : "neutral",
      timestamp: new Date().toISOString(),
    };

    this.emit("news", article);
  }
}

module.exports = PriceEngine;
