import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { FaEye, FaEyeSlash,FaUser, FaLock, } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/UserLoginModal.css';
import logo from '../assets/kgnlogo.png';
import { IoPersonCircle } from "react-icons/io5";
import { RiLockPasswordFill } from "react-icons/ri";

function UserLoginModal({ onSignUpClick, redirectPath, onLoginSuccess }) {

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [emailOrDomainJoinUPN, setEmailOrdomainJoinUPN] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleLogin = async () => {
        if (!emailOrDomainJoinUPN || !password) {
            setError('Please fill out all fields');
            return;
        }

        try {
            const isDomainJoinUPN = emailOrDomainJoinUPN.endsWith('@kggroup.com');
            const payload = isDomainJoinUPN
                ? { domainJoinUPN: emailOrDomainJoinUPN, password }
                : { email: emailOrDomainJoinUPN, password };

            const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
            const { user } = response.data;
            const { role } = response.data.user;

            const { organizationalUnitPath, domainJoinUPN, email } = user;

            // Store user information in localStorage
             localStorage.setItem("domainJoinUPN",domainJoinUPN)


            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);

            console.log(localStorage.getItem('accessToken')); // Should return a valid JWT
            console.log(localStorage.getItem('refreshToken')); // Should return a valid JWT

            toast.info('Logged in successfully!', {
                position: 'top-right',
                autoClose: 1000,
            });

            // Fetch encrypted URLs for each route
            const fetchEncryptedUrls = async () => {
                try {
                    const urls = [
                        { path: '/admin-dashboard', state: 'adminDashboard' },
                    ];

                    const encryptedUrls = {};
                    for (const route of urls) {
                        const encryptedResponse = await axios.get(`${API_BASE_URL}/encrypt-url?url=${route.path}`);
                        encryptedUrls[route.state] = encryptedResponse.data.encryptedUrl;
                    }

                    // Determine redirect path based on role
                    let redirectPath = `/f/${encryptedUrls.adminDashboard}`; // Default path for admin users

                    if (role !== 'admin') {
                        redirectPath = `/f/${encryptedUrls.adminDashboard}`; // Adjust path for non-admin users if needed
                    }

                    setTimeout(() => {
                        navigate(redirectPath, {
                            state: {
                                user: { ...user, organizationalUnitPath, domainJoinUPN, email },
                                role,
                            },
                        });
                        if (onLoginSuccess) onLoginSuccess(role);
                    }, 1000);
                } catch (err) {
                    console.error('Error fetching encrypted URLs:', err);
                }
            };

            // Call to fetch encrypted URLs after login is successful
            fetchEncryptedUrls();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        }
    };

    // Clear error when email or password changes
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        if (error) setError(''); // Clear error when input is modified
    };

    return (
        <div className="auth-container">
            <ToastContainer className="toast-msg" />

            <div className="auth-form">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={logo} alt="Logo" className="home-logo" />
                </div>

                <div className="auth-email-field" required>
                    {/* <label className="auth-label" style={{ textAlign: "left", color: "white" }}>Username</label> */}
                    <IoPersonCircle className="input-icon"  />
                    <input
                        className="auth-input"
                        placeholder="Username with domain (eg:@kggroup.com)"
                        value={emailOrDomainJoinUPN}
                        onChange={handleInputChange(setEmailOrdomainJoinUPN)}
                       
                    />
                </div>

                <div className="auth-password-field" required>
                    {/* <label className="auth-label" style={{ textAlign: "left", color: "white" }}>Password</label> */}
                    <RiLockPasswordFill className="input-icon" />
                    <div className="auth-password-wrapper" style={{ position: "relative",width:"100%" }}>
                        <input
                            className="auth-input"
                            type={passwordVisible ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={handleInputChange(setPassword)}
                        />
                        <span className="auth-password-toggle" onClick={togglePasswordVisibility} style={{ position: "absolute", right: "10px", top: "10px", color: "gray" }}>
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>

                {/* {error && <Message className="auth-error-message" negative content={error} />} */}
                {error && (
                <div className="auth-error-message">
                    <span className="error-icon"></span>
                    <span>{error}</span>
                </div>
                )}
              
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div>
                        <button className="login-button-main" onClick={handleLogin}>
                            Login
                            <div className="login-button-icon">
                                <svg
                                    height="24"
                                    width="24"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M0 0h24v24H0z" fill="none"></path>
                                    <path
                                        d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                        fill="currentColor"
                                    ></path>
                                </svg>
                            </div>
                        </button>
                    </div></div>

                <p className="signup-text" style={{ color: "white" }}>
                    Don’t have an account?{' '}
                    <span onClick={onSignUpClick} className="signup-link">
                        Sign up
                    </span>
                </p>
            </div>
        </div>
    );
}

export default UserLoginModal;