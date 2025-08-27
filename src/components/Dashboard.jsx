import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserDetailsForm from "./UserDetailsForm";
import OtpVerificationModal from "./OtpVerificationModal";
import kgnlogo from "../assets/logo_bg.png";
import PasswordReset from "./PasswordReset";
import gridBG from "../assets/whiteBG1.jpeg";
import axios from "axios";
import "./Dashboard.css";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Paper,
  Alert,
  Snackbar,
  IconButton,
  CircularProgress,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/fonts.css";
import "../styles/Dashboard.css";
import { Tooltip } from 'antd';
import direct from "../assets/direct.gif"  

const Dashboard = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [currentStep, setCurrentStep] = useState(1); // Step tracker
 
  const [username, setUsername] = useState("");
  const [mailId, setMailId] = useState("");


   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [toastSeverity, setToastSeverity] = useState(""); // "success" or "error"
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [domain, setdomain] = useState("");
  const [logs, setLogs] = useState([]);

  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate();


   const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

   const resetFields = () => {
    setUsername("");
    setMailId("");
    setdomain("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setCurrentStep(1);
  };


  const handleResetPassword = async (password) => {
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE_URL}/AD/reset-password`, { upn: `${username}@${domain}`, newPassword: password, email: mailId });

      if (response.status === 200) {
        setToastSeverity("success");
        setToastMessage("Password has been updated sucessfully!");
        setOpenToast(true);
        setLoading(false);

        resetFields();
        await fetchLogs(); // ⬅️ Add this to refresh the count
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setToastSeverity("error");
        setToastMessage("Password reset failed.");
        setOpenToast(true);
      } else {
        setToastSeverity("error");
        setToastMessage("An unexpected error occurred during password reset.");
        setOpenToast(true);

      }
      setLoading(false)
      console.error('Unexpected error:', error);
    }
  };

  const handleCheckUser = async (username, domain) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/AD/check-ad-user`,
        { upn: `${username}@${domain}` }
      );

      if (response.data.message === "User found.") {
        return true; // User found
      }
    } catch (error) {
      // Handle 404 specifically for "User not found"
      if (
        error.response &&
        error.response.status === 404 &&
        error.response.data.message === "User not found."
      ) {
        setToastSeverity("error");
        setToastMessage("User not found");
        setOpenToast(true);
      } else {
        console.error("Unexpected error:", error);
        setToastSeverity("error");
        setToastMessage(
          "An unexpected error occurred while checking the user."
        );
        setOpenToast(true);
      }
    }

    return false; // Default to user not found
  };

  console.log("toastMessage --> ",toastMessage)

  // Step 1: Handle sending OTP
  const handleSendOtp = async () => {
   
   
    setError(null);
    setLoading(true);

    const userFound = await handleCheckUser(username, domain);

    if (userFound) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/OTP/send-otp`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email: mailId,upn: `${username}@${domain}` }),
          }
        );

        const data = await response.json();

        if (data.success) {
          console.log("OTP Sent:", data);

          setToastSeverity("success");
          setToastMessage("OTP send sucessfully!");
          setOpenToast(true);
          setCurrentStep(2); // Proceed to next step
          setLoading(false);
          setTimerActive(true)
        } else {
          setToastSeverity("error");
          setToastMessage("Failed to send OTP. Please try again.");
          setOpenToast(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        setError("Error sending OTP. Server might be down.");
        toast.error("Error sending OTP. Server might be down.");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };
  const handleCloseToast = () => {
    setOpenToast(false);
  };

  // Step 2: Handle OTP Verification
  const handleVerifyOtp = (otpInput) => {
    setOtp(otpInput);
    setError(null);

    fetch(`${API_BASE_URL}/OTP/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: mailId, otp: otpInput,username }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("OTP Verified:", data);
          setCurrentStep(3); // Move to Step 3
          setToastSeverity("success");
          setToastMessage("OTP Verified Successfully!");
          setOpenToast(true);
        } else {
          setToastSeverity("error");
          setToastMessage("Invalid OTP. Please try again.");
          // setError("Invalid OTP. Please check again.");
          setOpenToast(true);
        }
        setTimerActive(false)
      })
      .catch(() => {
        setToastSeverity("error");
        setToastMessage("Error verifying OTP.");
        setOpenToast(true); // Trigger the toast
        setTimerActive(false)
      });
  };



  const handleLogout = () => {
    // Logic for logging out (e.g., clearing session, tokens, etc.)
    // Navigate to root ("/")
    navigate("/");
  };

  
      const fetchLogs = async () => {
        try {
          const [successResponse, failureResponse] = await Promise.all([
            // 🔹 API to get SUCCESS logs
            fetch(`${API_BASE_URL}/AD/password-reset-logs`),
    
            // 🔹 API to get FAILURE logs
            fetch(`${API_BASE_URL}/AD/password-reset-failure-logs`),
          ]);
    
          const successData = await successResponse.json();
          const failureData = await failureResponse.json();
    
          // Add "failure" status to failure logs
          const formattedFailureLogs = failureData.map(log => ({ ...log, status: "failure" }));
    
          // Combine both and sort by date
          const combinedLogs = [...successData, ...formattedFailureLogs].sort(
            (a, b) => new Date(b.resetDate) - new Date(a.resetDate)
          );
    
          setLogs(combinedLogs); // Set combined logs to state
        } catch (error) {
          console.error("Error fetching logs:", error);
        }
      }

    useEffect(() => {
      fetchLogs(); // 🔁 Called once on component mount
    }, []);
    
    const successCount = logs.filter(log => log.status !== "failure").length;
    const failureCount = logs.filter(log => log.status === "failure").length;
    const totalCount = logs.length; // 👈 This is what you want to display

     const [currentCount, setCurrentCount] = useState(0);
    
      useEffect(() => {
        let start = 0;
        const end = totalCount;
        if (start === end) return;
      
        const duration = 1000; // total animation duration in ms
        const incrementTime = 20;
        const steps = Math.floor(duration / incrementTime);
        const increment = Math.ceil(end / steps);
      
        const counter = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(counter);
          }
          setCurrentCount(start);
        }, incrementTime);
      
        return () => clearInterval(counter);
      }, [totalCount]);


  return (
    <Box
      className="dashboard-container"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        // overflow: "hidden",
      }}
    >
      {/* Header */}
      {loading && (
        <div className="loader-backdrop">
          <CircularProgress />
        </div>
      )}

      <AppBar
        position="sticky"
        sx={{
          flexShrink: 0,
          background: "transparent", 
          borderRadius: "8px", // Optional: Rounded corners
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          zIndex:"1000"
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <img src={kgnlogo} alt="Logo" className="logo" />
          <Tooltip title="Total number of OTPs sent!">
                 <div className>
                   <div
                     style={{
                       display: 'flex',
                       flexDirection: 'row',
                       alignItems: 'center',
                       justifyContent:'center',
                       backgroundColor: 'rgba(288, 288, 288)',
                       border: '2px solid #de1d34',
                       borderRadius: '10px',
                       padding: '1px 8px',
                       boxShadow: '0 0 25px rgba(238, 100, 100, 0.7)',
                       fontFamily: '"VT323", monospace',
                       color: '#ff1a1a',
                     }}
                   >
                     {/* Header */}
                     <div
                       style={{
                         display: 'flex',
                         alignItems: 'center',
                         fontSize: '26px',
                         marginBottom: '5px',
                         textShadow: '0 0 6px #ff1a1a',
                         letterSpacing: '1px',
                       }}
                     >
                       <img
                        src={direct}
                        alt="Sent Icon"
                        width="46"
                        height="46"
                        style={{
                          marginRight: '10px',
                        }}
                      />
                     </div>
         
                     {/* Flip Counter */}
                     {/* Flip Counter Box — Updated */}
               <div className="otp-flip-box-dashboard">
                 {String(currentCount)
                   .padStart(4, '0')
                   .split('')
                   .map((digit, index) => (
                     <div className="otp-digit-box-dashboard" key={index}>
                       <span className="otp-digit-dashboard">{digit}</span>
                     </div>
                   ))}
               </div>
         
             </div>
           </div>
         </Tooltip>
          <IconButton color="error" onClick={handleLogout}>
            <LogoutIcon /> {/* Logout icon */}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Error Message */}
      {/*{error && (
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}*/}

      {/* Main Content */}
      <Box
        className="DashBoard_mainContent"
        sx={{
          flex: 1, // Takes up remaining space
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          padding: 3,
        }}
      >
        {/* Step 1: User Details Form */}
        <Paper
          className="ContentOne"
          elevation={3}
          sx={{
            padding: 2,
            minHeight: "300px", // Ensures it fits the grid space
            opacity: currentStep >= 1 ? 1 : 0.6,
            pointerEvents: currentStep === 1 ? "auto" : "none",
            backgroundImage: `url(${gridBG})`, // Add your image URL here
            backgroundSize: "cover", // Ensure the image covers the entire space
            backgroundPosition: "center", // Center the background image
            backgroundRepeat: "no-repeat",
          }}
        >
          <Typography className="boxoneHeader"
            variant="h6"
            gutterBottom
            sx={{
              fontFamily: "'CallistaCustomFont', sans-serif", // Use the custom font name here
              fontWeight: 600, // Optional: Define font weight
              fontSize: "1.9rem", // Optional: Define font size
              color: "#df3435", // Optional: Define text color
            }}
          >
            <span style={{ color: "#143264" }}>A</span>ccount&nbsp;&nbsp;{" "}
            <span style={{ color: "#143264" }}>I</span>nformation
          </Typography>

          {/* Step Instructions */}
          <Box sx={{ mt: 2 }}>
            <Typography className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>1:</span>{" "}
              </strong>{" "}
              Please enter your official username.
            </Typography>
            <Typography className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
                mt: 1,
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>2:</span>{" "}
              </strong>{" "}
              Select the domain corresponding to your account.
            </Typography>
            <Typography
              className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
                mt: 1,
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>3:</span>{" "}
              </strong>{" "}
              Provide your official email address to receive a security code
              required to proceed with resetting your password.
            </Typography>
          </Box>

          <UserDetailsForm
            onSendOtp={handleSendOtp}
             domain={domain}
            mailId={mailId}
            username={username}
            setMailId={setMailId}
            setDomain={setdomain}
            setUsername={setUsername}
            isEditable={currentStep === 1}
          />
        </Paper>

        {/* Step 2: OTP Verification */}
        <Paper
          className="ContentTwo"
          elevation={3}
          sx={{
            padding: 2,
            minHeight: "300px", // Ensures it fits the grid space
            opacity: currentStep >= 2 ? 1 : 0.5,
            pointerEvents: currentStep === 2 ? "auto" : "none",
            backgroundImage: `url(${gridBG})`, // Add your image URL here
            backgroundSize: "cover", // Ensure the image covers the entire space
            backgroundPosition: "center", // Center the background image
            backgroundRepeat: "no-repeat",
          }}
        >
          <Typography className="boxoneHeader"
            variant="h6"
            gutterBottom
            sx={{
              fontFamily: "'CallistaCustomFont', sans-serif", // Use the custom font name here
              fontWeight: 600, // Optional: Define font weight
              fontSize: "1.9rem", // Optional: Define font size
              color: "#df3435", // Optional: Define text color
            }}
          >
            <span style={{ color: "#143264" }}>C</span>onfirm&nbsp;&nbsp;{" "}
            <span style={{ color: "#143264" }}>S</span>ecurity&nbsp;&nbsp;{" "}
            <span style={{ color: "#143264" }}>C</span>ode
          </Typography>

          {/* Step Instructions */}
          <Box sx={{ mt: 2 }}>
            <Typography className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>1:</span>{" "}
              </strong>{" "}
              You will receive a security code sent to your official email
              address.
            </Typography>
            <Typography className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
                mt: 1,
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>2:</span>{" "}
              </strong>{" "}
              Enter the six-digit security code in the input box below and
              verify it to proceed with resetting your password
            </Typography>
          </Box>

          <OtpVerificationModal
            onVerifyOtp={handleVerifyOtp}
            isEditable={currentStep === 2}
            timerActive={timerActive}
            setTimerActive={setTimerActive}
          />

          <Snackbar
            open={openToast}
            autoHideDuration={3000}
            onClose={handleCloseToast}
            anchorOrigin={{
              vertical: "bottom", // Position the Snackbar at the top
              horizontal: "center", // Position the Snackbar in the center
            }}
            sx={{
              "& .MuiSnackbarContent-root": {
                fontSize: "1.2rem", // Increase font size of the toast
                padding: "12px 24px", // Increase padding for larger toast
                backgroundColor:
                  toastSeverity === "success" ? "green" : toastSeverity === "error" ? "red" : undefined, // Green for success, red for error
                color: "white", // White text for better contrast
                borderColor: toastSeverity === "success" ? "darkgreen" : toastSeverity === "error" ? "darkred" : undefined, // Optional border for better visibility
                zIndex: "5000", // Ensure toast is above other elements
              },
            }}
          >
              <Alert
              onClose={handleCloseToast}
              severity={toastSeverity}
              variant="filled"
              sx={{
                width: "100%",
                // backgroundColor: "green", // Dark Green
                color: "#ffffff", // White text for contrast
                boxShadow: "none", // Remove shadow for a cleaner look
                zIndex: "5000",
              }}
            >
              {toastMessage}
            </Alert>

          </Snackbar>

        </Paper>

        {/* Step 3: Password Reset */}
        <Paper
          className="ContentThree"
          elevation={3}
          sx={{
            padding: 2,
            minHeight: "300px", // Ensures it fits the grid space
            opacity: currentStep >= 3 ? 1 : 0.5,
            pointerEvents: currentStep === 3 ? "auto" : "none",
            backgroundImage: `url(${gridBG})`, // Add your image URL here
            backgroundSize: "cover", // Ensure the image covers the entire space
            backgroundPosition: "center", // Center the background image
            backgroundRepeat: "no-repeat",
          }}
        >
          <Typography className="boxoneHeader"
            variant="h6"
            gutterBottom
            sx={{
              fontFamily: "'CallistaCustomFont', sans-serif",
              fontWeight: 600,
              fontSize: "1.9rem",
              color: "#df3435",
            }}
          >
            <span style={{ color: "#143264" }}>R</span>econfigure&nbsp;&nbsp;{" "}
            <span style={{ color: "#143264" }}>Y</span>our&nbsp;&nbsp;{" "}
            <span style={{ color: "#143264" }}>P</span>assword
          </Typography>

          {/* Step Instructions */}
          <Box sx={{ mt: 2 }}>
            <Typography className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>1:</span>{" "}
              </strong>{" "}
              You can now reset your password credentials.
            </Typography>
            <Typography className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
                mt: 1,
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>2:</span>{" "}
              </strong>{" "}
              Enter a new password that meets the required criteria and confirm
              it.
            </Typography>
            <Typography className="BoxOne_paraOne"
              variant="body1"
              sx={{
                fontFamily: "'Raleway', sans-serif", // Use Raleway font here
                fontSize: "1.1rem",
                color: "#333",
                mt: 1,
              }}
            >
              <strong>
                <span style={{ color: "#143264" }}>Step</span>{" "}
                <span style={{ color: "#df3435" }}>3:</span>{" "}
              </strong>{" "}
              Your password has been successfully updated! You can now log-in!
            </Typography>
          </Box>

          <PasswordReset
            onResetPassword={handleResetPassword}
            isEditable={currentStep === 3}
            confirmPassword={confirmPassword}
            newPassword={newPassword}
            setConfirmPassword={setConfirmPassword}
            setNewPassword={setNewPassword}

          />
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
