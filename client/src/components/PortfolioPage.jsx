import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import "./PortfolioPage.css";

export default function PortfolioPage() {
  const { user } = useAuth();
  const { prices, portfolio, tradeHistory } = useStocks();

  const positions = Object.entries(portfolio.positions || {});
  const positionsValue = positions.reduce(
    (sum, [t, pos]) => sum + (prices[t] || 0) * pos.qty, 0
  );
  const totalValue = portfolio.cash + positionsValue;
  const totalReturn = totalValue - 100000;
  const totalReturnPct = (totalReturn / 100000) * 100;

  return (
    <div className="pfpage">
      <h1 className="pfpage__title">Portfolio</h1>

      {}
      <div className="pfpage__summary">
        <div className="pfpage__sum-card pfpage__sum-card--main">
          <span className="pfpage__sum-label">Total Portfolio Value</span>
          <span className="pfpage__sum-big">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`pfpage__sum-change ${totalReturn >= 0 ? "gain" : "loss"}`}>
            {totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)} ({totalReturnPct.toFixed(2)}%)
          </span>
        </div>
        <div className="pfpage__sum-card">
          <span className="pfpage__sum-label">Cash Balance</span>
          <span className="pfpage__sum-value">${portfolio.cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="pfpage__sum-card">
          <span className="pfpage__sum-label">Invested</span>
          <span className="pfpage__sum-value">${positionsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="pfpage__sum-card">
          <span className="pfpage__sum-label">Positions</span>
          <span className="pfpage__sum-value">{positions.length}</span>
        </div>
      </div>

      {}
      <div className="pfpage__section">
        <h2 className="pfpage__section-title">Holdings</h2>
        {positions.length === 0 ? (
          <p className="pfpage__empty">No positions yet. Go to Trade to buy stocks.</p>
        ) : (
          <table className="pfpage__table">
            <thead>
              <tr>
                <th>Stock</th>
                <th className="pfpage__right">Shares</th>
                <th className="pfpage__right">Avg Cost</th>
                <th className="pfpage__right">Current</th>
                <th className="pfpage__right">Market Value</th>
                <th className="pfpage__right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(([ticker, pos]) => {
                const current = prices[ticker] || 0;
                const mktVal = current * pos.qty;
                const costBasis = pos.avgCost * pos.qty;
                const pl = mktVal - costBasis;
                const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
                const isGain = pl >= 0;
                return (
                  <tr key={ticker} className="pfpage__row">
                    <td className="pfpage__ticker">{ticker}</td>
                    <td className="pfpage__right">{pos.qty}</td>
                    <td className="pfpage__right">${pos.avgCost.toFixed(2)}</td>
                    <td className="pfpage__right">${current.toFixed(2)}</td>
                    <td className="pfpage__right">${mktVal.toFixed(2)}</td>
                    <td className={`pfpage__right ${isGain ? "gain" : "loss"}`}>
                      {isGain ? "+" : ""}${pl.toFixed(2)} ({plPct.toFixed(1)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {}
      <div className="pfpage__section">
        <h2 className="pfpage__section-title">Trade History</h2>
        {tradeHistory.length === 0 ? (
          <p className="pfpage__empty">No trades executed yet.</p>
        ) : (
          <div className="pfpage__history">
            {tradeHistory.slice(0, 20).map((t) => (
              <div className="pfpage__trade" key={t.id}>
                <div className="pfpage__trade-left">
                  <span className={`pfpage__trade-badge ${t.action === "BUY" ? "buy" : "sell"}`}>
                    {t.action}
                  </span>
                  <span className="pfpage__trade-ticker">{t.ticker}</span>
                  <span className="pfpage__trade-detail">
                    {t.quantity} shares @ ${t.price.toFixed(2)}
                  </span>
                </div>
                <div className="pfpage__trade-right">
                  <span className="pfpage__trade-total">${t.total.toFixed(2)}</span>
                  <span className="pfpage__trade-time">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
