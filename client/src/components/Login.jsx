import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const TICKERS = [
  { sym: "GOOG", price: "2,841.50", change: "+2.14%", up: true },
  { sym: "TSLA", price: "742.02", change: "-1.28%", up: false },
  { sym: "AMZN", price: "3,421.57", change: "+0.87%", up: true },
  { sym: "META", price: "334.12", change: "+3.41%", up: true },
  { sym: "NVDA", price: "824.18", change: "-0.52%", up: false },
  { sym: "AAPL", price: "178.72", change: "+1.05%", up: true },
  { sym: "MSFT", price: "378.91", change: "+0.62%", up: true },
  { sym: "NFLX", price: "485.20", change: "-0.93%", up: false },
];

const FEATURES = [
  { icon: "📊", color: "#00D4A8", title: "Wide Product Range", desc: "Access stocks, ETFs, and derivatives — all from a single dashboard with real-time data streaming." },
  { icon: "💎", color: "#00B4D8", title: "Transparent Pricing", desc: "Commission-free virtual trading with no hidden fees. Start with $100,000 in virtual cash." },
  { icon: "⚡", color: "#F59E0B", title: "Innovative Tools", desc: "Interactive canvas charts, inline sparklines, live tickers, and keyboard shortcuts for power users." },
  { icon: "🛡️", color: "#8B5CF6", title: "Dedicated Support", desc: "Real-time WebSocket data feed with blazing-fast execution and professional-grade analytics." },
];

