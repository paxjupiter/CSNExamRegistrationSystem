// scripts/report-by-location.js

document.addEventListener("DOMContentLoaded", async () => {
    // Access control
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "faculty") {
      alert("Access denied. Faculty only.");
      window.location.href = "index.html";
      return;
    }
  
    const facultyId = user.faculty_id;
    const locationSelect = document.getElementById("locationSelect");
    const tableBody = document.querySelector("#locationReportTable tbody");
    const downloadBtn = document.getElementById("downloadBtn");
    let currentReportData = [];
  
    // CSV Export — flat format (one row per student)
    function downloadCSV(rows, filename = "report.csv") {
      if (!rows.length) return;
  
      const headers = ["StudentName", "ExamName", "Date", "Time", "Building", "RoomNumber"];
      const csvLines = [headers.join(",")];
  
      rows.forEach(row => {
        row.Students.forEach(student => {
          const line = [
            `"${student}"`,
            `"${row.ExamName}"`,
            `"${row.Date}"`,
            `"${row.Time}"`,
            `"${row.Building}"`,
            `"${row.RoomNumber}"`
          ].join(",");
          csvLines.push(line);
        });
      });
  
      const csvContent = csvLines.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  
    try {
      // Fetch all sessions for this faculty
      const res = await fetch(`http://localhost:5000/api/faculty_reports/${facultyId}`);
      const allSessions = await res.json();
  
      // Populate dropdown with unique campuses from those sessions
      const campuses = [...new Set(allSessions.map(s => s.Campus))];
      campuses.forEach(campus => {
        const opt = document.createElement("option");
        opt.value = campus;
        opt.textContent = campus;
        locationSelect.appendChild(opt);
      });
  
      // On dropdown change, filter and render results
      locationSelect.addEventListener("change", () => {
        const selectedCampus = locationSelect.value;
        if (!selectedCampus) return;
  
        const rows = allSessions.filter(row => row.Campus === selectedCampus);
        currentReportData = rows;
        tableBody.innerHTML = "";
  
        rows.forEach(row => {
          row.Students.forEach(student => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${student}</td>
              <td>${row.ExamName}</td>
              <td>${row.Date}</td>
              <td>${row.Time}</td>
              <td>${row.Building}</td>
              <td>${row.RoomNumber}</td>
            `;
            tableBody.appendChild(tr);
          });
        });
      });
  
      // CSV export handler
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          if (!currentReportData.length) {
            alert("No data to download.");
            return;
          }
          const filename = `location-report-${Date.now()}.csv`;
          downloadCSV(currentReportData, filename);
        });
      }
  
    } catch (err) {
      console.error("Failed to load location report data:", err);
    }
  });
  