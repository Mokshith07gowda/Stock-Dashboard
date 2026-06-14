import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import Sparkline from "./Sparkline";
import "./HomePage.css";

const COMPANY = {
  GOOG: "Alphabet Inc.", TSLA: "Tesla Inc.", AMZN: "Amazon.com Inc.",
  META: "Meta Platforms Inc.", NVDA: "NVIDIA Corporation",
  AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", NFLX: "Netflix Inc.",
  BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", DOGE: "Dogecoin",
  JPM: "JPMorgan Chase", DIS: "Walt Disney Co.", AMD: "AMD Inc.",
};

export default function HomePage({ onNavigate }) {
  const { user } = useAuth();
  const { prices, openingPrices, priceHistory, portfolio, sessionStats } = useStocks();

  const allTickers = Object.keys(prices);
  const subs = user?.subscriptions || [];
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "Trader";

  const movers = allTickers
    .map((t) => {
      const p = prices[t];
      const o = openingPrices[t] || p;
      const pct = o ? ((p - o) / o) * 100 : 0;
      return { ticker: t, price: p, pct };
    })
    .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

  const positionsValue = Object.entries(portfolio.positions || {}).reduce(
    (sum, [t, pos]) => sum + (prices[t] || 0) * pos.qty, 0
  );
  const totalValue = portfolio.cash + positionsValue;
  const totalReturn = totalValue - 100000;
  const totalReturnPct = (totalReturn / 100000) * 100;
  const posCount = Object.keys(portfolio.positions || {}).length;

  return (
    <div className="home">
      {}
      <div className="home__welcome">
        <div>
          <h1 className="home__greeting">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName} 👋
          </h1>
          <p className="home__date">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <button className="home__trade-btn" onClick={() => onNavigate("trade")}>
          Start Trading →
        </button>
      </div>

      {}
      <div className="home__stats">
        <div className="home__stat-card">
          <span className="home__stat-label">Portfolio Value</span>
          <span className="home__stat-value">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className={`home__stat-change ${totalReturn >= 0 ? "gain" : "loss"}`}>
            {totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)} ({totalReturnPct.toFixed(2)}%)
          </span>
        </div>
        <div className="home__stat-card">
          <span className="home__stat-label">Available Cash</span>
          <span className="home__stat-value">${portfolio.cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="home__stat-sub">Ready to invest</span>
        </div>
        <div className="home__stat-card">
          <span className="home__stat-label">Active Positions</span>
          <span className="home__stat-value">{posCount}</span>
          <span className="home__stat-sub">{subs.length} watchlist stocks</span>
        </div>
        <div className="home__stat-card">
          <span className="home__stat-label">Market Status</span>
          <span className="home__stat-value" style={{ color: "var(--accent-gain)" }}>● Open</span>
          <span className="home__stat-sub">{allTickers.length} stocks streaming</span>
        </div>
      </div>

      {}
      <div className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">📊 Top Movers</h2>
          <button className="home__see-all" onClick={() => onNavigate("trade")}>View Market →</button>
        </div>
        <div className="home__movers">
          {movers.slice(0, 5).map((m) => {
            const isGain = m.pct >= 0;
            const history = priceHistory[m.ticker] || [];
            return (
              <div className="home__mover" key={m.ticker}>
                <div className="home__mover-left">
                  <span className="home__mover-ticker">{m.ticker}</span>
                  <span className="home__mover-company">{COMPANY[m.ticker]}</span>
                </div>
                <Sparkline data={history.slice(-20)} color={isGain ? "#00D4A8" : "#FF4D6A"} width={80} height={32} />
                <div className="home__mover-right">
                  <span className="home__mover-price">${m.price.toFixed(2)}</span>
                  <span className={`home__mover-pct ${isGain ? "gain" : "loss"}`}>
                    {isGain ? "+" : ""}{m.pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {}
      {subs.length > 0 && (
        <div className="home__section">
          <div className="home__section-header">
            <h2 className="home__section-title">⭐ Your Watchlist</h2>
            <span className="home__watchlist-count">{subs.length} stocks</span>
          </div>
          <div className="home__watchlist-grid">
            {subs.map((ticker) => {
              const p = prices[ticker] || 0;
              const o = openingPrices[ticker] || p;
              const delta = p - o;
              const deltaPct = o ? (delta / o) * 100 : 0;
              const isGain = delta >= 0;
              const history = priceHistory[ticker] || [];
              return (
                <div className="home__wcard" key={ticker}>
                  <div className="home__wcard-top">
                    <span className="home__wcard-ticker">{ticker}</span>
                    <Sparkline data={history.slice(-15)} color={isGain ? "#00D4A8" : "#FF4D6A"} width={60} height={24} />
                  </div>
                  <span className="home__wcard-price">${p.toFixed(2)}</span>
                  <span className={`home__wcard-delta ${isGain ? "gain" : "loss"}`}>
                    {isGain ? "+" : ""}{deltaPct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
