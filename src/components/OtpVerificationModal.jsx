import React, { useState, useRef, useEffect } from "react";
import { Button, Grid, Box, TextField, Snackbar, Alert, Typography } from "@mui/material";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "../styles/OtpVerificationModal.css"

const OtpVerificationModal = ({ onVerifyOtp, timerActive, setTimerActive }) => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(180); // Timer starts at 60 seconds


  const otpRefs = useRef([]);

  // Countdown Timer Effect
  useEffect(() => {
    if (timeLeft > 0 && timerActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setTimerActive(false); // Stop the timer
    }
  }, [timeLeft, timerActive]);

  // Handle change for individual OTP digit
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === "") { // Allow only numbers
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Focus next input if a digit is entered
      if (value && index < otp.length - 1) {
        otpRefs.current[index + 1].focus();
      }
    }
  };

  // Handle OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join(""); // Convert OTP array to a string
    onVerifyOtp(otpString);

  };

  // Handle close of the toast
  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]); // Clear OTP fields
    setTimeLeft(60); // Reset timer
    setTimerActive(true); // Restart timer
    onResendOtp(); // Call the resend OTP function
  };



  return (
    <Box classname="Otp_grid" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "50vh" }}>

      {/* Timer Display */}
      {/* <Box className="otp-timer-circle">
        <CircularProgressbar
          value={(timeLeft / 60) * 100}
          text={`00:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}`}
          className="otp-timer-progress" // Custom class for external styling
          styles={buildStyles({
            pathColor: "#df3435", // Progress bar color
            trailColor: "#2c2c2c", // Background circle color
            strokeLinecap: "round", // Smooth edges
            pathTransitionDuration: 1, // Smooth animation
            trailWidth: 2, // Thin background trail
            pathWidth: 4, // Thin progress bar
          })}
        />
      </Box> */}

      {/* Show Timer if Time is Remaining */}
      {timerActive && timeLeft > 0 && (
        <Box className="otp-timer-circle">
          <CircularProgressbar
            value={(timeLeft / 180) * 100}
             text={`${
              Math.floor(timeLeft / 60)
                .toString()
                .padStart(2, "0")
            }:${(timeLeft % 60).toString().padStart(2, "0")}`}
            className="otp-timer-progress"
            styles={buildStyles({
              textSize: "18px",
              textColor: "#ffffff",
              pathColor: "#df3435",
              trailColor: "#2c2c2c",
              strokeLinecap: "round",
            })}
          />
        </Box>
      )}

      {/* Show OTP Expired Message When Time Runs Out */}
      {!timerActive && timeLeft === 0 && (
        <Typography variant="h6" className="otp-timer-expired">
          OTP Expired. <span className="otp-timer-resend">Request a new one.</span>
        </Typography>
      )}





      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
        <Grid container spacing={2} justifyContent="center">
          {/* OTP Digits Input */}
          <Grid className="Otp_item" item xs={12} container justifyContent="center" spacing={2}>
            {otp.map((digit, index) => (
              <Grid className="Otp_tab" item key={index}>
                <TextField className=""
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  inputProps={{ maxLength: 1, style: { textAlign: "center" } }} // Max length for one digit
                  variant="outlined"
                  type="text"
                  fullWidth
                  sx={{
                    width: "50px",
                    backgroundColor: "white",
                  }}
                  inputRef={(el) => (otpRefs.current[index] = el)} // Assign refs for each input
                />
              </Grid>
            ))}
          </Grid>

          {/* Verify OTP Button */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth
              sx={{
                backgroundColor: "#df3435", // Apply red background to the button
                "&:hover": {
                  backgroundColor: "#d32f2f", // Darker red on hover
                },
              }}>
              Verify OTP
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar Toast for Success/Failure */}

    </Box>
  );
};

export default OtpVerificationModal;



