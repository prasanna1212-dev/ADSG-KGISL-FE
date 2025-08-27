import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/authUtils";

const useAuthChecker = () => {
  const navigate = useNavigate();

  return () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken || isTokenExpired(refreshToken)) {
      // If the refresh token is expired, clear tokens and navigate to home
      console.error("Refresh token expired or missing. Redirecting to login.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/");
    } else if (!accessToken || isTokenExpired(accessToken)) {
      // If only the access token is expired, do nothing (interceptor handles this)
      console.warn("Access token expired. Awaiting refresh...");
    }
  };
};

export default useAuthChecker;
