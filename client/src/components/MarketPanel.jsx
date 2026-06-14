import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import SearchBar from "./SearchBar";
import "./MarketPanel.css";

const ALL_TICKERS = [
  { ticker: "GOOG", company: "Alphabet Inc." },
  { ticker: "TSLA", company: "Tesla Inc." },
  { ticker: "AMZN", company: "Amazon.com Inc." },
  { ticker: "META", company: "Meta Platforms Inc." },
  { ticker: "NVDA", company: "NVIDIA Corporation" },
  { ticker: "AAPL", company: "Apple Inc." },
  { ticker: "MSFT", company: "Microsoft Corp." },
  { ticker: "NFLX", company: "Netflix Inc." },
  { ticker: "BTC", company: "Bitcoin" },
  { ticker: "ETH", company: "Ethereum" },
  { ticker: "SOL", company: "Solana" },
  { ticker: "DOGE", company: "Dogecoin" },
  { ticker: "JPM", company: "JPMorgan Chase" },
  { ticker: "DIS", company: "Walt Disney Co." },
  { ticker: "AMD", company: "AMD Inc." },
];

export default function MarketPanel({ onOpenModal }) {
  const { user } = useAuth();
  const { prices, openingPrices, sessionStats, portfolio, subscribe, unsubscribe } = useStocks();
  const subs = user?.subscriptions || [];
  const [search, setSearch] = useState("");

  const filtered = ALL_TICKERS.filter(
    ({ ticker, company }) =>
      ticker.toLowerCase().includes(search.toLowerCase()) ||
      company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mpanel" id="market-panel">
      <div className="mpanel__header">
        <h2 className="mpanel__title">Market Overview</h2>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="mpanel__table-wrap">
        <table className="mpanel__table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Company</th>
              <th className="mpanel__right">Price</th>
              <th className="mpanel__right">Change</th>
              <th className="mpanel__right">High</th>
              <th className="mpanel__right">Low</th>
              <th className="mpanel__center">Trade</th>
              <th className="mpanel__center">Watchlist</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ ticker, company }) => (
              <MarketRow
                key={ticker}
                ticker={ticker}
                company={company}
                price={prices[ticker]}
                openingPrice={openingPrices[ticker]}
                stats={sessionStats[ticker]}
                ownedQty={portfolio.positions?.[ticker]?.qty || 0}
                isSubscribed={subs.includes(ticker)}
                onSubscribe={() => subscribe(user.email, ticker)}
                onUnsubscribe={() => unsubscribe(user.email, ticker)}
                onOpenModal={() => onOpenModal?.(ticker)}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="mpanel__no-results">No stocks match "{search}"</p>
        )}
      </div>
    </div>
  );
}

function MarketRow({
  ticker, company, price, openingPrice, stats,
  ownedQty, isSubscribed, onSubscribe, onUnsubscribe, onOpenModal,
}) {
  if (price == null) return null;

  const delta = price - (openingPrice ?? price);
  const deltaPct = openingPrice ? (delta / openingPrice) * 100 : 0;
  const isGain = delta >= 0;
  const deltaColor = isGain ? "var(--accent-gain)" : "var(--accent-loss)";

  return (
    <tr className="mrow" id={`mrow-${ticker}`}>
      <td className="mrow__ticker">{ticker}</td>
      <td className="mrow__company">{company}</td>
      <td className="mrow__price mpanel__right">${price.toFixed(2)}</td>
      <td className="mpanel__right">
        <span className="mrow__delta" style={{ color: deltaColor }}>
          {isGain ? "+" : ""}{deltaPct.toFixed(2)}%
        </span>
      </td>
      <td className="mpanel__right">
        <span className="mrow__stat" style={{ color: "var(--accent-gain)" }}>
          ${stats?.high?.toFixed(2) || "—"}
        </span>
      </td>
      <td className="mpanel__right">
        <span className="mrow__stat" style={{ color: "var(--accent-loss)" }}>
          ${stats?.low?.toFixed(2) || "—"}
        </span>
      </td>
      <td className="mpanel__center">
        <div className="mrow__actions">
          <button className="mrow__btn mrow__btn--buy" id={`buy-${ticker}`}
            onClick={(e) => { e.stopPropagation(); onOpenModal(); }}>
            Buy
          </button>
          <button className="mrow__btn mrow__btn--sell" id={`sell-${ticker}`}
            onClick={(e) => { e.stopPropagation(); onOpenModal(); }}
            disabled={ownedQty === 0}
            title={ownedQty === 0 ? "No shares owned" : `Owned: ${ownedQty}`}>
            Sell
          </button>
        </div>
      </td>
      <td className="mpanel__center">
        {isSubscribed ? (
          <button className="mrow__btn mrow__btn--unsub" id={`unsub-${ticker}`}
            onClick={(e) => { e.stopPropagation(); onUnsubscribe(); }}>
            Unsubscribe
          </button>
        ) : (
          <button className="mrow__btn mrow__btn--sub" id={`sub-${ticker}`}
            onClick={(e) => { e.stopPropagation(); onSubscribe(); }}>
            Subscribe
          </button>
        )}
      </td>
    </tr>
  );
}
