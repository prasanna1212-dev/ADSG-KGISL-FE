import React, { useState, useEffect } from "react";
import SignupOtpVerificationModal from "./SignupOtpVerificationModal";
import { Form, Button, Message, Dropdown, Checkbox } from "semantic-ui-react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import "../styles/SignUpModal.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircularProgress from "@mui/material/CircularProgress";

function SignUpModal({ onClose={handleSignUpClose} }) {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  // const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [domainJoinUPN, setDomainJoinUPN] = useState("@kggroup.com");
  const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [showDomainFields, setShowDomainFields] = useState(false);
  const [domainToJoin, setDomainToJoin] = useState("");
  const [organizationalUnitPath, setOrganizationalUnitPath] = useState("");
  const [email, setEmail] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConstraints, setShowConstraints] = useState(false);
  const [showEmailConstraints, setShowEmailConstraints] = useState(false);

  const isLengthValid = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  const isValidEmailFormat = email.includes("@") && email.includes(".");
  const hasValidDomain = /\.[a-zA-Z]{2,}$/.test(email);
  const isAtPositionValid = email.indexOf("@") > 0;

  const [ouDetails, setOuDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const [adname, setAdname] = useState("DC01.kggroup.com");
  const [domains, setDomains] = useState([]);

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const fetchOUs = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/auth/ad-OUdetails`
        );
        setOuDetails(
          response.data.organizationalUnits.map((ou) => ({
            key: ou.ou,
            value: ou.distinguishedName,
            text: ou.ou,
          }))
        );
        setLoading(false);
      } catch (err) {
        console.error("Error fetching OUs:", err);
        setError("Failed to fetch Organizational Units from server.");
        setLoading(false);
      }
    };

    fetchOUs();
  }, []);

  const checkADUser = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/check-ad`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: `${username}${domainJoinUPN}` }),
        }
      );
      const data = await response.json();
      if (data.exists) {
        return true;
      } else {
        setError("User does not exist in Active Directory");
        return false;
      }
    } catch (error) {
      setError("An error occurred while checking Active Directory.");
      return false;
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    // if (password !== confirmPassword) {
    //   setError("Passwords do not match");
    //   return;
    // }

    if (!isValidEmailFormat || !isAtPositionValid || !hasValidDomain) {
      setError("Invalid email format");
      return;
    }

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA");
      return;
    }

    setError("");

    const isInAD = await checkADUser();
    if (!isInAD) return;

   
    try {
      setShowLoader(true);
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          domainJoinUPN: `${username}${domainJoinUPN}`,
          password,
          email,
          employeeNumber,
          domainToJoin,
          recaptchaToken,
          specifyDomainOrUnit: showDomainFields ? "Yes" : "No", // Pass "Yes" or "No" based on toggle
        }),
      });

      const data = await response.json();
      if (
        data.message ===
        "User exists in AD. OTP sent to email for verification."
      ) {
        setShowLoader(false)
        setSuccessMessage(
          "Signup successful! Verify the OTP sent to your email."
        );
        setError("")
        setShowOtpVerification(true);
        await fetch(`${API_BASE_URL}/auth/send-approval-mail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            username: `${username}${domainJoinUPN}`,
          }),
        });
      } else if (
        data.message === "User with this email is already registered"
      ) {
        setError(
          "An account with this email already exists. Please use a different email."
        );
        setShowLoader(false);
        setSuccessMessage("")
      } else if (
        data.message === "User with this domainJoinUPN is already registered!"
      ) {
        setShowLoader(false);
        setError(
          "An account with this Domain Join UPN already exists. Please use a different domain join UPN."
        );
        setSuccessMessage("")
      } else if (
        data.message === "User with this employee number is already registered!"
      ) {
        setError(
          "An account with this employee number already exists. Please use a different employee number."
        );
        setShowLoader(false);
        setSuccessMessage("")
      } else {
        setError(data.message || "Inavlid Password!");
        setShowLoader(false);
        setSuccessMessage("")
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setSuccessMessage("")
    }
  };

  const onRecaptchaChange = (token) => setRecaptchaToken(token);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  // const toggleConfirmPasswordVisibility = () =>
  //   setConfirmPasswordVisible(!confirmPasswordVisible);

  const domainOptions = Array.isArray(domains)
    ? domains.map((domain, index) => {
        // Join 'DC=' components, whether uppercase or lowercase, into a readable format
        const domainText = domain.distinguishedName
          .split(",")
          .filter((part) => part.trim().toUpperCase().startsWith("DC="))
          .map((part) => part.split("=")[1])
          .join(".");

        return {
          key: index,
          value: domain.distinguishedName,
          text: domainText, // Show as readable domain (e.g., "kggroup.com")
        };
      })
    : [{ key: 0, value: domains, text: domains }];

  const fetchDomains = async (adname) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/domains/${adname}`
      );
      setDomains(response.data);
    } catch (err) {
      console.error("Error fetching domains:", err);
      setError("Error fetching domain data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains(adname);
  }, []);

  const domainoptionsname = (domain) => {
    console.log(domain);
    const domainName = domain
      .split(",")
      .filter((part) => part.trim().toUpperCase().startsWith("DC="))
      .map((part) => part.split("=")[1])
      .join(".");
    setDomainToJoin(domainName);
  };

  // const handleAdnameChange = (e, { value }) => {
  //   setAdname(value);
  // };

  if (loading) return <p>Loading...</p>;
  console.log("showOtpVerification-->", showOtpVerification);

  const handleCreateUserInDB = async () => {
    setShowLoader(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/create-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domainJoinUPN: `${username}${domainJoinUPN}`,
            password,
            email,
            employeeNumber,
            domainToJoin,
            organizationalUnitPath,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(
          "User created successfully. Pending for Admin approval."
        );
        setShowOtpVerification(false); // Close OTP modal
        setShowLoader(false);
        onClose();

      } else {
        setError(data.message || "User creation failed.");
        setShowLoader(false);
      }
    } catch (error) {
      setError("An error occurred while creating the user.");
      setShowLoader(false);
    }
  };


  return (
    <>
      {showLoader && (
        <div className="loader-backdrop">
          <CircularProgress />
        </div>
      )}
      <div className="signup-modal-overlay">
        <div className="signup-modal-container">
          <span className="close-icon" onClick={onClose} style={{color:"white"}}>
            <FaTimes />
          </span>
          <h2 className="signup-modal-title" style={{color:"white"}}>Sign Up</h2>
          <Form onSubmit={handleSignUp} className="signup-modal-form">
            <Form.Field required>
              <label style={{ textAlign: "left", color:"white" }}>
                Select which domain you would like to login
              </label>
              <Dropdown
                placeholder="Select Domain"
                fluid
                selection
                options={domainOptions}
                onChange={(e, { value }) => domainoptionsname(value)}
                // readOnly
                icon={
                  <KeyboardArrowDownIcon
                    style={{
                      position: "absolute",
                      right: "10px",
                      bottom: "5px",
                    }}
                  />
                }
              />
            </Form.Field>

            <Form.Field required>
              <label style={{ textAlign: "left", color:"white" }}>Username</label>
              <div className="ad-join-upn">
                <Form.Input
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <span className="domain" style={{color:"red"}}>@{domainToJoin}</span>
              </div>
            </Form.Field>

            <Form.Group widths="equal">
              <Form.Field required>
                <label style={{ textAlign: "left", color:"white" }}>Password</label>
                <div className="password-field">
                  <Form.Input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowConstraints(true)}
                    onBlur={() => setShowConstraints(false)}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Field>
              {/* <Form.Field required>
              <label style={{ textAlign: "left" }}>Confirm Password</label>
              <div className="password-field">
                <Form.Input
                  type={confirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle-icon"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </Form.Field> */}
            </Form.Group>

            {/* {showConstraints && (
            <div className="password-constraints">
              <p style={{ color: isLengthValid ? "green" : "red" }}>
                • Minimum 8 characters
              </p>
              <p style={{ color: hasLetter ? "green" : "red" }}>
                • At least one letter
              </p>
              <p style={{ color: hasNumber ? "green" : "red" }}>
                • At least one number
              </p>
              <p style={{ color: hasSpecialChar ? "green" : "red" }}>
                • At least one special character (@$!%*?&)
              </p>
            </div>
          )} */}

            {/* <Form.Field required>
            <label style={{ textAlign: "left" }}>Specify Domain or Unit</label>
            <Checkbox
              toggle
              label={showDomainFields ? "Yes" : "No"}
              checked={showDomainFields}
              onChange={() => setShowDomainFields(!showDomainFields)}
            />
          </Form.Field>

          {showDomainFields && (
            <>
              <Form.Field required>
                <label style={{ textAlign: "left" }}>Domain to join</label>
                <Dropdown
                  placeholder="Select Doamin"
                  fluid
                  selection
                  options={domainOptions}
                  onChange={(e, { value }) => setDomainToJoin(value)}
                  icon={
                    <KeyboardArrowDownIcon
                      style={{
                        position: "absolute",
                        right: "10px",
                        bottom: "5px",
                      }}
                    />
                  }
                />
              </Form.Field>
                </>
              )} */}
            {/* <Form.Field required>
              <label style={{ textAlign: "left", color:"white" }}>Department</label>
              <Dropdown
                placeholder="Select Department"
                fluid
                selection
                options={ouDetails}
                onChange={(e, { value }) => setOrganizationalUnitPath(value)}
                icon={
                  <KeyboardArrowDownIcon
                    style={{
                      position: "absolute",
                      right: "10px",
                      bottom: "5px",
                    }}
                  />
                }
              />
            </Form.Field> */}

            <Form.Group widths="equal">
              <Form.Field required>
                <label style={{ textAlign: "left", color:"white" }}>Email ID</label>
                <Form.Input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setShowEmailConstraints(true)}
                  onBlur={() => setShowEmailConstraints(false)}
                  required
                />
              </Form.Field>

              <Form.Field required>
                <label style={{ textAlign: "left", color:"white" }}>Employee Number</label>
                <Form.Input
                  placeholder="Employee Number"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  required
                />
              </Form.Field>
            </Form.Group>

            {showEmailConstraints && (
              <div className="email-constraints">
                <p style={{ color: isValidEmailFormat ? "green" : "red" }}>
                  • Contains "@" and "."
                </p>
                <p style={{ color: isAtPositionValid ? "green" : "red" }}>
                  • "@" should not be the first character
                </p>
                <p style={{ color: hasValidDomain ? "green" : "red" }}>
                  • Ends with a valid domain (e.g., ".com", ".org")
                </p>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "15px",
                marginBottom: "15px",
              }}
            >
              <ReCAPTCHA
                sitekey="6LfksEorAAAAAHo8x_RgQPXYzSiDzrIVYKjM-bJ3"
                onChange={onRecaptchaChange}
              />
            </div>

            {error && <Message style={{ color: "red" }}>{error}</Message>}
            {successMessage && <Message positive content={successMessage} />}

            <Button type="submit" primary>
              Register
            </Button>
          </Form>
        </div>

        {showOtpVerification && (
          <SignupOtpVerificationModal
            onClose={() => setShowOtpVerification(false)}
            email={email}
            onOtpSuccess={handleCreateUserInDB} // Call handleCreateUserInDB on successful OTP verification
          />
        )}
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </div>
    </>
  );
}

export default SignUpModal;
