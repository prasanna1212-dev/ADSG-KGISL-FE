// src/components/LoginModal.js
import React, { useState } from 'react';
import UserLoginModal from './UserLoginModal';
import SignUpModal from './SignUpModal';
import kgnlogo from "../assets/logo_bg.png";
import { FaTimes } from 'react-icons/fa';
import '../styles/LoginDashboard.css';


function LoginDashboard({ onLoginSuccess, onClose }) {
    

    const [showSignUp, setShowSignUp] = useState(false);

    const handleSignUpClick = () => {
        setShowSignUp(true); // Show SignUpModal
    };

    const handleSignUpClose = () => {
        setShowSignUp(false); // Close SignUpModal and return to Login
    };

    const handleClose = () => {
        onClose(); // Call the parent-provided close function
    };

    return (
        
        <div className="login-dashboard-container" style={{ position: "relative" }}>
            {showSignUp ? (
                <div className="signup-modal">
                    <div className="modal-close-icon" onClick={handleClose}>
                        <FaTimes />
                    </div>
                    <SignUpModal onClose={handleSignUpClose} />
                </div>
            ) : (
                <div className="login-dashboard-modal">
                    <div className="modal-close-icon" onClick={handleClose}>
                        <FaTimes />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        {/* <img src={kgnlogo} alt="Logo" className="home-logo" /> */}
                    </div>
                    <div className="login-dashboard-content">
                        <UserLoginModal onLoginSuccess={onLoginSuccess} onSignUpClick={handleSignUpClick} />
                    </div>
                </div>
            )}
        </div>

    );
}

export default LoginDashboard;
