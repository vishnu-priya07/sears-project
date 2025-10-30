import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import ReportEmergency from "./pages/ReportEmergency";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <Router>
      <nav style={styles.nav}>
        <h2 style={styles.logo}>SEARS</h2>
        <div>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/alerts" style={styles.link}>Alerts</Link>
          <Link to="/report" style={styles.link}>Report</Link>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/signup" style={styles.link}>Signup</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/report" element={<ReportEmergency />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

const styles = {
  nav: {
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#0d6efd",
  },
  logo: { color: "white", margin: 0 },
  link: { color: "white", margin: "0 10px", textDecoration: "none" },
};

export default App;
