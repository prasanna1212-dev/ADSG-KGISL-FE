import React from "react";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../utils/authUtils";

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken || isTokenExpired(refreshToken)) {
    console.error("Refresh token expired or missing. Redirecting to login.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return <Navigate to="/" replace />;
  }

  if (!accessToken || isTokenExpired(accessToken)) {
    console.warn("Access token expired but refresh token is valid. Continuing...");
  }

  return children;
};

export default ProtectedRoute;
