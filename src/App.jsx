import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import UserDetailsForm from "./components/UserDetailsForm";
import LoginDashboard from './components/LoginDashboard';
import NetworkStatusChecker from './components/NetworkStatusChecker';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedPage from './components/ProtectedPage';
import ChatbotModal from './components/ChatbotModal';
import Lottie from "lottie-react";
import chatAnimation from "./assets/chatai2.json";   

import 'semantic-ui-css/semantic.min.css';
import '../src/fonts/Callista.ttf';

const App = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <Router>
      <NetworkStatusChecker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/c/:encryptedPath" element={<Dashboard />} />
        <Route path="/AD-userdetails-form" element={<UserDetailsForm />} />
        <Route path="/login-dashboard" element={<LoginDashboard />} />
        <Route path="/f/:encryptedPath" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/protected" element={<ProtectedPage />} />
      </Routes>

      {/* Chatbot Lottie trigger */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 100,
          cursor: "pointer",
        }}
      >
        {!isChatbotOpen && (
          <Lottie
            animationData={chatAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 80, height: 80 }}
            onClick={toggleChatbot}
          />
        )}
      </div>

      {/* Chatbot Modal */}
      {isChatbotOpen && <ChatbotModal onClose={toggleChatbot} />}
    </Router>
  );
};

export default App;
