import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import "./WalletPage.css";

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export default function WalletPage() {
  const { user } = useAuth();
  const { portfolio, walletDeposit, walletWithdraw, tradeHistory, prices } = useStocks();
  const [mode, setMode] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const positions = Object.entries(portfolio.positions || {});
  const positionsValue = positions.reduce(
    (sum, [t, pos]) => sum + (prices[t] || 0) * pos.qty, 0
  );
  const totalValue = portfolio.cash + positionsValue;

  const walletTxns = tradeHistory.filter((t) => t.ticker === "WALLET");

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setResult({ success: false, error: "Enter a valid amount" }); return; }
    setLoading(true);
    setResult(null);
    const res = mode === "deposit"
      ? await walletDeposit(user.email, amt)
      : await walletWithdraw(user.email, amt);
    setResult(res);
    setLoading(false);
    if (res.success) setAmount("");
  };

  return (
    <div className="wallet">
      <h1 className="wallet__title">Wallet</h1>

      {}
      <div className="wallet__balances">
        <div className="wallet__bal-card wallet__bal-card--main">
          <span className="wallet__bal-label">Total Portfolio Value</span>
          <span className="wallet__bal-big">
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="wallet__bal-card">
          <span className="wallet__bal-label">Available Cash</span>
          <span className="wallet__bal-value gain">
            ${portfolio.cash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="wallet__bal-card">
          <span className="wallet__bal-label">Invested</span>
          <span className="wallet__bal-value">
            ${positionsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {}
      <div className="wallet__form-section">
        <div className="wallet__toggle">
          <button
            className={`wallet__toggle-btn ${mode === "deposit" ? "wallet__toggle-btn--active-deposit" : ""}`}
            onClick={() => { setMode("deposit"); setResult(null); }}
          >💰 Deposit</button>
          <button
            className={`wallet__toggle-btn ${mode === "withdraw" ? "wallet__toggle-btn--active-withdraw" : ""}`}
            onClick={() => { setMode("withdraw"); setResult(null); }}
          >💸 Withdraw</button>
        </div>

        <div className="wallet__form">
          <label className="wallet__form-label">
            {mode === "deposit" ? "Deposit Amount" : "Withdraw Amount"}
          </label>
          <div className="wallet__input-wrap">
            <span className="wallet__input-prefix">$</span>
            <input
              type="number"
              className="wallet__input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="wallet__quick">
            {QUICK_AMOUNTS.map((a) => (
              <button key={a} className="wallet__quick-btn" onClick={() => setAmount(String(a))}>
                ${a.toLocaleString()}
              </button>
            ))}
          </div>

          {result && (
            <p className={`wallet__result ${result.success ? "wallet__result--ok" : "wallet__result--err"}`}>
              {result.success
                ? `✓ ${mode === "deposit" ? "Deposited" : "Withdrawn"} $${parseFloat(amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} successfully`
                : `✕ ${result.error}`}
            </p>
          )}

          <button
            className={`wallet__submit ${mode === "deposit" ? "wallet__submit--deposit" : "wallet__submit--withdraw"}`}
            onClick={handleSubmit}
            disabled={loading || !amount}
          >
            {loading ? "Processing…" : mode === "deposit" ? "Deposit Funds →" : "Withdraw Funds →"}
          </button>
        </div>
      </div>

      {}
      <div className="wallet__history-section">
        <h2 className="wallet__history-title">Wallet Transactions</h2>
        {walletTxns.length === 0 ? (
          <p className="wallet__empty">No wallet transactions yet.</p>
        ) : (
          <div className="wallet__history">
            {walletTxns.slice(0, 20).map((t) => (
              <div className="wallet__txn" key={t.id}>
                <div className="wallet__txn-left">
                  <span className={`wallet__txn-badge ${t.action === "DEPOSIT" ? "deposit" : "withdraw"}`}>
                    {t.action === "DEPOSIT" ? "↓ DEPOSIT" : "↑ WITHDRAW"}
                  </span>
                  <span className="wallet__txn-time">
                    {new Date(t.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <span className={`wallet__txn-amount ${t.action === "DEPOSIT" ? "gain" : "loss"}`}>
                  {t.action === "DEPOSIT" ? "+" : "-"}${t.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
