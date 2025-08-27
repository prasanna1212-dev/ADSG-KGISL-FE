import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import axios from "axios";
import "../styles/SelectDomain.css";

const SelectDomain = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [newDomain, setNewDomain] = useState("");
  const [domainList, setDomainList] = useState([]);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [openToast, setOpenToast] = useState(false);

  // Fetch existing domains from the backend
  const fetchDomains = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/AD/create-domains`);
      setDomainList(response.data.domains);
      const selectedResponse = await axios.get(`${API_BASE_URL}/AD/selected-domains`);
      setSelectedDomains(selectedResponse.data.selectedDomains);
    } catch (error) {
      console.error("Error fetching domains:", error);
    }
  };

  // Add a new domain to the backend
  const handleAddDomain = async () => {
    if (newDomain && !domainList.includes(newDomain)) {
      try {
        await axios.post(`${API_BASE_URL}/AD/create-domains`, {
          domain: newDomain,
        });
        setNewDomain("");
        fetchDomains(); // Refresh the domain list after adding
      } catch (error) {
        console.error("Error adding domain:", error);
      }
    }
  };

  // Update selected domains in the backend
  const updateSelectedDomains = async (updatedDomains) => {
    try {
      await axios.post(`${API_BASE_URL}/AD/selected-domains`, {
        selectedDomains: updatedDomains,
      });
      setToastMessage("Selected domains updated successfully!");
      setOpenToast(true);
    } catch (error) {
      console.error("Error updating selected domains:", error);
    }
  };

  // Toggle domain selection and update backend
  const handleToggleDomain = (domain) => {
    const updatedDomains = selectedDomains.includes(domain)
      ? selectedDomains.filter((d) => d !== domain)
      : [...selectedDomains, domain];

    setSelectedDomains(updatedDomains);
    updateSelectedDomains(updatedDomains);
  };

  // Delete a domain from the backend
  const handleDeleteDomain = async (domain) => {
    try {
      await axios.delete(`${API_BASE_URL}/AD/create-domains`, {
        data: { domain },
      });
      setToastMessage(`Domain "${domain}" deleted successfully!`);
      setOpenToast(true);
      fetchDomains(); // Refresh the domain list
    } catch (error) {
      console.error("Error deleting domain:", error);
    }
  };

  // Fetch domains on component mount
  useEffect(() => {
    fetchDomains();
  }, []);

  // Close Toast
  const handleCloseToast = () => setOpenToast(false);

  const [adConfigs, setAdConfigs] = useState([]); // State to store ad configs

  useEffect(() => {
    const fetchAdConfigs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/ad-config`); // Fetch API data
        setAdConfigs(response.data.adConfigs); // Update state with fetched data
      } catch (error) {
        console.error('Error fetching ad configs:', error);
      }
    };

    fetchAdConfigs(); // Call the function when component mounts
  }, []);

  console.log("adConfigs", adConfigs)

  function getBaseDn(domain) {
    const domainParts = domain.split('.');

    // Form the basedn by joining parts with ',dc='
    const basedn = `dc=${domainParts.join(',dc=')}`;

    return basedn
  }

  const isValiodDomain = (domain) => {
    // Split the domain by dots
    const basedn = getBaseDn(domain)

    // Check if any adConfig contains the formed basedn
    const isValid = adConfigs.some(config => config.baseDN == basedn);

    return isValid; // Return true if found, else false
  };

  return (
    <div>
      <div className="admin-dashboard-header-fontstyle">
        <h1>
          <span className="admin-dashboard-header-first-character">E</span>nable&nbsp;&nbsp;
          <span className="admin-dashboard-header-first-character">D</span>omains&nbsp;&nbsp;
          <span className="admin-dashboard-header-first-character">F</span>or&nbsp;&nbsp;
          <span className="admin-dashboard-header-first-character">U</span>ser Panel&nbsp;&nbsp;
          <span className="admin-dashboard-header-first-character">S</span>election
        </h1>
      </div>

      <Box sx={{ p: 3 }} className="select-domain-entire-container">
        {/* Input for creating a new domain */}
        <Typography variant="h5" color="primary" gutterBottom>
          Create New Domain
        </Typography>
        <TextField
          label="Enter a Domain"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddDomain}
          disabled={!newDomain}
        >
          Add Domain
        </Button>

        {/* List of domains */}
        <Typography variant="h5" color="primary" sx={{ mt: 3 }} gutterBottom>
          Existing Domains
        </Typography>
        <List>
          {domainList.map((domain) => (
            <ListItem key={domain}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => handleToggleDomain(domain)}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <>
                    {adConfigs.find(each => each.baseDN === getBaseDn(domain)) ? (
                      <>
                        {domain} - <span style={{ color: "#008000", fontWeight: "bold" }}>Valid Domain</span> ({adConfigs.find(each => each.baseDN === getBaseDn(domain))?.bindDN})
                      </>
                    ) : (
                      <>
                        {domain} - <span style={{ color: "#FF5F1F", fontWeight: "bold" }}>Not Valid Domain</span>
                      </>
                    )}
                  </>
                }
                style={{ color: "black", fontWeight: "normal" }}
              />
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteDomain(domain)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Toast Snackbar for Success */}
      <Snackbar
        open={openToast}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{
          vertical: "top", // Position the Snackbar at the top
          horizontal: "center", // Position the Snackbar at the left
        }}
      >
        <Alert onClose={handleCloseToast} severity="success" sx={{ width: "100%" }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SelectDomain;
