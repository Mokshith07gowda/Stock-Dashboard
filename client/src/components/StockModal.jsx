import { useRef, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import "./StockModal.css";

const COMPANY = {
  GOOG: "Alphabet Inc.", TSLA: "Tesla Inc.", AMZN: "Amazon.com Inc.",
  META: "Meta Platforms Inc.", NVDA: "NVIDIA Corporation",
  AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", NFLX: "Netflix Inc.",
  BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", DOGE: "Dogecoin",
  JPM: "JPMorgan Chase", DIS: "Walt Disney Co.", AMD: "AMD Inc.",
};

export default function StockModal({ ticker, onClose }) {
  const { user } = useAuth();
  const { prices, openingPrices, priceHistory, sessionStats, portfolio, executeTrade } = useStocks();
  const canvasRef = useRef(null);

  const [action, setAction] = useState("BUY");
  const [qty, setQty] = useState("1");
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeResult, setTradeResult] = useState(null);

  const price = prices[ticker] || 0;
  const opening = openingPrices[ticker] || price;
  const delta = price - opening;
  const deltaPct = opening ? (delta / opening) * 100 : 0;
  const isGain = delta >= 0;
  const history = priceHistory[ticker] || [];
  const stats = sessionStats[ticker] || {};

  const pos = portfolio.positions[ticker];
  const qtyNum = parseInt(qty, 10) || 0;
  const totalCost = qtyNum * price;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;

    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const padY = 16;
    const plotH = h - padY * 2;
    const stepX = w / (history.length - 1);
    const toY = (v) => padY + plotH - ((v - min) / range) * plotH;

    const color = isGain ? "#00D4A8" : "#FF4D6A";

    ctx.strokeStyle = "rgba(100,116,139,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "20");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(0, h);
    history.forEach((v, i) => ctx.lineTo(i * stepX, toY(v)));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    history.forEach((v, i) => {
      const x = i * stepX;
      i === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    const lx = (history.length - 1) * stepX;
    const ly = toY(history[history.length - 1]);
    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fillStyle = color + "30";
    ctx.fill();

    ctx.fillStyle = "#64748B";
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const val = min + (range / 4) * (4 - i);
      const y = padY + (plotH / 4) * i;
      ctx.fillText(`$${val.toFixed(2)}`, w - 4, y - 4);
    }
  }, [history, isGain]);

  const handleTrade = async () => {
    if (qtyNum <= 0) return;
    setTradeLoading(true);
    setTradeResult(null);
    const result = await executeTrade(user.email, ticker, action, qtyNum);
    setTradeResult(result);
    setTradeLoading(false);
    if (result.success) setQty("1");
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="smodal-overlay" onClick={onClose}>
      <div className="smodal" onClick={(e) => e.stopPropagation()}>
        {}
        <div className="smodal__header">
          <div>
            <h2 className="smodal__ticker">{ticker}</h2>
            <p className="smodal__company">{COMPANY[ticker]}</p>
          </div>
          <div className="smodal__price-block">
            <span className="smodal__price">${price.toFixed(2)}</span>
            <span className="smodal__delta" style={{ color: isGain ? "var(--accent-gain)" : "var(--accent-loss)" }}>
              {isGain ? "+" : ""}${delta.toFixed(2)} ({isGain ? "+" : ""}{deltaPct.toFixed(2)}%)
            </span>
          </div>
          <button className="smodal__close" onClick={onClose}>✕</button>
        </div>

        {}
        <div className="smodal__chart-wrap">
          <canvas ref={canvasRef} className="smodal__canvas" />
        </div>

        {}
        <div className="smodal__stats">
          <div className="smodal__stat">
            <span className="smodal__stat-label">Open</span>
            <span className="smodal__stat-value">${stats.open?.toFixed(2) || "—"}</span>
          </div>
          <div className="smodal__stat">
            <span className="smodal__stat-label">High</span>
            <span className="smodal__stat-value" style={{ color: "var(--accent-gain)" }}>
              ${stats.high?.toFixed(2) || "—"}
            </span>
          </div>
          <div className="smodal__stat">
            <span className="smodal__stat-label">Low</span>
            <span className="smodal__stat-value" style={{ color: "var(--accent-loss)" }}>
              ${stats.low?.toFixed(2) || "—"}
            </span>
          </div>
          <div className="smodal__stat">
            <span className="smodal__stat-label">Current</span>
            <span className="smodal__stat-value">${stats.current?.toFixed(2) || "—"}</span>
          </div>
          {pos && (
            <>
              <div className="smodal__stat">
                <span className="smodal__stat-label">Your Shares</span>
                <span className="smodal__stat-value">{pos.qty}</span>
              </div>
              <div className="smodal__stat">
                <span className="smodal__stat-label">Avg Cost</span>
                <span className="smodal__stat-value">${pos.avgCost.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {}
        <div className="smodal__trade">
          <div className="smodal__action-toggle">
            <button
              className={`smodal__action-btn ${action === "BUY" ? "smodal__action-btn--active-buy" : ""}`}
              onClick={() => setAction("BUY")}
            >Buy</button>
            <button
              className={`smodal__action-btn ${action === "SELL" ? "smodal__action-btn--active-sell" : ""}`}
              onClick={() => setAction("SELL")}
            >Sell</button>
          </div>

          <div className="smodal__trade-row">
            <label className="smodal__trade-label">Quantity</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="smodal__trade-input"
              id={`trade-qty-${ticker}`}
            />
          </div>

          <div className="smodal__trade-row">
            <span className="smodal__trade-label">Total</span>
            <span className="smodal__trade-total">
              ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {action === "BUY" && (
            <div className="smodal__trade-row">
              <span className="smodal__trade-label">Cash Available</span>
              <span className="smodal__trade-total">${portfolio.cash.toFixed(2)}</span>
            </div>
          )}

          <button
            className={`smodal__execute ${action === "BUY" ? "smodal__execute--buy" : "smodal__execute--sell"}`}
            onClick={handleTrade}
            disabled={tradeLoading || qtyNum <= 0}
            id={`execute-${action.toLowerCase()}-${ticker}`}
          >
            {tradeLoading ? "Processing…" : `${action} ${qtyNum} ${ticker}`}
          </button>

          {tradeResult && !tradeResult.success && (
            <p className="smodal__error">{tradeResult.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
