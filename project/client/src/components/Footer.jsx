import { FaTint, FaHeart, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
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
              Connecting blood donors with recipients in need. Together, we save lives and build a healthier community.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <FaHeart className="text-primary-500" />
              <span>Made with love to save lives</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/find-donors" className="hover:text-primary-500 transition-colors">Find Donors</Link></li>
              <li><Link to="/blood-request" className="hover:text-primary-500 transition-colors">Request Blood</Link></li>
              <li><Link to="/emergency" className="hover:text-primary-500 transition-colors">Emergency</Link></li>
              <li><Link to="/register" className="hover:text-primary-500 transition-colors">Become a Donor</Link></li>
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