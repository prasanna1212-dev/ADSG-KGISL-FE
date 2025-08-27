// src/components/OtpVerificationModal.js
import React, { useState, useEffect } from 'react';
import { Button, Input, Message } from 'semantic-ui-react';
import { FaTimes } from 'react-icons/fa';
import '../styles/SignupOtpVerifcationModal.css';

function OtpVerificationModal({ onClose, email, onOtpSuccess }) {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer > 0 && !success) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setError('OTP has expired. Please request a new one.');
    }
  }, [timer, success]);

  const handleChange = (element, index) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }

    // If the user presses backspace, move focus to the previous input field
    if (element.selectionStart === 0 && !value) {
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };

  const handleOtpVerification = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    const enteredOtp = otp.join("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onOtpSuccess(); // Notify parent component on success
        }, 1000);
      } else {
        setError(data.message || 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal-container">
        <span onClick={onClose} className="otp-modal-close">
          <FaTimes />
        </span>
        <h2 className="otp-modal-title">Verify OTP</h2>
        
        <p className="otp-timer">
          {timer > 0 ? `OTP expires in: 00:${timer.toString().padStart(2, '0')}` : 'OTP has expired'}
        </p>

        <form onSubmit={handleOtpVerification} className="otp-modal-form">
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                className="otp-input-box"
                disabled={timer === 0 || success}
              />
            ))}
          </div>
          
          {error && <Message negative content={error} />}
          {success && <Message positive content="OTP verified successfully!" />}
          
          <Button 
            type="submit" 
            primary 
            loading={loading} 
            disabled={loading || timer === 0 || success} 
            className="otp-modal-verify"
          >
            Verify OTP
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OtpVerificationModal;