const MARKET_STOCKS = [
  { sym: "GOOG", name: "Alphabet Inc.", sector: "Technology", price: "$2,841.50", cap: "$1.89T", pe: "26.4", yld: "0.0%", up: true },
  { sym: "TSLA", name: "Tesla Inc.", sector: "Automotive", price: "$742.02", cap: "$753B", pe: "98.7", yld: "0.0%", up: false },
  { sym: "AMZN", name: "Amazon.com Inc.", sector: "E-Commerce", price: "$3,421.57", cap: "$1.75T", pe: "59.3", yld: "0.0%", up: true },
  { sym: "META", name: "Meta Platforms", sector: "Social Media", price: "$334.12", cap: "$856B", pe: "22.1", yld: "0.0%", up: true },
  { sym: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors", price: "$824.18", cap: "$2.04T", pe: "67.2", yld: "0.04%", up: false },
];

const STEPS = [
  { num: "01", title: "Create Your Account", desc: "Sign up in seconds with just your email. No credit card or documents required to get started." },
  { num: "02", title: "Explore the Markets", desc: "Browse real-time stock data, track price movements with interactive charts, and build your watchlist." },
  { num: "03", title: "Execute Virtual Trades", desc: "Buy and sell stocks with $100K virtual cash. Track your portfolio performance and trade history." },
  { num: "04", title: "Master the Market", desc: "Learn trading strategies risk-free. Analyze your P&L, refine your approach, and build confidence." },
];

function handleScrollTo(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 70;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export default function Login() {
  const { login, signup } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const openModal = (m) => { setMode(m); setShowModal(true); setError(""); };
  const closeModal = () => { setShowModal(false); setError(""); setName(""); setEmail(""); setPassword(""); setConfirmPw(""); };

  useEffect(() => {
    if (!showModal) return;
    const handler = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (mode === "signup") {
      if (!name.trim()) return setError("Full name is required");
      if (!email.trim()) return setError("Email is required");
      if (password.length < 6) return setError("Password must be at least 6 characters");
      if (password !== confirmPw) return setError("Passwords do not match");
    } else {
      if (!email.trim()) return setError("Email is required");
      if (!password) return setError("Password is required");
    }
    setLoading(true);
    try {
      if (mode === "signup") await signup(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleQuickLogin = async (demoEmail) => {
    setLoading(true); setError("");
    try { await login(demoEmail, "demo1234"); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="lp">
      {}
      <nav className="lp-nav">
        <div className="lp-nav__brand">
          <span className="lp-nav__logo-icon">📊</span>
          <span className="lp-nav__logo-text">TradeDesk</span>
        </div>
        <div className="lp-nav__links">
          <button className="lp-nav__link" onClick={() => handleScrollTo("features")}>Features</button>
          <button className="lp-nav__link" onClick={() => handleScrollTo("markets")}>Markets</button>
          <button className="lp-nav__link" onClick={() => handleScrollTo("how-it-works")}>How It Works</button>
          <button className="lp-nav__link" onClick={() => handleScrollTo("about")}>About</button>
        </div>
        <div className="lp-nav__actions">
          <button className="lp-nav__signin" onClick={() => openModal("signin")}>Sign In</button>
          <button className="lp-nav__cta" onClick={() => openModal("signup")}>Get Started</button>
        </div>
      </nav>

      {}
      <section className="lp-hero">
        <div className="lp-hero__left">
          <h1 className="lp-hero__heading">
            Unique solutions &amp;<br />
            <span className="lp-hero__accent">Innovative approach</span><br />
            to trading
          </h1>
          <p className="lp-hero__desc">
            Stay on top of the market with our innovative technology, extensive
            product access, personalized education, and award-winning service.
          </p>
          <div className="lp-hero__buttons">
            <button className="lp-hero__btn-primary" onClick={() => openModal("signup")}>
              Get Early Access
            </button>
            <button className="lp-hero__btn-secondary" onClick={() => handleScrollTo("how-it-works")}>
              How It Works ▶
            </button>
          </div>
        </div>
        <div className="lp-hero__right">
          <div className="lp-mockup">
            <div className="lp-mockup__sidebar">
              <div className="lp-mockup__sidebar-dot" />
              <div className="lp-mockup__sidebar-dot" />
              <div className="lp-mockup__sidebar-dot" />
              <div className="lp-mockup__sidebar-dot" />
            </div>
            <div className="lp-mockup__main">
              <div className="lp-mockup__stats">
                <div className="lp-mockup__stat">
                  <span className="lp-mockup__stat-label">GOOG</span>
                  <span className="lp-mockup__stat-value gain">$2,841</span>
                </div>
                <div className="lp-mockup__stat">
                  <span className="lp-mockup__stat-label">TSLA</span>
                  <span className="lp-mockup__stat-value loss">$742</span>
                </div>
                <div className="lp-mockup__stat">
                  <span className="lp-mockup__stat-label">NVDA</span>
                  <span className="lp-mockup__stat-value gain">$824</span>
                </div>
              </div>
              <div className="lp-mockup__chart">
                <svg viewBox="0 0 200 60" className="lp-mockup__chart-svg">
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4a8" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00d4a8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,45 Q20,40 40,35 T80,20 T120,30 T160,15 T200,10" stroke="#00d4a8" strokeWidth="2" fill="none" />
                  <path d="M0,45 Q20,40 40,35 T80,20 T120,30 T160,15 T200,10 L200,60 L0,60Z" fill="url(#cg)" />
                </svg>
              </div>
              <div className="lp-mockup__bars">
                {[40, 60, 35, 80, 55, 70, 45, 65, 50, 75].map((h, i) => (
                  <div key={i} className="lp-mockup__bar" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="lp-hero__glow" />
        </div>
      </section>

      {}
      <section className="lp-tickers">
        <div className="lp-tickers__track">
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <div className="lp-ticker" key={i}>
              <div className="lp-ticker__info">
                <span className="lp-ticker__sym">{t.sym}</span>
                <svg className="lp-ticker__spark" viewBox="0 0 40 16">
                  <polyline
                    points={t.up ? "0,12 8,10 16,8 24,11 32,5 40,3" : "0,4 8,6 16,9 24,7 32,12 40,14"}
                    stroke={t.up ? "#00d4a8" : "#ff4d6a"} strokeWidth="1.5" fill="none" />
                </svg>
              </div>
              <span className="lp-ticker__price">${t.price}</span>
              <span className={`lp-ticker__change ${t.up ? "gain" : "loss"}`}>{t.change}</span>
            </div>
          ))}
        </div>
      </section>

      {}
      <section className="lp-features" id="features">
        <span className="lp-section-tag">✨ PLATFORM FEATURES</span>
        <h2 className="lp-features__heading">
          Take <span className="lp-hero__accent">full control</span> of your assets
        </h2>
        <p className="lp-features__desc">
          Everything you need to trade confidently — from real-time data to
          interactive charts, all in one powerful dashboard.
        </p>
        <div className="lp-features__grid">
          {FEATURES.map((f) => (
            <div className="lp-fcard" key={f.title}>
              <div className="lp-fcard__hex" style={{ background: `${f.color}18`, color: f.color }}>
                <span>{f.icon}</span>
              </div>
              <h3 className="lp-fcard__title">{f.title}</h3>
              <p className="lp-fcard__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {}
      <section className="lp-markets" id="markets">
        <span className="lp-section-tag">📈 LIVE MARKET DATA</span>
        <h2 className="lp-markets__heading">
          Real-time access to <span className="lp-hero__accent">top stocks</span>
        </h2>
        <p className="lp-markets__desc">
          Track price movements, analyze market cap, P/E ratios, and dividend yields
          — all updated every second via WebSocket.
        </p>
        <div className="lp-markets__table-wrap">
          <table className="lp-markets__table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Sector</th>
                <th className="lp-right">Price</th>
                <th className="lp-right">Market Cap</th>
                <th className="lp-right">P/E</th>
                <th className="lp-right">Yield</th>
              </tr>
            </thead>
            <tbody>
              {MARKET_STOCKS.map((s) => (
                <tr key={s.sym}>
                  <td>
                    <span className="lp-markets__sym">{s.sym}</span>
                    <span className="lp-markets__name">{s.name}</span>
                  </td>
                  <td><span className="lp-markets__sector">{s.sector}</span></td>
                  <td className={`lp-right lp-markets__price ${s.up ? "gain" : "loss"}`}>{s.price}</td>
                  <td className="lp-right">{s.cap}</td>
                  <td className="lp-right">{s.pe}</td>
                  <td className="lp-right">{s.yld}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lp-markets__stats-row">
          <div className="lp-markets__stat-box">
            <span className="lp-markets__stat-num">5</span>
            <span className="lp-markets__stat-lbl">Live Stocks</span>
          </div>
          <div className="lp-markets__stat-box">
            <span className="lp-markets__stat-num">1s</span>
            <span className="lp-markets__stat-lbl">Update Interval</span>
          </div>
          <div className="lp-markets__stat-box">
            <span className="lp-markets__stat-num">200+</span>
            <span className="lp-markets__stat-lbl">Price History Points</span>
          </div>
          <div className="lp-markets__stat-box">
            <span className="lp-markets__stat-num">24/7</span>
            <span className="lp-markets__stat-lbl">Simulated Market</span>
          </div>
        </div>
      </section>

      {}
      <section className="lp-steps" id="how-it-works">
        <span className="lp-section-tag">🚀 HOW IT WORKS</span>
        <h2 className="lp-steps__heading">
          Get started in <span className="lp-hero__accent">4 simple steps</span>
        </h2>
        <p className="lp-steps__desc">
          From zero to live trading in under a minute. No credit card, no KYC — just pure learning.
        </p>
        <div className="lp-steps__grid">
          {STEPS.map((s) => (
            <div className="lp-step" key={s.num}>
              <span className="lp-step__num">{s.num}</span>
              <h3 className="lp-step__title">{s.title}</h3>
              <p className="lp-step__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {}
      <section className="lp-about" id="about">
        <div className="lp-about__inner">
          <span className="lp-section-tag">🏢 ABOUT TRADEDESK</span>
          <h2 className="lp-about__heading">
            Built for aspiring traders,<br />
            <span className="lp-hero__accent">powered by modern tech</span>
          </h2>
          <p className="lp-about__desc">
            TradeDesk PRO is a full-stack stock broker dashboard built with React, Node.js,
            Express, and WebSocket. It simulates a professional-grade trading platform with
            real-time price streaming, interactive canvas charts, virtual portfolio management,
            and a complete trade execution engine.
          </p>
          <div className="lp-about__tech">
            <span className="lp-about__tech-badge">React</span>
            <span className="lp-about__tech-badge">Node.js</span>
            <span className="lp-about__tech-badge">Express</span>
            <span className="lp-about__tech-badge">WebSocket</span>
            <span className="lp-about__tech-badge">Canvas API</span>
            <span className="lp-about__tech-badge">Vite</span>
          </div>
          <button className="lp-hero__btn-primary" onClick={() => openModal("signup")} style={{ marginTop: 28 }}>
            Start Trading Now →
          </button>
        </div>
      </section>

      {}
      <footer className="lp-footer">
        <div className="lp-footer__left">
          <span className="lp-nav__logo-icon">📊</span>
          <span className="lp-nav__logo-text">TradeDesk</span>
        </div>
        <p className="lp-footer__copy">Built with React · Node.js · WebSocket · Canvas</p>
        <p className="lp-footer__copy">© 2026 TradeDesk PRO. All rights reserved.</p>
      </footer>

      {}
      {showModal && (
        <div className="lp-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="lp-modal">
            <button className="lp-modal__close" onClick={closeModal}>✕</button>
            <h2 className="lp-modal__heading">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
            <p className="lp-modal__sub">{mode === "signin" ? "Sign in to your dashboard" : "Start trading in seconds"}</p>
            <div className="lp-modal__tabs">
              <button className={`lp-modal__tab ${mode === "signin" ? "active" : ""}`} onClick={() => { setMode("signin"); setError(""); }}>Sign In</button>
              <button className={`lp-modal__tab ${mode === "signup" ? "active" : ""}`} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button>
            </div>
            <form className="lp-modal__form" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="lp-modal__field">
                  <label className="lp-modal__label">FULL NAME</label>
                  <input className="lp-modal__input" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
              )}
              <div className="lp-modal__field">
                <label className="lp-modal__label">EMAIL ADDRESS</label>
                <input className="lp-modal__input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="lp-modal__field">
                <label className="lp-modal__label">PASSWORD</label>
                <div className="lp-modal__pw-wrap">
                  <input className="lp-modal__input" type={showPw ? "text" : "password"} placeholder={mode === "signup" ? "Min 6 characters" : "Enter password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                  <button type="button" className="lp-modal__pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>{showPw ? "🙈" : "👁️"}</button>
                </div>
              </div>
              {mode === "signup" && (
                <div className="lp-modal__field">
                  <label className="lp-modal__label">CONFIRM PASSWORD</label>
                  <input className="lp-modal__input" type={showPw ? "text" : "password"} placeholder="Re-enter password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" />
                </div>
              )}
              {error && <p className="lp-modal__error">{error}</p>}
              <button className="lp-modal__submit" type="submit" disabled={loading}>
                {loading ? <span className="lp-spinner" /> : mode === "signin" ? "Sign In →" : "Create Account →"}
              </button>
            </form>
            <p className="lp-modal__switch">
              {mode === "signin" ? (<>Don't have an account? <button className="lp-modal__switch-btn" onClick={() => { setMode("signup"); setError(""); }}>Create one</button></>) : (<>Already have an account? <button className="lp-modal__switch-btn" onClick={() => { setMode("signin"); setError(""); }}>Sign in</button></>)}
            </p>
            <div className="lp-modal__divider"><span>DEMO</span></div>
            <div className="lp-modal__demos">
              <button className="lp-modal__demo" onClick={() => handleQuickLogin("trader1@demo.com")} disabled={loading}>trader1@demo.com</button>
              <button className="lp-modal__demo" onClick={() => handleQuickLogin("trader2@demo.com")} disabled={loading}>trader2@demo.com</button>
            </div>
            <p className="lp-modal__hint">Password: demo1234</p>
          </div>
        </div>
      )}
    </div>
  );
}
