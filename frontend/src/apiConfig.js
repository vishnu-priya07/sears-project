// src/apiConfig.js
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://sears-project.onrender.com"
    : "http://localhost:4000";

export default API_BASE;
