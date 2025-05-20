// registration-confirmation.js

// Wait for the DOM to fully load before running any logic
// This ensures all elements are accessible via DOM methods
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the most recently confirmed session data from localStorage
    const exam = JSON.parse(localStorage.getItem("confirmedSession"));
  
    // If there's no session data, redirect to login (fallback for invalid state)
    if (!exam) {
      window.location.href = "index.html"; // force login redirect
      return;
    }
    
    // Display campus name in the confirmation page
    document.getElementById("confirm-campus").textContent = exam.Campus;

    // Display exam name from session
    document.getElementById("confirm-exam").textContent = exam.ExamName;
    
    // Format the ISO date string into MM/DD/YYYY format
    const date = new Date(exam.Date);
    const formattedDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
    document.getElementById("confirm-date").textContent = formattedDate;

    // Extract and format time from 24-hour to 12-hour with AM/PM  
    const time = exam.Time;
    const [hourStr, minuteStr] = time.split(":");
    const hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const formattedTime = `${hour12}:${minuteStr} ${ampm} PST`;
    document.getElementById("confirm-time").textContent = formattedTime;
    
    // Display proctor assigned to the session
    document.getElementById("confirm-proctor").textContent =  `${exam.FacultyFirstName} ${exam.FacultyLastName}`;

    // Display building where the exam will take place
    document.getElementById("confirm-building").textContent = exam.Building;
    
    // Display room number where the exam will take place
    document.getElementById("confirm-room").textContent = exam.RoomNumber;

  });
  