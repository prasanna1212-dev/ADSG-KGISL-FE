import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

const UserDetailsForm = ({ onSendOtp , domain,username, mailId,setDomain,setMailId,setUsername}) => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [ou, setOu] = useState("");
  // const [username, setUsername] = useState("");
  // const [mailId, setMailId] = useState("");
  const [ouOptions, setOuOptions] = useState([]);
  const [usernameOptions, setUsernameOptions] = useState([]);
  // const [domain, setDomain] = useState("");
  const [domains, setDomains] = useState([]); // State for selected domains

  // States for Snackbar
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState(""); // success or error

  // Fetch organizational units (OUs)
  const fetchOUs = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/AD/ad-OUdetails`
      );
      const { organizationalUnits } = response.data;
      setOuOptions(organizationalUnits);
    } catch (error) {
      console.error("Error fetching OUs:", error);
    }
  };

  // Fetch selected domains
  const fetchSelectedDomains = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/AD/selected-domains`);
      setDomains(response.data.selectedDomains || []);
    } catch (error) {
      console.error("Error fetching selected domains:", error);
    }
  };

  // Fetch users based on selected OU
  const fetchOUUsers = async () => {
    try {
      const apiUrl = `${API_BASE_URL}/AD/ad-ouUsers/DC01.kggroup.com?ou=${ou}`;
      const response = await axios.get(apiUrl);
      setUsernameOptions(response.data.users);
    } catch (error) {
      console.error("Error fetching OU users:", error);
    }
  };

  // Fetch OUs on component mount
  useEffect(() => {
    fetchOUs();
    fetchSelectedDomains();
  }, []);

  // Fetch users when OU is selected
  useEffect(() => {
    if (ou) {
      fetchOUUsers();
    }
  }, [ou]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSendOtp(ou, username,domain, mailId); // Assuming this is an async function      
    } catch (error) {
      // Error toast
      setToastMessage("Failed to send OTP. Please try again.");
      setToastSeverity("error");
      setOpenToast(true);
    }
  };

  // Close toast handler
  const handleCloseToast = () => {
    setOpenToast(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <Grid container spacing={2}>
          {/* Username Dropdown */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <TextField
                label="Enter Username"
                variant="outlined"
                type=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                sx={{
                  backgroundColor: "white", // White background for TextField
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Domain</InputLabel>
              <Select
                label="Select domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                fullWidth
                sx={{
                  backgroundColor: "white", // White background for Select dropdown
                }}
              >
                {domains.map((each) => (
                  <MenuItem key={each} value={each}>
                    {each}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Mail ID Input */}
          <Grid item xs={12}>
            <TextField
              label="Mail ID"
              variant="outlined"
              type="email"
              value={mailId}
              onChange={(e) => setMailId(e.target.value)}
              fullWidth
              sx={{
                backgroundColor: "white", // White background for TextField
              }}
            />
          </Grid>

          {/* Send OTP Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="error" // Use the 'error' color for a red button
              fullWidth
              sx={{
                backgroundColor: "#df3435", // Apply red background to the button
                "&:hover": {
                  backgroundColor: "#d32f2f", // Darker red on hover
                },
              }}
            >
              Send OTP
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Toast Snackbar for Success/Failure */}
      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{
          vertical: "top", // Position the Snackbar at the top
          horizontal: "left", // Position the Snackbar at the left
        }}
        sx={{
          "& .MuiSnackbarContent-root": {
            fontSize: "1.2rem", // Increase font size of the toast
            padding: "12px 24px", // Increase padding for larger toast
            backgroundColor:
              toastSeverity === "success" ? "dodgerblue" : undefined, // Blue color for success
            color: toastSeverity === "success" ? "white" : undefined, // White text for success
            borderColor: toastSeverity === "success" ? "dodgerblue" : undefined, // Optional border color for success
          },
        }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{ width: "100%", zIndex:"5000" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserDetailsForm;
