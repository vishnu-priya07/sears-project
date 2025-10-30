import React, { useEffect, useState } from "react";
import API_BASE from "../apiConfig";

import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    try {
      // 🔹 Choose correct backend URL (local vs deployed)
      const response = await fetch(`${API_BASE}/api/dashboard/stats`);
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return <div className="dashboard-container">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>📊 Emergency Dashboard</h1>
      <p>Real-time overview of emergency activities and system statistics.</p>
      <p className="last-updated">⏱ Last Updated: {lastUpdated}</p>

      {/* Top Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card alert">
          <h2>{stats.activeAlerts}</h2>
          <p>Active Alerts</p>
        </div>
        <div className="stat-card resolved">
          <h2>{stats.resolvedCases}</h2>
          <p>Resolved Cases</p>
        </div>
        <div className="stat-card ongoing">
          <h2>{stats.ongoingEmergencies}</h2>
          <p>Ongoing Emergencies</p>
        </div>
        <div className="stat-card users">
          <h2>{stats.registeredUsers}</h2>
          <p>Registered Users</p>
        </div>
        <div className="stat-card reports">
          <h2>{stats.totalReports}</h2>
          <p>Total Reports</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <h2>📰 Recent Activity</h2>
        <ul>
          <li>🚨 New emergency reported at City Center</li>
          <li>✅ Fire emergency resolved successfully</li>
          <li>👤 {stats.registeredUsers} users enrolled so far</li>
          <li>⚠️ {stats.activeAlerts} active alerts in progress</li>
        </ul>
      </div>

      {/* System Usage Section */}
      <div className="system-usage">
        <h2>📈 System Usage</h2>
        <p>
          Total reports submitted: <b>{stats.totalReports}</b>
        </p>
        <p>
          Active users engaging today:{" "}
          <b>{Math.ceil(stats.registeredUsers / 3)}</b>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
