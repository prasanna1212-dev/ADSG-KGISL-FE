import React, { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaUsersCog,
  FaFileUpload,
  FaUser,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
  FaCheckCircle,
  FaExclamationCircle,
  FaFolder,
  FaClipboardList,
  FaFolderPlus,
  FaMailchimp,
  FaMailBulk,
  FaMobile,
  FaMobileAlt,
  FaIdCard,
  FaFileAlt,
  FaFileCsv,
  FaUsers,
} from "react-icons/fa";
import { LuFilePlus } from "react-icons/lu";
import { TbUsersPlus } from "react-icons/tb";

import axios from "axios";
import AddnewADUserActivityLogs from "./AddnewADUserActivityLogs";
import "../styles/AddnewADUser.css";
import Select, { components } from "react-select";

const CustomControl = (props) => (
  <components.Control {...props}>
    <FaFolder
      style={{
        marginLeft: "8px",
        marginRight: "6px",
        color: "#b8b8b8ff",
        fontSize: "16px",
      }}
    />
    {props.children}
  </components.Control>
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Message = ({ type, message }) => {
  if (!message) return null;
  const icon =
    type === "success" ? (
      <FaCheckCircle className="ad-user-icon-success" />
    ) : type === "error" ? (
      <FaExclamationCircle className="ad-user-icon-error" />
    ) : type === "warning" ? (
      <FaExclamationCircle className="ad-user-icon-warning" />
    ) : (
      <FaUserPlus className="ad-user-icon-info" />
    );

  return (
    <div className={`ad-user-message ad-user-message-${type}`}>
      {icon}
      <span className="ad-user-message-text">{message}</span>
    </div>
  );
};

/**
 * Component to display the detailed results of a bulk user creation.
 */
const BulkReport = ({ report }) => {
  if (!report || report.length === 0) return null;

  return (
    <div className="ad-bulk-report-container">
      <h4 className="ad-bulk-report-header">Bulk Creation Report</h4>
      <div className="ad-bulk-report-list">
        {report.map((item, index) => {
          let statusType = item.status;
          if (
            item.status === "failed" &&
            item.reason.includes("already exists")
          ) {
            statusType = "warning";
          }

          return (
            <div
              key={index}
              className={`ad-bulk-report-item ad-bulk-report-item-${statusType}`}
            >
              {statusType === "success" ? (
                <FaCheckCircle className="ad-user-icon-success" />
              ) : (
                <FaExclamationCircle className={`ad-user-icon-${statusType}`} />
              )}
              <div className="ad-bulk-report-details">
                <span className="ad-bulk-report-user-info">
                  User: <strong>{item.user.fullName}</strong> (
                  {item.user.userLogonName})
                </span>
                <span className="ad-bulk-report-status-text">
                  Status: {statusType} - {item.reason}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Component for the Single User creation form.
 */
const SingleUserForm = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  mail,
  setMail,
  mobile,
  handleMobileChange,
  employeeNumber,
  setEmployeeNumber,
  password,
  handlePasswordChange,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  selectedOU,
  setSelectedOU,
  ouDetails,
  handleCreateUser,
  passwordConstraints,
  isMobileValid,
  isPasswordFocused, // <-- New prop
  setIsPasswordFocused, // <-- New prop
  isConfirmPasswordFocused, // <-- New prop
  setIsConfirmPasswordFocused, // <-- New prop
}) => (
  <div className="ad-single-user-form">
    <h3 className="ad-single-user-header">
      <FaUserPlus className="ad-single-user-icon" />
      New User Details
    </h3>
    <div className="ad-single-user-form-grid">
      {/* First Name Input Field */}
      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">First Name</label>
        <div className="ad-single-user-input-container">
          <input
            type="text"
            placeholder="Enter First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="ad-single-user-input"
            required
          />
          <FaUser className="ad-single-user-input-icon" />
        </div>
      </div>

      {/* Last Name Input Field */}
      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">Last Name</label>
        <div className="ad-single-user-input-container">
          <input
            type="text"
            placeholder="Enter Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="ad-single-user-input"
            required
          />
          <FaUser className="ad-single-user-input-icon" />
        </div>
      </div>

      {/* Read-only Logon Name */}
      <div className="ad-single-user-form-group ad-single-user-full-width">
        <label className="ad-single-user-label">Logon Name</label>
        <div className="ad-single-user-input-container">
          <input
            type="text"
            readOnly
            value={
              firstName && lastName ? `${firstName}.${lastName}@kgnext.in` : ""
            }
            className="ad-single-user-input-readonly"
          />
          <FaUser className="ad-single-user-input-icon ad-single-user-icon-readonly" />
        </div>
      </div>

      {/* Password Input Field with Validation */}
      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">Password</label>
        <div className="ad-single-user-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setIsPasswordFocused(true)} // <-- New handler
            onBlur={() => setIsPasswordFocused(false)} // <-- New handler
            className="ad-single-user-input"
            required
          />
          <span
            className="ad-password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          <FaKey className="ad-single-user-input-icon" />
        </div>
      </div>

      {/* Confirm Password Input Field with Validation */}
      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">Confirm Password</label>
        <div className="ad-single-user-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setIsConfirmPasswordFocused(true)} // <-- New handler
            onBlur={() => setIsConfirmPasswordFocused(false)} // <-- New handler
            className="ad-single-user-input"
            required
          />
          <span
            className="ad-password-toggle-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          <FaKey className="ad-single-user-input-icon" />
        </div>
      </div>

      {/* Password Constraints List - Now Conditional */}
      {(isPasswordFocused || isConfirmPasswordFocused) && (
        <div className="ad-single-user-constraints-list ad-single-user-full-width">
          <ul>
            <li className={passwordConstraints.length ? "valid" : "invalid"}>
              At least 12 characters
            </li>
            <li
              className={passwordConstraints.hasAlphabet ? "valid" : "invalid"}
            >
              Should contain at least 1 alphabet
            </li>
            <li className={passwordConstraints.hasNumber ? "valid" : "invalid"}>
              Should contain at least 1 number
            </li>
            <li
              className={
                passwordConstraints.hasSpecialChar ? "valid" : "invalid"
              }
            >
              Should contain at least 1 special character
            </li>
            <li
              className={
                passwordConstraints.passwordsMatch ? "valid" : "invalid"
              }
            >
              Passwords match
            </li>
          </ul>
        </div>
      )}

      {/* Mail, Mobile, and EmployeeNumber Input Fields */}
      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">Email</label>
        <div className="ad-single-user-input-container">
          <input
            type="email"
            placeholder="Enter Email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            className="ad-single-user-input"
            required
          />
          <FaMailBulk className="ad-single-user-input-icon" />
        </div>
      </div>

      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">Mobile</label>
        <div className="ad-single-user-input-container">
          <input
            type="tel"
            placeholder="Enter Mobile Number"
            value={mobile}
            onChange={handleMobileChange}
            maxLength="10"
            className={`ad-single-user-input ${
              !isMobileValid && mobile.length > 0 ? "input-error" : ""
            }`}
            required
          />
          <FaMobileAlt className="ad-single-user-input-icon" />
        </div>
        {!isMobileValid && mobile.length > 0 && (
          <p className="ad-validation-error">
            Please enter a valid 10-digit mobile number.
          </p>
        )}
      </div>

      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">Employee Number</label>
        <div className="ad-single-user-input-container">
          <input
            type="text"
            placeholder="Enter Employee Number"
            value={employeeNumber}
            onChange={(e) => setEmployeeNumber(e.target.value)}
            className="ad-single-user-input"
            required
          />
          <FaIdCard className="ad-single-user-input-icon" />
        </div>
      </div>

      {/* Organizational Unit Dropdown */}
      <div className="ad-single-user-form-group">
        <label className="ad-single-user-label">Organizational Unit</label>
        <div className="ad-single-user-select-container">
          <FaFolder
            className="ad-single-user-select-prefix"
            aria-hidden="true"
            focusable="false"
          />
          <select
            value={selectedOU}
            onChange={(e) => setSelectedOU(e.target.value)}
            className="ad-single-user-select"
            required
          >
            <option value="" disabled>
              Select OU
            </option>
            {ouDetails?.map((ou, index) => (
              <option key={index} value={ou.distinguishedName}>
                {ou?.ou}
              </option>
            ))}
          </select>
          <FaChevronDown
            className="ad-single-user-select-icon"
            aria-hidden="true"
            focusable="false"
          />
        </div>
      </div>
    </div>

    {/* Button to trigger user creation */}
    <button onClick={handleCreateUser} className="ad-single-user-button">
      <FaUserPlus className="ad-single-user-button-icon" />
      Create User
    </button>
  </div>
);

/**
 * Component for the Bulk User Upload form.
 */
const BulkUserForm = ({ bulkFile, setBulkFile, handleBulkUpload }) => {
  const handleDownloadSample = () => {
    const headers =
      "firstName,lastName,fullName,userLogonName,password,organizationalUnit,mail,mobile,employeeNumber";
    const sampleData = `demo,kgn,"demo kgn","demo.kgn@kgnext.in","Kgnext@12345","CN=demo kgn,OU=KGN,DC=kgnext,DC=in","demokgn@kggroup.in",9988774455,314100`;
    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "AD_User_Sample.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="ad-multiple-user-form">
      <div className="ad-multiple-user-header-container">
        <h3 className="ad-multiple-user-header">
          <FaUsersCog className="ad-multiple-user-icon" />
          Bulk User Upload
        </h3>
        <div>
          <button
            className="ad-multiple-user-header-button"
            onClick={handleDownloadSample}
          >
            <FaFileCsv className="ad-multiple-user-header-button-icon" />
            Sample CSV
          </button>
        </div>
      </div>
      <p className="ad-multiple-user-description">
        Upload a `.csv` file with a list of users to create. The file should
        contain columns for &nbsp;
        <span style={{ fontWeight: "600" }}>
          firstName, lastName, fullName, userLogonName, password,
          organizationalUnit, mail, mobile, employeeNumber
        </span>
      </p>

      {/* File Upload Input */}
      <div className="ad-multiple-user-upload-area">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setBulkFile(e.target.files[0])}
          className="ad-multiple-user-file-input"
        />
        <div className="ad-multiple-user-upload-content">
          <LuFilePlus className="ad-multiple-user-upload-icon" />
          <span className="ad-multiple-user-upload-text">
            {bulkFile ? bulkFile.name : "Click to upload a .csv file"}
          </span>
          <span className="ad-multiple-user-upload-subtext">
            Maximum file size: 5MB
          </span>
        </div>
      </div>

      {/* Button to trigger the bulk upload */}
      <button
        onClick={handleBulkUpload}
        className="ad-multiple-user-button"
        disabled={!bulkFile}
      >
        <FaFileUpload className="ad-multiple-user-button-icon" />
        Upload & Create Users
      </button>
    </div>
  );
};

// The main component with the updated logic.
const AddnewADUser = () => {
  const [activeTab, setActiveTab] = useState("single");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mail, setMail] = useState("");
  const [mobile, setMobile] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedOU, setSelectedOU] = useState("");
  const [ouDetails, setOuDetails] = useState([]);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkReport, setBulkReport] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [ouName, setOuName] = useState("");
  const [ouActiveTab, setoUActiveTab] = useState("main");
  const [selectedParentOu, setSelectedParentOu] = useState("");

  const [groupName, setGroupName] = useState("");
  const [selectedParentOuForGroup, setSelectedParentOuForGroup] = useState("");

  // NEW state for validation
  const [passwordConstraints, setPasswordConstraints] = useState({
    length: false,
    hasAlphabet: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });
  const [isMobileValid, setIsMobileValid] = useState(true);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // <-- New state
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false); // <-- New state

  const serverName = "kgn-dc01";

  const displayMessage = (type, message) => {
    setSuccessMessage("");
    setErrorMessage("");
    setInfoMessage("");
    setWarningMessage("");
    if (type === "success") setSuccessMessage(message);
    if (type === "error") setErrorMessage(message);
    if (type === "info") setInfoMessage(message);
    if (type === "warning") setWarningMessage(message);
    if (type !== "report") setBulkReport(null);
  };

  // NEW handler for password changes
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    setPasswordConstraints({
      length: newPassword.length >= 12,
      hasAlphabet: /[a-zA-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
      passwordsMatch: newPassword === confirmPassword,
    });
  };

  // NEW handler for mobile number changes
  const handleMobileChange = (e) => {
    const newMobile = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setMobile(newMobile);
    setIsMobileValid(newMobile.length === 10);
  };

  useEffect(() => {
    setPasswordConstraints((prev) => ({
      ...prev,
      passwordsMatch: password === confirmPassword,
    }));
  }, [password, confirmPassword]);

  /**
   * Handles the single user creation logic.
   */
  const handleCreateUser = async () => {
    // Client-side validation
    if (
      !firstName ||
      !lastName ||
      !password ||
      !confirmPassword ||
      !selectedOU ||
      !mail ||
      !mobile ||
      !employeeNumber
    ) {
      displayMessage("error", "Please fill all required fields.");
      return;
    }

    // Check the new constraints before submission
    const allConstraintsMet = Object.values(passwordConstraints).every(
      (val) => val
    );
    if (!allConstraintsMet) {
      displayMessage(
        "error",
        "Password does not meet all the required constraints."
      );
      return;
    }
    if (!isMobileValid) {
      displayMessage("error", "Please enter a valid 10-digit mobile number.");
      return;
    }

    const fullName = `${firstName} ${lastName}`;
    const userLogonName = `${firstName}.${lastName}@kgnext.in`;
    const createdBy = localStorage.getItem("domainJoinUPN");

    try {
      displayMessage("info", "Creating user...");

      const response = await axios.post(
        `${API_BASE_URL}/AD/ad-createUser/${serverName}`,
        {
          firstName,
          lastName,
          fullName,
          userLogonName,
          password,
          organizationalUnit: selectedOU,
          mail,
          mobile,
          employeeNumber,
          createdBy,
        }
      );

      displayMessage(
        "success",
        response.data.message || "User created successfully!"
      );
      setFirstName("");
      setLastName("");
      setMail("");
      setMobile("");
      setEmployeeNumber("");
      setPassword("");
      setConfirmPassword("");
      setSelectedOU("");
      setPasswordConstraints({
        length: false,
        hasAlphabet: false,
        hasNumber: false,
        hasSpecialChar: false,
        passwordsMatch: false,
      });
      setIsMobileValid(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to create user. Please check server logs.";
      displayMessage("error", errorMsg);
      console.error("Failed to create user:", err);
    }
  };

  /**
   * Handles the bulk user upload logic and API call.
   */
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      displayMessage("error", "Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("usersCsv", bulkFile);
    const createdBy = localStorage.getItem("domainJoinUPN");
    formData.append("createdBy", createdBy);

    try {
      displayMessage(
        "info",
        `Uploading file and creating users. Please wait...`
      );
      setBulkReport(null);

      const response = await axios.post(
        `${API_BASE_URL}/AD/ad-bulk-create-users/${serverName}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { message, report } = response.data;

      if (message.includes("failed")) {
        displayMessage("error", message);
      } else if (message.includes("warnings") || message.includes("skipped")) {
        displayMessage("warning", message);
      } else {
        displayMessage("success", message);
      }

      setBulkReport(report);
      setBulkFile(null);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to process bulk upload. Please check server logs.";
      displayMessage("error", errorMsg);
      console.error("Bulk upload failed:", err);
      setBulkReport([]);
    }
  };

  const fetchOUs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/AD/ad-OUdetails`);
      setOuDetails(res.data.organizationalUnits || []);
    } catch (err) {
      console.error("Failed to fetch OU details", err);
    }
  };

  useEffect(() => {
    fetchOUs();
  }, []);

  const createOU = async () => {
    try {
      if (
        !ouName ||
        !serverName ||
        (ouActiveTab === "sub" && !selectedParentOu)
      ) {
        displayMessage("error", "Please fill required fields");
        return;
      }

      const payload = {
        ouName,
        ...(ouActiveTab === "sub" ? { parentOu: selectedParentOu } : {}),
      };

      const response = await axios.post(
        `${API_BASE_URL}/AD/create-ou/${serverName}`,
        payload
      );

      setOuName("");
      setSelectedParentOu("");
      fetchOUs();
      displayMessage(
        "success",
        response.data.message || "OU created successfully!"
      );
    } catch (err) {
      console.error("Error creating OU:", err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.message || "Failed to create OU. Please try again.";
      displayMessage("error", errorMsg);
    }
  };

  const createGroup = async () => {
    try {
      // 🔹 Validation
      if (
        !groupName ||
        !serverName ||
        (ouActiveTab === "subGroup" && !selectedParentOuForGroup)
      ) {
        displayMessage("error", "Please fill required fields");
        return; // stop execution if validation fails
      }

      // 🔹 Request payload
      const payload = {
        groupName,
        ...(ouActiveTab === "subGroup"
          ? { parentOu: selectedParentOuForGroup }
          : {}), // only add parentOu if tab is "sub"
      };

      const response = await axios.post(
        `${API_BASE_URL}/AD/create-group/${serverName}`,
        payload
      );

      // Reset states
      setGroupName("");
      setSelectedParentOuForGroup("");

      displayMessage(
        "success",
        response.data.message || "Group created successfully!"
      );
    } catch (err) {
      console.error("Error creating group:", err.response?.data || err.message);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to create group. Please try again.";
      displayMessage("error", errorMsg);
    }
  };

  return (
    <div className="ad-user-page-container">
      {/* Main Header */}
      <div className="ad-user-main-header">
        <div className="admin-dashboard-header-fontstyle">
          <div>
            <h1>
              <span className="admin-dashboard-header-first-character">A</span>
              ctive&nbsp;&nbsp;&nbsp;
              <span className="admin-dashboard-header-first-character">D</span>
              irectory&nbsp;&nbsp;&nbsp;
              <span className="admin-dashboard-header-first-character">U</span>
              ser&nbsp;&nbsp;&nbsp;
              <span className="admin-dashboard-header-first-character">C</span>
              reation
            </h1>
          </div>
        </div>
        <p className="ad-user-main-subtitle">
          Create single users or upload a list of users in bulk.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="ad-user-card-container">
        {/* Tab Buttons */}
        <div className="ad-user-tabs">
          <button
            onClick={() => {
              setActiveTab("single");
              displayMessage("", "");
            }}
            className={`ad-user-tab ${
              activeTab === "single" ? "ad-user-tab-active-single" : ""
            }`}
          >
            <FaUserPlus size={20} className="ad-user-tab-icon" />
            <span>Single User</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("bulk");
              displayMessage("", "");
            }}
            className={`ad-user-tab ${
              activeTab === "bulk" ? "ad-user-tab-active-bulk" : ""
            }`}
          >
            <FaUsersCog size={20} className="ad-user-tab-icon" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("reports");
              displayMessage("", "");
            }}
            className={`ad-user-tab ${
              activeTab === "reports" ? "ad-user-tab-active-reports" : ""
            }`}
          >
            <FaClipboardList size={20} className="ad-user-tab-icon" />
            <span>Activity Reports</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("createOu");
              displayMessage("", "");
            }}
            className={`ad-user-tab ${
              activeTab === "createOu" ? "ad-user-tab-active-bulk" : ""
            }`}
          >
            <FaFolder size={20} className="ad-user-tab-icon" />
            <span>Create OU</span>
          </button>
        </div>

        {/* Display the correct content based on the active tab */}
        <div className="ad-user-form-content">
          {activeTab === "single" && (
            <SingleUserForm
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              mail={mail}
              setMail={setMail}
              mobile={mobile}
              handleMobileChange={handleMobileChange}
              employeeNumber={employeeNumber}
              setEmployeeNumber={setEmployeeNumber}
              password={password}
              handlePasswordChange={handlePasswordChange}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              selectedOU={selectedOU}
              setSelectedOU={setSelectedOU}
              ouDetails={ouDetails}
              handleCreateUser={handleCreateUser}
              passwordConstraints={passwordConstraints}
              isMobileValid={isMobileValid}
              isPasswordFocused={isPasswordFocused} // <-- Pass new state
              setIsPasswordFocused={setIsPasswordFocused} // <-- Pass new state setter
              isConfirmPasswordFocused={isConfirmPasswordFocused} // <-- Pass new state
              setIsConfirmPasswordFocused={setIsConfirmPasswordFocused} // <-- Pass new state setter
            />
          )}
          {activeTab === "bulk" && (
            <BulkUserForm
              bulkFile={bulkFile}
              setBulkFile={setBulkFile}
              handleBulkUpload={handleBulkUpload}
            />
          )}
          {activeTab === "reports" && <AddnewADUserActivityLogs />}
        </div>

        {activeTab === "createOu" && (
          <div className="ad-create-ou-container">
            <div className="ad-ou-boxes-container">
              {/* MAIN OU BOX */}
              <div
                className={`ou-box ${ouActiveTab === "main" ? "active" : ""}`}
                onClick={() => setoUActiveTab("main")}
              >
                <h3 className="ou-box-title">Main OU</h3>

                <>
                  <div className="ad-single-user-form-group">
                    <label className="ad-single-user-label">OU Name</label>
                    <div className="ad-single-user-input-container">
                      <input
                        type="text"
                        placeholder="Enter OU Name"
                        value={ouName}
                        onChange={(e) => setOuName(e.target.value)}
                        className="ad-single-user-input"
                        required
                      />
                      <FaFolder className="ad-single-user-input-icon" />
                    </div>
                  </div>

                  <button onClick={createOU} className="ad-single-user-button">
                    <FaFolderPlus className="ad-single-user-button-icon" />
                    Create OU
                  </button>
                </>
              </div>

              {/* SUB OU BOX */}
              <div
                className={`ou-box ${ouActiveTab === "sub" ? "active" : ""}`}
                onClick={() => setoUActiveTab("sub")}
              >
                <h3 className="ou-box-title">Sub OU</h3>

                <>
                    <label className="ad-single-user-label">Parent OU</label>
                  <Select
                    value={
                      selectedParentOu
                        ? {
                            value: selectedParentOu,
                            label: ouDetails?.find(
                              (ou) => ou.distinguishedName === selectedParentOu
                            )?.ou,
                          }
                        : null
                    }
                    onChange={(option) =>
                      setSelectedParentOu(option?.value || "")
                    }
                    options={
                      ouDetails?.map((ou) => ({
                        value: ou.distinguishedName,
                        label: ou.ou,
                      })) || []
                    }
                    placeholder="Select Parent OU"
                    isSearchable={true}
                    classNamePrefix="react-select"
                    components={{ Control: CustomControl }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        width: "100%", // ✅ full width
                        minHeight: "40px",
                        marginBottom: "20px",
                        cursor: "pointer",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999, // ✅ higher z-index
                        width: "100%",
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999, // ✅ ensures dropdown goes above modals etc.
                      }),
                    }}
                    menuPortalTarget={document.body} // ✅ render dropdown at body level
                  />
                  <div className="ad-single-user-form-group">
                    <label className="ad-single-user-label">OU Name</label>
                    <div className="ad-single-user-input-container">
                      <input
                        type="text"
                        placeholder="Enter OU Name"
                        value={ouName}
                        onChange={(e) => setOuName(e.target.value)}
                        className="ad-single-user-input"
                        required
                      />
                      <FaFolder className="ad-single-user-input-icon" />
                    </div>
                  </div>
                  <button onClick={createOU} className="ad-single-user-button">
                    <FaFolderPlus className="ad-single-user-button-icon" />
                    Create OU
                  </button>
                </>
              </div>

              {/* MAIN GROUP BOX */}
              <div
                className={`ou-box ${
                  ouActiveTab === "mainGroup" ? "active" : ""
                }`}
                onClick={() => setoUActiveTab("mainGroup")}
              >
                <h3 className="ou-box-title">Main Group</h3>
                <>
                  <div className="ad-single-user-form-group">
                    <label className="ad-single-user-label">Group Name</label>
                    <div className="ad-single-user-input-container">
                      <input
                        type="text"
                        placeholder="Enter Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="ad-single-user-input"
                        required
                      />
                      <FaUser className="ad-single-user-input-icon" />
                    </div>
                  </div>

                  <button
                    onClick={createGroup}
                    className="ad-single-user-button"
                  >
                    <TbUsersPlus
                      className="ad-single-user-button-icon"
                      style={{ fontSize: "1rem" }}
                    />
                    Create Group
                  </button>
                </>
              </div>

              {/* SUB GROUP BOX */}
              <div
                className={`ou-box ${
                  ouActiveTab === "subGroup" ? "active" : ""
                }`}
                onClick={() => setoUActiveTab("subGroup")}
              >
                <h3 className="ou-box-title">Sub Group</h3>
                <>
                  <label className="ad-single-user-label">Parent OU</label>
                  <Select
                    value={
                      selectedParentOuForGroup
                        ? {
                            value: selectedParentOuForGroup,
                            label: ouDetails?.find(
                              (ou) =>
                                ou.distinguishedName ===
                                selectedParentOuForGroup
                            )?.ou,
                          }
                        : null
                    }
                    onChange={(option) =>
                      setSelectedParentOuForGroup(option?.value || "")
                    }
                    options={
                      ouDetails?.map((ou) => ({
                        value: ou.distinguishedName,
                        label: ou.ou,
                      })) || []
                    }
                    placeholder="Select Parent OU"
                    isSearchable={true}
                    classNamePrefix="react-select"
                    components={{ Control: CustomControl }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        width: "100%",
                        minHeight: "40px",
                        marginBottom: "20px",
                        cursor: "pointer",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        width: "100%",
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    }}
                    menuPortalTarget={document.body}
                  />

                  <div className="ad-single-user-form-group">
                    <label className="ad-single-user-label">Group Name</label>
                    <div className="ad-single-user-input-container">
                      <input
                        type="text"
                        placeholder="Enter Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="ad-single-user-input"
                        required
                      />
                      <FaUsers className="ad-single-user-input-icon" />
                    </div>
                  </div>

                  <button
                    onClick={createGroup}
                    className="ad-single-user-button"
                  >
                    <TbUsersPlus
                      className="ad-single-user-button-icon"
                      style={{ fontSize: "1rem" }}
                    />
                    Create Group
                  </button>
                </>
              </div>
            </div>
          </div>
        )}

        {/* Messages for user feedback (displays on all tabs) */}
        <div className="ad-user-messages">
          <Message type="success" message={successMessage} />
          <Message type="error" message={errorMessage} />
          <Message type="info" message={infoMessage} />
          <Message type="warning" message={warningMessage} />
        </div>

        {/* Bulk Report Display (only for Bulk tab) */}
        {activeTab === "bulk" && bulkReport && (
          <div className="ad-user-messages">
            <BulkReport report={bulkReport} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddnewADUser;

// import React, { useEffect, useState } from "react";
// import {
//   FaUserPlus,
//   FaUsersCog,
//   FaFileUpload,
//   FaUser,
//   FaKey,
//   FaEye,
//   FaEyeSlash,
//   FaChevronDown,
//   FaCheckCircle,
//   FaExclamationCircle,
//   FaFolder,
//   FaClipboardList,
//   FaFolderPlus,
//   FaMailchimp,
//   FaMailBulk,
//   FaMobile,
//   FaMobileAlt,
//   FaIdCard,
//   FaFileAlt,
//   FaFileCsv
// } from "react-icons/fa";
// import { LuFilePlus } from "react-icons/lu";
// import axios from "axios";
// import AddnewADUserActivityLogs from "./AddnewADUserActivityLogs";
// import "../styles/AddnewADUser.css";
// import Select, { components }  from "react-select";

// const CustomControl = (props) => (
//   <components.Control {...props}>
//     <FaFolder style={{ marginLeft: "8px", marginRight: "6px", color: "#b8b8b8ff",fontSize:"16px" }} />
//     {props.children}
//   </components.Control>
// );

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const Message = ({ type, message }) => {
//   if (!message) return null;
//   const icon =
//     type === "success" ? (
//       <FaCheckCircle className="ad-user-icon-success" />
//     ) : type === "error" ? (
//       <FaExclamationCircle className="ad-user-icon-error" />
//     ) : type === "warning" ? (
//       <FaExclamationCircle className="ad-user-icon-warning" />
//     ) : (
//       <FaUserPlus className="ad-user-icon-info" />
//     );

//   return (
//     <div className={`ad-user-message ad-user-message-${type}`}>
//       {icon}
//       <span className="ad-user-message-text">{message}</span>
//     </div>
//   );
// };

// /**
//  * Component to display the detailed results of a bulk user creation.
//  * This component has been updated to correctly identify 'skipped' users
//  * by checking the reason field from the backend report.
//  */
// const BulkReport = ({ report }) => {
//   if (!report || report.length === 0) return null;

//   return (
//     <div className="ad-bulk-report-container">
//       <h4 className="ad-bulk-report-header">Bulk Creation Report</h4>
//       <div className="ad-bulk-report-list">
//         {report.map((item, index) => {
//           // Determine the status for styling based on the report data
//           let statusType = item.status;
//           // Check if the reason indicates a user was skipped (already exists).
//           if (item.status === 'failed' && item.reason.includes('already exists')) {
//             statusType = 'warning';
//           }

//           return (
//             <div key={index} className={`ad-bulk-report-item ad-bulk-report-item-${statusType}`}>
//               {statusType === "success" ? (
//                 <FaCheckCircle className="ad-user-icon-success" />
//               ) : (
//                 <FaExclamationCircle className={`ad-user-icon-${statusType}`} />
//               )}
//               <div className="ad-bulk-report-details">
//                 <span className="ad-bulk-report-user-info">
//                   User: <strong>{item.user.fullName}</strong> ({item.user.userLogonName})
//                 </span>
//                 <span className="ad-bulk-report-status-text">
//                   Status: {statusType} - {item.reason}
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// /**
//  * Component for the Single User creation form.
//  */
// const SingleUserForm = ({
//   firstName,
//   setFirstName,
//   lastName,
//   setLastName,
//   mail,            // <--- ADDED
//   setMail,         // <--- ADDED
//   mobile,          // <--- ADDED
//   setMobile,       // <--- ADDED
//   employeeNumber,  // <--- ADDED
//   setEmployeeNumber,// <--- ADDED
//   password,
//   setPassword,
//   confirmPassword,
//   setConfirmPassword,
//   showPassword,
//   setShowPassword,
//   selectedOU,
//   setSelectedOU,
//   ouDetails,
//   handleCreateUser,
// }) => (
//   <div className="ad-single-user-form">
//     <h3 className="ad-single-user-header">
//       <FaUserPlus className="ad-single-user-icon" />
//       New User Details
//     </h3>
//     <div className="ad-single-user-form-grid">
//       {/* First Name Input Field */}
//       <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">First Name</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type="text"
//             placeholder="Enter First Name"
//             value={firstName}
//             onChange={(e) => setFirstName(e.target.value)}
//             className="ad-single-user-input"
//             required
//           />
//           <FaUser className="ad-single-user-input-icon" />
//         </div>
//       </div>

//       {/* Last Name Input Field */}
//       <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">Last Name</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type="text"
//             placeholder="Enter Last Name"
//             value={lastName}
//             onChange={(e) => setLastName(e.target.value)}
//             className="ad-single-user-input"
//             required
//           />
//           <FaUser className="ad-single-user-input-icon" />
//         </div>
//       </div>

//       {/* Read-only Logon Name */}
//       <div className="ad-single-user-form-group ad-single-user-full-width">
//         <label className="ad-single-user-label">Logon Name</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type="text"
//             readOnly
//             value={
//               firstName && lastName ? `${firstName}.${lastName}@kgnext.in` : ""
//             }
//             className="ad-single-user-input-readonly"
//           />
//           <FaUser className="ad-single-user-input-icon ad-single-user-icon-readonly" />
//         </div>
//       </div>

//       {/* Password Input Field */}
//       <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">Password</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type={showPassword ? "text" : "password"}
//             placeholder="Enter Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="ad-single-user-input"
//             required
//           />
//           <span
//             className="ad-password-toggle-icon"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </span>
//           <FaKey className="ad-single-user-input-icon" />
//         </div>
//       </div>
//
//       {/* Confirm Password Input Field */}
//       <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">Confirm Password</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type={showPassword ? "text" : "password"}
//             placeholder="Confirm Password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className="ad-single-user-input"
//             required
//           />
//           <span
//             className="ad-password-toggle-icon"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? <FaEyeSlash /> : <FaEye />}
//           </span>
//           <FaKey className="ad-single-user-input-icon" />
//         </div>
//       </div>

// {/* ADDED: mail, mobile, and EmployeeNumber Input Fields */}
// <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">Email</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type="email"
//             placeholder="Enter Email"
//             value={mail}
//             onChange={(e) => setMail(e.target.value)}
//             className="ad-single-user-input"
//             required
//           />
//           <FaMailBulk className="ad-single-user-input-icon" />
//         </div>
//       </div>
//       <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">Mobile</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type="tel"
//             placeholder="Enter Mobile Number"
//             value={mobile}
//             onChange={(e) => setMobile(e.target.value)}
//             className="ad-single-user-input"
//             required
//           />
//           <FaMobileAlt className="ad-single-user-input-icon" />
//         </div>
//       </div>
//       <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">Employee Number</label>
//         <div className="ad-single-user-input-container">
//           <input
//             type="text"
//             placeholder="Enter Employee Number"
//             value={employeeNumber}
//             onChange={(e) => setEmployeeNumber(e.target.value)}
//             className="ad-single-user-input"
//             required
//           />
//           <FaIdCard className="ad-single-user-input-icon" />
//         </div>
//       </div>

//       {/* Organizational Unit Dropdown */}
//       <div className="ad-single-user-form-group">
//         <label className="ad-single-user-label">Organizational Unit</label>
//         <div className="ad-single-user-select-container">
//           <FaFolder
//             className="ad-single-user-select-prefix"
//             aria-hidden="true"
//             focusable="false"
//           />
//           <select
//             value={selectedOU}
//             onChange={(e) => setSelectedOU(e.target.value)}
//             className="ad-single-user-select"
//             required
//           >
//             <option value="" disabled>
//               Select OU
//             </option>
//             {ouDetails?.map((ou, index) => (
//               <option key={index} value={ou.distinguishedName}>
//                 {ou?.ou}
//               </option>
//             ))}
//           </select>
//           <FaChevronDown
//             className="ad-single-user-select-icon"
//             aria-hidden="true"
//             focusable="false"
//           />
//         </div>
//       </div>
//     </div>

//     {/* Button to trigger user creation */}
//     <button onClick={handleCreateUser} className="ad-single-user-button">
//       <FaUserPlus className="ad-single-user-button-icon" />
//       Create User
//     </button>
//   </div>
// );

// /**
//  * Component for the Bulk User Upload form.
//  */
// const BulkUserForm = ({ bulkFile, setBulkFile, handleBulkUpload }) => {
//   const handleDownloadSample = () => {
//     // Define the CSV headers.
//     const headers = "firstName,lastName,fullName,userLogonName,password,organizationalUnit,mail,mobile,employeeNumber";

//     // Define the sample data.
//     const sampleData = `demo,kgn,"demo kgn","demo.kgn@kgnext.in","Kgnext@12345","CN=demo kgn,OU=KGN,DC=kgnext,DC=in","demokgn@kggroup.in",9988774455,314100`;

//     // Combine the headers and the sample data with a newline character.
//     const csvContent = `${headers}\n${sampleData}`;

//     // Create a Blob from the combined string.
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

//     // Create a temporary anchor element and trigger the download.
//     const link = document.createElement("a");
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute("href", url);
//       link.setAttribute("download", "AD_User_Sample.csv");
//       link.style.visibility = "hidden";
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   // Add the return statement here
//   return (
//     <div className="ad-multiple-user-form">
//       <div className="ad-multiple-user-header-container">
//         <h3 className="ad-multiple-user-header">
//           <FaUsersCog className="ad-multiple-user-icon" />
//           Bulk User Upload
//         </h3>
//         <div>
//           <button className="ad-multiple-user-header-button" onClick={handleDownloadSample}>
//             <FaFileCsv className="ad-multiple-user-header-button-icon" />
//             Sample CSV
//           </button>
//         </div>
//       </div>
//       <p className="ad-multiple-user-description">
//         Upload a `.csv` file with a list of users to create. The file should
//         contain columns for
//         &nbsp;<span style={{fontWeight:"600"}}>firstName, lastName, fullName, userLogonName, password, organizationalUnit, mail, mobile, employeeNumber</span>
//       </p>

//       {/* File Upload Input */}
//       <div className="ad-multiple-user-upload-area">
//         <input
//           type="file"
//           accept=".csv"
//           onChange={(e) => setBulkFile(e.target.files[0])}
//           className="ad-multiple-user-file-input"
//         />
//         <div className="ad-multiple-user-upload-content">
//           <LuFilePlus className="ad-multiple-user-upload-icon" />
//           <span className="ad-multiple-user-upload-text">
//             {bulkFile ? bulkFile.name : "Click to upload a .csv file"}
//           </span>
//           <span className="ad-multiple-user-upload-subtext">
//             Maximum file size: 5MB
//           </span>
//         </div>
//       </div>

//       {/* Button to trigger the bulk upload */}
//       <button onClick={handleBulkUpload} className="ad-multiple-user-button" disabled={!bulkFile}>
//         <FaFileUpload className="ad-multiple-user-button-icon" />
//         Upload & Create Users
//       </button>
//     </div>
//   );
// };

// // The main component with the updated logic.
// const AddnewADUser = () => {
//   const [activeTab, setActiveTab] = useState("single");
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [mail, setMail] = useState("");         // <--- ADDED
//   const [mobile, setMobile] = useState("");       // <--- ADDED
//   const [employeeNumber, setEmployeeNumber] = useState(""); // <--- ADDED
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [selectedOU, setSelectedOU] = useState("");
//   const [ouDetails, setOuDetails] = useState([]);
//   const [bulkFile, setBulkFile] = useState(null);
//   const [bulkReport, setBulkReport] = useState(null); // New state for bulk creation report
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [infoMessage, setInfoMessage] = useState("");
//   const [warningMessage, setWarningMessage] = useState(""); // New state for warning messages

// const [ouName,setOuName] = useState("");

// const [ouActiveTab, setoUActiveTab] = useState("main");
// const [selectedParentOu,setSelectedParentOu] = useState("");
//
//   // Hardcoded server name based on the previous backend logic example.
//   // In a real application, this would likely be passed as a prop.
//   const serverName = "kgn-dc01";

//   // Function to validate password on the frontend
//   const validatePassword = (pwd) => {
//     // Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.
//     const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//     return regex.test(pwd);
//   };

//   const displayMessage = (type, message) => {
//     setSuccessMessage("");
//     setErrorMessage("");
//     setInfoMessage("");
//     setWarningMessage(""); // Clear warning message
//     if (type === "success") setSuccessMessage(message);
//     if (type === "error") setErrorMessage(message);
//     if (type === "info") setInfoMessage(message);
//     if (type === "warning") setWarningMessage(message); // Set warning message
//     // Clear bulk report when a new message is displayed
//     if (type !== "report") setBulkReport(null);
//   };

//   /**
//    * Handles the single user creation logic.
//    * Now includes client-side validation and an asynchronous API call.
//    */
//   const handleCreateUser = async () => {
//     // Client-side validation
//     if (!firstName || !lastName || !password || !confirmPassword || !selectedOU) {
//       displayMessage("error", "Please fill all required fields.");
//       return;
//     }
//
//     if (password !== confirmPassword) {
//       displayMessage("error", "Password and Confirm Password do not match.");
//       return;
//     }

//     if (!validatePassword(password)) {
//       displayMessage("error", "Password must be at least 8 characters long and include one uppercase letter, one number, and one special character.");
//       return;
//     }

//     const fullName = `${firstName} ${lastName}`;
//     // The userLogonName is now hardcoded to use @kgnext.in
//     const userLogonName = `${firstName}.${lastName}@kgnext.in`;

//     // Fetch the domainJoinUPN from local storage.
//     // The key is 'domainJoinUPN' as shown in your screenshot.
//     const createdBy = localStorage.getItem('domainJoinUPN');

//     try {
//       // Show an info message while the request is in progress
//       displayMessage("info", "Creating user...");

//       // Make the API call to the backend
//       const response = await axios.post(
//         `${API_BASE_URL}/AD/ad-createUser/${serverName}`,
//         {
//           firstName,
//           lastName,
//           fullName,
//           userLogonName,
//           password,
//           organizationalUnit: selectedOU,
//           mail,           // <--- ADDED
//           mobile,         // <--- ADDED
//           employeeNumber, // <--- ADDED
//           createdBy       // <--- ADDED
//         }
//       );

//       // Handle a successful response
//       displayMessage("success", response.data.message || "User created successfully!");
//
//       // Clear the form fields after a successful submission
//       setFirstName("");
//       setLastName("");
//       setMail("");           // <--- ADDED
//       setMobile("");         // <--- ADDED
//       setEmployeeNumber(""); // <--- ADDED
//       setPassword("");
//       setConfirmPassword("");
//       setSelectedOU("");
//     } catch (err) {
//       // Handle an error response from the server
//       const errorMsg = err.response?.data?.message || "Failed to create user. Please check server logs.";
//       displayMessage("error", errorMsg);
//       console.error("Failed to create user:", err);
//     }
//   };

//   /**
//    * Handles the bulk user upload logic and API call.
//    * This function has been refactored to correctly display messages and the detailed report.
//    */
//   const handleBulkUpload = async () => {
//     if (!bulkFile) {
//       displayMessage("error", "Please select a file before uploading.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("usersCsv", bulkFile);

//     // Fetch the domainJoinUPN from local storage and append it to FormData.
//      const createdBy = localStorage.getItem('domainJoinUPN');
//      formData.append("createdBy", createdBy);

//     try {
//       displayMessage("info", `Uploading file and creating users. Please wait...`);
//       setBulkReport(null); // Clear previous report

//       const response = await axios.post(
//         `${API_BASE_URL}/AD/ad-bulk-create-users/${serverName}`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       // The backend sends a summary message and a detailed report.
//       const { message, report } = response.data;
//
//       // Check the summary message from the backend to determine the message type
//       if (message.includes("failed")) {
//         displayMessage("error", message);
//       } else if (message.includes("warnings") || message.includes("skipped")) {
//         displayMessage("warning", message);
//       } else {
//         displayMessage("success", message);
//       }
//
//       // Always set the report to display the detailed breakdown below the main message
//       setBulkReport(report);
//       setBulkFile(null); // Clear the file input
//     } catch (err) {
//       // Handle errors and display a message
//       const errorMsg = err.response?.data?.message || "Failed to process bulk upload. Please check server logs.";
//       displayMessage("error", errorMsg);
//       console.error("Bulk upload failed:", err);
//       setBulkReport([]); // Set an empty array to clear the report display
//     }
//   };

//   const fetchOUs = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/AD/ad-OUdetails`);
//       setOuDetails(res.data.organizationalUnits || []);
//     } catch (err) {
//       console.error("Failed to fetch OU details", err);
//     }
//   };

//   useEffect(() => {
//     fetchOUs();
//   }, []);

// const createOU = async () => {
//     try {
//         // 🔹 Validation
//         if (!ouName || !serverName || (ouActiveTab === "sub" && !selectedParentOu)) {
//         displayMessage("error", "Please fill required fields");
//         return; // stop execution if validation fails
//         }

//         // 🔹 Request payload
//         const payload = {
//         ouName,
//         ...(ouActiveTab === "sub" ? { parentOu:selectedParentOu } : {}), // only add parentou if tab is "sub"
//         };

//         const response = await axios.post(
//         `${API_BASE_URL}/AD/create-ou/${serverName}`,
//         payload
//         );

//         setOuName("");
//         setSelectedParentOu("");

//         fetchOUs();

//         displayMessage("success", response.data.message || "OU created successfully!");
//     } catch (err) {
//         console.error("Error creating OU:", err.response?.data || err.message);
//         const errorMsg = err.response?.data?.message || "Failed to create OU. Please try again.";
//         displayMessage("error", errorMsg);
//     }
//   };

//   return (
// <div className="ad-user-page-container">
//     {/* Main Header */}
//     <div className="ad-user-main-header">
//         <div className="admin-dashboard-header-fontstyle">
//             <div>
//                 <h1>
//                     <span className="admin-dashboard-header-first-character">A</span>
//                     ctive&nbsp;&nbsp;&nbsp;
//                     <span className="admin-dashboard-header-first-character">D</span>
//                     irectory&nbsp;&nbsp;&nbsp;
//                     <span className="admin-dashboard-header-first-character">U</span>
//                     ser&nbsp;&nbsp;&nbsp;
//                     <span className="admin-dashboard-header-first-character">C</span>
//                     reation
//                 </h1>
//             </div>
//         </div>
//         <p className="ad-user-main-subtitle">
//             Create single users or upload a list of users in bulk.
//         </p>
//     </div>

//     {/* Main Card Container */}
//     <div className="ad-user-card-container">
//         {/* Tab Buttons */}
//         <div className="ad-user-tabs">
//             <button
//                 onClick={() => {
//                     setActiveTab("single");
//                     displayMessage("", "");
//                 }}
//                 className={`ad-user-tab ${
//                     activeTab === "single" ? "ad-user-tab-active-single" : ""
//                 }`}
//             >
//                 <FaUserPlus size={20} className="ad-user-tab-icon" />
//                 <span>Single User</span>
//             </button>
//             <button
//                 onClick={() => {
//                     setActiveTab("bulk");
//                     displayMessage("", "");
//                 }}
//                 className={`ad-user-tab ${
//                     activeTab === "bulk" ? "ad-user-tab-active-bulk" : ""
//                 }`}
//             >
//                 <FaUsersCog size={20} className="ad-user-tab-icon" />
//                 <span>Bulk Upload</span>
//             </button>
//             <button
//                 onClick={() => {
//                     setActiveTab("reports");
//                     displayMessage("", "");
//                 }}
//                 className={`ad-user-tab ${
//                     activeTab === "reports" ? "ad-user-tab-active-reports" : ""
//                 }`}
//             >
//                 <FaClipboardList size={20} className="ad-user-tab-icon" />
//                 <span>Activity Reports</span>
//             </button>

//             <button
//             onClick={() => {
//               setActiveTab("createOu");
//               displayMessage("", "");
//             }}
//             className={`ad-user-tab ${
//               activeTab === "createOu" ? "ad-user-tab-active-bulk" : ""
//             }`}
//           >
//             <FaFolder  size={20} className="ad-user-tab-icon" />
//             <span>Create OU</span>
//           </button>
//         </div>

//         {/* Display the correct content based on the active tab */}
//         <div className="ad-user-form-content">
//             {activeTab === "single" && (
//                 <SingleUserForm
//                     firstName={firstName}
//                     setFirstName={setFirstName}
//                     lastName={lastName}
//                     setLastName={setLastName}
//                     mail={mail}                   // <--- ADDED
//                     setMail={setMail}               // <--- ADDED
//                     mobile={mobile}                 // <--- ADDED
//                     setMobile={setMobile}             // <--- ADDED
//                     employeeNumber={employeeNumber}       // <--- ADDED
//                     setEmployeeNumber={setEmployeeNumber} // <--- ADDED
//                     password={password}
//                     setPassword={setPassword}
//                     confirmPassword={confirmPassword}
//                     setConfirmPassword={setConfirmPassword}
//                     showPassword={showPassword}
//                     setShowPassword={setShowPassword}
//                     selectedOU={selectedOU}
//                     setSelectedOU={setSelectedOU}
//                     ouDetails={ouDetails}
//                     handleCreateUser={handleCreateUser}
//                 />
//             )}
//             {activeTab === "bulk" && (
//                 <BulkUserForm
//                     bulkFile={bulkFile}
//                     setBulkFile={setBulkFile}
//                     handleBulkUpload={handleBulkUpload}
//                 />
//             )}
//             {activeTab === "reports" && <AddnewADUserActivityLogs />}
//         </div>

//         {activeTab === "createOu" && (
//   <div className="ad-create-ou-container">
//     <div className="ad-ou-boxes-container">
//       {/* MAIN OU BOX */}
//       <div
//         className={`ou-box ${ouActiveTab === "main" ? "active" : ""}`}
//         onClick={() => setoUActiveTab("main")}
//       >
//         <h3 className="ou-box-title">Main OU</h3>

//           <>
//             <div className="ad-single-user-form-group">
//               <label className="ad-single-user-label">OU Name</label>
//               <div className="ad-single-user-input-container">
//                 <input
//                   type="text"
//                   placeholder="Enter OU Name"
//                   value={ouName}
//                   onChange={(e) => setOuName(e.target.value)}
//                   className="ad-single-user-input"
//                   required
//                 />
//                 <FaFolder className="ad-single-user-input-icon" />
//               </div>
//             </div>

//             <button onClick={createOU} className="ad-single-user-button">
//               <FaFolderPlus className="ad-single-user-button-icon" />
//               Create OU
//             </button>
//           </>

//       </div>

//       {/* SUB OU BOX */}
//       <div
//         className={`ou-box ${ouActiveTab === "sub" ? "active" : ""}`}
//         onClick={() => setoUActiveTab("sub")}
//       >
//         <h3 className="ou-box-title">Sub OU</h3>

//           <>
//               <label className="ad-single-user-label">Parent OU</label>
//                 <Select
//                     value={
//                         selectedParentOu
//                         ? {
//                             value: selectedParentOu,
//                             label: ouDetails?.find(
//                                 (ou) => ou.distinguishedName === selectedParentOu
//                             )?.ou,
//                             }
//                         : null
//                     }
//                     onChange={(option) => setSelectedParentOu(option?.value || "")}
//                     options={
//                         ouDetails?.map((ou) => ({
//                         value: ou.distinguishedName,
//                         label: ou.ou,
//                         })) || []
//                     }
//                     placeholder="Select Parent OU"
//                     isSearchable={true}
//                     classNamePrefix="react-select"
//                     components={{ Control: CustomControl }}
//                     styles={{
//                         control: (base) => ({
//                         ...base,
//                         width: "100%", // ✅ full width
//                         minHeight: "40px",
//                         marginBottom:"20px",
//                         cursor:"pointer"
//                         }),
//                         menu: (base) => ({
//                         ...base,
//                         zIndex: 9999, // ✅ higher z-index
//                         width: "100%",

//                         }),
//                         menuPortal: (base) => ({
//                         ...base,
//                         zIndex: 9999, // ✅ ensures dropdown goes above modals etc.
//                         }),
//                     }}
//                     menuPortalTarget={document.body} // ✅ render dropdown at body level
//                 />

//             <div className="ad-single-user-form-group">
//               <label className="ad-single-user-label">OU Name</label>
//               <div className="ad-single-user-input-container">
//                 <input
//                   type="text"
//                   placeholder="Enter OU Name"
//                   value={ouName}
//                   onChange={(e) => setOuName(e.target.value)}
//                   className="ad-single-user-input"
//                   required
//                 />
//                 <FaFolder className="ad-single-user-input-icon" />
//               </div>
//             </div>

//             <button onClick={createOU} className="ad-single-user-button">
//               <FaFolderPlus className="ad-single-user-button-icon" />
//               Create OU
//             </button>
//           </>
//       </div>
//     </div>
//   </div>
// )}
//

//         {/* Messages for user feedback (displays on all tabs) */}
//         <div className="ad-user-messages">
//             <Message type="success" message={successMessage} />
//             <Message type="error" message={errorMessage} />
//             <Message type="info" message={infoMessage} />
//             <Message type="warning" message={warningMessage} />
//         </div>

//         {/* Bulk Report Display (only for Bulk tab) */}
//         {activeTab === "bulk" && bulkReport && (
//             <div className="ad-user-messages">
//                 <BulkReport report={bulkReport} />
//             </div>
//         )}
//     </div>
// </div>
//   );
// };

// export default AddnewADUser;
