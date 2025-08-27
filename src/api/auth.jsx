import axios from "axios";

export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/login`, credentials);
  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  return response.data.user;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
};
