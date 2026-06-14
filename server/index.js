const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const PriceEngine = require("./priceEngine");

const PORT = process.env.PORT || 4000;

const VALID_TICKERS = [
  "GOOG", "TSLA", "AMZN", "META", "NVDA", "AAPL", "MSFT", "NFLX",
  "BTC", "ETH", "SOL", "DOGE",
  "JPM", "DIS", "AMD",
];
const INITIAL_CASH = 100000;

const users = {
  "trader1@demo.com": {
    email: "trader1@demo.com",
    name: "Trader One",
    password: "demo1234",
    subscriptions: ["GOOG", "TSLA", "NVDA"],
  },
  "trader2@demo.com": {
    email: "trader2@demo.com",
    name: "Trader Two",
    password: "demo1234",
    subscriptions: ["AMZN", "META"],
  },
};

const portfolios = {
  "trader1@demo.com": { cash: INITIAL_CASH, positions: {} },
  "trader2@demo.com": { cash: INITIAL_CASH, positions: {} },
};

const tradeHistory = {
  "trader1@demo.com": [],
  "trader2@demo.com": [],
};

function getOrCreateUser(email) {
  if (!users[email]) {
    users[email] = { email, name: "", password: "", subscriptions: [] };
    portfolios[email] = { cash: INITIAL_CASH, positions: {} };
    tradeHistory[email] = [];
  }
  return users[email];
}

const engine = new PriceEngine();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, error: "All fields are required" });

  const normalEmail = email.trim().toLowerCase();
  if (users[normalEmail])
    return res.status(409).json({ success: false, error: "Account already exists. Please sign in." });

  if (password.length < 6)
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });

  users[normalEmail] = { email: normalEmail, name: name.trim(), password, subscriptions: [] };
  portfolios[normalEmail] = { cash: INITIAL_CASH, positions: {} };
  tradeHistory[normalEmail] = [];

  const { password: _pw, ...safeUser } = users[normalEmail];
  res.json({ success: true, user: safeUser });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, error: "Email and password are required" });

  const normalEmail = email.trim().toLowerCase();
  const user = users[normalEmail];
  if (!user)
    return res.status(401).json({ success: false, error: "Account not found. Please sign up first." });

  if (user.password !== password)
    return res.status(401).json({ success: false, error: "Incorrect password" });

  const { password: _pw, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

app.get("/api/stocks", (_req, res) => {
  res.json(engine.getStockDetails());
});

app.get("/api/stocks/history", (_req, res) => {
  res.json(engine.getAllHistory());
});

app.get("/api/stocks/stats", (_req, res) => {
  res.json(engine.getSessionStats());
});

app.get("/api/subscriptions/:email", (req, res) => {
  const user = users[req.params.email];
  if (!user) return res.status(404).json({ error: "user not found" });
  res.json({ subscriptions: user.subscriptions });
});

app.post("/api/subscriptions/:email", (req, res) => {
  const user = users[req.params.email];
  if (!user) return res.status(404).json({ error: "user not found" });
  const { ticker } = req.body;
  if (!ticker || !VALID_TICKERS.includes(ticker))
    return res.status(400).json({ error: "invalid ticker" });
  if (!user.subscriptions.includes(ticker)) user.subscriptions.push(ticker);
  res.json({ subscriptions: user.subscriptions });
});

app.delete("/api/subscriptions/:email/:ticker", (req, res) => {
  const user = users[req.params.email];
  if (!user) return res.status(404).json({ error: "user not found" });
  user.subscriptions = user.subscriptions.filter((t) => t !== req.params.ticker);
  res.json({ subscriptions: user.subscriptions });
});

app.get("/api/portfolio/:email", (req, res) => {
  const pf = portfolios[req.params.email];
  if (!pf) return res.status(404).json({ error: "user not found" });
  res.json(pf);
});

app.post("/api/trade", (req, res) => {
  const { email, ticker, action, quantity } = req.body;

  if (!email || !ticker || !action || !quantity)
    return res.status(400).json({ error: "missing fields" });
  if (!VALID_TICKERS.includes(ticker))
    return res.status(400).json({ error: "invalid ticker" });
  if (!["BUY", "SELL"].includes(action))
    return res.status(400).json({ error: "action must be BUY or SELL" });

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0)
    return res.status(400).json({ error: "quantity must be positive integer" });

  const pf = portfolios[email];
  if (!pf) return res.status(404).json({ error: "user not found" });

  const currentPrice = engine.getSnapshot()[ticker];
  const total = parseFloat((currentPrice * qty).toFixed(2));

  if (action === "BUY") {
    if (total > pf.cash)
      return res.status(400).json({ error: "insufficient funds" });
    pf.cash = parseFloat((pf.cash - total).toFixed(2));
    if (!pf.positions[ticker]) pf.positions[ticker] = { qty: 0, avgCost: 0 };
    const pos = pf.positions[ticker];
    const totalCostBasis = pos.avgCost * pos.qty + total;
    pos.qty += qty;
    pos.avgCost = parseFloat((totalCostBasis / pos.qty).toFixed(2));
  } else {
    const pos = pf.positions[ticker];
    if (!pos || pos.qty < qty)
      return res.status(400).json({ error: "insufficient shares" });
    pf.cash = parseFloat((pf.cash + total).toFixed(2));
    pos.qty -= qty;
    if (pos.qty === 0) delete pf.positions[ticker];
  }

  const trade = {
    id: Date.now(),
    ticker,
    action,
    quantity: qty,
    price: currentPrice,
    total,
    timestamp: new Date().toISOString(),
  };

  if (!tradeHistory[email]) tradeHistory[email] = [];
  tradeHistory[email].unshift(trade);

  res.json({ trade, portfolio: pf });
});

