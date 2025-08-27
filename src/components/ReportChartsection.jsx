import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
function ReportChartsection() {
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState({ success: [], failure: [] });
    const [monthlyData, setMonthlyData] = useState([0, 0]);
 
    useEffect(() => {
        fetchResetLogs();
    }, []);
 
    const fetchResetLogs = async () => {
        try {
            const successResponse = await axios.get(`${API_BASE_URL}/AD/password-reset-logs`);
            const failureResponse = await axios.get(`${API_BASE_URL}/AD/password-reset-failure-logs`);
 
            const successLogs = Array.isArray(successResponse.data) ? successResponse.data : [];
            const failureLogs = Array.isArray(failureResponse.data) ? failureResponse.data : [];
 
            processLogs(successLogs, failureLogs);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };
 
    const processLogs = (successLogs, failureLogs) => {
        if (!Array.isArray(successLogs) || !Array.isArray(failureLogs)) {
            console.error("Invalid log format:", successLogs, failureLogs);
            return;
        }
 
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const currentDayOfWeek = currentDate.getDay();
        const currentDay = currentDate.toDateString();
 
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);
 
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
 
        const filteredSuccessLogs = successLogs.filter(log => {
            const logDate = new Date(log.resetDate);
            return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        });
 
        const filteredFailureLogs = failureLogs.filter(log => {
            const logDate = new Date(log.resetDate);
            return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        });
 
        setMonthlyData([filteredSuccessLogs.length, filteredFailureLogs.length]);
 
        const filteredSuccessLogsweek = successLogs.filter(log => {
            const logDate = new Date(log.resetDate);
            return logDate >= startOfWeek && logDate <= endOfWeek;
        });
 
        const filteredFailureLogsweek = failureLogs.filter(log => {
            const logDate = new Date(log.resetDate);
            return logDate >= startOfWeek && logDate <= endOfWeek;
        });
 
        const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const weeklySuccess = new Array(7).fill(0);
        const weeklyFailure = new Array(7).fill(0);
        const hourlySuccess = new Array(24).fill(0);
        const hourlyFailure = new Array(24).fill(0);
 
        filteredSuccessLogsweek.forEach(log => {
            const dayIndex = new Date(log.resetDate).getDay();
            weeklySuccess[dayIndex === 0 ? 6 : dayIndex - 1] += 1;
        });
 
        filteredFailureLogsweek.forEach(log => {
            const dayIndex = new Date(log.resetDate).getDay();
            weeklyFailure[dayIndex === 0 ? 6 : dayIndex - 1] += 1;
        });
 
        setWeeklyData({ success: weeklySuccess, failure: weeklyFailure });
 
        successLogs.forEach(log => {
            const logDate = new Date(log.resetDate);
            if (logDate.toDateString() === currentDay) {
                const hour = logDate.getHours();
                hourlySuccess[hour] += 1;
            }
        });
   
        failureLogs.forEach(log => {
            const logDate = new Date(log.resetDate);
            if (logDate.toDateString() === currentDay) {
                const hour = logDate.getHours();
                hourlyFailure[hour] += 1;
            }
        });
 
        const transformedData = [
            {
                name: "Success",
                data: hourlySuccess.map((count, index) => ({
                    x: new Date().setHours(index, 0, 0, 0),
                    y: count,
                    z: count * 5, // Bubble size multiplier
                })),
            },
            {
                name: "Failure",
                data: hourlyFailure.map((count, index) => ({
                    x: new Date().setHours(index, 0, 0, 0),
                    y: count,
                    z: count * 5, // Bubble size multiplier
                })),
            },
        ];
   
        setDailyData(transformedData);
    };
 
    const polarAreaChartOptions = {
        chart: { type: "polarArea" },
        labels: ["Success", "Failure"],
        colors: ["#9b3192", "#ea5f89"],
        legend: { position: "bottom" },
    };
 
    const weeklyChartOptions = {
        chart: { type: "bar", stacked: true, height: 350 },
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: "50%",
            },
        },
        xaxis: {
            categories: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            title: { text: "Number of Resets" },
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "vertical",
                gradientToColors: ["#4A00E0", "#FFC837"], // Gradient end colors
                stops: [0, 100]
            }
        },
        colors: ["#11998e", "#ff416c"], // Gradient start colors
        tooltip: {
            enabled: true,
            y: {
                formatter: (val) => val,
            },
            marker: {
                fillColors: ["#3731c5", "#ff6e5a"], // Tooltip marker color matches bar colors
            },
            style: {
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                color: '#000000',
            },
            custom: function({ series, seriesIndex, dataPointIndex, w }) {
                const value = series[seriesIndex][dataPointIndex];
                const label = w.globals.labels[dataPointIndex];
                return `
                    <div style="text-align: center; padding: 5px;">
                        <span style="font-size: 14px; font-weight: bold;">${label}</span><br>
                        <span style="font-size: 12px; color: ${seriesIndex === 0 ? '#11998e' : '#ff416c'};">${value}</span>
                    </div>
                `;
            }
        },
        legend: {
            position: "top",
            horizontalAlign: "center",
            markers: {
                fillColors: ["#4A00E0", "#ff635f"], // Set legend colors manually
            },
        },
 
    };
 
    // Bubble Chart Options
    const bubbleChartOptions = {
        chart: { type: "bubble", height: 350 },
        xaxis: {
            type: "datetime",
            labels: {
                formatter: (value) => {
                    return new Date(value).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false, // 24-hour format
                        timeZone: "Asia/Kolkata", // IST
                    });
                },
                rotate: -45,
            },
            tickAmount: 18, // Ensures more time points are displayed
            min: new Date().setHours(0, 0, 0, 0), // Start at 00:00
            max: new Date().setHours(23, 59, 59, 999), // End at 23:59
            title: { text: "Active Hours (IST)" },
        },
        yaxis: {
            title: { text: "Number of Resets" },
            min: 0,
            max: 4,
            tickAmount: 4, // Forces 1 to 5 interval
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "radial",
                gradientToColors: ["#00CED1", "#FF1493"],
                stops: [0, 100],
            },
        },
        colors: ["#00CED1", "#FF1493"], // Green for success, red for failure
        legend: { position: "top" },
        tooltip: {
            custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                let seriesName = w.config.series[seriesIndex].name; // Get series name
                let value = series[seriesIndex][dataPointIndex]; // Get the count value
                return `<div style="padding:5px; font-size:12px; background:#fff; border:1px solid #ccc;">
                            <strong>${seriesName}: ${value}</strong>
                        </div>`;
            },
        },
               
        dataLabels: {
            enabled: false, // Hides the number inside the bubble
        },
        };

  return (


    <div>
        <h3>Monthly Statistics Metrics</h3>
            <Chart options={polarAreaChartOptions} series={monthlyData} type="polarArea" height={200} width={700} />
           
            <h3>Weekly Activity Metrics</h3>
            <Chart options={weeklyChartOptions} series={[
                    { name: "Success", data: weeklyData.success },
                    { name: "Failure", data: weeklyData.failure }
                ]} type="bar" height={250} width={700} />
           
            <h3>Daily Distribution Metrics</h3>
            <Chart options={bubbleChartOptions} series={dailyData} type="bubble" height={250} width={750} />
    </div>
  )
}

export default ReportChartsection
