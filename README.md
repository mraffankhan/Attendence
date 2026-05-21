# AIAttend: Smart Biometric Attendance System 🚀

A modern, comprehensive, and highly responsive **AI Facial Recognition Attendance System**. This platform bridges the gap between traditional class management and next-generation biometric verification, providing distinct workflows for Students, Teachers, and Super Admins.

The system features a **React (Vite) Web Application**, a **Node.js/Express REST API**, and a **Native Android WebView App** for seamless cross-platform usage.

---

## 🌟 Key Features

*   **AI Face Recognition:** Integrates `face-api.js` for fast and secure biometric scanning directly from the device's camera.
*   **Premium Mobile-Responsive UI:** 
    *   Features a sleek **Off-Canvas Sidebar (Hamburger Menu)** with a frosted glass backdrop overlay on mobile devices.
    *   Dynamic CSS Grid layouts ensure statistics and tables scale beautifully on any screen size.
*   **Role-Based Dashboards:** Unique, isolated views and permissions for Students, Teachers, and Super Administrators.
*   **Built-in API Proxy:** Configured to automatically route `/api` traffic through the Vite dev server, completely bypassing local Windows Firewall restrictions when connecting from mobile devices on the same Wi-Fi.

---

## 🛠️ Technology Stack

*   **Frontend:** React 18, Vite, Vanilla CSS (Custom Design System), Lucide React (Icons)
*   **Backend:** Node.js, Express.js
*   **Database:** MySQL
*   **AI Model:** `face-api.js` (TensorFlow.js)
*   **Mobile App:** Native Android (Java/Kotlin) WebView

---

## 🚀 Getting Started (Local Development)

Follow these steps to get the full stack running on your local machine.

### 1. Prerequisites
*   Node.js (v18+)
*   MySQL Server (XAMPP, WAMP, or standalone)
*   Android Studio (for the mobile app)

### 2. Database Setup
1. Open your MySQL client (e.g., phpMyAdmin).
2. Create a new database named `attendance_system`.
3. Import the provided `mysql_schema.sql` file to scaffold the required tables and initial seed data.

### 3. Backend Setup
The backend runs on **Port 5000**.
```bash
# Navigate to the backend directory (if separate) or root
npm install

# Start the Node.js API server
npm run server
```

### 4. Frontend Setup
The frontend runs on **Port 5173** and proxies API requests.
```bash
# Install dependencies
npm install

# Start the Vite React application exposed to your local network
npm run dev
```
> **Note:** The Vite config is already set to `host: true`. This exposes the web app to your local network (e.g., `http://192.168.x.x:5173`), which is mandatory for mobile testing.

---

## 📱 Mobile App Configuration (Native Android)

To test the application on your physical Android phone using the Native Android wrapper:

### 1. Find Your Local IP Address
Ensure your computer and Android phone are connected to the **same Wi-Fi network**.
*   **Windows:** Open CMD and type `ipconfig`. Look for your IPv4 Address (e.g., `192.168.1.15`).

### 2. Update the Web App URL
Open the Android Studio project located in `attendance_app_mobile/android`:
1. Navigate to `MainActivity.java` or `MainActivity.kt`.
2. Locate the URL configuration for the WebView.
3. Change the URL to your local IP address targeting port **5173**:
   ```java
   String WEB_APP_URL = "http://192.168.1.15:5173";
   ```

### 3. Run on Device
Connect your Android phone via USB (with USB Debugging enabled) and click **Run** in Android Studio.

---

## 🔧 Troubleshooting

### Connection Errors on Mobile
If your mobile app shows "Connection Error" or a blank white screen:
1. **Check IP Address:** Ensure the IP address in Android Studio exactly matches your computer's current IPv4 address. IPs can change when you reconnect to Wi-Fi.
2. **Use Port 5173:** Make sure the mobile app connects to `5173` (Vite) and not `5000` (Node). The Vite server proxies traffic to Node, which successfully bypasses strict Windows Firewall rules blocking port 5000.
3. **Check Vite Output:** Confirm that when you run `npm run dev`, it outputs `Network: http://192.168.x.x:5173/`.

### UI Layout Issues
If the mobile UI looks squished, clear the cache in your Android WebView or simply restart the Vite server. The app utilizes a dynamic off-canvas sidebar that heavily relies on standard CSS Media Queries (`@media max-width: 768px`).

---

## 📁 Project Structure

```text
/
├── public/                 # Static assets and face-api.js models
├── src/                    
│   ├── components/         # Reusable React components (Sidebar, Nav, etc.)
│   ├── pages/              # Role-based dashboard pages
│   ├── lib/                # API configurations (api.js)
│   ├── App.jsx             # Main Router and Mobile Header layout
│   └── index.css           # Global CSS variables, grids, and utilities
├── vite.config.js          # Vite network and proxy configuration
├── package.json            # Node/React dependencies
└── README.md               # You are here!
```
