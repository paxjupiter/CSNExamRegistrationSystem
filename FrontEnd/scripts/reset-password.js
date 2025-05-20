document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#resetForm");
    const errorMsg = document.querySelector(".error-msg");
    const successMsg = document.querySelector(".success-msg");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorMsg.style.display = "none";
      successMsg.style.display = "none";
  
      const email = document.querySelector("#email").value.trim();
      const newPassword = document.querySelector("#newPassword").value.trim();
  
      try {
        const res = await fetch("http://localhost:5000/api/reset_password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, new_password: newPassword }),
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          errorMsg.textContent = data.error || "Reset failed.";
          errorMsg.style.display = "block";
          return;
        }
  
        successMsg.textContent = data.message;
        successMsg.style.display = "block";
        form.reset();
      } catch (err) {
        console.error("Reset error:", err);
        errorMsg.textContent = "Error connecting to server.";
        errorMsg.style.display = "block";
      }
    });
  });
  