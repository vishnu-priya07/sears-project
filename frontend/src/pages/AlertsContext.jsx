import React, { createContext, useState } from "react";

export const AlertsContext = createContext();

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "Fire",
      location: "Building A - 2nd Floor",
      severity: "High",
      time: new Date(),
    },
    {
      id: 2,
      type: "Medical",
      location: "Library - Reading Hall",
      severity: "Medium",
      time: new Date(),
    },
  ]);

  return (
    <AlertsContext.Provider value={{ alerts, setAlerts }}>
      {children}
    </AlertsContext.Provider>
  );
}
