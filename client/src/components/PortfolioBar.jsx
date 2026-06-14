import { useStocks } from "../context/StockContext";
import "./PortfolioBar.css";

export default function PortfolioBar() {
  const { portfolio, prices } = useStocks();
  const { cash, positions } = portfolio;

  let positionsValue = 0;
  for (const [ticker, pos] of Object.entries(positions)) {
    const currentPrice = prices[ticker] || 0;
    positionsValue += currentPrice * pos.qty;
  }
  const totalValue = cash + positionsValue;
  const totalReturn = totalValue - 100000;
  const totalReturnPct = (totalReturn / 100000) * 100;
  const isGain = totalReturn >= 0;

  let best = null, worst = null;
  for (const [ticker, pos] of Object.entries(positions)) {
    const currentPrice = prices[ticker] || 0;
    const pnl = (currentPrice - pos.avgCost) * pos.qty;
    if (!best || pnl > best.pnl) best = { ticker, pnl };
    if (!worst || pnl < worst.pnl) worst = { ticker, pnl };
  }

  return (
    <div className="pbar">
      <div className="pbar__item">
        <span className="pbar__label">Portfolio Value</span>
        <span className="pbar__value pbar__value--hero">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="pbar__divider" />

      <div className="pbar__item">
        <span className="pbar__label">Available Cash</span>
        <span className="pbar__value">
          ${cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="pbar__divider" />

      <div className="pbar__item">
        <span className="pbar__label">Total Return</span>
        <span className="pbar__value" style={{ color: isGain ? "var(--accent-gain)" : "var(--accent-loss)" }}>
          {isGain ? "+" : ""}${totalReturn.toFixed(2)} ({isGain ? "+" : ""}{totalReturnPct.toFixed(2)}%)
        </span>
      </div>

      <div className="pbar__divider" />

      <div className="pbar__item">
        <span className="pbar__label">Positions</span>
        <span className="pbar__value">{Object.keys(positions).length}</span>
      </div>

      {best && (
        <>
          <div className="pbar__divider" />
          <div className="pbar__item">
            <span className="pbar__label">Best Performer</span>
            <span className="pbar__value" style={{ color: "var(--accent-gain)" }}>
              {best.ticker} {best.pnl >= 0 ? "+" : ""}${best.pnl.toFixed(2)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
