# Exam Registration System (ERS)

A full-stack web application for managing college-level exam scheduling. Built using Flask, MySQL, and a clean front-end interface, ERS provides role-based access for students and faculty, secure login handling with bcrypt, and dynamic UI components designed for accessibility and ease of use.

All image and styling comply with branding requirements for College of Southern Nevada. Logo assets were downloaded directly from the CSN website. All other images are original. 

> 💡 Initially created as part of a group prototype, this repo represents the full-scale, independently developed version maintained by **Aiden Montoro**.

---

## ⚡ Quick Start

1. Clone the repo and install dependencies
2. Set up the database using `create_exam_db.sql`
3. Run the Flask server and open `index.html` in your browser

---

## 🔍 Overview

ERS offers a smooth, keyboard-free workflow for students registering for exams, and gives faculty access to live reports filtered by exam, date, or location. All user accounts, exam sessions, and registration data are stored in a secure MySQL database and processed via a Flask API.

---

## 🧑‍🎓 Student Features

- Secure login using NSHE number as email
- Auto-populated registration form (no typing required)
- Exam selection via dependent dropdowns (campus → exam → date → time → proctor)
- Live validation (e.g., seat availability, duplicate prevention)
- View and cancel upcoming registrations
- Confirmation page after registration

---

## 🧑‍🏫 Faculty Features

- Login using CSN email + secure password
- View exam reports:
  - By exam name
  - By session date
  - By location
- Real-time report filtering via Flask + MySQL

---

## 🔐 Security & Authentication

- Passwords are hashed using **bcrypt** and never stored in plaintext
- All login, account creation, and query logic is handled server-side via Flask routes
- Faculty passwords must meet minimum complexity (8+ chars, uppercase, number, special)
- All database interactions are secured via parameterized queries, preventing SQL injection by separating user input from executable SQL logic.

---

## 🧪 Demo Accounts

### Student - Chad Johnson
- **Email:** `7935545372@student.csn.edu`  
- **Password:** `7935545372`

### Faculty - Sarah Garcia
- **Email:** `sarah.garcia@csn.edu`  
- **Password:** `Teach123!`

**All credentials preloaded into the database work, users can log in with any username/password combo.**

 ⚠️ Password hashing only applies to accounts created via the app. Manually batch-loaded accounts (via SQL) bypass bcrypt and store passwords as plaintext.

---

## 🧠 Tech Stack

| Layer        | Tech                             |
|--------------|----------------------------------|
| Front-End    | HTML5, CSS3, JavaScript (vanilla)|
| Back-End     | Python 3 (Flask)                 |
| Database     | MySQL                            |
| Security     | bcrypt for password hashing      |
| Tools        | XAMPP, MySQL CLI, VS Code        |

---

## 🧭 Development Milestones

### Phase 1: UI Prototype
- ✅ Role-based login logic
- ✅ Auto-filled student info on login
- ✅ Keyboard-free form navigation
- ✅ Basic field validation
- ✅ Faculty dashboard placeholder routing
- ✅ Wireframes and user flow diagrams

### Phase 2: Full-Stack Integration
- ✅ Flask server with route logic
- ✅ MySQL database schema + seeding
- ✅ Account creation (student/faculty)
- ✅ Exam registration + cancellation
- ✅ Live validation + deduplication
- ✅ Date/time formatting
- ✅ Conditional dropdowns
- ✅ Student confirmation screen

---

## 🖼️ Wireframes

| Screen            | Preview |
|-------------------|---------|
| UI Overview       | ![UI Wireframe](/Wireframes/UI_Wireframe.png) |
| Workflow Diagram  | ![Workflow Wireframe](/Wireframes/Workflow_Wireframe.png) |
| Functional Flow   | ![Functional Wireframe](/Wireframes/Functional_Wireframe.png) |

---

## 💻 How to Run the App Locally

### Step 1: Install Tools

- [Python 3](https://www.python.org/downloads/)  
  ✅ Be sure to check "Add Python to PATH" during install  
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)  
  ✅ Remember your root password

### Step 2: Set Up the Database

In your terminal:

```bash
mysql -u your_username -p
```

Then, run:

```sql
SOURCE path/to/create_exam_db.sql;
```

This creates the `csners` database and populates it with test data.

Optionally, the statements can be run individually or in batches from MySQL workbench.

**Please note that if you want the hashing to work natively, the dummy accounts must be created manually. This must be done BEFORE running the SQL statements for Location, Exam, and Registrations. All other INSERT statements will be skipped**  

### Step 3: Run the Flask Server

```bash
cd path/to/BackEnd
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors mysql-connector-python
python exam_reg_backend.py
```

Leave this terminal open while using the app — it powers all dynamic data.

The above commands only need to be run the first time. For subsequent runs, you only need:

```bash
venv\Scripts\activate
python exam_reg_backend.py
```

### Step 4: Open the Front-End

Open `index.html` in a browser (localhost/FilepathWhereAppIsSaved).  
Use the demo credentials or create a test account.

---

## 🔄 Reset the Database

To reset everything:

```sql
SOURCE create_exam_db.sql;
```

<p>Note: The frontend can be run from localhost using a local server like XAMPP or simply opened as a file in your browser (e.g., index.html). No deployment required.</p>
---

## 📌 Notes

- No real student data is used
- The app is not deployed live — local setup required
- Fully functional Flask backend and database interactions
- Clean UI design with accessibility in mind
- Built to simulate real institutional workflows

---

## 🙌 Acknowledgments

Originally conceptualized as a collaborative school project.

- **Daverlie Ordiway** – Product Owner  
- **Jayden Gude** – Scrum Master  
- **Renka Kanetake** – QA  
- **Aiden (Pax) Montoro** – Lead Developer & Final Implementation

---

> Ready for review by prospective employers or technical reviewers.  
> Full codebase available under open educational use.
