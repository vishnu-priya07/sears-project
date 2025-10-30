import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../apiConfig";

import "./Login.css";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🔹 Define backend base URL (auto-switch for production)


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Login successful!");
        localStorage.setItem("loggedInUser", JSON.stringify(data.user)); // store user session
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        alert(data.message || "❌ Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("⚠️ Error connecting to server. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        <p>
          Don’t have an account? <a href="/signup">Signup here</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
