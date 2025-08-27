import React, { useState, useEffect } from "react";
import Userimg from "../assets/UserImg.jpg";
import "../styles/ApprovedUser.css";
import Pagination from "@mui/material/Pagination"; // Add Material-UI Pagination component

const ApprovedUser = ({ theme, activeTab }) => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [approvedUsers, setApprovedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Number of users per page

  // Fetches the list of approved users
  const fetchApprovedUsers = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/approved/approved-users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setApprovedUsers(data);
    } catch (err) {
      console.error("Error fetching approved users:", err);
    }
  };

  useEffect(() => {
    fetchApprovedUsers();
  }, []);

  useEffect(() => {
    fetchApprovedUsers();
  }, [activeTab]);

  // Handles the removal of a user's permission
  const handleRemovePermission = async (username) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/approved/remove-permission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ username }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      const result = await response.json();
      console.log(result.message);
      await fetchApprovedUsers(); // Refresh the approved users list
    } catch (error) {
      console.error("Error removing permission:", error);
    }
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = approvedUsers.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div>
    <div className={`approved-users-container ${theme}`}>
      <div className="approved-users-cards" style={{ display: "flex", flexWrap: "nowrap" }}>
        {paginatedUsers.map((user) => (
          <div className="approved-users-card" key={user._id}>
            <div className="approved-users-card-body">
              <img
                src={Userimg}
                alt={user.domainJoinUPN}
                className="avatar custom-avatar"
              />
              <p className="approved-users-username">{user.domainJoinUPN}</p>
            </div>
            <div className="approved-users-card-footer">
              <button
                className="approved-users-deactivate-button"
                onClick={() => handleRemovePermission(user.domainJoinUPN)}
              >
                Deactivate User
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination-container">
        <Pagination
          count={Math.ceil(approvedUsers.length / pageSize)} // Calculate total pages
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          variant="outlined"
          shape="rounded"
        />
      </div>
    </div>
    </div>
  );
};

export default ApprovedUser;