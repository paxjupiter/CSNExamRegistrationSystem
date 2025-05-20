// exam-registration.js

// Wait until the entire DOM is loaded before executing logic
// This ensures all HTML elements are present in the DOM
// before we attempt to reference them by ID or class

document.addEventListener("DOMContentLoaded", () => {
  // --- Prefill student information from localStorage ---
  // These fields are read-only and populated for convenience
  const nameField = document.querySelector("#name");
  const nsheField = document.querySelector("#nshe");
  const emailField = document.querySelector("#email");

  // Reference to the dropdowns used for filtering available sessions
  const campusSelect = document.getElementById("campus");
  const examSelect = document.getElementById("exam");
  const dateSelect = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const proctorSelect = document.getElementById("proctor");

  // UI element for displaying how many seats are left
  const seatWarning = document.querySelector(".seat-warning");

  // Grab the user info stored at login and fill it in the form
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const nshe = localStorage.getItem("studentNSHE");
  const email = localStorage.getItem("email");

  if (firstName && lastName && nshe && email) {
    nameField.value = `${firstName} ${lastName}`;
    nsheField.value = nshe;
    emailField.value = email;
  } else {
    // If required info is missing, send user back to login
    window.location.href = "index.html";
    return;
  }

  // This will hold the entire list of sessions returned from the server
  let allExams = [];

  // Fetch all session data from the backend
  fetch("http://localhost:5000/api/exams")
    .then(response => response.json())
    .then(data => {
      allExams = data.filter(exam => exam.Count < 20);

      // Populate the first dropdown (campus), disable others initially
      populateDropdown(campusSelect, getUniqueDisplayMap(data, "Campus"), "-- Select Your Campus --");
      examSelect.disabled = true;
      dateSelect.disabled = true;
      timeSelect.disabled = true;
      proctorSelect.disabled = true;
    })
    .catch(err => {
      console.error("Failed to fetch exam data:", err);
    });

  // --- UTILITY FUNCTIONS ---

  // Populates any dropdown with a given set of values
  function populateDropdown(select, items, placeholder) {
    select.innerHTML = `<option value="" disabled selected hidden>${placeholder}</option>`;
    items.forEach(item => {
      const option = new Option(item.label, item.value);
      select.appendChild(option);
    });
    select.disabled = false;
  }

  // Takes session data and extracts a unique list of values by key
  // Optionally uses a formatter (e.g., convert ISO date to readable date)
  function getUniqueDisplayMap(data, key, formatter = v => v) {
    const seen = new Set();
    const result = [];

    data.forEach(item => {
      const raw = item[key];
      if (!seen.has(raw)) {
        seen.add(raw);
        result.push({ value: raw, label: formatter(raw) });
      }
    });

    return result;
  }

  // Format raw YYYY-MM-DD date to MM/DD/YYYY
  function formatDateForDisplay(isoDate) {
    // Assumes format is always YYYY-MM-DD from backend
    const [yyyy, mm, dd] = isoDate.split("-");
    return `${mm}/${dd}/${yyyy}`;
  }
  
  
  
  
  

  // Convert 24-hour time to 12-hour AM/PM format for display
  function formatTimeForDisplay(time24) {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minuteStr} ${ampm} PST`;
  }

  // Clears dropdowns and disables them to reset the chain
  function resetAndDisable(...dropdowns) {
    dropdowns.forEach(d => {
      d.innerHTML = `<option value="" disabled selected hidden>-- Select --</option>`;
      d.disabled = true;
    });
  }

  // --- DROPDOWN CHAINING LOGIC ---

  // When a campus is selected, populate exams at that campus
  campusSelect.addEventListener("change", () => {
    const selectedCampus = campusSelect.value;
    const filtered = allExams.filter(e => e.Campus === selectedCampus);
    populateDropdown(examSelect, getUniqueDisplayMap(filtered, "ExamName"), "-- Select Your Exam --");
    resetAndDisable(dateSelect, timeSelect, proctorSelect);
  });

  // When exam is selected, filter sessions by date
  examSelect.addEventListener("change", () => {
    const selectedCampus = campusSelect.value;
    const selectedExam = examSelect.value;
    const filtered = allExams.filter(e => e.Campus === selectedCampus && e.ExamName === selectedExam);
    populateDropdown(dateSelect, getUniqueDisplayMap(filtered, "Date", formatDateForDisplay), "-- Select a Date --");
    resetAndDisable(timeSelect, proctorSelect);
  });

  // When date is selected, filter sessions by time
  dateSelect.addEventListener("change", () => {
    const selectedCampus = campusSelect.value;
    const selectedExam = examSelect.value;
    const selectedDate = dateSelect.value;
    const filtered = allExams.filter(
      e => e.Campus === selectedCampus && e.ExamName === selectedExam && e.Date === selectedDate
    );
    populateDropdown(timeSelect, getUniqueDisplayMap(filtered, "Time", formatTimeForDisplay), "-- Select a Time --");
    resetAndDisable(proctorSelect);
  });

  // When time is selected, lock in proctor and show remaining seats
  timeSelect.addEventListener("change", () => {
    const selectedCampus = campusSelect.value;
    const selectedExam = examSelect.value;
    const selectedDate = dateSelect.value;
    const selectedTime = timeSelect.value;

    const matchingExam = allExams.find(
      e =>
        e.Campus === selectedCampus &&
        e.ExamName === selectedExam &&
        e.Date === selectedDate &&
        e.Time === selectedTime
    );

    if (matchingExam) {
      // Show proctor but do not allow it to be changed
      proctorSelect.innerHTML = `<option>${matchingExam.FacultyFirstName} ${matchingExam.FacultyLastName}</option>`;
      proctorSelect.disabled = true;
      const MAX_CAPACITY = 20;
      const seatsLeft = MAX_CAPACITY - matchingExam.Count;
      seatWarning.textContent = `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} remaining for this test – Register now!`;
    } else {
      proctorSelect.innerHTML = `<option value="" disabled selected hidden>-- Proctor Will Appear Here --</option>`;
      seatWarning.textContent = "";
    }
  });

  // --- FORM SUBMISSION ---
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Find the session the user picked based on all filters
    const selectedCampus = campusSelect.value;
    const selectedExam = examSelect.value;
    const selectedDate = dateSelect.value;
    const selectedTime = timeSelect.value;

    const matchingExam = allExams.find(
      e =>
        e.Campus === selectedCampus &&
        e.ExamName === selectedExam &&
        e.Date === selectedDate &&
        e.Time === selectedTime
    );

    if (!matchingExam) {
      alert("Something went wrong – please check your selections.");
      return;
    }
    
    const studentId = localStorage.getItem("student_id"); 
    
    console.log("studentId", studentId);
    console.log("exam_id", matchingExam.Exam_ID);

    try {
      const response = await fetch("http://localhost:5000/api/register_exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          exam_id: matchingExam.Exam_ID
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Registration failed.");
        return;
      }

      // Store the matching session so we can show it on the confirmation page
      localStorage.setItem("confirmedSession", JSON.stringify(matchingExam));
      window.location.href = "registration-confirmation.html";

    } catch (err) {
      console.error("Error submitting registration:", err);
      alert("Could not reach the server.");
    }
  });

});
