import { Link } from 'react-router-dom'
import { FaTint, FaHeart, FaUsers, FaAmbulance, FaMapMarkerAlt, FaShieldAlt, FaHandHoldingHeart, FaSearch, FaPlus, FaBell } from 'react-icons/fa'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalRequests: 0,
    citiesCovered: 0,
    successRate: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stats`);
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // --- HERO SECTIONS ---
  const PublicHero = () => (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Save Lives, <span className="text-yellow-300">Donate Blood</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connect with blood donors in your area instantly. Every donation counts, every life matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              Become a Donor
            </Link>
            <Link to="/blood-request" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              Request Blood
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  const DonorHero = () => (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome Back, <span className="text-yellow-300">Hero!</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Ready to save more lives? Browse blood requests in your area and make a difference today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/find-requests" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              View Blood Requests
            </Link>
            <Link to="/dashboard" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  const ReceiverHero = () => (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Need Blood? <span className="text-yellow-300">We're Here!</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Post your blood request and connect with verified donors in your area quickly and safely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/blood-request" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              Request Blood
            </Link>
            <Link to="/find-donors" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              Find Donors
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  // --- FEATURES SECTIONS ---
  const publicFeatures = [
    {
      icon: <FaTint className="text-3xl text-primary-600" />,
      title: "Easy Blood Requests",
      description: "Post blood requests quickly and reach donors in your area instantly."
    },
    {
      icon: <FaUsers className="text-3xl text-primary-600" />,
      title: "Verified Donors",
      description: "Connect with verified blood donors who are ready to help save lives."
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-primary-600" />,
      title: "Location-Based Matching",
      description: "Find donors near you with our advanced location-based matching system."
    },
    {
      icon: <FaAmbulance className="text-3xl text-primary-600" />,
      title: "Emergency Support",
      description: "24/7 emergency blood request system for critical situations."
    },
    {
      icon: <FaHeart className="text-3xl text-primary-600" />,
      title: "Safe & Secure",
      description: "All donor information is verified and kept secure with privacy protection."
    },
    {
      icon: <FaShieldAlt className="text-3xl text-primary-600" />,
      title: "Trusted Platform",
      description: "Join thousands of users who trust our platform for blood donation needs."
    }
  ];

  const donorFeatures = [
    {
      icon: <FaHandHoldingHeart className="text-3xl text-primary-600" />,
      title: "Save Lives",
      description: "Your blood donation can save up to three lives. Be a hero today."
    },
    {
      icon: <FaSearch className="text-3xl text-primary-600" />,
      title: "Find Requests",
      description: "Browse blood requests in your area and respond to those in need."
    },
    {
      icon: <FaBell className="text-3xl text-primary-600" />,
      title: "Get Notified",
      description: "Receive notifications for urgent blood requests near you."
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-primary-600" />,
      title: "Local Impact",
      description: "Help people in your community with location-based matching."
    },
    {
      icon: <FaShieldAlt className="text-3xl text-primary-600" />,
      title: "Safe Process",
      description: "All requests are verified and your privacy is protected."
    },
    {
      icon: <FaHeart className="text-3xl text-primary-600" />,
      title: "Make a Difference",
      description: "Join thousands of donors making a real impact in society."
    }
  ];

  const receiverFeatures = [
    {
      icon: <FaPlus className="text-3xl text-primary-600" />,
      title: "Quick Requests",
      description: "Post blood requests instantly and reach verified donors quickly."
    },
    {
      icon: <FaUsers className="text-3xl text-primary-600" />,
      title: "Find Donors",
      description: "Connect with verified blood donors who are ready to help."
    },
    {
      icon: <FaAmbulance className="text-3xl text-primary-600" />,
      title: "Emergency Support",
      description: "24/7 emergency blood request system for critical situations."
    },
    {
      icon: <FaMapMarkerAlt className="text-3xl text-primary-600" />,
      title: "Local Donors",
      description: "Find donors near you with our location-based matching system."
    },
    {
      icon: <FaShieldAlt className="text-3xl text-primary-600" />,
      title: "Verified Platform",
      description: "All donor information is verified and kept secure."
    },
    {
      icon: <FaHeart className="text-3xl text-primary-600" />,
      title: "Trusted Network",
      description: "Join thousands of users who trust our platform for blood needs."
    }
  ];

  // --- CTA SECTIONS ---
  const PublicCTA = () => (
    <section className="bg-primary-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Make a Difference?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join our community of life-savers today. Your donation can save up to three lives.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Register as Donor
          </Link>
          <Link to="/find-donors" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Find Donors
          </Link>
        </div>
      </div>
    </section>
  );

  const DonorCTA = () => (
    <section className="bg-primary-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Save More Lives?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Check for new blood requests in your area. Your donation can save up to three lives.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/find-requests" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            View Requests
          </Link>
          <Link to="/dashboard" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            My Dashboard
          </Link>
        </div>
      </div>
    </section>
  );

  const ReceiverCTA = () => (
    <section className="bg-primary-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Need Blood Urgently?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Post your request and connect with verified donors quickly. We're here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/blood-request" className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Request Blood
          </Link>
          <Link to="/find-donors" className="bg-transparent border-2 border-white hover:bg-white hover:text-primary-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Find Donors
          </Link>
        </div>
      </div>
    </section>
  );

  // --- WHICH TO SHOW? ---
  const HeroSection = !isAuthenticated ? PublicHero : user?.role === 'donor' ? DonorHero : ReceiverHero;
  const features = !isAuthenticated ? publicFeatures : user?.role === 'donor' ? donorFeatures : receiverFeatures;
  const CTASection = !isAuthenticated ? PublicCTA : user?.role === 'donor' ? DonorCTA : ReceiverCTA;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section (global for all) */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className={`text-3xl md:text-4xl font-bold ${stats.totalRequests > 0 ? 'text-primary-600' : 'text-red-600'} mb-2`}>
                {loadingStats ? '...' : `${stats.totalRequests || 0}+`}
              </div>
              <div className="text-gray-600">Lives Saved</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl md:text-4xl font-bold ${stats.totalDonors > 0 ? 'text-primary-600' : 'text-red-600'} mb-2`}>
                {loadingStats ? '...' : `${stats.totalDonors || 0}+`}
              </div>
              <div className="text-gray-600">Registered Donors</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl md:text-4xl font-bold ${stats.citiesCovered > 0 ? 'text-primary-600' : 'text-red-600'} mb-2`}>
                {loadingStats ? '...' : `${stats.citiesCovered || 0}+`}
              </div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl md:text-4xl font-bold ${stats.successRate > 0 ? 'text-primary-600' : 'text-red-600'} mb-2`}>
                {loadingStats ? '...' : `${stats.successRate || 0}%`}
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {user?.role === 'donor' ? 'Why Donate with BloodConnect?' :
               user?.role === 'receiver' ? 'Why Choose BloodConnect?' :
               'Why Choose BloodConnect?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {user?.role === 'donor' ? 'Our platform makes it easy to save lives and make a real impact in your community.' :
               user?.role === 'receiver' ? 'Our platform makes blood requests simple, safe, and efficient.' :
               'Our platform makes blood donation and requests simple, safe, and efficient.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Groups Section - Only show for public/receiver */}
      {(!isAuthenticated || user?.role === 'receiver') && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Blood Group Compatibility
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Understanding blood type compatibility is crucial for safe transfusions.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bloodGroup, index) => (
                <div key={index} className="bg-primary-50 rounded-lg p-6 text-center border border-primary-200">
                  <div className="text-2xl font-bold text-primary-600 mb-2">{bloodGroup}</div>
                  <div className="text-sm text-gray-600">
                    {bloodGroup === 'O-' ? 'Universal Donor' : bloodGroup === 'AB+' ? 'Universal Receiver' : 'Compatible Groups'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

export default Home