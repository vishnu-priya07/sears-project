import React, { useState, useEffect, useContext } from "react";
import { AlertsContext } from "./AlertsContext";
import API_BASE from "../apiConfig";

import "./ReportEmergency.css";

function ReportEmergency() {
  const { setAlerts } = useContext(AlertsContext);

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    userInfo: "",
    type: "",
    priority: "medium",
    location: { lat: "", lon: "" },
    details: "",
    date: "",
    time: "",
  });

  const [responseMsg, setResponseMsg] = useState("");

  // 🔹 Define backend URL (auto-switch)

  // Auto-fill date and time
  useEffect(() => {
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setFormData((prev) => ({ ...prev, date, time }));
  }, []);

  // Detect user location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lon = pos.coords.longitude.toFixed(6);
          setFormData((prev) => ({ ...prev, location: { lat, lon } }));
        },
        () => alert("Unable to fetch location. Please enter manually.")
      );
    } else {
      alert("Geolocation not supported by this browser.");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lon") {
      setFormData({
        ...formData,
        location: { ...formData.location, [name]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const reportData = {
        type: formData.type,
        description: formData.details,
        reporter: {
          name: formData.username,
          phone: formData.phone,
          info: formData.userInfo,
        },
        location: {
          lat: parseFloat(formData.location.lat),
          lon: parseFloat(formData.location.lon),
        },
        priority: formData.priority,
        date: formData.date,
        time: formData.time,
      };

      const res = await fetch(`${API_BASE}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      const data = await res.json();
      console.log("Server Response:", data);

      if (data.status === "assigned") {
        setResponseMsg(
          `✅ Alert sent to ${data.responder.name} (${data.responder.contact}). They are responding now!`
        );
      } else {
        setResponseMsg("⚠️ No available responder found for this emergency type.");
      }

      setAlerts((prev) => [
        {
          id: Date.now(),
          type: formData.type,
          location: `${formData.location.lat}, ${formData.location.lon}`,
          severity:
            formData.priority === "high"
              ? "High"
              : formData.priority === "low"
              ? "Low"
              : "Medium",
          time: new Date(),
        },
        ...prev,
      ]);

      alert("🚨 Emergency reported successfully!");
      setFormData({
        username: "",
        phone: "",
        userInfo: "",
        type: "",
        priority: "medium",
        location: { lat: "", lon: "" },
        details: "",
        date: "",
        time: "",
      });
    } catch (err) {
      console.error("Error sending report:", err);
      setResponseMsg("❌ Failed to send report. Please try again.");
    }
  };

  return (
    <div className="report-container">
      <h1>📝 Report an Emergency</h1>
      <p className="form-intro">
        Please fill out the details below. Your report will help responders act quickly.
      </p>

      <form className="report-form" onSubmit={handleSubmit}>
        {/* USER INFORMATION SECTION */}
        <h3>👤 Your Information</h3>
        <label>Name:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          placeholder="Enter your full name"
          onChange={handleChange}
          required
        />

        <label>Phone Number:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          placeholder="Enter your contact number"
          onChange={handleChange}
          required
        />

        <label>Additional Info:</label>
        <textarea
          name="userInfo"
          value={formData.userInfo}
          placeholder="E.g. address, medical condition, blood group, etc."
          onChange={handleChange}
        />

        {/* EMERGENCY DETAILS SECTION */}
        <h3>🚨 Emergency Details</h3>
        <label>Type of Emergency:</label>
        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="">Select...</option>
          <option value="fire">🔥 Fire</option>
          <option value="accident">🚗 Accident</option>
          <option value="medical">🏥 Medical</option>
          <option value="flood">🌊 Flood</option>
          <option value="earthquake">🌍 Earthquake</option>
          <option value="security">🛡️ Security Threat</option>
          <option value="other">⚠️ Other</option>
        </select>

        <label>Priority Level:</label>
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

        <div className="datetime-row">
          <div>
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} readOnly />
          </div>
          <div>
            <label>Time:</label>
            <input type="text" name="time" value={formData.time} readOnly />
          </div>
        </div>

        <label>Location:</label>
        <div className="location-row">
          <input
            type="text"
            name="lat"
            value={formData.location.lat}
            placeholder="Latitude"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lon"
            value={formData.location.lon}
            placeholder="Longitude"
            onChange={handleChange}
            required
          />
          <button type="button" className="detect-btn" onClick={detectLocation}>
            📍 Detect
          </button>
        </div>

        <label>Details:</label>
        <textarea
          name="details"
          value={formData.details}
          placeholder="Provide additional details about the emergency..."
          onChange={handleChange}
          required
        />

        <button type="submit" className="submit-btn">
          🚨 Submit Report
        </button>
      </form>

      {responseMsg && <p className="response-message">{responseMsg}</p>}
    </div>
  );
}

export default ReportEmergency;
