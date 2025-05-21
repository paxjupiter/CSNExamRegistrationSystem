// ers-landing.js

document.addEventListener("DOMContentLoaded", () => {
  const slides = [
    {
      src: "screenshots/login-screen.png",
      caption: "Login page for students and faculty to access their respective dashboards. Login credentials are encrypted with bcrypt.",
    },
    {
      src: "screenshots/student-dashboard.png",
      caption: "Student dashboard displaying personalized greeting, instructions, and navigation options.",
    },
    {
      src: "screenshots/exam-registration.png",
      caption: "Students can register for exams from available sessions dynamically loaded from the database.",
    },
    {
      src: "screenshots/duplicate-session.png",
      caption: "Duplicate registrations, time conflicts, and capacity limitations are enforced.",
    },
    {
      src: "screenshots/registration-confirmation.png",
      caption: "Students receive a confirmation of successful registration.",
    },
    {
      src: "screenshots/student-registrations.png",
      caption: "Students can review and cancel their upcoming exam registrations.",
    },
    {
      src: "screenshots/faculty-dashboard.png",
      caption: "Faculty have their own UI with report-generation tools.",
    },
    {
      src: "screenshots/report-by-exam.png",
      caption: "Faculty report by exam, showing student lists and session details. Only those exams that the user is proctoring can be selected.",
    },
    {
      src: "screenshots/report-by-date.png",
      caption: "Faculty report by date, showing student lists and session details. Only those dates that the user is scheduled to proctor can be selected.",
    },
    {
      src: "screenshots/report-by-location.png",
      caption: "Faculty report by location, organizing sessions by campus and room. Dowload report button generates a csv file of that report, which can be opened in Excel.",
    }
  ];

  let currentSlide = 0;
  const slideImage = document.getElementById("slideImage");
  const slideCaption = document.getElementById("slideCaption");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  function updateSlide(index) {
    slideImage.src = slides[index].src;
    slideCaption.textContent = slides[index].caption;
  }

  if (prevBtn && nextBtn && slideImage && slideCaption) {
    prevBtn.addEventListener("click", () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      updateSlide(currentSlide);
    });

    nextBtn.addEventListener("click", () => {
      currentSlide = (currentSlide + 1) % slides.length;
      updateSlide(currentSlide);
    });

    updateSlide(currentSlide); // Init on load
  }
});
