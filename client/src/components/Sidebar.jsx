import "./Sidebar.css";

const TABS = [
  { id: "home",      icon: "🏠", label: "Home" },
  { id: "trade",     icon: "📈", label: "Trade" },
  { id: "portfolio", icon: "💼", label: "Portfolio" },
  { id: "watchlist", icon: "⭐", label: "Watchlist" },
  { id: "wallet",    icon: "💰", label: "Wallet" },
  { id: "news",      icon: "📰", label: "News" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar__tab ${activeTab === tab.id ? "sidebar__tab--active" : ""}`}
            onClick={() => onTabChange(tab.id)}
            id={`tab-${tab.id}`}
            title={tab.label}
          >
            <span className="sidebar__tab-icon">{tab.icon}</span>
            <span className="sidebar__tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="sidebar__footer">
        <span className="sidebar__version">v1.0</span>
      </div>
    </aside>
  );
}
