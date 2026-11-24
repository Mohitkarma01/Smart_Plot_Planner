import { useState, useEffect } from "react";
import { API_URL } from "../config";

function HistoryPage({ onViewLayout }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState(null);

  // Load saved plots and their requirements from Django
  const loadHistory = async () => {
    setLoading(true);
    setError("");

    try {
      const [plotsResponse, requirementsResponse] = await Promise.all([
        fetch(`${API_URL}/plots/`),
        fetch(`${API_URL}/requirements/`),
      ]);

      if (!plotsResponse.ok || !requirementsResponse.ok) {
        throw new Error("Unable to load history");
      }

      const plotsData = await plotsResponse.json();
      const requirementsData = await requirementsResponse.json();

      const plots = Array.isArray(plotsData)
        ? plotsData
        : plotsData.results || [];

      const requirements = Array.isArray(requirementsData)
        ? requirementsData
        : requirementsData.results || [];

      const savedPlots = plots.map((plot) => ({
        ...plot,
        requirements: requirements.find(
          (item) =>
            Number(item.plot) === Number(plot.id) ||
            Number(item.plot_id) === Number(plot.id) ||
            Number(item.plot?.id) === Number(plot.id)
        ),
      }));

      // Newest plot first
      savedPlots.sort((a, b) => Number(b.id) - Number(a.id));

      setHistory(savedPlots);
    } catch (err) {
      console.error("History error:", err);
      setError("History load nahi hui. Django server check karein.");
    } finally {
      setLoading(false);
    }
  };

  // Page khulte hi (har baar History tab open hone par) fresh data aayega
  useEffect(() => {
    loadHistory();
  }, []);

  const handleView = async (plotId) => {
    setOpeningId(plotId);
    await onViewLayout(plotId);
    setOpeningId(null);
  };

  return (
    <section className="history-card">
      <div className="history-toolbar">
        <div className="section-title">
          <h2>Plot History</h2>
          <p>
            Your previously saved house plans
            {!loading && !error && history.length > 0 && (
              <span className="history-count">
                {" "}
                ({history.length} saved)
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={loadHistory}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && <p className="history-message">Loading saved plots...</p>}

      {!loading && error && (
        <p className="history-message history-error">{error}</p>
      )}

      {!loading && !error && history.length === 0 && (
        <p className="history-message">
          No saved plots yet. Create your first plan from the New Plan tab.
        </p>
      )}

      <div className="history-grid">
        {history.map((plot) => (
          <div className="history-item" key={plot.id}>
            <h3>Plot #{plot.id}</h3>
            <p className="history-size">
              {plot.length} × {plot.width} ft
            </p>

            <dl className="history-details">
              <div>
                <dt>Road Side</dt>
                <dd>{plot.road_side}</dd>
              </div>

              <div>
                <dt>Floors</dt>
                <dd>{plot.floors}</dd>
              </div>

              {plot.requirements ? (
                <>
                  <div>
                    <dt>Bedrooms</dt>
                    <dd>{plot.requirements.bedrooms}</dd>
                  </div>

                  <div>
                    <dt>Bathrooms</dt>
                    <dd>{plot.requirements.bathrooms}</dd>
                  </div>

                  <div>
                    <dt>Kitchens</dt>
                    <dd>{plot.requirements.kitchens}</dd>
                  </div>

                  <div>
                    <dt>Halls</dt>
                    <dd>{plot.requirements.halls}</dd>
                  </div>

                  <div>
                    <dt>Parking</dt>
                    <dd>{plot.requirements.parking ? "Yes" : "No"}</dd>
                  </div>

                  <div>
                    <dt>Garden</dt>
                    <dd>{plot.requirements.garden ? "Yes" : "No"}</dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt>Room details</dt>
                  <dd>Not found</dd>
                </div>
              )}
            </dl>

            <button
              type="button"
              className="view-btn"
              onClick={() => handleView(plot.id)}
              disabled={openingId === plot.id}
            >
              {openingId === plot.id ? "Opening..." : "View Layout"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HistoryPage;