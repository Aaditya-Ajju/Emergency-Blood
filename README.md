# EmergencyBlood - Real-time Blood Donation Platform

A comprehensive MERN stack application that connects blood donors with those in need through real-time notifications, interactive maps, and secure authentication.

## 🩸 Features

### Core Functionality
- **Real-time Blood Requests**: Post and browse blood donation requests with live updates
- **Interactive Map**: OpenStreetMap integration showing active requests and donor locations
- **Smart Matching**: Location-based donor matching within customizable radius
- **Emergency Alerts**: Instant notifications for critical blood needs
- **Donor Profiles**: Gamification with badges and donation tracking

### Technical Features
- **JWT Authentication**: Secure user authentication with bcrypt password hashing
- **Real-time Communication**: Socket.IO for instant notifications and updates
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Location Services**: Geolocation API integration with address autocomplete
- **Data Validation**: Comprehensive input validation and error handling

## 🛠 Tech Stack

### Frontend
- **React.js** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Leaflet** - Interactive maps with OpenStreetMap
- **Axios** - HTTP client for API calls
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation middleware

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd emergency-blood-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/emergency-blood
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # CORS
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```
   
   This will start both the server (port 5000) and client (port 5173) concurrently.

### Alternative Start Methods

**Start server only:**
```bash
cd server
npm run dev
```

**Start client only:**
```bash
cd client
npm run dev
```

## 📱 Usage

### For Blood Donors
1. **Register** with your blood group and location
2. **Browse** active blood requests on the map
3. **Respond** to requests you can help with
4. **Get notified** about nearby emergency requests
5. **Track** your donations and earn badges

### For Blood Seekers
1. **Create** a blood request with patient details
2. **Specify** urgency level and required units
3. **Receive** responses from nearby donors
4. **Manage** your active requests
5. **Mark** requests as fulfilled

### Key Pages
- **Dashboard**: Overview of requests, map, and quick actions
- **Blood Requests**: Browse and filter all requests
- **Create Request**: Post new blood requests
- **Profile**: Manage account and view achievements

## 🗺 Map Features

- **Interactive Markers**: Color-coded by urgency level
- **User Location**: Shows your current position
- **Radius Filter**: Adjustable search radius (10-100km)
- **Popup Details**: Quick request information
- **Real-time Updates**: Live marker updates

## 🔔 Notification System

- **Emergency Alerts**: Critical requests notify nearby donors
- **Response Notifications**: Request creators get notified of responses
- **Donation Confirmations**: Donors receive confirmation and badges
- **Real-time Updates**: Live updates across all connected users

## 🏆 Gamification

### Donor Badges
- **First Drop**: First donation
- **Life Saver**: 5 donations
- **Blood Hero**: 10 donations
- **Guardian Angel**: 25 donations
- **Legend**: 50+ donations

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin request security
- **Helmet.js**: Security headers middleware

## 📊 Database Schema

### User Model
- Personal information (name, email, phone)
- Blood group and donor status
- Location with coordinates
- Donation history and badges
- Authentication credentials

### Blood Request Model
- Patient and requester information
- Blood requirements (group, units, urgency)
- Hospital details and location
- Request status and responses
- Fulfillment tracking

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Blood Requests
- `GET /api/blood-requests` - Get all requests (with filters)
- `POST /api/blood-requests` - Create new request
- `GET /api/blood-requests/:id` - Get specific request
- `POST /api/blood-requests/:id/respond` - Respond to request
- `POST /api/blood-requests/:id/fulfill` - Mark as fulfilled

## 🎨 Design System

### Colors
- **Primary Red**: Emergency and blood-related elements
- **Medical Blue**: Professional medical interface
- **Success Green**: Positive actions and confirmations
- **Warning Orange**: Medium priority alerts
- **Neutral Grays**: Text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300-900 range
- **Hierarchy**: Clear heading and body text distinction

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd client
npm run build
# Deploy the dist folder
```

### Backend (Heroku/Railway)
```bash
cd server
# Set environment variables
# Deploy with your preferred platform
```

### Environment Variables for Production
- Set all `.env` variables in your hosting platform
- Update `CLIENT_URL` to your frontend domain
- Use MongoDB Atlas for production database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email aadityarajwebdev@gmail.com or create an issue in the repository.

## 🙏 Acknowledgments

- OpenStreetMap for map data
- Leaflet.js for map functionality
- All the amazing open-source libraries used
- The blood donation community for inspiration

---

**Made with ❤️ for saving lives**
