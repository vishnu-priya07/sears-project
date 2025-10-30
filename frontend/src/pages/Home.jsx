import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in on page load
  useEffect(() => {
    const userEmail = localStorage.getItem("loggedInUser");
    if (userEmail) {
      setLoggedInUser(userEmail);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    navigate("/login");
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-top">
          <h1>🚨 Smart Emergency Alert & Response System</h1>

        </div>
        <p className="tagline">
          Stay informed. Stay safe. Stay connected during emergencies.
        </p>
        <div className="hero-buttons">
          <Link to="/report">
            <button className="cta-btn">📢 Report Emergency</button>
          </Link>
           {loggedInUser && (
            <button className="logout-btn" onClick={handleLogout}>
              🔓 Logout
            </button>
          )}
          {!loggedInUser && (
            <>
              <Link to="/login">
                <button className="secondary-btn">🔑 Login</button>
              </Link>
              <Link to="/signup">
                <button className="secondary-btn">📝 Signup</button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>🌟 Why Choose SEARS?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🔔 Real-Time Alerts</h3>
            <p>
              Get notified instantly during emergencies like fire, accidents,
              floods, or security threats in your area.
            </p>
          </div>
          <div className="feature-card">
            <h3>📍 Live Map Tracking</h3>
            <p>
              Visualize emergency zones and safe routes on an interactive map.
            </p>
          </div>
          <div className="feature-card">
            <h3>🛡️ Quick Response</h3>
            <p>
              Connect with nearby responders, hospitals, and security services
              in seconds.
            </p>
          </div>
          <div className="feature-card">
            <h3>🤝 Community Support</h3>
            <p>
              Stay connected with neighbors and organizations for collective
              safety.
            </p>
          </div>
          <div className="feature-card">
            <h3>📊 Emergency Analytics</h3>
            <p>
              Access detailed statistics and reports to understand patterns,
              risk-prone areas, and prepare better for the future.
            </p>
          </div>
          <div className="feature-card">
            <h3>⚡ Offline Mode</h3>
            <p>
              Even without internet, report emergencies via SMS-based fallback
              system to ensure no delay in response.
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-section">
        <h2>Ready to Stay Safe?</h2>
        <p>
          Join thousands of users who rely on SEARS for smart emergency
          management.
        </p>
        <Link to="/alerts">
          <button className="cta-btn large">🚀 Get Started</button>
        </Link>
        <Link to="/dashboard">
        <button className="cta-btn large">📊 Dashboard</button>
        </Link>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <p>© 2025 SEARS - Smart Emergency Alert & Response System</p>
      </footer>
    </div>
  );
}

export default Home;
