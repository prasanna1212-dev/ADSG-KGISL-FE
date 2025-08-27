import React from "react";
import { FaSignInAlt } from 'react-icons/fa'; 
import "../styles/BlobButton.css"; // Import the CSS for styling

const LoginButton = ({ onClick }) => {
  return (
    <div className="buttons">
      <button className="blob-btn" onClick={onClick}>
      <FaSignInAlt className="login-icon" />
        <span className="blob-btn__inner">
          <span className="blob-btn__blobs">
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
            <span className="blob-btn__blob"></span>
          </span>
        </span>
      </button>

      {/* Gooey Filter */}
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: "none" }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7"
              result="goo"
            ></feColorMatrix>
            <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default LoginButton;
