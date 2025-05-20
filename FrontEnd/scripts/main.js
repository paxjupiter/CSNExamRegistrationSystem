// scripts/main.js

/*
  This script handles two major parts of the exam registration system:
  1. Login validation and user session storage for both students and faculty
  2. Account creation form logic for new users, with dynamic input validation

  NOTE: The logic is designed to work in tandem with backend Flask endpoints.
  All fetch requests assume the backend is running at localhost:5000.
*/

// -------------------------------------------------------------------------
// MOCK USERS (unused in production, used for early testing/demo if needed)
// -------------------------------------------------------------------------
/*
const mockUsers = [
  {
    email: "1234567890@student.csn.edu",
    nshe: "1234567890",
    role: "student"
  },
  {
    email: "jdoe@csn.edu",
    password: "Teach@123",
    role: "faculty"
  }
];
*/

// -------------------------------------------------------------------------
// VALIDATION HELPERS
// -------------------------------------------------------------------------

// Faculty passwords must include letters, numbers, and a special character
function isValidFacultyPassword(pw) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(pw);
}

// Student emails must follow the format: 10-digit ID @student.csn.edu
function isValidStudentEmail(email) {
  const pattern = /^\d{10}@student\.csn\.edu$/;
  return pattern.test(email);
}

// Extracts the NSHE number from a valid student email
function extractNSHE(email) {
  return email.split("@")[0];
}

// -------------------------------------------------------------------------
// DOM LOADED EVENT — PAGE LOGIC INITIALIZATION
// -------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // LOGIN FORM HANDLING
  // -----------------------------
  const form = document.querySelector(".login-form");
  const errorMsg = document.querySelector(".error-msg");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent form's default behavior

      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value.trim();

      try {
        // Send login request to backend
        const response = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          // Show error message returned from server or fallback message
          errorMsg.style.display = "block";
          errorMsg.textContent = data.error || "Login failed";
          return;
        }

        // Save all relevant user data to localStorage for session tracking
        localStorage.setItem("auth_id", data.auth_id);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("firstName", data.first_name);
        localStorage.setItem("lastName", data.last_name);
        localStorage.setItem("email", data.email);

        if (data.role === "student") {
          localStorage.setItem("studentNSHE", data.nshe_id);
        
          // Fetch and store student_id using auth_id
          const res = await fetch(`http://localhost:5000/api/get_student_id/${data.auth_id}`);
          const studentData = await res.json();
          
          if (!res.ok || !studentData.student_id) {
            throw new Error("Failed to fetch student ID.");
          }
        
          localStorage.setItem("student_id", studentData.student_id);
        
          // ✅ Store full user object (needed for student-registrations.js)
          localStorage.setItem("user", JSON.stringify({
            ...data,
            student_id: studentData.student_id
          }));
        
          // Redirect AFTER storing user
          window.location.href = "student-dashboard.html";
          return;
        }
        

        // Save raw user object for debugging or future use
        localStorage.setItem("user", JSON.stringify(data));

        // Faculty redirection
        if (data.role === "faculty") {
          window.location.href = "faculty-dashboard.html";
          localStorage.setItem("faculty_id", data.faculty_id);
        } 
        
        else {
          errorMsg.style.display = "block";
          errorMsg.textContent = "Unknown user role.";
        }

      } catch (err) {
        console.error("Login error:", err);
        errorMsg.style.display = "block";
        errorMsg.textContent = "Error connecting to server.";
      }
    });
  }
});


  // -----------------------------
// ACCOUNT CREATION FORM HANDLING
// -----------------------------
const accountForm = document.querySelector(".account-form-card"); // Reference to form
const errorDisplay = document.querySelector(".error-msg");
const successDisplay = document.querySelector(".success-msg");

// Show/hide student or faculty fields based on role selection
const roleDropdown = document.querySelector("#role");
if (roleDropdown) {
  roleDropdown.addEventListener("change", () => {
    const role = roleDropdown.value;
    document.getElementById("student-fields").style.display = role === "student" ? "block" : "none";
    document.getElementById("faculty-fields").style.display = role === "faculty" ? "block" : "none";
  });
}

