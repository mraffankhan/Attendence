# AI-Powered Biometric Attendance Management System: A Class-Centric Approach

**Author Name**  
*Department of Computer Science*  
*University/Institution Name*  
*City, Country*  
*author.email@example.com*

*Abstract*—Traditional attendance tracking methods, such as manual roll calls and RFID systems, are often time-consuming, prone to proxy attendance, and inefficient for large class sizes. This paper proposes a comprehensive, AI-powered Biometric Attendance Management System designed to streamline the attendance process. The system utilizes facial recognition technology (`face-api.js`) to authenticate students in real-time. A class-centric architecture provides distinct workflows for administrators, teachers, and students. Key features include automated session finalization, course-wise performance tracking, and secure teacher-led attendance workflows. The implementation demonstrates a robust, scalable, and user-friendly solution that significantly reduces administrative overhead and improves attendance accuracy in educational institutions.

*Index Terms*—Biometrics, Facial Recognition, Attendance Management, Web Application, Artificial Intelligence, face-api.js.

---

## I. INTRODUCTION

Managing student attendance is a critical administrative task in educational institutions. Manual methods are tedious and susceptible to human error and fraudulent practices (e.g., proxy attendance). While automated systems like barcode scanners and biometric fingerprint readers have been introduced, they often require specialized hardware and can create bottlenecks at classroom entrances.

The advent of advanced computer vision and deep learning has made facial recognition a viable and highly accurate alternative. This project introduces a web-based, AI-driven attendance management system that leverages standard camera hardware to recognize student faces dynamically. The system is designed around a "class-centric" model, ensuring that attendance is tightly coupled with specific courses, schedules, and authorized faculty.

## II. SYSTEM ARCHITECTURE

The proposed system follows a modern client-server architecture designed for scalability and performance.

### A. Frontend (User Interface)
The user interface is built using React.js, providing a responsive and dynamic experience. The frontend caters to three primary user roles:
1) *Admin Dashboard*: For managing users (students/teachers), defining classes, assigning courses, and scheduling timetables.
2) *Teacher Dashboard*: For initiating class sessions, monitoring live biometric scans, and finalizing attendance records.
3) *Student Dashboard*: For viewing personal attendance statistics, course-wise performance, and participating in active sessions.

### B. Facial Recognition Module
The core biometric authentication relies on `face-api.js`, a JavaScript API for face detection and recognition in the browser built on top of TensorFlow.js [1], [2]. 
- *Enrollment*: During registration, a student's facial features are extracted and stored as a robust 128-dimensional floating-point descriptor in the database.
- *Authentication*: During a class session, the frontend captures live video feeds, detects faces, computes their descriptors, and calculates the Euclidean distance against stored profiles to find matches.

### C. Backend & Database
The backend is powered by Node.js and Express.js [4], providing RESTful APIs for data management and authentication.
- *Database*: A relational MySQL database is used to maintain data integrity. It stores user credentials, class schedules, biometric descriptors (as stringified JSON arrays), and historical attendance logs.
- *Session Management*: The backend enforces security by allowing only assigned teachers to open attendance sessions for specific classes based on the timetable.

## III. PROPOSED METHODOLOGY

The attendance workflow is designed to be seamless and secure:
1) *Session Initiation*: A teacher logs into the portal and starts a live attendance session for their currently scheduled class.
2) *Biometric Scanning*: The system activates the camera and continuously scans for faces. As students enter the camera's field of view, the system processes the frames.
3) *Matching & Logging*: Detected face descriptors are matched against the enrolled students of that specific class. Successful matches are instantly marked as "Present" in the active session database.
4) *Automated Finalization*: Once the teacher ends the session, the system automatically runs a finalization routine. Any student in the class roster who was not biometrically verified is definitively marked as "Absent", and the session record is locked to prevent tampering.

## IV. IMPLEMENTATION DETAILS AND CHALLENGES

A major challenge involved storing high-dimensional array data (Float32Array) in MySQL. This was resolved by accurately parsing double-stringified JSON data into native JavaScript arrays on the frontend before feeding it to the face matcher. 

To provide a premium user experience, the interface utilizes modern design principles, responsive grids, and real-time visual feedback (e.g., notifications and live camera overlays) [3]. The system handles concurrent requests efficiently, ensuring that multiple students can be recognized in a single frame without significant UI lag.

## V. RESULTS AND DISCUSSION

The deployed system demonstrates high accuracy in face detection under standard classroom lighting conditions. The transition to a class-centric model significantly improved the organizational workflow for administrators. Teachers reported a drastic reduction in the time taken to record attendance, allowing them to focus more on instructional activities. The automated finalization feature eliminated ambiguities in attendance records.

## VI. CONCLUSION

The AI-powered Biometric Attendance Management System presents a robust, scalable, and efficient solution to traditional attendance tracking challenges. By integrating facial recognition into a modern web stack and enforcing a class-centric architecture, the project provides a seamless experience for all stakeholders. Future enhancements may include spoofing detection (liveness checks) and integration with institutional learning management systems.

## REFERENCES

[1] Smilkov, D., Thorat, N., Bileschi, S., d'Avella, B., Macaluso, C., & Nielsen, E. (2019). TensorFlow.js: Machine learning for the web and beyond. *Proceedings of the 2nd SysML Conference*, Palo Alto, CA, USA.
[2] V. Mühler. face-api.js: JavaScript API for face recognition in the browser with tensorflow.js. *GitHub repository*.
[3] React: A JavaScript library for building user interfaces. [Online]. Available: https://reactjs.org/
[4] Express: Fast, unopinionated, minimalist web framework for Node.js. [Online]. Available: https://expressjs.com/
