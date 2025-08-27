import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RecentAccess.css";
import { FaGithub, FaCode, FaMoneyBillWave } from "react-icons/fa";
// Import images correctly
import oneImg from "../assets/one.png";
import twoImg from "../assets/two.png";
import threeImg from "../assets/three.png";


function RecentAccess() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [topEmails, setTopEmails] = useState([]);

  useEffect(() => {
    const fetchResetLogs = async () => {
      try {
        const [successRes, failureRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/AD/password-reset-logs`),
          axios.get(`${API_BASE_URL}/AD/password-reset-failure-logs`),
        ]);

        const allLogs = [...successRes.data, ...failureRes.data];

        const emailFrequency = allLogs.reduce((acc, log) => {
          acc[log.email] = (acc[log.email] || 0) + 1;
          return acc;
        }, {});

        const sortedEmails = Object.entries(emailFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([email, count]) => ({ email, count }));

        setTopEmails(sortedEmails);
      } catch (error) {
        console.error("Error fetching password reset logs:", error);
      }
    };

    fetchResetLogs();
  }, []);

  const images = [oneImg, threeImg, twoImg];

  return (
    <div className="recent-access-section-container">
      <div className="admin-dashboard-header-fontstyle">
        <h1>
          <span className="admin-dashboard-header-first-character">F</span>requently&nbsp;&nbsp;
          <span className="admin-dashboard-header-first-character">A</span>ttempted&nbsp;&nbsp;
          <span className="admin-dashboard-header-first-character">A</span>ccounts&nbsp;&nbsp;
        </h1>
      </div>

      <div className="recent-access-container">
        {topEmails.length > 0 ? (
          <div className="recent-access-cards">
            {topEmails.map(({ email, count }, index) => (
              <div
                key={index}
                className="recent-access-glass"
                data-text={`${email} - ${count} attempts`}
                style={{ "--r": index === 0 ? -15 : index === 2 ? 15 : 0 }}
              >
                 <img
                  src={images[index]}
                  alt={`Icon ${index}`}
                  className="recent-access-image"
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No recent password reset attempts.</p>
        )}
      </div>
    </div>
  );
}

export default RecentAccess;
