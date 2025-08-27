import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import kgnlogo from "../assets/kgnlogo.png";
import textimg from "../assets/AD-SERVICE GATEWAY.png";
import textimg1 from "../assets/webAppText.png"
import description from "../assets/SecurePasswordText.png";
import LoginButton from "../components/LoginButton";
import LoginDashboard from "../components/LoginDashboard";
import '../styles/HomePage.css';
import "../styles/fonts.css";
import homeBG from "../assets/homeBG.mp4";
import { Toast } from "primereact/toast"; // PrimeReact Toast Import
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { Tooltip } from 'antd';


const HomePage = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_BASE_URL_TWO = import.meta.env.VITE_API_BASE_URL_TWO;


  const [eventData, setEventData] = useState(null)

  const toastRef = useRef(null);

  const [messageToken, setMessageToken] = useState(null)

  function formatDate(dateInput) {
    const date = new Date(dateInput);

    const options = {
      year: "numeric",
      month: "short",  // Mar
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    };

    return date.toLocaleString("en-US", options).replace(",", "");
  }



  const autoLoginLog = async (domain_join_upn, status) => {

    console.log("domain_join_upn", domain_join_upn)

    try {
      const res = await axios.post(`${API_BASE_URL_TWO}/role-based/log-activity`, {
        domain_join_upn,
        date: formatDate(new Date()),
        app: "NVR Surveillance Center",
        status,
      });

      console.log("✅ Activity logged:", res.data);
    } catch (error) {
      console.error("❌ Failed to log activity:", error.response?.data || error.message);
    }
  }

  useEffect(() => {
    // Step 1: Extract token from URL
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    // Step 2: Send token to backend for validation
    if (token) {
      setMessageToken(token)
      // axios
      //   .post("http://172.30.6.11:5068/api/auth/validate-message-token", { token })
      //   .then((res) => {
      //     console.log("user", res.data)
      //     const { domain_upn, origin } = res.data.user;
      //     localStorage.setItem("domain_join_upn", domain_upn)
      //     localStorage.setItem("origin", origin)
      //     setEventData(JSON.parse(JSON.stringify(res.data.user)))
      //     console.log("✅ Authenticated:", domain_upn);
      //   })
      //   .catch((err) => {
      //     console.error("❌ Invalid or expired token", err);
      //     autoLoginLog(domain_upn,"Failure")
      //     // Optional: redirect to login or show error
      //   });



      axios
        .post(`${API_BASE_URL}/auth/validate-message-token`, { token })
        .then((res) => {
          console.log("user", res.data)
          const { domain_upn, origin } = res.data.user;


          localStorage.setItem("origin", origin)
           localStorage.setItem("domain_join_upn", domain_upn)

          setEventData(JSON.parse(JSON.stringify(res.data.user)))

        })
        .catch((err) => {
          console.error("❌ Invalid or expired token", err);
          // Optional: redirect to login or show error
        });


    }
  }, []);

  const navigate = useNavigate();
  const [showComponent, setShowComponent] = useState(false);
  const [encryptedDashboardUrl, setEncryptedDashboardUrl] = useState("");
  const [encryptedUrls, setEncryptedUrls] = useState({});
  const [logs, setLogs] = useState([]);

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

      setEncryptedUrls(encryptedUrls)
    } catch (err) {
      console.error('Error fetching encrypted URLs:', err);
    }
  }

  useEffect(() => {
    const fetchEncryptedDashboardUrl = async () => {
      const urlToEncrypt = "/dashboard";
      try {
        const response = await axios.get(
          `${API_BASE_URL}/encrypt-url?url=${urlToEncrypt}`
        );
        setEncryptedDashboardUrl(response.data.encryptedUrl);
      } catch (error) {
        console.error("Error encrypting URL for View Task:", error);
      }
    };


    fetchEncryptedDashboardUrl();
    fetchEncryptedUrls()
  }, []);



  const handleAutoLogin = async (domain_upn) => {


    await axios
      .post(`${API_BASE_URL}/auth/generate-token`, {
        domain_join_upn: domain_upn,

      })
      .then((response) => {
        const { accessToken, refreshToken } = response.data;
        console.log("✅ Access Token:", accessToken);
        console.log("✅ Refresh Token:", refreshToken);

        localStorage.setItem('domain_join_upn', domain_upn);

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('messageToken', messageToken)
        autoLoginLog(domain_upn, "Success")

        navigate(`/f/${encryptedUrls.adminDashboard}`)

        // You can store them if needed:
        // localStorage.setItem("accessToken", accessToken);
        // localStorage.setItem("refreshToken", refreshToken);
      })
      .catch((error) => {
        console.error("❌ Error generating tokens:", error);

        autoLoginLog(domain_upn, "Failure")

        toastRef.current.show({
          severity: "error", // 🔥 Use "error" not "danger"
          summary: "Error",
          // detail: `You're not allow to access ${app}`,

          content: (
            <div className="py-2 px-1 flex items-center gap-4">
              <FaRegCircleXmark style={{ color: "#ff4d4f", fontSize: "2.5rem" }} />
              <p className="m-0" style={{ wordSpacing: "5px", }}>
                <span style={{ fontFamily: "proximaNova-regular" }}>Failed to verify the access!</span>&nbsp;
                <strong style={{ color: "#ff4d4f", fontFamily: "proximaNovaBold", letterSpacing: "0.5px" }}>{"Please Try again!"}</strong>.
              </p>
            </div>
          ),
          life: 5000,
        });
      });

  };

  const handleLogin = () => {
    if (encryptedDashboardUrl) {
      navigate(`/c/${encryptedDashboardUrl}`);
    }
  };

  // const handleLogin = () => {
  //   navigate('/dashboard'); // Redirect to Dashboard on button click
  // };

  const handleLogoClick = () => {
    // Optionally, navigate to a different route or show a component
    console.log("event data", eventData)
    if (eventData && eventData?.domain_upn) {
      handleAutoLogin(eventData?.domain_upn)
    } else {

      setShowComponent(true);
    }
  };

  useEffect(() => {
    async function fetchLogs() {
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
    <div className="home-container">
      {/* Video Background */}
      <video autoPlay loop muted className="video-background">
        <source src={homeBG} type="video/mp4" />
      </video>

      {/* Logo at top-right */}
      <div className="logo-top-left">
        <img
          src={kgnlogo}
          alt="Logo"
          className="logo"
          onClick={handleLogoClick} // Call the handler on click
          style={{ cursor: 'pointer' }} // Add pointer cursor for better UX
        />
      </div>

      <Tooltip title="Total number of OTPs sent!">
        <div className="count-top-right">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a0a',
              border: '2px solid #f04949',
              borderRadius: '15px',
              padding: '10px 18px',
              boxShadow: '0 0 25px rgba(255, 0, 0, 0.7)',
              fontFamily: '"VT323", monospace',
              color: '#ff1a1a',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '22px',
                fontFamily: "'LED1', sans-serif",
                letterSpacing: '1.5px',
                color: '#ff1a1a',
                textShadow: '0 0 6px #ff1a1a',
                marginBottom: '6px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="#f04949"
                style={{
                  marginRight: '10px',
                  filter: 'drop-shadow(0 0 3px #ff1a1a)',
                }}
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              {/* OTP Sent */}
            </div>

            {/* Flip Counter */}
            {/* Flip Counter Box — Updated */}
            <div className="otp-flip-box">
              {String(currentCount)
                .padStart(4, '0')
                .split('')
                .map((digit, index) => (
                  <div className="otp-digit-box" key={index}>
                    <span className="otp-digit">{digit}</span>
                  </div>
                ))}
            </div>

          </div>
        </div>
      </Tooltip>


      {/* Centered Text */}
      <div className="home-content">
        <img src={textimg1} alt="Logo" className="header-text-img" /><br />
        <img src={description} alt="Logo" className="description-text-img" />
        <LoginButton onClick={handleLogin} className="home-login-button" />
      </div>

      {/* Conditionally Render the Component */}
      {showComponent && <LoginDashboard onClose={() => setShowComponent(false)} />}
    </div>
  );
};

export default HomePage;
