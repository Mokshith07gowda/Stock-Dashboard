import { useStocks } from "../context/StockContext";
import "./NewsFeed.css";

export default function NewsFeed() {
  const { news } = useStocks();

  return (
    <div className="newsfeed" id="newsfeed">
      <h2 className="newsfeed__title">
        <span className="newsfeed__icon">📰</span> Live Market News
      </h2>

      {news.length === 0 ? (
        <p className="newsfeed__empty">Waiting for news…</p>
      ) : (
        <div className="newsfeed__list">
          {news.map((item, i) => (
            <div
              key={item.id}
              className={`newsfeed__item newsfeed__item--${item.sentiment}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="newsfeed__badge">{item.ticker}</span>
              <span className="newsfeed__headline">{item.headline}</span>
              <span className="newsfeed__time">
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
