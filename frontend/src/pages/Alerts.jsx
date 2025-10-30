import React, { useEffect, useState } from "react";
import API_BASE from "../apiConfig";

import "./Alerts.css";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // 🔹 Choose correct backend URL (local vs deployed)

        const res = await fetch(`${API_BASE}/reports`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // Convert reports into alert format
          const formatted = data.map((r) => ({
            id: r.id,
            type: r.type,
            severity:
              r.type === "fire" || r.type === "accident" ? "High" : "Medium",
            location: `Lat: ${r.location.lat}, Lon: ${r.location.lon}`,
            time: new Date(r.time),
            reporter: r.reporter?.name || "Unknown",
            contact: r.reporter?.phone || "N/A",
            description: r.description || "",
          }));
          setAlerts(formatted.reverse()); // newest first
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, 10000); // auto-refresh every 10 sec
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time) => {
    const diff = Math.floor((new Date() - time) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hr ago`;
  };

  return (
    <div className="page-container">
      <h1>🚨 Live Emergency Alerts</h1>
      <p className="sub-text">Stay updated with real-time emergencies across your area</p>

      {loading ? (
        <p>⏳ Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p>No emergency alerts reported yet.</p>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-card ${alert.type.toLowerCase()}`}
            >
              <h3>
                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert{" "}
                <span className={`severity ${alert.severity.toLowerCase()}`}>
                  {alert.severity}
                </span>
              </h3>
              <p>📍 <b>Location:</b> {alert.location}</p>
              <p>📝 <b>Description:</b> {alert.description}</p>
              <p>👤 <b>Reported By:</b> {alert.reporter} ({alert.contact})</p>
              <p>⏱ <b>Reported:</b> {formatTime(alert.time)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Alerts;
