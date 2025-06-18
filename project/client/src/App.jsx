import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Homepage2 from './pages/Homepage2';
import Profile from './pages/Profile';
import Map from './pages/Map';
import CreateRequest from './pages/CreateRequest';
import RequestDetails from './pages/RequestDetails';
import RespondToRequest from './pages/RespondToRequest';
import PublicRoute from './components/PublicRoute';
import GiveFeedback from './pages/GiveFeedback';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">
              <Routes>
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/homepage2"
                  element={
                    <ProtectedRoute>
                      <Homepage2 />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feedback"
                  element={
                    <ProtectedRoute>
                      <GiveFeedback />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/map"
                  element={
                    <ProtectedRoute>
                      <Map />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-request"
                  element={
                    <ProtectedRoute>
                      <CreateRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests/:id"
                  element={
                    <ProtectedRoute>
                      <RequestDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests/:id/respond"
                  element={
                    <ProtectedRoute>
                      <RespondToRequest />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;