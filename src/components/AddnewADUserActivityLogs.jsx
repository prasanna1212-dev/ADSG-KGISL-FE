import React, { useState, useEffect } from 'react';
import "../styles/AddnewADUserActivityReport.css";
import { FaUser, FaEnvelope, FaBuilding, FaFileAlt, FaChevronLeft, FaChevronRight, FaSearch, FaTimesCircle } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddnewADUserActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // NEW: Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(4);
    const recordsPerPageOptions = [4, 8, 12, 20];

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/AD/AddADUser-single-bulk-logs`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();

                // Sort the data by timestamp in descending order (latest first)
                const sortedLogs = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                setLogs(sortedLogs);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // NEW: Function to handle search input changes and reset page
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to the first page when search term changes
    };

    // Corrected: Utility function to format email into "Firstname Lastname"
    // MOVED THIS FUNCTION HERE, BEFORE IT IS CALLED IN filteredLogs
    const formatToName = (email) => {
        if (!email) return "";
        const username = email.split("@")[0];
        const parts = username.split(".");

        return parts
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    };

    // Corrected: Function to render the reason, handling arrays and strings
    // MOVED THIS FUNCTION HERE, BEFORE IT IS CALLED IN THE JSX
    const renderReason = (reason) => {
        if (Array.isArray(reason)) {
            return (
                <ul className="addaduser-activity-logs-error-list">
                    {reason.map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            );
        }
        return <p>{reason}</p>;
    };

    // NEW: Filter logs based on search term
    const filteredLogs = logs.filter(log => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();

        // Return true if any of the following fields match the search term
        const matches = (
            log.message?.toLowerCase().includes(lowercasedSearchTerm) ||
            (log.createdBy && formatToName(log.createdBy)?.toLowerCase().includes(lowercasedSearchTerm)) ||
            log.adServer?.toLowerCase().includes(lowercasedSearchTerm) ||
            log.actionType?.replace('_', ' ').toLowerCase().includes(lowercasedSearchTerm)
        );

        // Also check user details within the report for both single and bulk
        let matchesUserDetails = false;
        if (log.actionType === 'single_create' && log.report?.user) {
            const user = log.report.user;
            if (user.fullName?.toLowerCase().includes(lowercasedSearchTerm) || user.userLogonName?.toLowerCase().includes(lowercasedSearchTerm)) {
                matchesUserDetails = true;
            }
        } else if (log.actionType === 'bulk_create' && log.report?.length > 0) {
            matchesUserDetails = log.report.some(reportItem =>
                reportItem.user?.fullName?.toLowerCase().includes(lowercasedSearchTerm) ||
                reportItem.user?.userLogonName?.toLowerCase().includes(lowercasedSearchTerm)
            );
        }

        return matches || matchesUserDetails;
    });

    // Pagination Logic updated to use filteredLogs
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredLogs.length / recordsPerPage);

    const handleViewReport = (log) => {
        setSelectedLog(log);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedLog(null);
    };

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) {
            return;
        }
        setCurrentPage(pageNumber);
    };

    const handleRecordsPerPageChange = (e) => {
        setRecordsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    if (loading) {
        return <div className="addaduser-activity-logs-loading">Loading activity logs...</div>;
    }

    if (error) {
        return <div className="addaduser-activity-logs-error-message">Error: Failed to load logs. {error}</div>;
    }

    return (
        <div className="addaduser-activity-logs-container">
            {/* NEW: Search and Pagination container */}
            <div className="addaduser-activity-logs-controls-wrapper">
                {/* NEW: Search Box */}
                <div className="addaduser-activity-logs-search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="addaduser-activity-logs-search-input"
                    />
                    {searchTerm && (
                        <FaTimesCircle
                            className="clear-search-icon"
                            onClick={() => setSearchTerm('')}
                        />
                    )}
                </div>

                {/* Pagination and Rows per Page controls */}
                {filteredLogs.length > 0 && (
                    <div className="addaduser-activity-logs-pagination-container">
                        <div className="addaduser-activity-logs-rows-per-page">
                            <span className="addaduser-activity-logs-record-info">
                                Displaying {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredLogs.length)} of {filteredLogs.length} records
                            </span>
                        </div>
                        <div className="addaduser-activity-logs-pagination-controls">
                            <span>Rows per page:</span>
                            <select onChange={handleRecordsPerPageChange} value={recordsPerPage}>
                                {recordsPerPageOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="addaduser-activity-logs-pagination-btn"
                            >
                                <FaChevronLeft />
                            </button>
                            <span className="addaduser-activity-logs-page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="addaduser-activity-logs-pagination-btn"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Render based on filtered logs */}
            {filteredLogs.length === 0 && searchTerm ? (
                <div className="addaduser-activity-logs-no-logs">No results found for "{searchTerm}".</div>
            ) : filteredLogs.length === 0 && !searchTerm ? (
                <div className="addaduser-activity-logs-no-logs">No activity logs found.</div>
            ) : (
                <div className="addaduser-activity-logs-list">
                    {currentLogs.map((log) => (
                        <div key={log._id} className={`addaduser-activity-logs-card ${log.status === 'success' ? 'addaduser-activity-logs-card--success' : 'addaduser-activity-logs-card--failed'}`}>
                            <div className="addaduser-activity-logs-header">
                                <div className="addaduser-activity-logs-timestamp">Created by: <span style={{ color: "dodgerblue" }}>{formatToName(log.createdBy)}</span></div>
                                <span className="addaduser-activity-logs-timestamp">
                                    {new Date(log.timestamp).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                                <div className="addaduser-activity-logs-status-indicator-wrapper">
                                    <div className={`addaduser-activity-logs-status-indicator addaduser-activity-logs-status-indicator--${log.status}`}>
                                        {log.status === 'success' ? (
                                            <svg className="addaduser-activity-logs-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="addaduser-activity-logs-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="addaduser-activity-logs-content">
                                <p className="addaduser-activity-logs-message">{log.message}</p>

                                {log.actionType === "single_create" && log.status === "success" && log.report?.user && (
                                    <div className="addaduser-account-details-card">
                                        <h4 className="addaduser-account-details-title">Account Details</h4>
                                        <div className="addaduser-account-detail-item">
                                            <FaUser className="ad-user-detail-icon" />
                                            <strong>Full Name:</strong> <span>{log.report.user.fullName}</span>
                                        </div>
                                        <div className="addaduser-account-detail-item">
                                            <FaEnvelope className="ad-user-detail-icon" />
                                            <strong>Logon Name:</strong> <span>{log.report.user.userLogonName}</span>
                                        </div>
                                        {log.report.user.organizationalUnit && (
                                            <div className="addaduser-account-detail-item">
                                                <FaBuilding className="ad-user-detail-icon" />
                                                <strong>OU:</strong> <span>{log.report.user.organizationalUnit}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {log.actionType === "single_create" &&
                                    log.status === "failed" &&
                                    log.message?.includes("Entry Already Exists") &&
                                    log.report?.user?.userLogonName && (
                                        <div className="addaduser-account-details-card">
                                            <h4 className="addaduser-account-details-title">Account Already Exists</h4>
                                            <div className="addaduser-account-detail-item">
                                                <FaEnvelope className="ad-user-detail-icon" />
                                                <strong>Logon Name:</strong> <span>{log.report.user.userLogonName}</span>
                                            </div>
                                        </div>
                                    )}

                                {log.actionType === "bulk_create" && (
                                    <div className="addaduser-activity-logs-bulk-summary">
                                        <p>Total Users: {log.totalUsers}</p>
                                        <p>Success: {log.successCount}</p>
                                        <p>Failed: {log.failureCount}</p>
                                    </div>
                                )}

                                <div className="addaduser-activity-logs-details">
                                    <span className="addaduser-activity-logs-adserver">AD Server: {log.adServer}</span>
                                    <span className="addaduser-activity-logs-action-type">Action: {log.actionType.replace('_', ' ')}</span>
                                </div>
                            </div>
                            {log.report && log.report.length > 0 && (
                                <div className="addaduser-activity-logs-actions">
                                    <button
                                        className="addaduser-activity-logs-view-report-btn"
                                        onClick={() => handleViewReport(log)}
                                    >
                                        <FaFileAlt size={16} /> View Detailed Report
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {showModal && selectedLog && (
                <div className="addaduser-activity-logs-modal-overlay" onClick={closeModal}>
                    <div className="addaduser-activity-logs-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="addaduser-activity-logs-modal-close" onClick={closeModal}>&times;</button>
                        <h2 className="addaduser-activity-logs-modal-title">Report for {selectedLog.actionType.replace('_', ' ')}</h2>
                        <p className="addaduser-activity-logs-modal-timestamp">
                            <small>Report generated on: </small>
                            {new Date(selectedLog.timestamp).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true
                            })}
                        </p>
                        <div className="addaduser-activity-logs-modal-report-list">
                            {selectedLog.report.map((reportItem, index) => (
                                <div key={index} className="addaduser-activity-logs-modal-report-item">
                                    <p><strong>User:</strong> {reportItem.user?.fullName || 'N/A'}</p>
                                    <p><strong>Status:</strong> <span className={`status--${reportItem.status}`}>{reportItem.status}</span></p>
                                    {renderReason(reportItem.reason)}
                                    <p><strong>OU:</strong> {reportItem.user?.organizationalUnit || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddnewADUserActivityLogs;

// import React, { useState, useEffect } from 'react';
// import "../styles/AddnewADUserActivityReport.css";
// import { FaUser, FaEnvelope, FaBuilding, FaFileAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AddnewADUserActivityLogs = () => {
//     const [logs, setLogs] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedLog, setSelectedLog] = useState(null);
//     const [showModal, setShowModal] = useState(false);
    
//     // Pagination state
//     const [currentPage, setCurrentPage] = useState(1);
//     const [recordsPerPage, setRecordsPerPage] = useState(4); // Default to 4 records per page
//     const recordsPerPageOptions = [4, 8, 12, 20]; // Options for user to select

//     useEffect(() => {
//         const fetchLogs = async () => {
//             try {
//                 const response = await fetch(`${API_BASE_URL}/AD/AddADUser-single-bulk-logs`);
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }
//                 const data = await response.json();

//                 // Sort the data by timestamp in descending order (latest first)
//                 const sortedLogs = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
//                 setLogs(sortedLogs);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchLogs();
//     }, []);

//     // Pagination Logic
//     const indexOfLastRecord = currentPage * recordsPerPage;
//     const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
//     const currentLogs = logs.slice(indexOfFirstRecord, indexOfLastRecord);
//     const totalPages = Math.ceil(logs.length / recordsPerPage);

//     const handleViewReport = (log) => {
//         setSelectedLog(log);
//         setShowModal(true);
//     };

//     const closeModal = () => {
//         setShowModal(false);
//         setSelectedLog(null);
//     };

//     const handlePageChange = (pageNumber) => {
//         if (pageNumber < 1 || pageNumber > totalPages) {
//             return;
//         }
//         setCurrentPage(pageNumber);
//     };

//     const handleRecordsPerPageChange = (e) => {
//         setRecordsPerPage(Number(e.target.value));
//         setCurrentPage(1); // Reset to the first page when records per page changes
//     };

//     if (loading) {
//         return <div className="addaduser-activity-logs-loading">Loading activity logs...</div>;
//     }

//     if (error) {
//         return <div className="addaduser-activity-logs-error-message">Error: Failed to load logs. {error}</div>;
//     }

//     if (logs.length === 0) {
//         return <div className="addaduser-activity-logs-no-logs">No activity logs found.</div>;
//     }

//     // Utility function to format email into "Firstname Lastname"
//     const formatToName = (email) => {
//         if (!email) return "";
//         const username = email.split("@")[0];
//         const parts = username.split(".");
    
//         return parts
//         .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
//         .join(" ");
//     };  

//     // Function to render the reason, handling arrays and strings
//     const renderReason = (reason) => {
//         if (Array.isArray(reason)) {
//             return (
//                 <ul className="addaduser-activity-logs-error-list">
//                     {reason.map((err, i) => (
//                         <li key={i}>{err}</li>
//                     ))}
//                 </ul>
//             );
//         }
//         return <p>{reason}</p>;
//     };

//     return (
//         <div className="addaduser-activity-logs-container">
//             {/* Pagination and Rows per Page controls moved to the top */}
//             {logs.length > 0 && (
//                 <div className="addaduser-activity-logs-pagination-container">
//                     {/* Displaying rows per page text and dropdown */}
//                     <div className="addaduser-activity-logs-rows-per-page">
//                         <span className="addaduser-activity-logs-record-info">
//                             Displaying {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, logs.length)} of {logs.length} records
//                         </span>
//                     </div>
//                     <div className="addaduser-activity-logs-pagination-controls">
//                     <span>Rows per page:</span>
//                         <select onChange={handleRecordsPerPageChange} value={recordsPerPage}>
//                             {recordsPerPageOptions.map(option => (
//                                 <option key={option} value={option}>{option}</option>
//                             ))}
//                         </select>
//                         <button 
//                             onClick={() => handlePageChange(currentPage - 1)}
//                             disabled={currentPage === 1}
//                             className="addaduser-activity-logs-pagination-btn"
//                         >
//                             <FaChevronLeft />
//                         </button>
//                         <span className="addaduser-activity-logs-page-info">
//                             Page {currentPage} of {totalPages}
//                         </span>
//                         <button 
//                             onClick={() => handlePageChange(currentPage + 1)}
//                             disabled={currentPage === totalPages}
//                             className="addaduser-activity-logs-pagination-btn"
//                         >
//                             <FaChevronRight />
//                         </button>
//                     </div>
//                 </div>
//             )}
//             <div className="addaduser-activity-logs-list">
//                 {currentLogs.map((log) => (
//                     <div key={log._id} className={`addaduser-activity-logs-card ${log.status === 'success' ? 'addaduser-activity-logs-card--success' : 'addaduser-activity-logs-card--failed'}`}>
//                         <div className="addaduser-activity-logs-header">
//                             <div className="addaduser-activity-logs-timestamp">Created by: <span style={{color:"dodgerblue"}}>{formatToName(log.createdBy)}</span></div>
//                             <span className="addaduser-activity-logs-timestamp">
//                                 {new Date(log.timestamp).toLocaleString('en-GB', {
//                                     day: '2-digit',
//                                     month: 'numeric',
//                                     year: 'numeric',
//                                     hour: '2-digit',
//                                     minute: '2-digit',
//                                     second: '2-digit',
//                                     hour12: true
//                                 })}
//                             </span>
//                             <div className="addaduser-activity-logs-status-indicator-wrapper">
//                                 <div className={`addaduser-activity-logs-status-indicator addaduser-activity-logs-status-indicator--${log.status}`}>
//                                     {log.status === 'success' ? (
//                                         <svg className="addaduser-activity-logs-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                         </svg>
//                                     ) : (
//                                         <svg className="addaduser-activity-logs-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                                         </svg>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="addaduser-activity-logs-content">
//                             <p className="addaduser-activity-logs-message">{log.message}</p>
                            
//                             {log.actionType === "single_create" && log.status === "success" && log.report?.user && (
//                                 <div className="addaduser-account-details-card">
//                                     <h4 className="addaduser-account-details-title">Account Details</h4>
//                                     <div className="addaduser-account-detail-item">
//                                         <FaUser className="ad-user-detail-icon" />
//                                         <strong>Full Name:</strong> <span>{log.report.user.fullName}</span>
//                                     </div>
//                                     <div className="addaduser-account-detail-item">
//                                         <FaEnvelope className="ad-user-detail-icon" />
//                                         <strong>Logon Name:</strong> <span>{log.report.user.userLogonName}</span>
//                                     </div>
//                                     {log.report.user.organizationalUnit && (
//                                         <div className="addaduser-account-detail-item">
//                                             <FaBuilding className="ad-user-detail-icon" />
//                                             <strong>OU:</strong> <span>{log.report.user.organizationalUnit}</span>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* NEW: Show Logon Name for failed "Entry Already Exists" */}
//                             {log.actionType === "single_create" && 
//                              log.status === "failed" && 
//                              log.message?.includes("Entry Already Exists") && 
//                              log.report?.user?.userLogonName && (
//                                 <div className="addaduser-account-details-card">
//                                     <h4 className="addaduser-account-details-title">Account Already Exists</h4>
//                                     <div className="addaduser-account-detail-item">
//                                         <FaEnvelope className="ad-user-detail-icon" />
//                                         <strong>Logon Name:</strong> <span>{log.report.user.userLogonName}</span>
//                                     </div>
//                                 </div>
//                             )}

//                             {log.actionType === "bulk_create" && (
//                                 <div className="addaduser-activity-logs-bulk-summary">
//                                     <p>Total Users: {log.totalUsers}</p>
//                                     <p>Success: {log.successCount}</p>
//                                     <p>Failed: {log.failureCount}</p>
//                                 </div>
//                             )}

//                             <div className="addaduser-activity-logs-details">
//                                 <span className="addaduser-activity-logs-adserver">AD Server: {log.adServer}</span>
//                                 <span className="addaduser-activity-logs-action-type">Action: {log.actionType.replace('_', ' ')}</span>
//                             </div>
//                         </div>
//                         {log.report && log.report.length > 0 && (
//                             <div className="addaduser-activity-logs-actions">
//                                 <button 
//                                     className="addaduser-activity-logs-view-report-btn" 
//                                     onClick={() => handleViewReport(log)}
//                                 >
//                                     <FaFileAlt size={16} /> View Detailed Report
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>

//             {/* Dynamic Modal for Detailed Report (unchanged) */}
//             {showModal && selectedLog && (
//                 <div className="addaduser-activity-logs-modal-overlay" onClick={closeModal}>
//                     <div className="addaduser-activity-logs-modal-content" onClick={e => e.stopPropagation()}>
//                         <button className="addaduser-activity-logs-modal-close" onClick={closeModal}>&times;</button>
//                         <h2 className="addaduser-activity-logs-modal-title">Report for {selectedLog.actionType.replace('_', ' ')}</h2>
//                         <p className="addaduser-activity-logs-modal-timestamp">
//                             <small>Report generated on: </small>
//                             {new Date(selectedLog.timestamp).toLocaleString('en-GB', {
//                                 day: '2-digit',
//                                 month: 'short',
//                                 year: 'numeric',
//                                 hour: '2-digit',
//                                 minute: '2-digit',
//                                 second: '2-digit',
//                                 hour12: true
//                             })}
//                         </p>
//                         <div className="addaduser-activity-logs-modal-report-list">
//                             {selectedLog.report.map((reportItem, index) => (
//                                 <div key={index} className="addaduser-activity-logs-modal-report-item">
//                                     <p><strong>User:</strong> {reportItem.user?.fullName || 'N/A'}</p>
//                                     <p><strong>Status:</strong> <span className={`status--${reportItem.status}`}>{reportItem.status}</span></p>
//                                     {renderReason(reportItem.reason)}
//                                     <p><strong>OU:</strong> {reportItem.user?.organizationalUnit || 'N/A'}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default AddnewADUserActivityLogs;