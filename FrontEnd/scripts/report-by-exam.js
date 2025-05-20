// scripts/report-by-exam.js

document.addEventListener("DOMContentLoaded", async () => {
    // Access control
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "faculty") {
      alert("Access denied. Faculty only.");
      window.location.href = "index.html";
      return;
    }
  
    const facultyId = user.faculty_id;
    const examSelect = document.getElementById("examSelect");
    const tableBody = document.querySelector("#examReportTable tbody");
    const downloadBtn = document.getElementById("downloadBtn");
    let currentReportData = [];
  
    // CSV Export — flat format (one row per student)
    function downloadCSV(rows, filename = "report.csv") {
      if (!rows.length) return;
  
      const headers = ["StudentName", "Date", "Time", "Campus", "Building", "RoomNumber"];
      const csvLines = [headers.join(",")];
  
      rows.forEach(row => {
        row.Students.forEach(student => {
          const line = [
            `"${student}"`,
            `"${row.Date}"`,
            `"${row.Time}"`,
            `"${row.Campus}"`,
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
      // Fetch all exams for this faculty only
      const res = await fetch(`http://localhost:5000/api/faculty_reports/${facultyId}`);
      const allSessions = await res.json();
  
      // Populate dropdown with unique exam names
      const examNames = [...new Set(allSessions.map(s => s.ExamName))];
      examNames.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        examSelect.appendChild(opt);
      });
  
      // On dropdown change, filter and render results
      examSelect.addEventListener("change", () => {
        const selectedExam = examSelect.value;
        if (!selectedExam) return;
  
        const rows = allSessions.filter(session => session.ExamName === selectedExam);
        currentReportData = rows;
        tableBody.innerHTML = "";
  
        rows.forEach(row => {
          row.Students.forEach(student => {
            const tr = document.createElement("tr");
          
            tr.innerHTML = `
              <td>${student}</td>
              <td>${row.Date}</td>
              <td>${row.Time}</td>
              <td>${row.Campus}</td>
              <td>${row.Building}</td>
              <td>${row.RoomNumber}</td>
            `;
            
            tableBody.appendChild(tr);
          });
          
        });
      });
  
      // Handle CSV download
      if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
          if (!currentReportData.length) {
            alert("No data to download.");
            return;
          }
          const filename = `exam-report-${Date.now()}.csv`;
          downloadCSV(currentReportData, filename);
        });
      }
  
    } catch (err) {
      console.error("Failed to load exam report:", err);
    }
  });
  