// student-dashboard.js

// Wait until the DOM is fully loaded before manipulating elements
document.addEventListener("DOMContentLoaded", () => {
    // Retrieve first and last name of the student from localStorage
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");

    // Get reference to the HTML element where the name should be displayed
    const nameElement = document.getElementById("student-name");

    // If the element exists, populate it with the student's name
    if (nameElement) {
      if (firstName && lastName) {
        // Display full name
        nameElement.textContent = `${firstName} ${lastName}`;
      } else {
        // Fallback if no name is found in localStorage
        nameElement.textContent = "[Name Not Found]";
      }
    }
  });
  