import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/NetworkStatusChecker.css"; 

const NetworkStatusChecker = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [isConnected, setIsConnected] = useState(true);

  const checkBackendConnection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/network-status`);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(checkBackendConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOffline = () => setIsConnected(false);
    const handleOnline = () => checkBackendConnection();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      {!isConnected && (
        <div className="network-status-banner">
        <div className="banner-content">
          <span className="icon">⚠️</span>
          <div>
            <h4>Connection Lost</h4>
            <p>We are unable to connect to the server. Please check your internet connection or try again later.</p>
          </div>
        </div>
      </div>      
      )}
    </>
  );
};

export default NetworkStatusChecker;
