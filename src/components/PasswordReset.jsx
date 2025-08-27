import React, { useState } from "react";
import { Button, TextField, Grid, Box, IconButton, InputAdornment, Snackbar, Alert } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const PasswordReset = ({ onResetPassword,newPassword ,confirmPassword ,setConfirmPassword,setNewPassword }) => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const passwordConstraints = [
    { text: "Atleast 12 characters", regex: /.{12,}/ },
    { text: "should contains 1 alphabet", regex: /[a-zA-Z]/ },
    { text: "should contains 1 number", regex: /\d/ },
    { text: "should contains 1 special character", regex: /[!@#$%^&*(),.?":{}|<>]/ },
  ];

  // Validate password based on constraints
  const validatePassword = (password) => {
    return passwordConstraints.every((constraint) => constraint.regex.test(password));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      if (validatePassword(newPassword)) {
        onResetPassword(newPassword); // Pass the new password to parent component
      }
    } else {
      setSnackbarMessage("Passwords do not match");
      setOpenSnackbar(true);
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordMatch(password === confirmPassword);
    setPasswordValid(validatePassword(password));
  };

  const handleConfirmPasswordChange = (e) => {
    const confirm = e.target.value;
    setConfirmPassword(confirm);
    setPasswordMatch(newPassword === confirm);
  };

  const handlePaste = (e) => {
    e.preventDefault(); // Prevent paste action
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px" }}>
        <Grid container spacing={2}>
          {/* New Password Input */}
          <Grid item xs={12}>
            <TextField
              label="Enter New Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={handlePasswordChange}
              fullWidth
              sx={{
                backgroundColor: "white",
              }}
              onFocus={() => setShowConstraints(true)}
              onBlur={() => setShowConstraints(false)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onPaste={handlePaste} // Prevent paste action
            />
            {showConstraints && (
              <Box sx={{ mt: 1, fontSize: "0.875rem" }}>
                <ul>
                  {passwordConstraints.map((constraint, index) => (
                    <li
                      key={index}
                      style={{
                        color: constraint.regex.test(newPassword) ? "green" : "red", // Green if valid, red if invalid
                      }}
                    >
                      {constraint.text}
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </Grid>

          {/* Confirm Password Input */}
          <Grid item xs={12}>
            <TextField
              label="Confirm Password"
              variant="outlined"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              fullWidth
              sx={{
                backgroundColor: "white",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onPaste={handlePaste} // Prevent paste action
            />
          </Grid>

          {/* Reset Password Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                backgroundColor: "#df3435", // Apply red background to the button
                "&:hover": {
                  backgroundColor: "#d32f2f", // Darker red on hover
                },
              }}
            >
              Reset Password
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar for success and error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{
          vertical: "top", // Position the Snackbar at the top
          horizontal: "center", // Position the Snackbar at the left
        }}
      >
        <Alert
          severity={passwordValid && passwordMatch ? "success" : "error"} // Success if valid and matches
          onClose={() => setOpenSnackbar(false)}
          sx={{
            backgroundColor: passwordValid && passwordMatch ? "green" : "red", // Green for success, red for failure
            color: "white", // White text for better contrast
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PasswordReset;



