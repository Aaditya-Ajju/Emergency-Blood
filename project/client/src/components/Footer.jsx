import { FaTint, FaHeart, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHandHoldingHeart, FaSearch, FaPlus, FaBell } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Footer = () => {
  const { user, isAuthenticated } = useAuth();

  // Donor-specific quick links
  const donorLinks = [
    { to: "/find-requests", text: "Blood Requests" },
    { to: "/dashboard", text: "My Dashboard" },
    { to: "/emergency", text: "Emergency" },
    { to: "/profile", text: "My Profile" }
  ];

  // Receiver-specific quick links
  const receiverLinks = [
    { to: "/find-donors", text: "Find Donors" },
    { to: "/blood-request", text: "Request Blood" },
    { to: "/emergency", text: "Emergency" },
    { to: "/profile", text: "My Profile" }
  ];

  // General quick links for non-authenticated users
  const generalLinks = [
    { to: "/find-donors", text: "Find Donors" },
    { to: "/blood-request", text: "Request Blood" },
    { to: "/emergency", text: "Emergency" },
    { to: "/register", text: "Become a Donor" }
  ];

  // Choose links based on user role
  const quickLinks = user?.role === 'donor' ? donorLinks : 
                     user?.role === 'receiver' ? receiverLinks : 
                     generalLinks;

  // Donor-specific description
  const donorDescription = "Join our community of life-savers. Your blood donation can save up to three lives. Together, we build a healthier community.";

  // Receiver-specific description
  const receiverDescription = "Connect with verified blood donors in your area. Our platform makes it easy to find the blood you need quickly and safely.";

  // General description for non-authenticated users
  const generalDescription = "Connecting blood donors with recipients in need. Together, we save lives and build a healthier community.";

  // Choose description based on user role
  const description = user?.role === 'donor' ? donorDescription : 
                      user?.role === 'receiver' ? receiverDescription : 
                      generalDescription;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <FaTint className="text-primary-500 text-2xl" />
              <span className="text-xl font-bold">BloodConnect</span>
            </div>
            <p className="text-gray-400 mb-4">
              {description}
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <FaHeart className="text-primary-500" />
              <span>
                {user?.role === 'donor' ? 'Made with love to save lives' :
                 user?.role === 'receiver' ? 'Made with care for your needs' :
                 'Made with love to save lives'}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {user?.role === 'donor' ? 'Donor Links' :
               user?.role === 'receiver' ? 'Receiver Links' :
               'Quick Links'}
            </h3>
            <ul className="space-y-2 text-gray-400">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.to} className="hover:text-primary-500 transition-colors">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <FaPhone className="text-primary-500" />
                <a href="tel:9798503975" className="hover:text-primary-500 transition-colors">9798503975</a>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope className="text-primary-500" />
                <a href="mailto:aadityarajwebdev@gmail.com" className="hover:text-primary-500 transition-colors">aadityarajwebdev@gmail.com</a>
              </div>
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-primary-500" />
                <span>123 Health St, City, State</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BloodConnect. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer