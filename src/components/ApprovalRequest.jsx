import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import { LuCheck, LuX } from 'react-icons/lu';
import '../styles/ApprovalRequest.css';
import Userimg from '../assets/UserImg.jpg';

const ApprovalRequest = ({ theme, activeTab }) => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [error, setError] = useState('');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Number of users per page

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/approval/pending-users`, {
        withCredentials: true,
      });
      setPendingUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching pending users');
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [activeTab]);

  const handleApprove = async (username, email) => {
    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/approval/approve-user`,
        { username, email },
        { withCredentials: true }
      );
      setSnackbarMessage(`${username} has been approved successfully.`);
      setSnackbarOpen(true);
      setPendingUsers(pendingUsers.filter((user) => user.username !== username));
      fetchPendingUsers();
    } catch (err) {
      setError('Error approving user.');
      console.error(err);
      setSnackbarMessage('Error approving user.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (username) => {
    try {
      await axios.post(
        `${API_BASE_URL}/approval/reject-user`,
        { username },
        { withCredentials: true }
      );
      setSnackbarMessage(`${username} has been rejected.`);
      setSnackbarOpen(true);
      setPendingUsers(pendingUsers.filter((user) => user.username !== username));
    } catch (err) {
      setError('Error rejecting user.');
      console.error(err);
      setSnackbarMessage('Error rejecting user.');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = pendingUsers.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className={`approval-request-container ${theme}`}>
      {error && <p className="error-message">{error}</p>}

      {loading && (
        <div className="loader-backdrop">
          <CircularProgress />
        </div>
      )}

      {/* Conditional Rendering for No Users */}
      {pendingUsers.length === 0 && !loading ? (
        <p className="no-users-message">
          No Pending users available! All the users are in the approved list.
        </p>
      ) : (
        <>
          <div className="user-cards">
            {paginatedUsers.map((user) => (
              <div key={user.username} className="card custom-card">
                <div className="card-body custom-card-body">
                  <div className="user-info custom-user-info">
                    <img
                      src={Userimg}
                      alt={user.domainJoinUPN}
                      className="avatar custom-avatar"
                    />
                    <div>
                      <p className="user-name custom-user-name">{user.domainJoinUPN}</p>
                    </div>
                  </div>
                  <p className="user-request custom-user-request">
                    <strong>{user.domainJoinUPN}</strong> has requested to join your team. You can approve or decline their request.
                  </p>
                </div>
                <div className="card-footer custom-card-footer">
                  <button
                    className="button decline custom-decline-button"
                    onClick={() => handleReject(user.domainJoinUPN)}
                  >
                    <LuX className="icon" /> Decline
                  </button>
                  <button
                    className="button approve custom-approve-button"
                    onClick={() => handleApprove(user.domainJoinUPN, user.email)}
                  >
                    <LuCheck className="icon" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination-container">
            <Pagination
              count={Math.ceil(pendingUsers.length / pageSize)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              variant="outlined"
              shape="rounded"
            />
          </div>
        </>
      )}

      {/* MUI Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default ApprovalRequest;