# 🛡️ BehaviorAuth – Behavior-Based Authentication System

BehaviorAuth is a browser-based authentication system that enhances traditional login security by analyzing **how users interact** with the login page. Instead of relying only on usernames and passwords, it creates a behavioral profile using typing patterns, mouse movements, and login timing.

This project is built entirely with **HTML5, CSS3, and Vanilla JavaScript**, requiring no external frameworks or backend services.

---

# 🧠 What is Behavioral Authentication?

Traditional authentication relies on:

* **Something you know** — Password
* **Something you have** — OTP or security token

BehaviorAuth introduces a third layer:

* **How you behave**

During every login, the application silently records behavioral biometrics and compares them with the user's previously enrolled behavioral profile.

### Behavioral Signals Captured

| Signal                    | Description                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| ⌨️ **Keystroke Dynamics** | Measures key hold time (dwell time) and time between keystrokes (flight time). |
| 🖱️ **Mouse Movement**    | Tracks cursor movement speed, direction, velocity, and interaction patterns.   |
| 🕐 **Login Timing**       | Records the login hour and total time taken to complete the login form.        |

During the **first login**, the collected behavior is stored as the user's behavioral fingerprint.

During **subsequent logins**, the new behavior is compared against the stored profile using a weighted similarity algorithm.

* **Similarity ≥ 60%** → ✅ Access Granted
* **Similarity < 60%** → ❌ Access Denied

---

# ✨ Features

* 🔐 Behavioral biometric authentication
* ⌨️ Keystroke dynamics analysis
* 🖱️ Mouse movement tracking
* 🕒 Login time and session duration monitoring
* 📊 Weighted similarity algorithm using eight behavioral features
* 📈 Animated similarity score visualization
* 💾 Client-side profile storage using Local Storage
* ✅ Real-time username validation
* 📱 Fully responsive interface
* 🎨 Modern Glassmorphism UI with animated gradients
* ⚡ Built with pure HTML, CSS, and JavaScript (No frameworks or dependencies)

---

# 🔄 Authentication Workflow

```
User Login
      │
      ▼
Is behavioral profile available?
      │
 ┌────┴────┐
 │         │
 No       Yes
 │         │
 ▼         ▼
Enroll   Compare Behavior
Profile  With Stored Profile
 │         │
 └────┬────┘
      ▼
Similarity Score
      │
Score ≥ 60% ?
      │
 ┌────┴────┐
 │         │
Yes       No
 │         │
 ▼         ▼
Access   Access
Granted  Denied
```

# 📁 Project Structure

```
behavior-auth/
│
├── index.html
├── style.css
├── auth.js
└── README.md
```

### File Responsibilities

### index.html

* Login interface
* Behavioral metrics display
* Username validation hooks
* Result screen

### style.css

* Glassmorphism design
* Animated background effects
* Responsive layout
* Validation styles
* Button animations

### auth.js

* Username validation
* Keystroke tracking
* Mouse movement tracking
* Behavioral profile generation
* Similarity calculation
* Authentication logic
* Result rendering

---

# 🎨 Tech Stack

| Technology         | Purpose                                    |
| ------------------ | ------------------------------------------ |
| HTML5              | Page structure                             |
| CSS3               | Styling, animations, responsive design     |
| JavaScript         | Authentication logic and behavior tracking |
| Local Storage      | Client-side profile persistence            |
| Google Fonts       | Outfit & JetBrains Mono                    |

---

# ⚙️ Configuration

The authentication behavior can be customized in **auth.js**.

```javascript
const STORAGE_KEY = "behaviorAuth_v3";
const THRESHOLD = 0.60;
```

Increase the threshold to make authentication stricter.

Example:

```javascript
0.90
```

Decrease the threshold to make it more lenient.

Example:

```javascript
0.45
```

Feature weights can also be adjusted inside the similarity calculation function.

---

# ✅ Username Validation Rules

| Rule               | Description                                      |
| ------------------ | ------------------------------------------------ |
| Allowed Characters | Letters (A–Z, a–z) and digits (0–9)              |
| Blocked Characters | Spaces and special symbols                       |
| Minimum Length     | 3 characters                                     |
| Maximum Length     | 20 characters                                    |
| Live Feedback      | Green border when valid, red border when invalid |

---

# 🔭 Future Enhancements

* Secure server-side behavioral profile storage
* Password hashing using bcrypt or Argon2
* Multi-session behavioral profile averaging
* Machine Learning-based user classification
* Mobile touch gesture authentication
* Continuous authentication during active sessions
* Administrative dashboard for behavioral analytics
* Secure database integration

---

# Author : Jasvinder Kaur