// Handle form submission
if (accountForm) {
  accountForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = document.querySelector("#role").value;
    const firstName = document.querySelector("#firstName").value.trim();
    const lastName = document.querySelector("#lastName").value.trim();

    // Clear previous messages
    errorDisplay.style.display = "none";
    errorDisplay.textContent = "";
    successDisplay.style.display = "none";

    let email, password, nshe_id;

    // ------------------------
    // SHARED FIELD VALIDATION
    // ------------------------
    if (!role || !firstName || !lastName) {
      errorDisplay.style.display = "block";
      errorDisplay.textContent = "Please fill out all required fields.";
      return;
    }

    // ------------------------
    // STUDENT VALIDATION
    // ------------------------
    if (role === "student") {
      email = document.querySelector("#studentEmail").value.trim();
      nshe_id = document.querySelector("#nshe").value.trim();

      if (!isValidStudentEmail(email)) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Invalid student email format.";
        return;
      }

      if (email.split("@")[0] !== nshe_id) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "NSHE ID must match email.";
        return;
      }

      password = nshe_id; // NSHE ID is also password

    } else if (role === "faculty") {
      // ------------------------
      // FACULTY VALIDATION
      // ------------------------
      email = document.querySelector("#facultyEmail").value.trim();
      password = document.querySelector("#facultyPassword").value.trim();

      if (!email.includes("@csn.edu") || email.includes("@student.csn.edu")) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Invalid faculty email format.";
        return;
      }

      if (!isValidFacultyPassword(password)) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = "Password must be at least 8 characters, include a number and symbol.";
        return;
      }

    } else {
      // ------------------------
      // INVALID ROLE
      // ------------------------
      errorDisplay.style.display = "block";
      errorDisplay.textContent = "Unknown role selected.";
      return;
    }

    // ------------------------
    // BACKEND REQUEST
    // ------------------------
    try {
      const response = await fetch("http://localhost:5000/api/create_account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role,
          first_name: firstName,
          last_name: lastName,
          nshe_id: nshe_id || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorDisplay.style.display = "block";
        errorDisplay.textContent = data.error || "Account creation failed.";
        return;
      }

      // Success message
      successDisplay.style.display = "block";
      successDisplay.textContent = "Account created! Redirecting...";
      errorDisplay.style.display = "none";

      // Store basic session info
      localStorage.setItem("auth_id", data.auth_id);
      localStorage.setItem("userRole", role);
      localStorage.setItem("firstName", firstName);
      localStorage.setItem("lastName", lastName);
      localStorage.setItem("email", email);

      if (role === "student") {
        localStorage.setItem("studentNSHE", nshe_id);

        const res = await fetch(`http://localhost:5000/api/get_student_id/${data.auth_id}`);
        const result = await res.json();

        if (!res.ok || !result.student_id) {
          throw new Error("Student ID fetch failed");
        }

        localStorage.setItem("student_id", result.student_id);

        // ✅ Save full user object
        const fullStudent = {
          auth_id: data.auth_id,
          role: role, // ← from earlier in the function
          first_name: firstName,
          last_name: lastName,
          email: email,
          student_id: result.student_id
        };

        localStorage.setItem("user", JSON.stringify(fullStudent));

        window.location.href = "student-dashboard.html";

      } else {
        const fullFaculty = {
          auth_id: data.auth_id,
          role: role,
          first_name: firstName,
          last_name: lastName,
          email: email,
          faculty_id: data.faculty_id
        };

        localStorage.setItem("faculty_id", data.faculty_id);
        localStorage.setItem("user", JSON.stringify(fullFaculty));

        window.location.href = "faculty-dashboard.html";
      }

    } catch (err) {
      console.error("Account creation error:", err);
      errorDisplay.style.display = "block";
      errorDisplay.textContent = "Error connecting to server.";
    }
  });
}


