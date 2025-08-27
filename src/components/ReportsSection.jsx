import React, { useState, useEffect } from 'react'
import { Form, Input, Select, TimePicker, DatePicker, Button, message } from "antd";
import {

    ClockCircleOutlined,

} from "@ant-design/icons";
import dayjs from "dayjs";
import "antd/dist/reset.css"; // Ensure AntD styles are applied
import "../styles/ReportSection.css"
import { FaCalendarDay, FaCalendarWeek } from "react-icons/fa";
import { FaCalendarDays, FaCalendar, FaDownload } from "react-icons/fa6";
import { IoMdMail } from "react-icons/io";
import { HiMiniUserGroup } from "react-icons/hi2";
import { FaCalendarAlt } from "react-icons/fa";

import { GrOrganization } from "react-icons/gr";
import { MdSwapHorizontalCircle } from "react-icons/md";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import kgnlogo from "../assets/logo_bg.png"
import signature from "../assets/signature.jfif"
import axios from 'axios';
import ReportChartsection from './ReportChartsection';


const { RangePicker } = DatePicker;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Your API URL from environment variables



function ReportsSection() {
  

    const [form] = Form.useForm();

    const [selectedDateRange, setSelectedDateRange] = useState({ startDate: "", endDate: "" })

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,  // ✅ Ensures AM/PM format
        });
    };


    const [failureLogs, setFailureLogs] = useState([])



    const [resetLogs, setResetLogs] = useState([])

    // Example Usage
    const fetchFailureLogs = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/AD/password-reset-failure-logs`
            );

            setFailureLogs(response.data);
        } catch (error) {
            console.error("Error fetching failure logs:", error);
        }
    };


    async function fetchLogs() {
        try {
            const response = await fetch(`${API_BASE_URL}/AD/password-reset-logs`);
            const data = await response.json();
            setResetLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    }

    useEffect(() => {
        fetchFailureLogs();
        fetchLogs()
    }, []);

    const getReportData = (reportType, startDate, endDate) => {
        console.log("All Logs Before Filtering ---> ", [...resetLogs, ...failureLogs]);

        let logsData = [];

        const today = new Date();

        if (reportType === "Last Week") {
            // ✅ Step 1: Get Last Week's Date Range (Sunday to Saturday)
            const lastSunday = new Date(today);
            lastSunday.setDate(today.getDate() - today.getDay() - 7); // Last week's Sunday
            lastSunday.setHours(0, 0, 0, 0);

            const lastSaturday = new Date(lastSunday);
            lastSaturday.setDate(lastSunday.getDate() + 6); // Last week's Saturday
            lastSaturday.setHours(23, 59, 59, 999);

            console.log("Last Week's Range:", lastSunday, "to", lastSaturday);

            // ✅ Step 2: Filter logs and add "status"
            logsData = [
                ...resetLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= lastSunday && logDate <= lastSaturday;
                }).map(log => ({ ...log, status: "Success" })), // Add "Success" status

                ...failureLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= lastSunday && logDate <= lastSaturday;
                }).map(log => ({ ...log, status: "Failure" })) // Add "Failure" status
            ];

            console.log("Filtered Logs for Last Week --->", logsData);

        } else if (reportType === "Last Month") {
            // ✅ Step 1: Get the First & Last Day of Last Month
            const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            firstDayLastMonth.setHours(0, 0, 0, 0);

            const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            lastDayLastMonth.setHours(23, 59, 59, 999);

            console.log("Last Month's Range:", firstDayLastMonth, "to", lastDayLastMonth);

            // ✅ Step 2: Filter logs and add "status"
            logsData = [
                ...resetLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= firstDayLastMonth && logDate <= lastDayLastMonth;
                }).map(log => ({ ...log, status: "Success" })),

                ...failureLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= firstDayLastMonth && logDate <= lastDayLastMonth;
                }).map(log => ({ ...log, status: "Failure" }))
            ];

            console.log("Filtered Logs for Last Month --->", logsData);

        } else if (reportType === "Current Week") {
            // ✅ Step 1: Get the Current Week's Sunday
            const currentSunday = new Date(today);
            currentSunday.setDate(today.getDate() - today.getDay()); // Find last Sunday
            currentSunday.setHours(0, 0, 0, 0);

            console.log("Current Week's Range:", currentSunday, "to", today);

            // ✅ Step 2: Filter logs and add "status"
            logsData = [
                ...resetLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= currentSunday && logDate <= today;
                }).map(log => ({ ...log, status: "Success" })),

                ...failureLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= currentSunday && logDate <= today;
                }).map(log => ({ ...log, status: "Failure" }))
            ];

            console.log("Filtered Logs for Current Week --->", logsData);

        } else if (reportType === "Current Month") {
            // ✅ Step 1: Get First Day of the Current Month
            const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            firstDayCurrentMonth.setHours(0, 0, 0, 0);

            console.log("Current Month's Range:", firstDayCurrentMonth, "to", today);

            // ✅ Step 2: Filter logs and add "status"
            logsData = [
                ...resetLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= firstDayCurrentMonth && logDate <= today;
                }).map(log => ({ ...log, status: "Success" })),

                ...failureLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= firstDayCurrentMonth && logDate <= today;
                }).map(log => ({ ...log, status: "Failure" }))
            ];

            console.log("Filtered Logs for Current Month --->", logsData);
        } else if (reportType === "dateRange") {
            // ✅ Step 1: Convert startDate and endDate to Date objects
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            console.log("Date Range Filter:", start, "to", end);

            // ✅ Step 2: Filter logs based on startDate and endDate
            logsData = [
                ...resetLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= start && logDate <= end;
                }).map(log => ({ ...log, status: "Success" })),

                ...failureLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= start && logDate <= end;
                }).map(log => ({ ...log, status: "Failure" }))
            ];
        } else if (reportType === "Daily") {
            // ✅ Today's Report
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set start of the day
        
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999); // Set end of the day
        
            console.log("Today's Report Range:", today, "to", todayEnd);
        
            logsData = [
                ...resetLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= today && logDate <= todayEnd;
                }).map(log => ({ ...log, status: "Success" })),
        
                ...failureLogs.filter(log => {
                    const logDate = new Date(log.resetDate);
                    return logDate >= today && logDate <= todayEnd;
                }).map(log => ({ ...log, status: "Failure" }))
            ];
        
            console.log("Filtered Today's Logs --->", logsData);
        }

        logsData.sort((a, b) => new Date(b.resetDate) - new Date(a.resetDate));

        return logsData

        // console.log("logsData ---> ", logsData);
    };






    const generatePDF = async (reportType, startDate, endDate) => {
        console.log("Generating PDF...");

        const doc = new jsPDF({ unit: "mm", format: "a4" });

        const pageHeight = doc.internal.pageSize.height;
        const marginTop = 50; // Space reserved for header
        const marginBottom = 35; // Space reserved for footer
        const tableStartY = marginTop + 5; // Ensures table does not overlap header

        const addWatermark = () => {
            doc.saveGraphicsState();
            if (doc.setGState) {
                doc.setGState(new doc.GState({ opacity: 0.20 })); // 20% opacity
            }
            doc.setFontSize(40);
            doc.setTextColor(150, 150, 150);
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            doc.text("OFFICIAL COPY", pageWidth / 2, pageHeight / 2, {
                angle: 25,
                align: "center",
            });

            doc.restoreGraphicsState();
        };

        const addHeader = () => {
            const img = new Image();
            img.src = kgnlogo;
            doc.addImage(img, "PNG", 10, 10, 45, 25);

            doc.setFontSize(12).setTextColor(45, 54, 142).text("KG Information Systems Private Limited", 120, 12);
            ["No.365, KGISL Campus, Thudiyalur Road,", "Saravanampatti, Coimbatore - 641035", "Email: info@kgisl.com", "Website: www.kgisl.com"].map((text, i) =>
                doc.setFontSize(10).setTextColor(0, 0, 0).text(text, 120, 17 + i * 5)
            );

            doc.setFontSize(16);
            const title = `${reportType !== "dateRange" ? reportType : ""} Password Reset Report`;
            doc.text(title, 60, 45);
        };

        const addFooter = () => {
            const footerY = pageHeight - marginBottom;

            doc.setFillColor("#E32636").rect(10, footerY, 190, 0.5, "F");

            doc.setFontSize(10).setTextColor(0, 0, 0).text(`Generated On: ${formatDate(new Date())}`, 12, footerY + 6);

            const signImg = new Image();
            signImg.src = signature;
            doc.addImage(signImg, "PNG", 140, footerY + 5, 40, 15);
            [["Devaraj Palaniswamy", 45, 54, 142], ["Group Senior Vice President", 0, 0, 0]].map(([text, r, g, b], i) =>
                doc.setTextColor(r, g, b).text(text, 150, footerY + 20 + i * 5)
            );
        };

        let logsData = getReportData(reportType, startDate, endDate);

        if (!logsData || logsData.length === 0) {
            console.warn("No data available for the report!");
            return;
        }

        const columns = ["Domain Account", "Attempted By", "Date & Time", "Status"];
        const rows = logsData.map((log) => [
            log.upn,
            log.email,
            formatDateTime(log.resetDate),
            { content: log.status, styles: { textColor: log.status === "Success" ? [0, 128, 0] : [255, 0, 0] } },
        ]);

        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: tableStartY,
            margin: { top: marginTop, bottom: marginBottom, left: 10, right: 10 }, // Ensuring space for header and footer
            theme: "grid",
            headStyles: { fillColor: "#003366", textColor: "#FFFFFF" },
            styles: { fontSize: 10, cellPadding: 2 },
            pageBreak: "auto",

            willDrawPage: (data) => {
                if (data.pageNumber === 1) {
                    // Only add header on the first page inside willDrawPage
                    addHeader();
                }
            },

            didDrawPage: (data) => {
                // Add header and footer dynamically on every page
                if (data.pageNumber > 1) {
                    doc.setPage(data.pageNumber);
                    addHeader();
                }
                addFooter();
                addWatermark();
            },
        });

        doc.save("Generated_Report.pdf");
    };




    const handleChangeMonthlyDay = (e) => {
        let inputValue = e.target.value;

        // Prevent non-numeric input
        if (!/^\d*$/.test(inputValue)) return;

        // Convert input value to number
        let num = parseInt(inputValue, 10);

        console.log(num)
        if (!isNaN(num)) {
            if (num >= 1 && num <= 31) {
                form.setFieldsValue({ "monthly_day": num });
            } else {
                form.setFieldsValue({ "monthly_day": 31 }); // If input exceeds 31, reset to 31
            }
        } else {
            form.setFieldsValue({ "monthly_day": "" }); // Allow clearing input
        }
    };

     const postReportMailSchedule = (scheduleData) => {
    const convertedScheduleData = {
      ...scheduleData,
      daily_time: scheduleData.daily_time
        ? scheduleData.daily_time.format("HH:mm")
        : null,
      weekly_time: scheduleData.weekly_time
        ? scheduleData.weekly_time.format("HH:mm")
        : null,
      monthly_time: scheduleData.monthly_time
        ? scheduleData.monthly_time.format("HH:mm")
        : null,
    };

    axios
      .post(
        `${API_BASE_URL}/reports/schedule-report-mail`,
        convertedScheduleData
      )
      .then((response) => {
        console.log("Schedule updated successfully:", response.data);
        message.success("Mail Schedule updated successfully!");
        // Optionally update UI or show success message
      })
      .catch((error) => {
        console.error(
          "Failed to update schedule:",
          error.response?.data || error.message
        );
        // Optionally show error message to user
      });
  };

    return (

        <div className='report-section-container'>
            <div className="admin-dashboard-header-fontstyle">
                <h1>
                    <span className="admin-dashboard-header-first-character">A</span>utomated&nbsp;&nbsp;
                    <span className="admin-dashboard-header-first-character">R</span>eport&nbsp;&nbsp;
                    <span className="admin-dashboard-header-first-character">G</span>eneration&nbsp;&nbsp;

                </h1>
            </div>
            <div className='report-section-entire'>
                <div className='report-left-section-container'>


                    <div className="report-section-form-container">
                        <Form layout="vertical" form={form} onFinish={postReportMailSchedule}>
                            {/* Email Fields */}
                            <Form.Item name="email" label={<span style={{ fontSize: "1.1rem", fontFamily: "proximaNovaBold", display: "flex", alignItems: "center", gap: "5px" }}><IoMdMail className="report-section-email-icon" style={{ fontSize: "1.2rem" }} /> To</span>} rules={[{ required: true }]}>
                                <Input placeholder="Enter Email" />
                            </Form.Item>
                            <Form.Item name="cc"
                                label={<span style={{ fontSize: "1.1rem", fontFamily: "proximaNovaBold", display: "flex", alignItems: "center", gap: "5px" }}><HiMiniUserGroup className="report-section-cc-icon" color='green' />
                                    Cc <span style={{ fontWeight: "normal", color: "gray", fontFamily: "proximaNova-regular" }}>(comma seperated)</span>
                                </span>} >
                                <Input placeholder="Add cc" />
                            </Form.Item >
                            <Form.Item name="bcc"
                                label={<span style={{ fontSize: "1.1rem", fontFamily: "proximaNovaBold", display: "flex", alignItems: "center", gap: "5px" }}><GrOrganization className="report-section-bcc-icon" color='#5A4FCF' />
                                    bcc <span style={{ fontWeight: "normal", color: "gray", fontFamily: "proximaNova-regular" }}>(comma seperated)</span>
                                </span>}>
                                <Input placeholder="Add bcc" />
                            </Form.Item>


                            {/* Report Schedule */}
                            <div className="report-section-schedule-title">
                                <FaCalendarAlt className="report-section-schedule-icon" color='#318CE7' /> Report Schedule
                            </div>

                            <div className='report-sechdule-card-container'>
                                <div className='report-sechdule-card'>
                                    <div className='report-schedule-card-head'>Daily</div>
                                    <Form.Item name="daily_time" >
                                        <TimePicker

                                            format="HH:mm"
                                            use12Hours={false}
                                            placeholder="Select Time"
                                            suffixIcon={<ClockCircleOutlined style={{ color: "#4A90E2" }} />}
                                            style={{ width: "-webkit-fill-available" }}

                                        />
                                    </Form.Item>
                                </div>

                                <div className='report-sechdule-card'>
                                    <div className='report-schedule-card-head'>Weekly</div>
                                    <Form.Item name='weekly_day' >
                                        <Select

                                            style={{ width: "-webkit-fill-available" }}
                                            placeholder="Select a day"

                                        >
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                                <Option key={day} value={day}>
                                                    {day}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item name='weekly_time'>
                                        <TimePicker

                                            format="HH:mm"
                                            use12Hours={false}
                                            placeholder="Select Time"
                                            suffixIcon={<ClockCircleOutlined style={{ color: "#4A90E2" }} />}
                                            style={{ width: "-webkit-fill-available" }}

                                        />
                                    </Form.Item>


                                </div>

                                <div className='report-sechdule-card' >
                                    <div className='report-schedule-card-head'>Monthly</div>
                                    <Form.Item name='monthly_day'>
                                        <Input
                                            type="number"

                                            onChange={(value) => handleChangeMonthlyDay(value)}
                                            min="1"
                                            max="31"
                                            placeholder="Enter a number (1-31)"
                                            style={{ width: "-webkit-fill-available" }}
                                        />
                                    </Form.Item>

                                    <Form.Item name='monthly_time'>
                                        <TimePicker

                                            format="HH:mm"
                                            use12Hours={false}
                                            placeholder="Select Time"
                                            suffixIcon={<ClockCircleOutlined style={{ color: "#4A90E2" }} />}
                                            style={{ width: "-webkit-fill-available" }}

                                        />
                                    </Form.Item>


                                </div>
                            </div>

                            {/* <hr style={{ height: "0.5px", border: "none", backgroundColor: "lightgray", margin: "10px 0" }} /> */}

                            <div className='mail-schedule-button-container'>
                                <Button htmlType='submit' className='mail-schedule-button'
                                    style={{ fontFamily: "proximaNovaBold" }}>
                                    Schedule
                                </Button>
                            </div>

                            <div className="report-section-schedule-title" style={{ paddingTop: "5px" }}>
                                <FaDownload className="report-section-schedule-icon" />Download Reports
                            </div>
                            <div className='report-download-card-container'>

                                <div className='report-download-card'>
                                    <div className='report-download-head'>
                                        <div className='report-download-head-text' style={{ fontFamily: "proximaNova-regular", }}>Weekly Report</div>
                                        <FaCalendarWeek style={{ color: "#00A86B", fontSize: "1.2rem" }} />
                                    </div>

                                    <button className='download-report-button' onClick={() => { generatePDF("Last Week") }}>
                                        <FaDownload style={{ fontSize: "1rem" }} />
                                        <div className='download-report-text' style={{ fontFamily: "proximaNova-regular" }}>Last week</div>
                                    </button>

                                    <button className='download-report-button' onClick={() => { generatePDF("Current Week") }}>
                                        <FaDownload style={{ fontSize: "1rem" }} />
                                        <div className='download-report-text' style={{ fontFamily: "proximaNova-regular" }}>Current week</div>
                                    </button>
                                </div>

                                <div className='report-download-card'>
                                    <div className='report-download-head'>
                                        <div className='report-download-head-text' style={{ fontFamily: "proximaNova-regular", }}>Monthly Report</div>
                                        <FaCalendarDays style={{ color: "#ff6801", fontSize: "1.2rem" }} />
                                    </div>

                                    <button className='download-report-button' onClick={() => { generatePDF("Last Month") }}>
                                        <FaDownload />
                                        <div className='download-report-text' style={{ fontFamily: "proximaNova-regular" }}>Last Month</div>
                                    </button>

                                    <button className='download-report-button' onClick={() => { generatePDF("Current Month") }}>
                                        <FaDownload />
                                        <div className='download-report-text' style={{ fontFamily: "proximaNova-regular" }}>Current Month</div>
                                    </button>
                                </div>

                                <div className='report-download-card'>
                                    <div className='report-download-head'>
                                        <div className='report-download-head-text' style={{ fontFamily: "proximaNova-regular", }}>Daily Report</div>
                                        <FaCalendarDay style={{ color: "#9b870c", fontSize: "1.2rem" }} />
                                    </div>

                                    <button className='download-report-button' onClick={() => { generatePDF("Daily", selectedDateRange?.startDate, selectedDateRange?.endDate) }}>
                                        <FaDownload />
                                        <div className='download-report-text' style={{ fontFamily: "proximaNova-regular" }}>Today Report</div>
                                    </button>
                                </div>

                                <div className='report-download-card' onClick={() => { generatePDF("dateRange", selectedDateRange?.startDate, selectedDateRange?.endDate) }}>
                                    <div className='report-download-head'>
                                        <div className='report-download-head-text' style={{ fontFamily: "proximaNova-regular", }}>Custom Date</div>
                                        <FaCalendar style={{ color: "#662d91", fontSize: "1.2rem" }} />
                                    </div>

                                    {
                                        (selectedDateRange.startDate && selectedDateRange.endDate) &&
                                        <button className='download-report-button'>
                                            <FaDownload />
                                            <div className='download-report-text' style={{ fontFamily: "proximaNova-regular" }}>Download between Range</div>
                                        </button>
                                    }

                                    <RangePicker
                                        onChange={(values) => {
                                            console.log(values);

                                            if (!values || values.length === 0) {
                                                // ✅ Handle Clear Action

                                                setSelectedDateRange({ startDate: "", endDate: "" }); // Reset state
                                                return;
                                            }
                                            setSelectedDateRange({ startDate: formatDate(values[0]), endDate: formatDate(values[1]) })
                                        }}


                                        suffixIcon={<FaCalendarDays style={{ color: "gray", fontSize: "1.2rem" }} />}
                                        format="MMM D, YYYY"
                                        separator={<span style={{ color: "green", fontSize: "1.6rem" }}><MdSwapHorizontalCircle /></span>}
                                        placeholder={["Start Date", "End Date"]}
                                        style={{ width: "-webkit-fill-available", marginTop: "10px" }}
                                    />
                                </div>
                            </div>



                        </Form>

                    </div>
                </div>

                <div className='report-right-section-container'>
                    <ReportChartsection />
                </div>

            </div>

        </div>
    )
}

export default ReportsSection
