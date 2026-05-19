# AI Biometric Attendance System

A comprehensive, class-based Attendance Management System powered by AI Facial Recognition. This project includes a React/Node.js web application and a Flutter mobile app wrapper for seamless cross-platform usage.

## Features
- **AI Face Recognition:** Uses `face-api.js` for secure biometric scanning.
- **Teacher & Student Dashboards:** Distinct workflows for instructors and students.
- **Class-Based Management:** Organize attendance by courses and specific classes.
- **Mobile Application:** A Flutter mobile wrapper ensuring the exact same UI and workflow on Android/iOS devices.

---

## How to Run Locally (Web Application)

### 1. Database Setup
Make sure you have MySQL/XAMPP running. The database schema is located in `mysql_schema.sql`. Import it to create the required tables.

### 2. Install Dependencies
Open a terminal in the root folder and install the Node modules:
```bash
npm install
```

### 3. Start the Backend Server
Start the Node.js API server (usually running on port 3000 or 5000):
```bash
# Example start command depending on your setup
node server.js
# or if you have a dev script
npm run server
```

### 4. Start the Web Frontend
Start the Vite React application:
```bash
npm run dev -- --host
```
> **Note:** The `--host` flag is important if you want to test the application on your mobile device over the local network.

---

## How to Run the Flutter Mobile App

The mobile application is located in the `attendance_app_mobile` directory. It uses a WebView to load your web application natively with camera permissions automatically handled.

### 1. Find Your Local IP Address
If you are running the web app locally on your computer, you need your computer's local IP address (e.g., `192.168.1.15`).
- **Windows:** Open Command Prompt and type `ipconfig`. Look for "IPv4 Address".
- **Mac:** Open Terminal and type `ifconfig | grep inet`.

### 2. Configure the Mobile App URL
Open `attendance_app_mobile/lib/main.dart` and update line 10 to point to your computer's IP address and the Vite port (usually 5173). 

```dart
// Change this to your actual IP Address!
const String WEB_APP_URL = 'http://192.168.1.15:5173'; 
```
*(If your web app is deployed on Vercel/Render, just paste the live `https://` link here instead).*

### 3. Run the App
Connect your Android/iOS device (or start an emulator), make sure it is on the **same Wi-Fi network** as your computer, and run:
```bash
cd attendance_app_mobile
flutter run
```

---

## Project Structure
- `/` - Root directory containing the React frontend and Node.js backend.
- `/attendance_app_mobile` - Flutter mobile application wrapper.
- `/server` (or similar) - API backend files.
- `/public/models` - `face-api.js` neural network models.
