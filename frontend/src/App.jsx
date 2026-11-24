import { useState, useRef } from "react";
import "./App.css";
import { API_URL } from "./config";
import HistoryPage from "./components/HistoryPage";

function App() {
  // Which page is visible: "planner" (form + result) or "history"
  const [page, setPage] = useState("planner");

  const [formData, setFormData] = useState({
    length: "",
    width: "",
    road_side: "North",
    floors: 1,
    bedrooms: 2,
    bathrooms: 2,
    kitchens: 1,
    halls: 1,
    parking: true,
    garden: true,
  });

  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save plot, save requirements and generate layout
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Save plot
      const plotResponse = await fetch(`${API_URL}/plots/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          length: Number(formData.length),
          width: Number(formData.width),
          road_side: formData.road_side,
          floors: Number(formData.floors),
        }),
      });

      const plotData = await plotResponse.json();

      if (!plotResponse.ok) {
        console.error(plotData);
        alert("Plot save nahi hua.");
        return;
      }

      // Step 2: Save room requirements
      const requirementResponse = await fetch(`${API_URL}/requirements/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plot: plotData.id,
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          kitchens: Number(formData.kitchens),
          halls: Number(formData.halls),
          parking: formData.parking,
          garden: formData.garden,
        }),
      });

      const requirementData = await requirementResponse.json();

      if (!requirementResponse.ok) {
        console.error(requirementData);
        alert("Room requirements save nahi hui.");
        return;
      }

      // Step 3: Generate house layout
      // (History page khulte hi khud fresh data load kar leta hai)
      const layoutResponse = await fetch(
        `${API_URL}/plots/${plotData.id}/generate-layout/`
      );

      const layoutData = await layoutResponse.json();

      if (!layoutResponse.ok) {
        console.error(layoutData);
        alert("Layout generate nahi hua.");
        return;
      }

      setLayout(layoutData);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Django server se connection nahi ho raha. Server check karein.");
    } finally {
      setLoading(false);
    }
  };

  // Open a saved plot's layout from the History page
  const openSavedLayout = async (plotId) => {
    try {
      const response = await fetch(
        `${API_URL}/plots/${plotId}/generate-layout/`
      );
      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        alert("Layout load nahi hua.");
        return;
      }

      setLayout(data);
      setPage("planner");

      // Wait for the planner page to render, then scroll to the result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Open layout error:", error);
      alert("Django server se connection nahi ho raha. Server check karein.");
    }
  };

  // Room CSS class
  const getRoomClass = (type) => {
    return `room room-${type.toLowerCase()}`;
  };

  // Road CSS class
  const getRoadClass = (side) => {
    return `road road-${side.toLowerCase()}`;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div>
          <h1>Smart Plot Planner</h1>
          <p>House Layout Generator</p>
        </div>

        <nav className="nav-tabs">
          <button
            type="button"
            className={`nav-tab ${page === "planner" ? "active" : ""}`}
            onClick={() => setPage("planner")}
          >
            New Plan
          </button>

          <button
            type="button"
            className={`nav-tab ${page === "history" ? "active" : ""}`}
            onClick={() => setPage("history")}
          >
            History
          </button>
        </nav>
      </header>

      <main className="main-container">
        {/* History Page */}
        {page === "history" && <HistoryPage onViewLayout={openSavedLayout} />}

        {/* Planner Page */}
        {page === "planner" && (
          <div className="workspace">
            {/* Plot Input Form */}
            <section className="form-card">
              <div className="section-title">
                <h2>Plot Details</h2>
                <p>Enter your plot and room requirements</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {/* Plot Length */}
                  <div className="input-box">
                    <label>Plot Length</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        name="length"
                        value={formData.length}
                        onChange={handleChange}
                        placeholder="Example: 40"
                        min="1"
                        required
                      />
                      <span>ft</span>
                    </div>
                  </div>

                  {/* Plot Width */}
                  <div className="input-box">
                    <label>Plot Width</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        name="width"
                        value={formData.width}
                        onChange={handleChange}
                        placeholder="Example: 30"
                        min="1"
                        required
                      />
                      <span>ft</span>
                    </div>
                  </div>

                  {/* Road Side */}
                  <div className="input-box">
                    <label>Road Side</label>
                    <select
                      name="road_side"
                      value={formData.road_side}
                      onChange={handleChange}
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>

                  {/* Floors */}
                  <div className="input-box">
                    <label>Floors</label>
                    <select
                      name="floors"
                      value={formData.floors}
                      onChange={handleChange}
                    >
                      <option value="1">1 Floor</option>
                      <option value="2">2 Floors</option>
                    </select>
                  </div>

                  {/* Bedrooms */}
                  <div className="input-box">
                    <label>Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      required
                    />
                  </div>

                  {/* Bathrooms */}
                  <div className="input-box">
                    <label>Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      required
                    />
                  </div>

                  {/* Kitchens */}
                  <div className="input-box">
                    <label>Kitchens</label>
                    <input
                      type="number"
                      name="kitchens"
                      value={formData.kitchens}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      required
                    />
                  </div>

                  {/* Halls */}
                  <div className="input-box">
                    <label>Halls</label>
                    <input
                      type="number"
                      name="halls"
                      value={formData.halls}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      required
                    />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="options-section">
                  <label className="option">
                    <input
                      type="checkbox"
                      name="parking"
                      checked={formData.parking}
                      onChange={handleChange}
                    />
                    <span>Parking</span>
                  </label>

                  <label className="option">
                    <input
                      type="checkbox"
                      name="garden"
                      checked={formData.garden}
                      onChange={handleChange}
                    />
                    <span>Garden</span>
                  </label>
                </div>

                <button
                  className="generate-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Generating Plan..." : "Generate House Plan"}
                </button>
              </form>
            </section>

            {/* Generated House Plan */}
            {layout && (
              <section className="result-card" ref={resultRef}>
                {/* Result Header */}
                <div className="result-header">
                  <div>
                    <h2>Generated House Plan</h2>
                    <p>Conceptual 2D floor layout</p>
                  </div>

                  <div className="plot-size">
                    {layout.plot.length}
                    {" × "}
                    {layout.plot.width}
                    <small>feet</small>
                  </div>
                </div>

                {/* Plan Information */}
                <div className="info-bar">
                  <div>
                    <span>Road</span>
                    <strong>{layout.plot.road_side}</strong>
                  </div>

                  <div>
                    <span>Floors</span>
                    <strong>{layout.plot.floors}</strong>
                  </div>

                  <div>
                    <span>Bedrooms</span>
                    <strong>{layout.requirements.bedrooms}</strong>
                  </div>

                  <div>
                    <span>Bathrooms</span>
                    <strong>{layout.requirements.bathrooms}</strong>
                  </div>
                </div>

                {/* North Indicator */}
                <div className="north-arrow">
                  <span>N</span>
                  <div>↑</div>
                </div>

                {/* Floor Plan */}
                <div
                  className={`plan-wrapper plan-${layout.plot.road_side.toLowerCase()}`}
                >
                  {/* Road */}
                  <div className={getRoadClass(layout.plot.road_side)}>
                    ROAD
                    <span>
                      {layout.plot.road_side.toUpperCase()}
                      {" SIDE"}
                    </span>
                  </div>

                  {/* Plot Boundary */}
                  <div
                    className="floor-plan"
                    style={{
                      aspectRatio: `${layout.plot.width} / ${layout.plot.length}`,
                    }}
                  >
                    <div className="dim dim-width">
                      <span>{layout.plot.width} ft</span>
                    </div>

                    <div className="dim dim-length">
                      <span>{layout.plot.length} ft</span>
                    </div>

                    <div className="plot-boundary">
                      {/* Rooms */}
                      {layout.rooms.map((room, index) => (
                        <div
                          key={index}
                          className={getRoomClass(room.type)}
                          style={{
                            left: `${(room.x / layout.plot.width) * 100}%`,
                            top: `${(room.y / layout.plot.length) * 100}%`,
                            width: `${(room.width / layout.plot.width) * 100}%`,
                            height: `${(room.length / layout.plot.length) * 100}%`,
                          }}
                        >
                          <div className="room-label">
                            <strong>{room.name}</strong>
                            <span>
                              {room.width} × {room.length} ft
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Room Legend */}
                <div className="legend">
                  <h3>Room Details</h3>

                  <div className="legend-grid">
                    {layout.rooms.map((room, index) => (
                      <div className="legend-item" key={index}>
                        <div
                          className={`legend-dot dot-${room.type.toLowerCase()}`}
                        />

                        <div>
                          <strong>{room.name}</strong>
                          <span>
                            {room.width} × {room.length} ft
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="note">
                  <strong>Note:</strong> This is a conceptual floor plan
                  generated from the entered requirements. It is not a
                  construction-ready architectural drawing.
                </div>
              </section>
            )}

            {/* Empty state */}
            {!layout && (
              <section className="plan-placeholder">
                <h2>Your floor plan appears here</h2>
                <p>
                  Enter the plot size and the rooms you need, then press
                  Generate House Plan.
                </p>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;