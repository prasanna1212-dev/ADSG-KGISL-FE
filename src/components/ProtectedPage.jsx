import React, { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import useAuthChecker from "../hooks/useAuthChecker";

const ProtectedPage = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [data, setData] = useState(null);
  const checkAuth = useAuthChecker();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL}/protected`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching protected data:", error.message);
      }
    };

    fetchData();
    checkAuth(); // Check authentication status
  }, [checkAuth]);

  return <div>{data ? <p>{data.message}</p> : <p>Loading...</p>}</div>;
};

export default ProtectedPage;
