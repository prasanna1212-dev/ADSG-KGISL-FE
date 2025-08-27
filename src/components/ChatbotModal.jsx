import React, { useState, useEffect, useRef } from 'react';
import "../styles/ChatbotModal.css";
import chatbgvid from '../assets/chatbgvid.mp4';
import chaticonai from '../assets/chaticonai.png';
import chaticonuser from '../assets/chaticonuser3.jpg';
import { X, Bot, Rocket, HelpCircle, MessageSquare } from 'lucide-react'; 
import Lottie from "lottie-react";
import networkGlobe from "../assets/networkglobe.json";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Utility function for formatting date as DD/MM/YYYY, hh:mm:ssAM/PM
const formatDateTime = () => {
  const formatted = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return formatted.replace(" ", ""); // remove space before AM/PM
};

function ChatbotModal({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am a quantum intelligence model. How can I assist you in navigating the AD Self Service Gateway?",
      sender: 'bot',
      timestamp: formatDateTime()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [launch, setLaunch] = useState(false);
  const [isFAQView, setIsFAQView] = useState(false);
  const [faqs, setFaqs] = useState([]); // NEW: State to store dynamic FAQ data

  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message or view change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // NEW: Fetch FAQ data from the backend on component mount
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot/faqs`); // Assuming this is your API endpoint
        const data = await response.json();
        setFaqs(data);
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
      }
    };
    fetchFAQs();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isFAQView]);

  // Fetch bot response from backend
  const getBotResponse = async (userInput) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/chatbot/getinfo-faq?query=${encodeURIComponent(userInput)}`
      );
      const data = await response.json();
      return data.answer;
    } catch (err) {
      return "Sorry, I'm having trouble retrieving that information.";
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    setLaunch(true);
    setTimeout(() => setLaunch(false), 2000);

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: formatDateTime()
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');

    setIsTyping(true);
    setTimeout(async () => {
      const botResponse = await getBotResponse(userMessage.text);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        time: formatDateTime()
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Toggles between Chat and FAQ view
  const handleToggleView = () => {
    setIsFAQView(prev => !prev);
  };

  // Handles click on an FAQ question
  const handleFAQQuestionClick = (question, answer) => {
    const userQuestionMessage = {
      id: Date.now(),
      text: question,
      sender: 'user',
      time: formatDateTime()
    };
    
    const botAnswerMessage = {
      id: Date.now() + 1,
      text: answer,
      sender: 'bot',
      time: formatDateTime()
    };
    
    setMessages(prevMessages => [...prevMessages, userQuestionMessage, botAnswerMessage]);
    setIsFAQView(false); // Switch back to chat view
  };

  return (
    <div className="chatbot-modal-overlay">
      <div className="chatbot-modal">
        {/* Header */}
        <div className="chatbot-header">
          <video className="header-video-bg" autoPlay loop muted playsInline>
            <source src={chatbgvid} type="video/mp4" />
          </video>
          <h2 className="title">
            <Bot size={28} className="icon-glow" />
            <span className="gradient-text">ADSG</span>
            <span className="title-text">Digital Assistant</span>
          </h2>
          <button className="chatbot-close-button" onClick={onClose}>
            <X size={24} className="icon-glow" />
          </button>
        </div>

        {/* Body - Conditionally Renders Chat or FAQ */}
        <div className="chatbot-body">
          <div className="chatbot-bg-lottie">
            <Lottie animationData={networkGlobe} loop={true} />
          </div>
          {isFAQView ? (
            <div className="faq-container">
              <h5>Frequently Asked Questions</h5>
              <ul className="faq-list">
                {faqs.map((faq, index) => ( // Updated to use 'faqs' state
                  <li 
                    key={faq._id} // Use the unique MongoDB ID
                    className="faq-item"
                    onClick={() => handleFAQQuestionClick(faq.questionPatterns[0], faq.answer)}
                  >
                    <span>{index + 1}. {faq.questionPatterns[0]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="message-container">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${
                    message.sender === 'bot'
                      ? 'bot-message message-enter-from-left'
                      : 'user-message message-enter-from-right'
                  }`}
                >
                  <div className="message-icon-wrapper">
                    <img
                      src={message.sender === 'bot' ? chaticonai : chaticonuser}
                      alt={`${message.sender} icon`}
                      className="message-icon"
                    />
                  </div>
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">{message.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot-message typing-indicator">
                  <div className="message-icon-wrapper">
                    <img src={chaticonai} alt="AI icon" className="message-icon" />
                  </div>
                  <p className="typing-indicator-dot">...</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* New Toggle Button for FAQ/Chat */}
          <button className="faq-button" onClick={handleToggleView}>
            {isFAQView ? (
              <>
                <MessageSquare size={20} className="faq-icon" />
                <span className="faq-text">Chat</span>
              </>
            ) : (
              <>
                <HelpCircle size={20} className="faq-icon" />
                <span className="faq-text">FAQ</span>
              </>
            )}
          </button>
        </div>

        {/* Footer - Conditionally render input based on view */}
        {!isFAQView && (
          <div className="chatbot-footer">
            <input
              type="text"
              className="chat-input"
              placeholder="Engage with the AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`rocket-button ${launch ? "launch" : ""}`}
              onClick={handleSendMessage}
            >
              <div className="rocket-wrapper">
                <Rocket size={20} className="rocket-icon" />
                <span className="flame"></span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatbotModal;

// import React, { useState, useEffect, useRef } from 'react';
// import "../styles/ChatbotModal.css";
// import chatbgvid from '../assets/chatbgvid.mp4'; 
// import chaticonai from '../assets/chaticonai.png'; 
// import chaticonuser from '../assets/chaticonuser3.jpg'; 
// import { X, Bot, Rocket } from 'lucide-react'; 
// import Lottie from "lottie-react";
// import networkGlobe from "../assets/networkglobe.json"; 

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // Utility function for formatting date as DD/MM/YYYY, hh:mm:ssAM/PM
// const formatDateTime = () => {
//     const formatted = new Date().toLocaleString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: true,
//     });
//     return formatted.replace(" ", ""); // remove space before AM/PM
//   };

// function ChatbotModal({ onClose }) {
//   const [messages, setMessages] = useState([
//     { 
//       id: 1, 
//       text: "Hello! I am a quantum intelligence model. How can I assist you in navigating the AD Self Service Gateway?", 
//       sender: 'bot',
//       timestamp: formatDateTime()
//     }
//   ]);
//   const [input, setInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [launch, setLaunch] = useState(false);
  
//   const messagesEndRef = useRef(null);

//   // Scroll to bottom on new message
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Fetch bot response from backend
//   const getBotResponse = async (userInput) => {
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/chatbot/getinfo-faq?query=${encodeURIComponent(userInput)}`
//       );
//       const data = await response.json();
//       return data.answer;
//     } catch (err) {
//       return "Sorry, I'm having trouble retrieving that information.";
//     }
//   };
  
//   const handleSendMessage = async () => {
//     if (input.trim() === '') return;
  
//     setLaunch(true);
//     setTimeout(() => setLaunch(false), 2000);
  
//     const userMessage = { 
//       id: Date.now(), 
//       text: input, 
//       sender: 'user',
//       time: formatDateTime()   // ✅ timestamp here
//     };
  
//     setMessages(prevMessages => [...prevMessages, userMessage]);
//     setInput('');
  
//     setIsTyping(true);
//     setTimeout(async () => {
//       const botResponse = await getBotResponse(userMessage.text);
//       const botMessage = { 
//         id: Date.now() + 1, 
//         text: botResponse, 
//         sender: 'bot',
//         time: formatDateTime()   // ✅ timestamp here
//       };
//       setMessages(prevMessages => [...prevMessages, botMessage]);
//       setIsTyping(false);
//     }, 1500);
//   };  

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="chatbot-modal-overlay">
//       <div className="chatbot-modal">
//         {/* Header */}
//         <div className="chatbot-header">
//           <video className="header-video-bg" autoPlay loop muted playsInline>
//             <source src={chatbgvid} type="video/mp4" />
//           </video>
//           <h2 className="title">
//             <Bot size={28} className="icon-glow" />
//             <span className="gradient-text">ADSG</span>
//             <span className="title-text">Digital Assistant</span>
//           </h2>
//           <button className="chatbot-close-button" onClick={onClose}>
//             <X size={24} className="icon-glow" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="chatbot-body">
//           <div className="chatbot-bg-lottie">
//             <Lottie animationData={networkGlobe} loop={true} />
//           </div>
//           <div className="message-container">
//             {messages.map(message => (
//               <div
//               key={message.id}
//               className={`message ${
//                 message.sender === 'bot'
//                   ? 'bot-message message-enter-from-left'
//                   : 'user-message message-enter-from-right'
//               }`}
//             >
//               <div className="message-icon-wrapper">
//                 <img
//                   src={message.sender === 'bot' ? chaticonai : chaticonuser}
//                   alt={`${message.sender} icon`}
//                   className="message-icon"
//                 />
//               </div>
//               <div className="message-content">
//                 <p>{message.text}</p>
//                 <span className="message-time">{message.time}</span> {/* ✅ timestamp */}
//               </div>
//             </div>            
//             ))}
//             {isTyping && (
//               <div className="message bot-message typing-indicator">
//                 <div className="message-icon-wrapper">
//                   <img src={chaticonai} alt="AI icon" className="message-icon" />
//                 </div>
//                 <p className="typing-indicator-dot">...</p>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="chatbot-footer">
//           <input
//             type="text"
//             className="chat-input"
//             placeholder="Engage with the AI..."
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//           />
//           <button
//             className={`rocket-button ${launch ? "launch" : ""}`}
//             onClick={handleSendMessage}
//           >
//             <div className="rocket-wrapper">
//               <Rocket size={20} className="rocket-icon" />
//               <span className="flame"></span>
//             </div>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatbotModal;