# exam_reg_backend.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import timedelta, date
import bcrypt

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Database Configuration ---
db_config = {
    'host': 'localhost',
    'user': 'csners_admin',  # Shared admin account for team usage
    'password': 'QuantumFungus2025!',
    'database': 'csners'
}

# --- Utility Function: Connect to the MySQL database ---
def get_db():
    return mysql.connector.connect(**db_config)

# --- Endpoint: Create Account ---
# Handles creation of new student or faculty accounts with validation.
# Validates email format based on role and prevents duplicate email registration.
@app.route('/api/create_account', methods=['POST'])
def create_account():
    data = request.json
    email = data.get('email')
    raw_password = data.get('password')
    hashed_password = bcrypt.hashpw(raw_password.encode(), bcrypt.gensalt()).decode()
    role = data.get('role')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    nshe_id = data.get('nshe_id')  # Only for students

    if role not in ['student', 'faculty']:
        return jsonify({'error': 'Invalid role'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Insert into authentication table
        cursor.execute("""
            INSERT INTO AUTHENTICATION (Email, Password, Role)
            VALUES (%s, %s, %s)
        """, (email, hashed_password, role))

        auth_id = cursor.lastrowid  # Get generated Auth_ID

        # Insert into either student or faculty table
        if role == 'student':
            cursor.execute("""
                INSERT INTO STUDENT (FirstName, LastName, Email, NSHE_ID, Auth_ID)
                VALUES (%s, %s, %s, %s, %s)
            """, (first_name, last_name, email, nshe_id, auth_id))
        else:  # faculty
            cursor.execute("""
                INSERT INTO FACULTY (FirstName, LastName, Email, Auth_ID)
                VALUES (%s, %s, %s, %s)
            """, (first_name, last_name, email, auth_id))

        conn.commit()
        return jsonify({
            'message': 'Account created successfully',
            'auth_id': auth_id
        }), 201


    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Login ---
# Verifies user credentials and returns user information if successful.
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Lookup in authentication
        cursor.execute("""
            SELECT * FROM AUTHENTICATION WHERE Email = %s
        """, (email,))
        auth = cursor.fetchone()

        if not auth or not bcrypt.checkpw(password.encode(), auth['Password'].encode()):
            return jsonify({'error': 'Invalid credentials'}), 401


        if not auth:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Load extra user details depending on role
        if auth['Role'] == 'student':
            cursor.execute("""
                SELECT Student_ID, FirstName, LastName, NSHE_ID
                FROM STUDENT
                WHERE Auth_ID = %s
            """, (auth['Auth_ID'],))
            profile = cursor.fetchone()
        elif auth['Role'] == 'faculty':
            cursor.execute("""
                SELECT Faculty_ID, FirstName, LastName
                FROM FACULTY
                WHERE Auth_ID = %s
            """, (auth['Auth_ID'],))
            profile = cursor.fetchone()
        else:
            profile = {}

        return jsonify({
            'auth_id': auth['Auth_ID'],
            'email': auth['Email'],
            'role': auth['Role'],
            'first_name': profile.get('FirstName', ''),
            'last_name': profile.get('LastName', ''),
            'nshe_id': profile.get('NSHE_ID', None),
            'student_id': profile.get('Student_ID', None),
            'faculty_id': profile.get('Faculty_ID', None)
        }), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Get All Exam Sessions ---
# Returns all scheduled exam sessions and metadata including room, proctor, and timing.
@app.route('/api/exams', methods=['GET'])
def get_exams():
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                e.Exam_ID,
                e.ExamName,
                e.Date,
                e.Time,
                e.Capacity,
                e.Count,
                f.FirstName AS FacultyFirstName,
                f.LastName AS FacultyLastName,
                l.Campus,
                l.Building,
                l.RoomNumber
            FROM EXAM e
            JOIN FACULTY f ON e.Faculty_ID = f.Faculty_ID
            JOIN LOCATION l ON e.Location_ID = l.Location_ID
            ORDER BY e.Date, e.Time
        """)
        exams = cursor.fetchall()

        for exam in exams:
            # ✅ Patch: Convert date object to string before sending
            if isinstance(exam['Date'], date):
                exam['Date'] = exam['Date'].strftime("%Y-%m-%d")

            if isinstance(exam['Time'], timedelta):
                total_seconds = int(exam['Time'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                exam['Time'] = f"{hours:02d}:{minutes:02d}"

        return jsonify(exams), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@app.route('/api/register_exam', methods=['POST'])
def register_exam():
    data = request.json
    student_id = data.get('student_id')
    exam_id = data.get('exam_id')

    if not student_id or not exam_id:
        return jsonify({'error': 'Missing student_id or exam_id'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # 🔒 Check if already registered for exact session
        cursor.execute("""
            SELECT 1 FROM REGISTRATION
            WHERE Student_ID = %s AND Exam_ID = %s
        """, (student_id, exam_id))
        if cursor.fetchone():
            return jsonify({'error': 'Already registered for this exam session.'}), 400

        # 🔒 Get session details
        cursor.execute("""
            SELECT ExamName, Date, Time, Capacity, Count FROM EXAM
            WHERE Exam_ID = %s
        """, (exam_id,))
        exam = cursor.fetchone()
        if not exam:
            return jsonify({'error': 'Exam not found.'}), 404

        if exam['Count'] >= exam['Capacity']:
            return jsonify({'error': 'Exam is full.'}), 400

        # 🔒 Check if student is already registered for 3 exams
        cursor.execute("""
            SELECT COUNT(*) AS count FROM REGISTRATION
            WHERE Student_ID = %s
        """, (student_id,))
        reg_count = cursor.fetchone()["count"]
        if reg_count >= 3:
            return jsonify({'error': 'Cannot register for more than 3 exams.'}), 400

        # 🔒 Check for time conflict
        cursor.execute("""
            SELECT 1 FROM REGISTRATION r
            JOIN EXAM e ON r.Exam_ID = e.Exam_ID
            WHERE r.Student_ID = %s AND e.Date = %s AND e.Time = %s
        """, (student_id, exam['Date'], exam['Time']))
        if cursor.fetchone():
            return jsonify({'error': 'Time conflict: already registered for another exam at this time.'}), 400

        # 🔒 Check for same ExamName conflict
        cursor.execute("""
            SELECT 1 FROM REGISTRATION r
            JOIN EXAM e ON r.Exam_ID = e.Exam_ID
            WHERE r.Student_ID = %s AND e.ExamName = %s
        """, (student_id, exam['ExamName']))
        if cursor.fetchone():
            return jsonify({'error': f'Already registered for another session of "{exam["ExamName"]}".'}), 400

        # ✅ Register the student
        cursor.execute("""
            INSERT INTO REGISTRATION (Student_ID, Exam_ID)
            VALUES (%s, %s)
        """, (student_id, exam_id))

        # ✅ Update the Count
        cursor.execute("""
            UPDATE EXAM
            SET Count = Count + 1
            WHERE Exam_ID = %s
        """, (exam_id,))

        # ✅ Decrement capacity
        cursor.execute("""
            UPDATE EXAM
            SET Capacity = Capacity - 1
            WHERE Exam_ID = %s
        """, (exam_id,))

        conn.commit()
        return jsonify({'message': 'Registration successful.'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()


# --- Endpoint: View a Student's Registrations ---
# Returns a list of upcoming sessions for a given student ID.
@app.route('/api/student_registrations/<int:student_id>', methods=['GET'])
def get_student_registrations(student_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                e.Exam_ID,
                e.ExamName,
                e.Date,
                e.Time,
                l.Campus,
                l.Building,
                l.RoomNumber,
                f.FirstName AS FacultyFirstName,
                f.LastName AS FacultyLastName
            FROM REGISTRATION r
            JOIN EXAM e ON r.Exam_ID = e.Exam_ID
            JOIN FACULTY f ON e.Faculty_ID = f.Faculty_ID
            JOIN LOCATION l ON e.Location_ID = l.Location_ID
            WHERE r.Student_ID = %s
            ORDER BY e.Date, e.Time
        """, (student_id,))

        results = cursor.fetchall()

        # Convert timedelta objects to HH:MM strings and format date
        for row in results:
            if isinstance(row['Date'], date):
                row['Date'] = row['Date'].strftime("%Y-%m-%d")

            if isinstance(row['Time'], timedelta):
                total_seconds = int(row['Time'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                row['Time'] = f"{hours:02d}:{minutes:02d}"

        return jsonify(results), 200


    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Delete a Registration ---
# Removes a student's registration from a session and decrements seat count.
@app.route('/api/delete_registration', methods=['POST'])
def delete_registration():
    data = request.json
    student_id = data.get('student_id')
    exam_id = data.get('exam_id')

    if not student_id or not exam_id:
        return jsonify({'error': 'Missing student_id or exam_id'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Delete the registration
        cursor.execute("""
            DELETE FROM REGISTRATION
            WHERE Student_ID = %s AND Exam_ID = %s
        """, (student_id, exam_id))

        # Decrease the count
        cursor.execute("""
            UPDATE EXAM
            SET Count = Count - 1
            WHERE Exam_ID = %s AND Count > 0
        """, (exam_id,))

        # Increase Capacity (open seats)
        cursor.execute("""
            UPDATE EXAM
            SET Capacity = Capacity + 1
            WHERE Exam_ID = %s
        """, (exam_id,))

        conn.commit()
        return jsonify({'message': 'Registration successfully canceled.'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint - Helper to store studentID
# Makes it easier for scripts to fetch student ID
@app.route('/api/get_student_id/<int:auth_id>', methods=['GET'])
def get_student_id(auth_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT Student_ID FROM STUDENT
            WHERE Auth_ID = %s
        """, (auth_id,))
        student = cursor.fetchone()

        if not student:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({'student_id': student['Student_ID']}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Report by Exam ---
# Returns all students registered for a specific exam
@app.route('/api/report_by_exam/<string:exam_name>', methods=['GET'])
def report_by_exam(exam_name):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
                e.Date,
                e.Time,
                l.Campus,
                l.Building,
                l.RoomNumber
            FROM REGISTRATION r
            JOIN STUDENT s ON r.Student_ID = s.Student_ID
            JOIN EXAM e ON r.Exam_ID = e.Exam_ID
            JOIN LOCATION l ON e.Location_ID = l.Location_ID
            WHERE e.ExamName = %s
            ORDER BY e.Date, e.Time
        """, (exam_name,))

        results = cursor.fetchall()

        # Convert timedelta to string if needed
        from datetime import datetime, timedelta

        for row in results:
            # Convert date string to datetime object if needed
            date_obj = datetime.strptime(str(row['Date']), "%Y-%m-%d")
            row['Date'] = date_obj.strftime("%m/%d/%Y")


            # Format time if it's a timedelta
            if isinstance(row['Time'], timedelta):
                total_seconds = int(row['Time'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                row['Time'] = f"{hours:02d}:{minutes:02d}"

        #log to check date formatting
        print("FINAL JSON TO CLIENT:")
        print(results)
        return jsonify(results), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Report by Date ---
# Returns all students registered for exams on a given date
@app.route('/api/report_by_date/<string:exam_date>', methods=['GET'])
def report_by_date(exam_date):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
                e.ExamName,
                e.Time,
                l.Campus,
                l.Building,
                l.RoomNumber
            FROM REGISTRATION r
            JOIN STUDENT s ON r.Student_ID = s.Student_ID
            JOIN EXAM e ON r.Exam_ID = e.Exam_ID
            JOIN LOCATION l ON e.Location_ID = l.Location_ID
            WHERE e.Date = %s
            ORDER BY e.ExamName, e.Time
        """, (exam_date,))

        results = cursor.fetchall()

        from datetime import datetime, timedelta

        for row in results:
            # Parse ISO string to datetime object if needed

            # if isinstance(row['Date'], str):
            #     try:
            #         date_obj = datetime.fromisoformat(row['Date'])
            #     except ValueError:
            #         date_obj = datetime.strptime(row['Date'], "%a, %d %b %Y %H:%M:%S %Z")
            # else:
            #     date_obj = row['Date']

            # row['Date'] = date_obj.strftime("%m/%d/%Y")

            # Format time if it's a timedelta
            if isinstance(row['Time'], timedelta):
                total_seconds = int(row['Time'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                row['Time'] = f"{hours:02d}:{minutes:02d}"

        return jsonify(results), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Get Dates with Scheduled Exams for a Faculty Member ---
# Returns valid dates for datepicker to only allow user to select those dates
@app.route('/api/faculty_exam_dates/<int:faculty_id>', methods=['GET'])
def get_faculty_exam_dates(faculty_id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT DISTINCT Date FROM EXAM
            WHERE Faculty_ID = %s
            ORDER BY Date ASC
        """, (faculty_id,))

        rows = cursor.fetchall()
        dates = [row[0].strftime('%Y-%m-%d') for row in rows]  # format to ISO for <input type="date">

        return jsonify(dates), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()



# --- Endpoint: Report by Location ---
# Returns all students registered for exams at a given campus
@app.route('/api/report_by_location/<string:campus>', methods=['GET'])
def report_by_location(campus):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                CONCAT(s.FirstName, ' ', s.LastName) AS StudentName,
                e.ExamName,
                e.Date,
                e.Time,
                l.Building,
                l.RoomNumber
            FROM REGISTRATION r
            JOIN STUDENT s ON r.Student_ID = s.Student_ID
            JOIN EXAM e ON r.Exam_ID = e.Exam_ID
            JOIN LOCATION l ON e.Location_ID = l.Location_ID
            WHERE l.Campus = %s
            ORDER BY e.Date, e.Time
        """, (campus,))

        results = cursor.fetchall()

        from datetime import datetime, timedelta

        for row in results:
            if isinstance(row['Date'], str):
                try:
                    date_obj = datetime.fromisoformat(row['Date'])
                except ValueError:
                    date_obj = datetime.strptime(row['Date'], "%a, %d %b %Y %H:%M:%S %Z")
            else:
                date_obj = row['Date']
            row['Date'] = date_obj.strftime("%m/%d/%Y")

            if isinstance(row['Time'], timedelta):
                total_seconds = int(row['Time'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                row['Time'] = f"{hours:02d}:{minutes:02d}"

        return jsonify(results), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Filter Exam Data by Proctor ---
# Returns only relevant exam data for the faculty/proctor who is logged in
@app.route('/api/faculty_reports/<int:faculty_id>', methods=['GET'])
def get_faculty_reports(faculty_id):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                e.ExamName,
                e.Date,
                e.Time,
                l.Campus,
                l.Building,
                l.RoomNumber,
                COUNT(r.Registration_ID) AS StudentCount,
                GROUP_CONCAT(CONCAT(s.FirstName, ' ', s.LastName) SEPARATOR '||') AS Students
            FROM EXAM e
            JOIN LOCATION l ON e.Location_ID = l.Location_ID
            LEFT JOIN REGISTRATION r ON e.Exam_ID = r.Exam_ID
            LEFT JOIN STUDENT s ON r.Student_ID = s.Student_ID
            WHERE e.Faculty_ID = %s
            GROUP BY e.Exam_ID
            ORDER BY e.Date, e.Time
        """, (faculty_id,))

        results = cursor.fetchall()

        # Force parsing to fix JS timezone shift
        from datetime import datetime

        for row in results:
            if isinstance(row['Students'], str):
                row['Students'] = row['Students'].split('||')
            elif not isinstance(row['Students'], list):
                row['Students'] = []

            # 🔥 Re-parse and format the date cleanly
            if isinstance(row['Date'], date):
                row['Date'] = row['Date'].strftime("%Y-%m-%d")

            # 🔧 Format time if it's a timedelta
            if isinstance(row['Time'], timedelta):
                total_seconds = int(row['Time'].total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                row['Time'] = f"{hours:02d}:{minutes:02d}"

        return jsonify(results), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

# --- Endpoint: Reset Password ---
# Validates user by role check in authentication table
@app.route('/api/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')

    if not email or not new_password:
        return jsonify({'error': 'Email and password required'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Check if user exists and get role
        cursor.execute("SELECT * FROM AUTHENTICATION WHERE Email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'Account not found'}), 404

        if user['Role'] == 'student':
            return jsonify({'error': "Students cannot reset their password. Contact your system administrator."}), 403

        # Validate password strength (same rule from frontend)
        import re
        pattern = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$')
        if not pattern.match(new_password):
            return jsonify({'error': 'Password must be at least 8 characters long, include a number and a special character.'}), 400

        # Hash new password
        hashed_pw = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt()).decode()

        # Update password
        cursor.execute("UPDATE AUTHENTICATION SET Password = %s WHERE Email = %s", (hashed_pw, email))
        conn.commit()

        return jsonify({'message': 'Password updated successfully'}), 200

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()



# --- App Runner ---
# Launches Flask server in debug mode
if __name__ == '__main__':
    app.run(debug=True)
