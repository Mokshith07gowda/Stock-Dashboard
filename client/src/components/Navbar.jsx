import { useAuth } from "../context/AuthContext";
import { useStocks } from "../context/StockContext";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useStocks();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar__left">
        <div className="navbar__brand">
          <svg className="navbar__icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="navbar__logo">TradeDesk</span>
        </div>
        <div className={`navbar__status ${connected ? "navbar__status--live" : "navbar__status--off"}`}>
          <span className="navbar__status-dot" />
          {connected ? "Live" : "Offline"}
        </div>
      </div>

      <div className="navbar__right">
        <ThemeToggle />

        <div className="navbar__user">
          <div className="navbar__avatar">{initials}</div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">{user?.name || user?.email?.split("@")[0]}</span>
            <span className="navbar__user-email">{user?.email}</span>
          </div>
        </div>

        <button className="navbar__signout" id="signout-btn" onClick={logout}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
