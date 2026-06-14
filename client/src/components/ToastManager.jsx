import { useStocks } from "../context/StockContext";
import "./Toast.css";

export default function ToastManager() {
  const { toasts, dismissToast } = useStocks();

  return (
    <div className="toast-container" id="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          onClick={() => dismissToast(t.id)}
        >
          <div className="toast__icon">
            {t.type === "gain" ? "📈" : t.type === "loss" ? "📉" : t.type === "trade" ? "💼" : "🔔"}
          </div>
          <div className="toast__body">
            <span className="toast__title">{t.title}</span>
            <span className="toast__msg">{t.message}</span>
          </div>
          <button className="toast__close" onClick={() => dismissToast(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
