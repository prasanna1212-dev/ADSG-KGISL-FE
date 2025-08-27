import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // Check if the token is expired
  } catch {
    return true; // Assume expired if decoding fails
  }
};

export const checkAuthStatus = (navigate) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken || isTokenExpired(refreshToken)) {
    console.error("Refresh token expired or missing. Redirecting to login.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/"); // Redirect to login
  } else if (!accessToken || isTokenExpired(accessToken)) {
    console.warn("Access token expired but refresh token is valid. Awaiting refresh...");
  }
};
