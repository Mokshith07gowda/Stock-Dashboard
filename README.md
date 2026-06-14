# TradeDesk — Stock Broker Client Web Dashboard

A real-time stock broker client web dashboard that allows users to subscribe to supported stocks, view live price updates via WebSocket, execute trades (buy/sell), manage a wallet, and maintain personal watchlists — all without refreshing the page. The app supports multiple concurrent users with independent dashboards updating asynchronously.

**Live Demo:** [https://stock-dashboard-psev.onrender.com](https://stock-dashboard-psev.onrender.com)

## Tech Stack

| Layer    | Technology                        |
| -------- | --------------------------------- |
| Frontend | React 18 + Vite 5, plain CSS     |
| Backend  | Node.js + Express 4 + WebSocket  |
| State    | In-memory (no database)           |

## Features

- **Email-based Authentication** — Sign up / Sign in with email and password
- **15 Supported Assets** — Stocks (GOOG, TSLA, AMZN, META, NVDA, AAPL, MSFT, NFLX, JPM, DIS, AMD) and Crypto (BTC, ETH, SOL, DOGE)
- **Live Price Feed** — All 15 assets update every second via WebSocket, no page refresh needed
- **Subscribe / Unsubscribe** — Subscribe to any stock from the Trade section to add it to your personal watchlist
- **Multi-User Support** — At least two users can be logged in simultaneously in separate browser tabs, each with independent subscriptions, and both dashboards update asynchronously in real-time
- **Personal Watchlist** — View only your subscribed stocks with sparkline charts and detailed stats
- **Buy / Sell Trading** — Execute trades from the Trade section or Stock detail modal with real-time portfolio updates
- **Wallet System** — Deposit and withdraw funds with quick-amount presets and full transaction history
- **Portfolio Tracking** — View total portfolio value, available cash, active positions, and P&L
- **Sparkline Charts** — Canvas-drawn price history charts for each stock
- **Session Persistence** — Login and subscriptions survive browser refresh via localStorage
- **Fully Responsive** — Works on mobile, tablet, and laptop without any issues
- **Dark Financial Terminal UI** — Professional design with Inter + JetBrains Mono fonts
- **Live Market News** — Auto-generated market news feed
- **Ticker Tape** — Scrolling price ticker at the top of the dashboard

## Setup & Run

### 1. Start the backend

```bash
cd server
npm install
npm run dev
```

→ Server runs on **http://localhost:4000**

### 2. Start the frontend

```bash
cd client
npm install
npm run dev
```

→ App runs on **http://localhost:5173**

## Test Multi-User Real-Time Updates

1. Open **http://localhost:5173** in **Tab 1** → Sign in as `trader1@demo.com` (password: `demo1234`)
2. Open **http://localhost:5173** in **Tab 2** → Sign in as `trader2@demo.com` (password: `demo1234`)
3. Both dashboards update live every second via WebSocket
4. Tab 1 default watchlist: **GOOG, TSLA, NVDA**
5. Tab 2 default watchlist: **AMZN, META**
6. Subscribe / Unsubscribe from either tab — watchlists update independently
7. Execute trades or deposit funds — each user's portfolio is isolated

## Pre-seeded Demo Users

| Email              | Password   | Default Watchlist   |
| ------------------ | ---------- | ------------------- |
| trader1@demo.com   | demo1234   | GOOG, TSLA, NVDA    |
| trader2@demo.com   | demo1234   | AMZN, META          |

New users can sign up via the landing page with any email and password (min 6 characters). Each new user starts with $100,000 cash.

## Supported Assets

| Ticker | Name               | Type   |
| ------ | ------------------ | ------ |
| GOOG   | Alphabet Inc.      | Stock  |
| TSLA   | Tesla Inc.         | Stock  |
| AMZN   | Amazon.com Inc.    | Stock  |
| META   | Meta Platforms     | Stock  |
| NVDA   | NVIDIA Corporation | Stock  |
| AAPL   | Apple Inc.         | Stock  |
| MSFT   | Microsoft Corp.    | Stock  |
| NFLX   | Netflix Inc.       | Stock  |
| JPM    | JPMorgan Chase     | Stock  |
| DIS    | Walt Disney Co.    | Stock  |
| AMD    | AMD Inc.           | Stock  |
| BTC    | Bitcoin            | Crypto |
| ETH    | Ethereum           | Crypto |
| SOL    | Solana             | Crypto |
| DOGE   | Dogecoin           | Crypto |

## API Reference

| Method | Endpoint                            | Description                    |
| ------ | ----------------------------------- | ------------------------------ |
| POST   | `/api/signup`                       | Register a new user            |
| POST   | `/api/login`                        | Sign in with email & password  |
| GET    | `/api/stocks`                       | All 15 assets + current prices |
| GET    | `/api/stocks/history`               | Full price history             |
| GET    | `/api/stocks/stats`                 | Session high/low/volume stats  |
| GET    | `/api/subscriptions/:email`         | User's watchlist               |
| POST   | `/api/subscriptions/:email`         | Subscribe to a ticker          |
| DELETE | `/api/subscriptions/:email/:ticker` | Unsubscribe from a ticker      |
| GET    | `/api/portfolio/:email`             | User's portfolio               |
| POST   | `/api/trade`                        | Execute a buy/sell trade       |
| GET    | `/api/trades/:email`                | User's trade history           |
| POST   | `/api/wallet/deposit`               | Deposit funds                  |
| POST   | `/api/wallet/withdraw`              | Withdraw funds                 |

## WebSocket

Connect to `ws://localhost:4000`. Messages:

```json
{ "type": "SNAPSHOT",      "prices": { "GOOG": 175.24, ... }, "stats": {...}, "history": {...} }
{ "type": "PRICE_UPDATE",  "prices": { "GOOG": 176.10, ... }, "stats": {...} }
{ "type": "ALERTS",        "alerts": [{ "ticker": "GOOG", "changePct": 5.2, "price": 184.5 }] }
{ "type": "NEWS",          "article": { "ticker": "TSLA", "headline": "...", "time": "..." } }
```

## Project Structure

```
stock-dashboard/
├── server/
│   ├── package.json
│   ├── index.js              # Express + WebSocket server, REST API routes
│   └── priceEngine.js        # Stock price simulator with EventEmitter
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css            # Global styles, CSS variables, animations
│       ├── context/
│       │   ├── AuthContext.jsx # Authentication state (login/signup/logout)
│       │   └── StockContext.jsx# WebSocket, prices, portfolio, trades, wallet
│       └── components/
│           ├── Login.jsx / Login.css           # Landing page + auth modal
│           ├── Navbar.jsx / Navbar.css         # Top navigation bar
│           ├── Sidebar.jsx / Sidebar.css       # Side/bottom navigation
│           ├── Dashboard.jsx / Dashboard.css   # Main layout + page routing
│           ├── HomePage.jsx / HomePage.css     # Home dashboard overview
│           ├── MarketPanel.jsx / MarketPanel.css # Trade section (market table)
│           ├── StockModal.jsx / StockModal.css # Stock detail + trade modal
│           ├── PortfolioPage.jsx / PortfolioPage.css # Portfolio & trade history
│           ├── WatchlistPage.jsx / WatchlistPage.css # Subscribed stocks
│           ├── WalletPage.jsx / WalletPage.css # Deposit/withdraw funds
│           ├── NewsPage.jsx / NewsPage.css     # Market news feed
│           ├── TradePage.jsx / TradePage.css   # Trade page wrapper
│           ├── StockCard.jsx / StockCard.css   # Individual stock card
│           ├── Sparkline.jsx                   # Canvas sparkline chart
│           ├── TickerTape.jsx / TickerTape.css # Scrolling price ticker
│           ├── SearchBar.jsx / SearchBar.css   # Market search filter
│           ├── PortfolioBar.jsx / PortfolioBar.css # Portfolio summary bar
│           ├── NewsFeed.jsx / NewsFeed.css     # News feed widget
│           ├── ThemeToggle.jsx                 # Dark/light theme toggle
│           ├── ToastManager.jsx / Toast.css    # Toast notifications
│           └── ... 
└── README.md
```
