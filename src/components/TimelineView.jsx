import React, { useState, useEffect } from "react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import { Typography, Paper, TextField } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Success Icon
import CancelIcon from "@mui/icons-material/Cancel"; // Failure Icon
import "../styles/TimelineView.css";

function TimelineView() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const [successResponse, failureResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/AD/password-reset-logs`),
          fetch(`${API_BASE_URL}/AD/password-reset-failure-logs`),
        ]);

        const successData = await successResponse.json();
        const failureData = await failureResponse.json();

        // Add missing "status" field for failure logs if not present
        const formattedFailureLogs = failureData.map(log => ({ ...log, status: "failure" }));

        // Merge both logs & sort by date
        const combinedLogs = [...successData, ...formattedFailureLogs].sort(
          (a, b) => new Date(b.resetDate) - new Date(a.resetDate)
        );

        setLogs(combinedLogs);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    }

    fetchLogs();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} , ${date.toLocaleTimeString()}`;
  };

  const filteredLogs = searchQuery
    ? logs.filter(
        (log) =>
          (log.email && log.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (log.upn && log.upn.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : logs;

  return (
    <div className="timeline-view">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="admin-dashboard-header-fontstyle">
          <h1>
            <span className="admin-dashboard-header-first-character">T</span>imeLine&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">M</span>ap&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">U</span>pdate
          </h1>
        </div>

        <div className="search-container" style={{ textAlign: "right", marginBottom: "10px" }}>
          <TextField
            placeholder="Search logs"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: "300px" }}
          />
          {searchQuery && filteredLogs.length === 0 && (
            <Typography variant="body2" color="error" sx={{ marginTop: "10px" }}>
              No search results found.
            </Typography>
          )}
        </div>
      </div>

      <Timeline position="alternate">
        {filteredLogs.map((log, index) => (
          <TimelineItem key={index}>
            {/* <TimelineSeparator>
              <TimelineDot color={log.status === "failure" ? "error" : "primary"} />
              {index < filteredLogs.length - 1 && <TimelineConnector />}
            </TimelineSeparator> */}
            <TimelineSeparator>
              {log.status === "failure" ? (
                <CancelIcon sx={{ color: "red", fontSize: 30 }} />
              ) : (
                <CheckCircleIcon sx={{ color: "green", fontSize: 30 }} />
              )}
              {index < filteredLogs.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3} className="timeline-paper">
                <Typography
                  variant="h6"
                  component="h1"
                  color={log.status === "failure" ? "error" : "primary"}
                >
                  {log.status === "failure" ? "Failed Password Reset Attempt" : "Success Password Update Log"}
                </Typography>
                <Typography>
                  <b>The Domain Account Password {log.status === "failure" ? "reset failed for" : "updated by"}</b>{" "}
                  <span style={{ color: "#A337b6" }}>{log.upn || "N/A"}</span> <br />
                  <b>attempted by </b> <span style={{ color: "#28a745" }}>{log.email}</span> <br />
                  <b>Date and Time:</b> {formatDateTime(log.resetDate)}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}

export default TimelineView;
