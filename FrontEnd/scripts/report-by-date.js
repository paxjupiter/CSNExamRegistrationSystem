// scripts/report-by-date.js

document.addEventListener("DOMContentLoaded", async () => {
    // Access control: redirect if not faculty
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "faculty") {
      alert("Access denied. Faculty only.");
      window.location.href = "index.html";
      return;
    }

    let currentReportData = [];

    function downloadCSV(rows, filename = "report.csv") {
        if (!rows.length) return;
      
        const headers = ["StudentName", "ExamName", "Time", "Campus", "Building", "Room"];
        const csvLines = [headers.join(",")];
      
        rows.forEach(row => {
          row.Students.forEach(student => {
            const line = [
              `"${student}"`,
              `"${row.ExamName}"`,
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
          
  
    const datePicker = document.getElementById("datePicker");
    const tableBody = document.querySelector("#dateReportTable tbody");

    // 🔥 Only allow valid faculty exam dates
    const facultyId = localStorage.getItem("faculty_id");
    let validDates = [];

    try {
      const res = await fetch(`http://localhost:5000/api/faculty_exam_dates/${facultyId}`);
      validDates = await res.json();

      if (validDates.length) {
        datePicker.min = validDates[0];
        datePicker.max = validDates[validDates.length - 1];
      }
    } catch (err) {
      console.error("Failed to fetch valid faculty exam dates:", err);
    }

  
    // Listen for changes on the date picker
    datePicker.addEventListener("change", async () => {
        const selectedDate = datePicker.value;
        if (!selectedDate) return;

        if (!validDates.includes(selectedDate)) {
          tableBody.innerHTML = ""; // Clear table on invalid date
          alert("You do not have any exams scheduled for this date.");
          datePicker.value = "";
          return;
        }
        
      
        try {
          const facultyId = localStorage.getItem("faculty_id");
          const res = await fetch(`http://localhost:5000/api/faculty_reports/${facultyId}`);
          const allSessions = await res.json();
          console.log("All sessions from API:", allSessions);

          const selectedDate = datePicker.value; // "2025-05-07"

            // Confirm backend date format
            console.log("Selected date:", selectedDate);

            // Normalize session date if needed
            const normalizeDate = (dateStr) => {
            const parsed = new Date(dateStr);
            if (isNaN(parsed)) return dateStr; // fallback if it’s already "YYYY-MM-DD"
            return parsed.toISOString().split("T")[0];
            };

            // DEBUG: Log both sides of comparison
            allSessions.forEach((session, i) => {
            const normalized = normalizeDate(session.Date);
            console.log(`Session ${i + 1}: ${normalized} === ${selectedDate} ?`, normalized === selectedDate);
            });

            // Filter correctly
            const rows = allSessions.filter(session => normalizeDate(session.Date) === selectedDate);
            console.log("Filtered row example:", rows[0]);

            // Store result
            currentReportData = rows;
            tableBody.innerHTML = ""; // Clear table

            // Render rows
            rows.forEach(row => {
                row.Students.forEach(studentName => {
                  const tr = document.createElement("tr");
                  tr.innerHTML = `
                    <td>${studentName}</td>
                    <td>${row.ExamName}</td>
                    <td>${row.Time}</td>
                    <td>${row.Campus}</td>
                    <td>${row.Building}</td>
                    <td>${row.RoomNumber}</td>
                  `;
                  tableBody.appendChild(tr);
                });
              });              
                
        } catch (err) {
          console.error("Failed to load report data:", err);
        }
      });
      

    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            if (!currentReportData.length) {
            alert("No data to download.");
            return;
            }

            const filename = `report-${Date.now()}.csv`;
            downloadCSV(currentReportData, filename);
        });
    }

  });
  