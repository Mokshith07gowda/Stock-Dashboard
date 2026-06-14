import { useStocks } from "../context/StockContext";
import "./TickerTape.css";

const COMPANY = {
  GOOG: "Alphabet", TSLA: "Tesla", AMZN: "Amazon",
  META: "Meta", NVDA: "NVIDIA",
};

export default function TickerTape() {
  const { prices, openingPrices } = useStocks();
  const tickers = Object.keys(prices);
  if (tickers.length === 0) return null;

  const items = [...tickers, ...tickers];

  return (
    <div className="tape">
      <div className="tape__track">
        {items.map((t, i) => {
          const p = prices[t];
          const o = openingPrices[t] || p;
          const delta = ((p - o) / o) * 100;
          const isGain = delta >= 0;
          return (
            <span className="tape__item" key={`${t}-${i}`}>
              <span className="tape__ticker">{t}</span>
              <span className="tape__price">${p?.toFixed(2)}</span>
              <span
                className="tape__delta"
                style={{ color: isGain ? "var(--accent-gain)" : "var(--accent-loss)" }}
              >
                {isGain ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
