document.addEventListener("DOMContentLoaded", () => {

  // Retrieve the current user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("USER FROM localStorage:", user);


  // Redirect if no user is found or user is not a student
  if (!user || user.role !== "student") {
    window.location.href = "index.html";
    return;
  }

  // Fetch all registrations for the student based on their user_id
  fetch(`http://localhost:5000/api/student_registrations/${localStorage.getItem("student_id")}`)
    .then((res) => res.json())
    .then((registrations) => {
      const container = document.getElementById("exam-cards");

      // If no registrations are found, inform the user
      if (registrations.length === 0) {
        container.innerHTML = `<div class="no-registrations-message">You have no registered exams.</div>`;
        return;
      }

      // Loop through each registration and build a visual card
      registrations.forEach((reg) => {
        const card = document.createElement("div");
        card.className = "exam-card";

        // Format the exam date for user-friendly display
        const [yyyy, mm, dd] = reg.Date.split("-");
        const formattedDate = `${mm}/${dd}/${yyyy}`;


        // Convert time from 24-hour to 12-hour AM/PM format
        const [hourStr, minuteStr] = reg.Time.split(":");
        const hour = parseInt(hourStr);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        const formattedTime = `${hour12}:${minuteStr} ${ampm} PST`;

        // Inject session details into the card's HTML structure
        card.innerHTML = `
          <p><strong>Campus:</strong> ${reg.Campus}</p>
          <p><strong>Exam:</strong> ${reg.ExamName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Building:</strong> ${reg.Building}</p>
          <p><strong>Room:</strong> ${reg.RoomNumber}</p>
          <p><strong>Proctor:</strong> ${reg.FacultyFirstName} ${reg.FacultyLastName}</p>
        `;

        // Create a cancel button and attach logic to allow deregistration
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Cancel Registration";
        deleteBtn.classList.add("cancel-btn");
        deleteBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to cancel this registration?")) {

            // Send cancellation request to the backend
            fetch(`http://localhost:5000/api/delete_registration`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                student_id: user.student_id || localStorage.getItem("student_id"),
                exam_id: reg.Exam_ID
              }),
            })
            .then((res) => res.json())
            .then((data) => {
              alert(data.message || "Registration canceled.");
              window.location.reload(); // Refresh page to reflect changes
            })
            .catch((err) => {
              console.error(err);
              alert("Something went wrong.");
            });
          }
        });

        // Append the cancel button to the card
        card.appendChild(deleteBtn);

        // Add the completed card to the main container
        container.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Failed to load registrations:", err);
    });
});
