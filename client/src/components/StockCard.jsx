import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import Sparkline from "./Sparkline";
import "./StockCard.css";

const COMPANY = {
  GOOG: "Alphabet Inc.", TSLA: "Tesla Inc.", AMZN: "Amazon.com Inc.",
  META: "Meta Platforms Inc.", NVDA: "NVIDIA Corporation",
};

export default function StockCard({ ticker, index = 0, onOpenModal }) {
  const { user } = useAuth();
  const { prices, openingPrices, priceHistory, unsubscribe } = useStocks();

  const currentPrice = prices[ticker];
  const openingPrice = openingPrices[ticker];
  const history = priceHistory[ticker] || [];
  const company = COMPANY[ticker] || ticker;

  const [flash, setFlash] = useState("");
  const prevPrice = useRef(currentPrice);

  useEffect(() => {
    if (currentPrice == null || prevPrice.current == null) {
      prevPrice.current = currentPrice;
      return;
    }
    if (currentPrice > prevPrice.current) setFlash("gain");
    else if (currentPrice < prevPrice.current) setFlash("loss");
    prevPrice.current = currentPrice;
    const id = setTimeout(() => setFlash(""), 600);
    return () => clearTimeout(id);
  }, [currentPrice]);

  if (currentPrice == null) return null;

  const delta = currentPrice - (openingPrice ?? currentPrice);
  const deltaPct = openingPrice ? (delta / openingPrice) * 100 : 0;
  const isGain = delta >= 0;
  const deltaColor = isGain ? "var(--accent-gain)" : "var(--accent-loss)";
  const sparkColor = isGain ? "#00D4A8" : "#FF4D6A";
  const glowShadow = isGain ? "var(--shadow-glow-gain)" : "var(--shadow-glow-loss)";

  return (
    <div
      className={`scard stagger-enter ${flash ? `scard--flash-${flash}` : ""}`}
      id={`scard-${ticker}`}
      style={{
        animationDelay: `${index * 0.08}s`,
        boxShadow: `var(--shadow-card), ${glowShadow}`,
        cursor: "pointer",
      }}
      onClick={() => onOpenModal?.(ticker)}
    >
      <div className="scard__header">
        <div>
          <span className="scard__ticker">{ticker}</span>
          <span className="scard__company">{company}</span>
        </div>
        <Sparkline data={history.slice(-20)} color={sparkColor} width={140} height={44} />
      </div>

      <div className="scard__row">
        <span className="scard__price">${currentPrice.toFixed(2)}</span>
        <span className="scard__delta" style={{ color: deltaColor }}>
          {isGain ? "+" : ""}${delta.toFixed(2)} ({isGain ? "+" : ""}{deltaPct.toFixed(2)}%)
        </span>
      </div>

      <button
        className="scard__unsub"
        id={`unsub-card-${ticker}`}
        onClick={(e) => {
          e.stopPropagation();
          unsubscribe(user.email, ticker);
        }}
      >
        Unsubscribe
      </button>
    </div>
  );
}
