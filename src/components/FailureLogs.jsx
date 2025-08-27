import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Box,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import {
  FaUserCircle,
  FaUser,
  FaCalendarAlt,
  FaInfoCircle,
  FaTimesCircle,
  FaServer,
} from "react-icons/fa";
import axios from "axios";
import "../styles/FailureLogs.css";
import NoDataImage from "../assets/noData.png"; // Ensure you have a relevant image in your assets folder

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Your API URL from environment variables

function FailureLogs() {
  const [failureLogs, setFailureLogs] = useState([]); // Stores fetched failure logs
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const options = { year: "numeric", month: "short", day: "2-digit", timeZone: "Asia/Kolkata" };
        return new Date(dateString).toLocaleDateString("en-US", options);
      };

   
  

  // Fetch failure logs from the backend
  useEffect(() => {
    const fetchFailureLogs = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/AD/password-reset-failure-logs`
        );

        setFailureLogs(response.data);
      } catch (error) {
        console.error("Error fetching failure logs:", error);
      }
    };

    fetchFailureLogs();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  console.log("failureLogs --> ", failureLogs);

  const filteredData = failureLogs.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  console.log("filteredData --> ", filteredData);

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  console.log("paginatedData --> ", paginatedData);

            {/* Check if there are logs */}
            {paginatedData.length > 0 ? (
                <div className="failure-logs-cards-container">
                    {paginatedData.map((item, index) => (
                        <Card key={index} className="failure-logs-card">
                            <CardContent className="failure-logs-card-content">
                                <div className="failure-logs-card-item">
                                    <div> <FaUserCircle className="failure-logs-icon domain-icon" /></div>
                                    <div> <Typography variant="body1">
                                        <strong>Domain User Account:</strong> {item.upn}
                                    </Typography></div>
                                </div>
                                <div className="failure-logs-card-item">
                                    <div><FaUser className="failure-logs-icon attempted-icon" /></div>
                                    <div><Typography variant="body1">
                                        <strong>Attempted by:</strong> {item.email}
                                    </Typography></div>
                                </div>
                                <div className="failure-logs-card-item">
                                    <div> <FaCalendarAlt className="failure-logs-icon date-icon" /></div>
                                    <div> <Typography variant="body1">
                                        <strong>Date & Time:</strong> {formatDate(item.resetDate)}, {new Date(item.resetDate).toLocaleTimeString()}
                                    </Typography></div>
                                </div>
                                <div className="failure-logs-card-item">
                                    <div><FaInfoCircle className="failure-logs-icon details-icon" /></div>
                                    <div><Typography variant="body1">
                                        <strong>Reason:</strong> {item.reason}
                                    </Typography></div>
                                </div>
                                <div className="failure-logs-card-item">
                                    <div><FaServer className="failure-logs-icon server-icon" /></div>
                                    <div><Typography variant="body1">
                                        <strong>UserDN:</strong> {item.userDn}
                                    </Typography></div>
                                </div>
                                <div className="failure-logs-card-item">
                                    <div> <FaTimesCircle className="failure-logs-icon failed-icon" /></div>
                                    <div> <Typography variant="body1">
                                        <strong>Failed</strong> {item.status}
                                    </Typography></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Box className="failure-logs-no-data">
                    <img src={NoDataImage} alt="No Data Found" className="failure-logs-no-data-image" />
                    <Typography variant="h6" className="failure-logs-no-data-text">
                        No data found
                    </Typography>
                </Box>
            )}
  return (
    <div className="failure-logs-container">
      <div className="failure-logs-header-container">
        {/* Heading */}
        <div className="admin-dashboard-header-fontstyle">
          <h1>
            <span className="admin-dashboard-header-first-character">F</span>
            ailure&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">L</span>
            ogs&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">U</span>
            pdate
          </h1>
        </div>

        <div className="failure-logs-header-rightside-container">
          {/* Search Box */}
          <div className="failure-logs-search-container">
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              className="failure-logs-search-box"
            />
          </div>
          {/* Pagination */}
          <div className="failure-logs-pagination-container">
            <Pagination
              count={Math.ceil(filteredData.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              color="primary"
              className="failure-logs-pagination"
            />
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              size="small"
              className="failure-logs-rows-select"
            >
              {[10, 20, 30].map((option) => (
                <MenuItem key={option} value={option}>
                  {option} per page
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Check if there are logs */}
      {paginatedData.length > 0 ? (
        <div className="failure-logs-cards-container">
          {paginatedData.map((item, index) => (
            <div className="failure-logs-card">
              <div className="failure-logs-card-head">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <FaUserCircle
                    style={{ fontSize: "1.5rem", color: "#318CE7" }}
                  />
                  <div
                    style={{
                      fontWeight: "bold",
                      fontFamily: "proximaNovaBold",
                      fontSize: "1.2rem",
                    }}
                  >
                    Domain User Account
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontFamily: "proximaNova-regular",
                      color: "gray",
                      fontWeight: "normal",
                    }}
                  >
                    {item.upn}
                  </div>
                </div>
              </div>

              <div className="failure-logs-card-head">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <FaUser style={{ fontSize: "1.3rem", color: "#4B0082" }} />
                  <div
                    style={{
                      fontWeight: "bold",
                      fontFamily: "proximaNovaBold",
                      fontSize: "1.2rem",
                    }}
                  >
                    Attempted by
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontFamily: "proximaNova-regular",
                      color: "gray",
                      fontWeight: "normal",
                    }}
                  >
                    {item.email}
                  </div>
                </div>
              </div>

              <div className="failure-logs-card-head">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <FaCalendarAlt
                    style={{ fontSize: "1.3rem", color: "blueviolet" }}
                  />
                  <div
                    style={{
                      fontWeight: "bold",
                      fontFamily: "proximaNovaBold",
                      fontSize: "1.2rem",
                    }}
                  >
                    Date & Time
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontFamily: "proximaNova-regular",
                      color: "gray",
                      fontWeight: "normal",
                    }}
                  >
                    {formatDate(item.resetDate)},{" "}
                    {new Date(item.resetDate).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="failure-logs-card-head">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <FaInfoCircle
                    style={{ fontSize: "1.3rem", color: "#17B169" }}
                  />
                  <div
                    style={{
                      fontWeight: "bold",
                      fontFamily: "proximaNovaBold",
                      fontSize: "1.2rem",
                    }}
                  >
                    Reason
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontFamily: "proximaNova-regular",
                      color: "gray",
                      fontWeight: "normal",
                    }}
                  >
                    {item.reason}
                  </div>
                </div>
              </div>

              <div className="failure-logs-card-head">
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <FaServer style={{ fontSize: "1.3rem", color: "#FF7F50" }} />
                  <div
                    style={{
                      fontWeight: "bold",
                      fontFamily: "proximaNovaBold",
                      fontSize: "1.2rem",
                    }}
                  >
                    User DN
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <div
                    style={{
                      fontSize: "1rem",
                      fontFamily: "proximaNova-regular",
                      color: "black",
                      fontWeight: "normal",
                      letterSpacing: "1px",
                    }}
                  >
                    {item.userDn}
                  </div>
                </div>
              </div>

              <div
                className="failure-logs-card-head"
                style={{ border: "none" }}
              >
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <FaTimesCircle style={{ fontSize: "1.5rem", color: "red" }} />
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontFamily: "sans-serif",
                      color: "gray",
                      fontWeight: "bold",
                    }}
                  >
                    Failed
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Box className="failure-logs-no-data">
          <img
            src={NoDataImage}
            alt="No Data Found"
            className="failure-logs-no-data-image"
          />
          <Typography variant="h6" className="failure-logs-no-data-text">
            No data found
          </Typography>
        </Box>
      )}

      {/* {paginatedData.length > 0 ? (
        <div className="failure-logs-cards-container">
          {paginatedData.map((item, index) => (
            <Card key={index} className="failure-logs-card">
              <CardContent className="failure-logs-card-content">
                <div className="failure-logs-card-item">
                  <div>
                    <strong className="failure-card-head">
                      Domain User Account:
                    </strong>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <FaUserCircle className="failure-logs-icon attempted-icon" />
                    <Typography
                      variant="body1"
                      style={{ color: "gray", fontSize: "1.1rem" }}
                    >
                      {item.email}
                    </Typography>
                  </div>
                </div>
                <div className="failure-logs-card-item">
                  <div>
                    <strong className="failure-card-head">Attempted by:</strong>
                  </div>
                  <div style={{ display: "flex", gap: "10px",alignItems:"center" }}>
                    <FaUser className="failure-logs-icon attempted-icon" />
                    <Typography
                      variant="body1"
                      style={{ color: "gray", fontSize: "1.1rem",wordBreak: "break-word", // Ensures long words break into new lines
                        whiteSpace: "normal", 
                        overflowWrap: "break-word", 
                     }}
                    >
                      {item.upn}
                    </Typography>
                  </div>
                </div>
                <div className="failure-logs-card-item">
                  <div>
                    <strong className="failure-card-head">Date & Time:</strong>
                  </div>
                  <div style={{ display: "flex", gap: "10px",alignItems:"center" }}>
                    <FaCalendarAlt className="failure-logs-icon date-icon" />
                    <Typography
                      variant="body1"
                      style={{ color: "gray", fontSize: "1.1rem" }}
                    >
                      {formatDate(item.resetDate)},{" "}
                      {new Date(item.resetDate).toLocaleTimeString()}
                    </Typography>
                  </div>
                </div>

                <div className="failure-logs-card-item">
                  <div>
                    <strong className="failure-card-head">Reason:</strong>
                  </div>
                  <div style={{ display: "flex", gap: "10px" ,alignItems:"center"}}>
                    <FaInfoCircle className="failure-logs-icon details-icon" />
                    <Typography
                      variant="body1"
                      style={{ color: "gray", fontSize: "1.1rem" ,wordBreak: "break-word", // Ensures long words break into new lines
                        whiteSpace: "normal", 
                        overflowWrap: "break-word", }}
                    >
                      {item.reason}
                    </Typography>
                  </div>
                </div>

                <div className="failure-logs-card-item" >
                  

                  <div>
                    <strong className="failure-card-head">UserDN:</strong>
                  </div>
                  <div style={{ display: "flex", gap: "10px",alignItems:"center" }}>
                    <FaServer className="failure-logs-icon server-icon" style={{fontSize:"2rem"}} />
                    <Typography
                      variant="body1"
                      style={{ color: "gray", fontSize: "1.1rem",wordBreak: "break-word", // Ensures long words break into new lines
                      
                        overflowWrap: "break-word",flexGrow: 1,  }}
                    >
                      {item.userDn}
                    </Typography>
                  </div>

                </div>

                <div className="failure-logs-card-item">
                 

                 
                  <div style={{ display: "flex", gap: "10px" }}>
                    <FaTimesCircle className="failure-logs-icon failed-icon" />
                    <Typography
                      variant="body1"
                      style={{ color: "gray", fontSize: "1.1rem" }}
                    >
                      {"Failed"}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Box className="failure-logs-no-data">
          <img
            src={NoDataImage}
            alt="No Data Found"
            className="failure-logs-no-data-image"
          />
          <Typography variant="h6" className="failure-logs-no-data-text">
            No data found
          </Typography>
        </Box>
      )} */}
    </div>
  );
}

export default FailureLogs;

// import React, { useState } from "react";
// import { Card, CardContent, Typography, TextField, MenuItem, Divider } from "@mui/material";
// import Pagination from "@mui/material/Pagination";
// import Select from "@mui/material/Select";
// import InputAdornment from "@mui/material/InputAdornment";
// import SearchIcon from "@mui/icons-material/Search";
// import { FaUserCircle, FaUser, FaCalendarAlt, FaInfoCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
// import "../styles/FailureLogs.css";

// const data = Array.from({ length: 50 }, (_, index) => ({
//   id: index + 1,
//   domainAccount: `Domain-${index + 1}`,
//   attemptedBy: `User-${index + 1}`,
//   dateTime: `2025-03-05 12:${index < 10 ? "0" : ""}${index} PM`,
//   accountDetails: `Details-${index + 1}`,
//   status: index % 2 === 0 ? "Success" : "Failed",
// }));

// function FailureLogs() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [page, setPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//     setPage(1);
//   };

//   const handleChangePage = (_, newPage) => {
//     setPage(newPage);
//   };

//   const handleRowsPerPageChange = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(1);
//   };

//   const filteredData = data.filter((item) =>
//     Object.values(item).some((value) =>
//       value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//   return (
//     <div className="failure-logs-container">
//       <div className="failure-logs-header-container">
//         {/* Heading */}
//         <div className="admin-dashboard-header-fontstyle">
//           <h1>
//             <span className="admin-dashboard-header-first-character">F</span>ailure&nbsp;&nbsp;
//             <span className="admin-dashboard-header-first-character">L</span>ogs&nbsp;&nbsp;
//             <span className="admin-dashboard-header-first-character">U</span>pdate
//           </h1>
//         </div>

//         <div className="failure-logs-header-rightside-container">
//           {/* Search Box */}
//           <div className="failure-logs-search-container">
//             <TextField
//               label="Search"
//               variant="outlined"
//               size="small"
//               value={searchTerm}
//               onChange={handleSearch}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <SearchIcon />
//                   </InputAdornment>
//                 ),
//               }}
//               className="failure-logs-search-box"
//             />
//           </div>
//           {/* Pagination */}
//           <div className="failure-logs-pagination-container">
//             <Pagination
//               count={Math.ceil(filteredData.length / rowsPerPage)}
//               page={page}
//               onChange={handleChangePage}
//               color="primary"
//               className="failure-logs-pagination"
//             />
//             <Select value={rowsPerPage} onChange={handleRowsPerPageChange} size="small" className="failure-logs-rows-select">
//               {[10, 20, 30].map((option) => (
//                 <MenuItem key={option} value={option}>
//                   {option} per page
//                 </MenuItem>
//               ))}
//             </Select>
//           </div>
//         </div>
//       </div>

//       {/* Cards */}
//       <div className="failure-logs-cards-container">
//         {paginatedData.map((item) => (
//           <Card key={item.id} className="failure-logs-card">
//             <CardContent className="failure-logs-card-content">
//               <div className="failure-logs-card-item">
//                 <FaUserCircle className="failure-logs-icon domain-icon" />
//                 <Typography variant="body1">
//                   <strong>Domain Account:</strong> {item.domainAccount}
//                 </Typography>
//               </div>
//               <div className="failure-logs-card-item">
//                 <FaUser className="failure-logs-icon attempted-icon" />
//                 <Typography variant="body1">
//                   <strong>Attempted By:</strong> {item.attemptedBy}
//                 </Typography>
//               </div>
//               <div className="failure-logs-card-item">
//                 <FaCalendarAlt className="failure-logs-icon date-icon" />
//                 <Typography variant="body1">
//                   <strong>Date & Time:</strong> {item.dateTime}
//                 </Typography>
//               </div>
//               <div className="failure-logs-card-item">
//                 <FaInfoCircle className="failure-logs-icon details-icon" />
//                 <Typography variant="body1">
//                   <strong>Account Details:</strong> {item.accountDetails}
//                 </Typography>
//               </div>
//               <div className="failure-logs-card-item">
//                 {item.status === "Success" ? (
//                   <FaCheckCircle className="failure-logs-icon success-icon" />
//                 ) : (
//                   <FaTimesCircle className="failure-logs-icon failed-icon" />
//                 )}
//                 <Typography variant="body1">
//                   <strong>Status:</strong> {item.status}
//                 </Typography>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default FailureLogs;
