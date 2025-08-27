import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";
import "../styles/CalendarView.css";
import "../styles/fonts.css";

const localizer = momentLocalizer(moment);

function CalendarView() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [successLogs, setSuccessLogs] = useState([]);
  const [failureLogs, setFailureLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        // Fetch Success Logs
        const successResponse = await fetch(
          `${API_BASE_URL}/AD/password-reset-logs`
        );
        const successData = await successResponse.json();
        setSuccessLogs(successData);

        // Fetch Failure Logs
        const failureResponse = await fetch(
          `${API_BASE_URL}/AD/password-reset-failure-logs`
        );
        const failureData = await failureResponse.json();
        setFailureLogs(failureData);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    }

    fetchLogs();
  }, []);

  // Map logs to events
  const successEvents = successLogs.map((log) => ({
    title: `The Password has been updated by (${log.email})\n for the Domain Account (${log.upn})`,
    start: new Date(log.resetDate),
    end: new Date(log.resetDate),
    allDay: false,
    color: "#007bff",
    type: "success",
  }));

  const failureEvents = failureLogs.map((log) => ({
    title: `Password Reset Failed for (${log.email})\n on Domain Account (${log.upn})`,
    start: new Date(log.resetDate),
    end: new Date(log.resetDate),
    allDay: false,
    color: "red",
    type: "failure",
  }));

  const allEvents = [...successEvents, ...failureEvents];

  // Filter events based on search query
  useEffect(() => {
    if (searchQuery) {
      const results = allEvents.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(results);
    } else {
      setFilteredEvents([]);
    }
  }, [searchQuery, allEvents]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEvent(null);
  };

  const eventsToShow = searchQuery ? filteredEvents : allEvents;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle missing date
    const date = new Date(dateString);
  
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Ensures AM/PM format
    });
  };  

  return (
    <div className="calendar-view">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="admin-dashboard-header-fontstyle">
          <h1>
            <span className="admin-dashboard-header-first-character">E</span>vent&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">U</span>pdate&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">L</span>ogs
          </h1>
        </div>

        {/* Search Box */}
        <div className="search-container" style={{ textAlign: "right", marginBottom: "10px" }}>
          <TextField
            placeholder="Search Events logs"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: "300px" }}
          />
          {searchQuery && filteredEvents.length === 0 && (
            <Typography variant="body2" color="error" sx={{ marginTop: "10px" }}>
              No search results found.
            </Typography>
          )}
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={eventsToShow}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100vh" }}
          onSelectEvent={handleEventClick}
          eventPropGetter={(event) => ({
            style: { backgroundColor: event.color },
          })}
        />
      </div>

      {/* Event Details Modal */}
      <Modal open={open} onClose={handleClose} className="password-update-info-modal">
        <Box sx={{ padding: 4, backgroundColor: "white", borderRadius: 2 }}>
          {selectedEvent && (
            <>
              <Typography variant="h5" component="h2" color={selectedEvent.color}>
                {selectedEvent.type === "success" ? "Success Event Details" : "Failure Event Details"}
              </Typography>
              <Typography>
                <strong>Title:</strong> {selectedEvent.title}
              </Typography>

              {/* Extract Email and Domain Account safely */}
              <Typography>
                <strong>Attempted by:</strong>
                <span style={{ color: "#007bff" }}>
                  {selectedEvent.title?.match(/by \(([^)]+)\)/)?.[1] ||
                    selectedEvent.title?.match(/for \(([^)]+)\)/)?.[1] ||
                    "N/A"}
                </span>
              </Typography>
              <Typography>
                <strong>Domain Account:</strong>
                <span style={{ color: "#28a745" }}>
                  {selectedEvent.title?.match(/Account \(([^)]+)\)/)?.[1] || "N/A"}
                </span>
              </Typography>

              <Typography>
                <strong>Date:</strong> {selectedEvent.start ? formatDate(selectedEvent.start) : "N/A"}
              </Typography>
            </>
          )}
          <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default CalendarView;
