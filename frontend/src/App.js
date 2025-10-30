import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Context
import { AlertsProvider } from "./pages/AlertsContext";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import ReportEmergency from "./pages/ReportEmergency";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state from localStorage on page refresh
  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <AlertsProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes (only logged in users can access) */}
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/alerts"
            element={isLoggedIn ? <Alerts /> : <Navigate to="/login" />}
          />
          <Route
            path="/report"
            element={isLoggedIn ? <ReportEmergency /> : <Navigate to="/login" />}
          />
        </Routes>
      </Router>
    </AlertsProvider>
  );
}

export default App;
