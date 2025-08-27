// AdminDashboard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarView from "../components/CalendarView";
import TimelineView from "../components/TimelineView";
import SelectDomain from "../components/SelectDomain";
import ApprovalRequest from "../components/ApprovalRequest";
import ApprovedUsers from "../components/ApprovedUsers";
import FailureLogs from "../components/FailureLogs";
import ReportsSection from "../components/ReportsSection"
import kgnlogo from "../assets/logo_bg.png";
import { FaCalendarAlt, FaStream, FaSignOutAlt, FaUserShield, FaCheckCircle, FaCheckDouble, FaUserCog, FaUserEdit, FaUserMd, FaUsersSlash, FaUserPlus, FaCheckSquare, FaMap, FaBug, FaExclamationTriangle } from "react-icons/fa";
import "../styles/AdminDashboard.css";
import { BiSolidReport } from "react-icons/bi";
import RecentAccess from "./RecentAccess";
import { RiCalendarScheduleFill } from "react-icons/ri";
import MailSchedule from "./MailSchedule";
import AddnewADUser from "./AddnewADUser";
import { TbUserScan } from "react-icons/tb";


function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("calendar");
  const navigate = useNavigate();

//  const handleLogout = () => {
//     const mesagetoken =  localStorage.getItem('messageToken')
//     if(mesagetoken){
//       const origin = localStorage.getItem("origin")
//       localStorage.removeItem("origin")
//       localStorage.removeItem("messageToken")
//       window.location.href = `${origin}`
//     }else{
//       window.location.href = "/"
//     }

//   };
const handleLogout = () => {
  const mesagetoken = localStorage.getItem("messageToken");

  // ✅ Clear all auth-related localStorage items
  localStorage.removeItem("origin");
  localStorage.removeItem("messageToken");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("domainJoinUPN");

  if (mesagetoken) {
    const origin = localStorage.getItem("origin");
    window.location.href = origin || "/";
  } else {
    window.location.href = "/";
  }
};


  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={kgnlogo} alt="KGNext Logo" className="admin-logo-img" />
          <nav className="admin-navigation">
            <button
              className={`admin-nav-button ${activeTab === "calendar" ? "active" : ""}`}
              onClick={() => setActiveTab("calendar")}
            >
              <FaCalendarAlt style={{ marginRight: "10px" }} />
              Calendar View
            </button>
            <button
              className={`admin-nav-button ${activeTab === "timeline" ? "active" : ""}`}
              onClick={() => setActiveTab("timeline")}
            >
              <FaMap style={{ marginRight: "10px" }} />
              Timeline View
            </button>
            <button
              className={`admin-nav-button ${activeTab === "failurelogs" ? "active" : ""}`}
              onClick={() => setActiveTab("failurelogs")}
            >
              <FaExclamationTriangle style={{ marginRight: "10px" }} />
              Fault Reports
            </button>
            <button
              className={`admin-nav-button ${activeTab === "selectdomain" ? "active" : ""}`}
              onClick={() => setActiveTab("selectdomain")}
            >
              <FaCheckDouble style={{ marginRight: "10px" }} />
              Select Domain
            </button>
            <button
              className={`admin-nav-button ${activeTab === "approvalrequest" ? "active" : ""}`}
              onClick={() => setActiveTab("approvalrequest")}
            >
              <TbUserScan style={{ marginRight: "10px" }} />
              Approval Request
            </button>
            <button
              className={`admin-nav-button ${activeTab === "approvedusers" ? "active" : ""}`}
              onClick={() => setActiveTab("approvedusers")}
            >
              <FaCheckCircle style={{ marginRight: "10px" }} />
              Approved Users
            </button>

            <button
              className={`admin-nav-button ${activeTab === "reportsection" ? "active" : ""}`}
              onClick={() => setActiveTab("reportsection")}
            >
              <BiSolidReport style={{ marginRight: "10px" }} />
              Activity Metrics
            </button>
            <button
              className={`admin-nav-button ${activeTab === "recentaccess" ? "active" : ""}`}
              onClick={() => setActiveTab("recentaccess")}
            >
              <FaUserShield style={{ marginRight: "10px" }} />
              Recently Used
            </button>
             <button
              className={`admin-nav-button ${activeTab === "mailschedule" ? "active" : ""}`}
              onClick={() => setActiveTab("mailschedule")}
            >
              <RiCalendarScheduleFill style={{ marginRight: "10px" }} />
              Mail schedules
            </button>
            <button
              className={`admin-nav-button ${activeTab === "addnewaduser" ? "active" : ""}`}
              onClick={() => setActiveTab("addnewaduser")}
            >
              <FaUserPlus style={{ marginRight: "10px" }} />
              Account Creation
            </button>
          </nav>
        </div>
        <div className="admin-logout-container">
          <button className="admin-logout-button logout-button" onClick={handleLogout}>
            <span className="logout-circle" aria-hidden="true">
              <span className="logout-icon">
                {/* SVG Logout Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="M9 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
            </span>
            <span className="logout-button-text">Logout</span>
          </button>
        </div>

      </aside>
      <main className="admin-main-content">
        {activeTab === "calendar" && <CalendarView />}
        {activeTab === "timeline" && <TimelineView />}
        {activeTab === "failurelogs" && <FailureLogs />}
        {activeTab === "selectdomain" && <SelectDomain />}
        {activeTab === "approvalrequest" && <ApprovalRequest />}
        {activeTab === "approvedusers" && <ApprovedUsers />}
        {activeTab === "reportsection" && <ReportsSection />}
        {activeTab === "recentaccess" && <RecentAccess />}
        {activeTab === "mailschedule" && <MailSchedule />}
        {activeTab === "addnewaduser" && <AddnewADUser />}
      </main>
    </div>
  );
}

export default AdminDashboard;