import React, { useState, useEffect } from "react";
import "../styles/MailSchedule.css";
import { Tabs, Table, Switch, Button, Tooltip, message, Modal } from "antd";
import dayjs from "dayjs";
import { MdDelete } from "react-icons/md";
import {
  DeleteFilled,
  CloseOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MailSchedule() {
  const [activeKey, setActiveKey] = React.useState("daily");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [sechduleForDelete, setSechduleForDelete] = useState(null);

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const [reportMailSchedules, setReportMailSchedules] = useState([]);

  const updateReportStatus = (reportType, email, time, newStatus) => {
    setReportMailSchedules((prevState) => {
      if (!["daily", "weekly", "monthly"].includes(reportType))
        return prevState;

      const updatedEntries = prevState[reportType].map((entry) => {
        if (entry.email === email && entry.time === time) {
          return {
            ...entry,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return entry;
      });

      return {
        ...prevState,
        [reportType]: updatedEntries,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const deleteSchedule = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/reports/report-schedule`,
        {
          data: {
            ...sechduleForDelete,
          },
        }
      );

      console.log("✅ Schedule deleted:", response.data);
      message.success("Schedule deleted successfully!");
      // Optionally show a success message or refresh data
    } catch (error) {
      console.error(
        "❌ Error deleting schedule:",
        error.response?.data || error.message
      );
      message.error("Failed to delete Schedule!");
      // Optionally show error message to user
    } finally {
      setIsModalVisible(false);
      getReportSchedules();
    }
  };

  async function updateReportMailSchedules() {
    const payload = {
      daily: reportMailSchedules.daily,
      weekly: reportMailSchedules.weekly,
      monthly: reportMailSchedules.monthly,
    };
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reports/update-report-mail-schedule`,
        payload
      );
      console.log("Update successful:", response.data);
      message.success("Mail schedule updated successfully!");
      getReportSchedules();
      return response.data;
    } catch (error) {
      console.error("Failed to update schedules:", error);
      throw error;
    }
  }

  const dailycolumns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: "25%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "25%",
      render: (status) => (
        <span className={`status-badge ${status}`}>
          {status === "active" ? "Active" : "In Active"}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "25%",
      render: (createdAt) => dayjs(createdAt).format("MMM DD, YYYY HH:mm"),
    },
    {
      title: "Actions",
      dataIndex: "isEnabled",
      key: "toggle",
      width: "25%",
      render: (_, record) => (
        // <div className={`toggle-button off`} onClick={() => {}}>
        //   <div className="toggle-button-slider"></div>
        // </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Tooltip
            title={record?.status === "in_active" ? "Activate" : "Deactivate"}
          >
            {/* <Switch checked={false} onChange={() => {}} /> */}
            <Switch
              checked={record.status === "active"}
              onChange={(checked) => {
                updateReportStatus(
                  "daily",
                  record.email,
                  record.time,
                  checked ? "active" : "in_active"
                );
              }}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <MdDelete
              style={{ fontSize: "1.5rem", color: "red", cursor: "pointer" }}
              onClick={() => {
                setSechduleForDelete({ ...record, reportType: "daily" });
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const Monthlycolumns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: "20%",
    },
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
      width: "20%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status) => (
        <span className={`status-badge ${status}`}>
          {status === "active" ? "Active" : "In Active"}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "20%",
      render: (createdAt) => dayjs(createdAt).format("MMM DD, YYYY HH:mm"),
    },
    {
      title: "Action",
      dataIndex: "isEnabled",
      key: "toggle",
      width: "20%",
      render: (isEnabled, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Tooltip
            title={record?.status === "in_active" ? "Activate" : "Deactivate"}
          >
            <Switch
              checked={record.status === "active"}
              onChange={(checked) => {
                updateReportStatus(
                  "monthly",
                  record.email,
                  record.time,
                  checked ? "active" : "in_active"
                );
              }}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <MdDelete
              style={{ fontSize: "1.5rem", color: "red", cursor: "pointer" }}
              onClick={() => {
                setSechduleForDelete({ ...record, reportType: "monthly" });
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const WeeklyColumns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      width: "20%",
    },
    {
      title: "Weekday",
      dataIndex: "weekday",
      key: "weekday",
      width: "20%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status) => (
        <span className={`status-badge ${status}`}>
          {status === "active" ? "Active" : "In Active"}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "20%",
      render: (createdAt) => dayjs(createdAt).format("MMM DD, YYYY HH:mm"),
    },
    {
      title: "Action",
      dataIndex: "isEnabled",
      key: "toggle",
      width: "20%",
      render: (isEnabled, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <Tooltip title="Activate">
            <Switch
              checked={record.status === "active"}
              onChange={(checked) => {
                updateReportStatus(
                  "weekly",
                  record.email,
                  record.time,
                  checked ? "active" : "in_active"
                );
              }}
            />
          </Tooltip>

          <Tooltip
            title={record?.status === "in_active" ? "Activate" : "Deactivate"}
          >
            <MdDelete
              style={{ fontSize: "1.5rem", color: "red", cursor: "pointer" }}
              onClick={() => {
                setSechduleForDelete({ ...record, reportType: "weekly" });
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const items = [
    {
      key: "daily",
      label: "Daily",
      children: (
        <>
          <div className="schedule-table-container">
            {/* <h2 style={{ wordSpacing: "5px", fontWeight: "bold" }}>
              Daily Mail Schedule
            </h2> */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2>Daily Mail Schedule</h2>
              <Button
                type="primary"
                onClick={() => {
                  updateReportMailSchedules();
                }}
                style={{
                  fontSize: "1.15rem",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                Save
              </Button>
            </div>

            <Table
              columns={dailycolumns}
              dataSource={reportMailSchedules?.daily}
              rowKey="id"
              pagination={false}
              className="schedule-table"
              bordered
            />
          </div>
        </>
      ),
    },
    {
      key: "weekly",
      label: "Weekly",
      children: (
        // <WeeklyScheduleTable
        //   data={weeklyData}
        //   onToggleChange={(id, isEnabled) => onToggleChange('weekly', id, isEnabled)}
        // />

        <>
          <div className="schedule-table-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2>Weekly Mail Schedule</h2>
              <Button
                type="primary"
                onClick={() => {
                  updateReportMailSchedules();
                }}
                style={{
                  fontSize: "1.15rem",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                Save
              </Button>
            </div>
            <Table
              columns={WeeklyColumns}
              dataSource={reportMailSchedules?.weekly}
              rowKey="id"
              pagination={false}
              className="schedule-table"
              bordered
            />
          </div>
        </>
      ),
    },
    {
      key: "monthly",
      label: "Monthly",
      children: (
        // <MonthlyScheduleTable
        //   data={monthlyData}
        //   onToggleChange={(id, isEnabled) => onToggleChange('monthly', id, isEnabled)}
        // />

        <>
          <div className="schedule-table-container">
            {/* <h2>Monthly Mail Schedule</h2> */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2>Monthly Mail Schedule</h2>
              <Button
                type="primary"
                onClick={() => {
                  updateReportMailSchedules();
                }}
                style={{
                  fontSize: "1.15rem",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                Save
              </Button>
            </div>
            <Table
              columns={Monthlycolumns}
              dataSource={reportMailSchedules.monthly}
              rowKey="id"
              pagination={false}
              className="schedule-table"
              bordered
            />
          </div>
        </>
      ),
    },
  ];

  async function getReportSchedules() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reports/report-mail-schedules`
      ); // replace with your API URL
      const reportSchedules = response.data;

      setReportMailSchedules(reportSchedules);
    } catch (error) {
      console.error("Failed to fetch report schedules:", error);
    }
  }

  useEffect(() => {
    getReportSchedules();
  }, []);

  return (
    <div>
      <div className="admin-dashboard-header-fontstyle">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>
            <span className="admin-dashboard-header-first-character">R</span>
            eport&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">M</span>
            ail&nbsp;&nbsp;&nbsp;&nbsp;
            <span className="admin-dashboard-header-first-character">S</span>
            chedules
          </h1>
        </div>
      </div>

      <div className="schedule-tabs-container">
        <Tabs
          activeKey={activeKey}
          items={items}
          onChange={handleTabChange}
          className="schedule-tabs"
        />
      </div>

      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        closable={false}
        centered
        width={480}
        bodyStyle={{ padding: 0, borderRadius: "12px" }}
        style={{ borderRadius: "12px", overflow: "hidden" }}
      >
        {/* Modal Body */}
        <div
          style={{
            paddingBottom: "10px",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {/* Icon Circle */}
          <div
            style={{
              backgroundColor: "#fee2e2",
              borderRadius: "50%",

              marginRight: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
            }}
          >
            <ExclamationCircleFilled
              style={{ color: "#dc2626", fontSize: "2.4rem" }}
            />
          </div>

          {/* Title and Subtitle */}
          <div>
            <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: 4 }}>
              Delete Schedule
            </div>
            <div style={{ fontSize: "14px", color: "#4b5563" }}>
              Are you sure you want to delete the{" "}
              <strong>{sechduleForDelete?.reportType} scehdule&nbsp;?</strong>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            paddingTop: "16px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <Button
            onClick={() => {
              setSechduleForDelete(null);
              setIsModalVisible(false);
            }}
          >
            <CloseOutlined /> Cancel
          </Button>
          <Button type="primary" danger onClick={deleteSchedule}>
            <DeleteFilled /> Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default MailSchedule;