app.get("/api/trades/:email", (req, res) => {
  const trades = tradeHistory[req.params.email];
  if (!trades) return res.status(404).json({ error: "user not found" });
  res.json({ trades });
});

app.post("/api/wallet/deposit", (req, res) => {
  const { email, amount } = req.body;
  if (!email || !amount) return res.status(400).json({ error: "missing fields" });
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: "amount must be positive" });
  if (amt > 1000000) return res.status(400).json({ error: "maximum deposit is $1,000,000" });
  const pf = portfolios[email];
  if (!pf) return res.status(404).json({ error: "user not found" });
  pf.cash = parseFloat((pf.cash + amt).toFixed(2));

  if (!tradeHistory[email]) tradeHistory[email] = [];
  tradeHistory[email].unshift({
    id: Date.now(),
    ticker: "WALLET",
    action: "DEPOSIT",
    quantity: 1,
    price: amt,
    total: amt,
    timestamp: new Date().toISOString(),
  });

  res.json({ cash: pf.cash, portfolio: pf });
});

app.post("/api/wallet/withdraw", (req, res) => {
  const { email, amount } = req.body;
  if (!email || !amount) return res.status(400).json({ error: "missing fields" });
  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: "amount must be positive" });
  const pf = portfolios[email];
  if (!pf) return res.status(404).json({ error: "user not found" });
  if (amt > pf.cash) return res.status(400).json({ error: "insufficient funds" });
  pf.cash = parseFloat((pf.cash - amt).toFixed(2));

  if (!tradeHistory[email]) tradeHistory[email] = [];
  tradeHistory[email].unshift({
    id: Date.now(),
    ticker: "WALLET",
    action: "WITHDRAW",
    quantity: 1,
    price: amt,
    total: amt,
    timestamp: new Date().toISOString(),
  });

  res.json({ cash: pf.cash, portfolio: pf });
});

// Serve static client files in production
const path = require("path");
app.use(express.static(path.join(__dirname, "../client/dist")));

// Fallback to client-side router for non-API routes
app.get("*", (req, res) => {
  // If request is for /api/*, don't serve index.html (let it return 404)
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("[WS] client connected  — total:", wss.clients.size);

  ws.send(
    JSON.stringify({
      type: "SNAPSHOT",
      prices: engine.getSnapshot(),
      stats: engine.getSessionStats(),
      history: engine.getAllHistory(),
    })
  );

  ws.on("close", () =>
    console.log("[WS] client disconnected — total:", wss.clients.size)
  );
  ws.on("error", (err) => console.error("[WS] error:", err.message));
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const c of wss.clients) {
    if (c.readyState === 1) c.send(msg);
  }
}

engine.on("tick", (prices) => {
  broadcast({ type: "PRICE_UPDATE", prices, stats: engine.getSessionStats() });
});

engine.on("alerts", (alerts) => {
  broadcast({ type: "ALERTS", alerts });
});

engine.on("news", (article) => {
  broadcast({ type: "NEWS", article });
});

engine.start();
server.listen(PORT, () =>
  console.log(`🚀  Server listening on http://localhost:${PORT}`)
);
