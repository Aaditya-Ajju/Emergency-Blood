import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  Zap,
  ChevronRight,
  Star,
  Award,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reviewAPI, appConfigAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  Heart: Heart,
  MapPin: MapPin,
  Clock: Clock,
  Users: Users,
  Shield: Shield,
  Zap: Zap,
  Award: Award, // For stats section if needed, though current stats don't use it
};

const Landing = () => {
  const [reviews, setReviews] = useState([]);
  const { user } = useAuth();
  const [features, setFeatures] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetchReviews();
    fetchAppConfig();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getAll();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews.');
    }
  };

  const fetchAppConfig = async () => {
    try {
      const featuresResponse = await appConfigAPI.getFeatures();
      setFeatures(featuresResponse.data.features);

      const statsResponse = await appConfigAPI.getStats();
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error('Error fetching app config:', error);
      toast.error('Failed to load app configuration.');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-red-800 to-red-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-900 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-15" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="relative p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-filter backdrop-blur-lg border border-white/20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                Save Lives Through Blood Donation
              </h1>
              <p className="mt-6 text-xl text-red-100 max-w-3xl mx-auto drop-shadow-sm">
                Join our community of life-savers. Connect with donors and recipients instantly,
                and make a difference in someone's life today.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-red-700 hover:bg-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Emergency Blood?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our platform makes blood donation and requests simple, fast, and reliable.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`inline-flex p-3 rounded-lg ${feature.color}`}>
                    {IconComponent && <IconComponent className="w-6 h-6" />}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-700">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-tr from-red-50 to-red-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const IconComponent = iconMap[stat.icon];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center relative p-6 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full">
                    {IconComponent && <IconComponent className="w-6 h-6 text-red-600" />}
                  </div>
                  <div className="mt-4">
                    <p className="text-4xl font-bold text-gray-900">{stat.number}</p>
                    <p className="mt-2 text-lg text-gray-700">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl drop-shadow-sm">
              What Our Users Say
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              Hear from our community of life-savers and recipients.
            </p>
            {user ? (
              <Link
                to="/feedback"
                className="mt-8 inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Give Feedback & Rate Us
                </span>
              </Link>
            ) : (
              <p className="mt-8 text-md text-gray-600">
                <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">Login</Link> to give your feedback and rate us.
              </p>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 text-base italic">"{review.comment}"</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                    <p className="font-semibold">- {review.user?.name || 'Anonymous'} (<span className="text-red-500">{review.user?.bloodGroup || 'N/A'}</span>)</p>
                    <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 p-8 rounded-2xl shadow-xl bg-white/40 backdrop-filter backdrop-blur-lg border border-white/30">
              <p className="text-lg font-semibold">No reviews yet.</p>
              <p className="mt-2 text-gray-700">Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block text-red-200">Join our community today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-red-50"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;