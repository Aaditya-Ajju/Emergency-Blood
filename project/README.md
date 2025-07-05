# Blood Help Platform

A modern, full-stack web application to connect blood donors and receivers, making blood donation and emergency requests fast, secure, and efficient.

## 🚀 Project Overview
Blood Help Platform is designed to streamline the process of finding blood donors and managing blood requests. It provides a user-friendly interface for donors, receivers, and admins, with real-time notifications, secure authentication, and a robust backend.

## 🛠️ Tech Stack
- **Frontend:** React (Vite, Tailwind CSS)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Other:** Axios, React Router, Toastify, Helmet, Rate Limiting, XSS & MongoDB sanitization

## ✨ Features
- User registration & login (Donor/Receiver roles)
- Post and manage blood requests
- Donor matching and response system
- Real-time notifications (in-app)
- Password reset (secure token-based)
- Admin dashboard (user/request management)
- Stats dashboard (lives saved, donors, cities, success rate)
- Accessibility & mobile-friendly design
- Security best practices (rate limiting, sanitization, helmet)

## 🖥️ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or Atlas)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd BLOOD_HELP/project
   ```
2. **Install dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. **Configure environment variables:**
   - Create a `.env` file in `server/` with your MongoDB URI and JWT secret:
     ```env
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```
4. **Start the backend:**
   ```bash
   cd server
   npm run dev
   # or
   npm start
   ```
5. **Start the frontend:**
   ```bash
   cd ../client
   npm run dev
   ```
6. **Open your browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)



## 🤝 Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

---

> Made with ❤️ to help save lives.
