import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import Sparkline from "./Sparkline";
import "./WatchlistPage.css";

const COMPANY = {
  GOOG: "Alphabet Inc.", TSLA: "Tesla Inc.", AMZN: "Amazon.com Inc.",
  META: "Meta Platforms Inc.", NVDA: "NVIDIA Corporation",
  AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", NFLX: "Netflix Inc.",
  BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", DOGE: "Dogecoin",
  JPM: "JPMorgan Chase", DIS: "Walt Disney Co.", AMD: "AMD Inc.",
};

export default function WatchlistPage({ onNavigate }) {
  const { user } = useAuth();
  const { prices, openingPrices, priceHistory, sessionStats, unsubscribe } = useStocks();
  const subs = user?.subscriptions || [];

  return (
    <div className="wlpage">
      <div className="wlpage__header">
        <div>
          <h1 className="wlpage__title">Watchlist</h1>
          <p className="wlpage__subtitle">
            {subs.length} subscribed stock{subs.length !== 1 ? "s" : ""} — prices update in real-time
          </p>
        </div>
        <button className="wlpage__add-btn" onClick={() => onNavigate("trade")}>
          + Add Stocks
        </button>
      </div>

      {subs.length === 0 ? (
        <div className="wlpage__empty">
          <div className="wlpage__empty-icon">📋</div>
          <h2 className="wlpage__empty-title">Your watchlist is empty</h2>
          <p className="wlpage__empty-desc">
            Go to the <strong>Trade</strong> page and click <strong>Subscribe</strong> on any stock to add it to your watchlist.
          </p>
          <button className="wlpage__empty-btn" onClick={() => onNavigate("trade")}>
            Browse Stocks →
          </button>
        </div>
      ) : (
        <div className="wlpage__grid">
          {subs.map((ticker) => {
            const p = prices[ticker] || 0;
            const o = openingPrices[ticker] || p;
            const delta = p - o;
            const deltaPct = o ? (delta / o) * 100 : 0;
            const isGain = delta >= 0;
            const history = priceHistory[ticker] || [];
            const stats = sessionStats[ticker] || {};

            return (
              <div className={`wlcard ${isGain ? "wlcard--gain" : "wlcard--loss"}`} key={ticker}>
                <div className="wlcard__top">
                  <div className="wlcard__info">
                    <span className="wlcard__ticker">{ticker}</span>
                    <span className="wlcard__company">{COMPANY[ticker] || ticker}</span>
                  </div>
                  <button
                    className="wlcard__unsub"
                    onClick={() => unsubscribe(user.email, ticker)}
                    title="Unsubscribe"
                  >
                    Unsubscribe
                  </button>
                </div>

                <div className="wlcard__chart">
                  <Sparkline data={history.slice(-30)} color={isGain ? "#00D4A8" : "#FF4D6A"} width={240} height={50} />
                </div>

                <div className="wlcard__bottom">
                  <span className="wlcard__price">${p.toFixed(2)}</span>
                  <span className={`wlcard__delta ${isGain ? "gain" : "loss"}`}>
                    {isGain ? "▲" : "▼"} {isGain ? "+" : ""}{deltaPct.toFixed(2)}%
                  </span>
                </div>

                <div className="wlcard__stats">
                  <div className="wlcard__stat">
                    <span className="wlcard__stat-label">Open</span>
                    <span className="wlcard__stat-val">${stats.open?.toFixed(2) || "—"}</span>
                  </div>
                  <div className="wlcard__stat">
                    <span className="wlcard__stat-label">High</span>
                    <span className="wlcard__stat-val gain">${stats.high?.toFixed(2) || "—"}</span>
                  </div>
                  <div className="wlcard__stat">
                    <span className="wlcard__stat-label">Low</span>
                    <span className="wlcard__stat-val loss">${stats.low?.toFixed(2) || "—"}</span>
                  </div>
                  <div className="wlcard__stat">
                    <span className="wlcard__stat-label">Current</span>
                    <span className="wlcard__stat-val">${stats.current?.toFixed(2) || "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
