import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reviewAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const GiveFeedback = () => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (rating === 0) {
      toast.error('Please give a star rating.');
      setIsLoading(false);
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment.');
      setIsLoading(false);
      return;
    }

    try {
      await reviewAPI.create({ rating, comment });
      toast.success('Feedback submitted successfully!');
      setRating(0);
      setComment('');
      navigate('/homepage2');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold text-gray-900 drop-shadow-sm text-center mb-6">Give Us Your Feedback!</h2>
        <p className="text-center text-gray-700 mb-8">Your valuable feedback helps us improve and save more lives.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2 text-center">Your Rating <span className="text-red-600">*</span></label>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <Star
                    key={starValue}
                    className={`h-10 w-10 cursor-pointer transition-colors duration-200
                      ${starValue <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }`}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-800 mb-1">Your Comments <span className="text-red-600">*</span></label>
            <textarea
              id="comment"
              name="comment"
              rows="6"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white/70 text-gray-900 placeholder-gray-500 focus:bg-white transition-all duration-200"
              placeholder="Share your experience or suggestions here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-base font-medium text-white bg-red-700 hover:bg-red-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Submitting...' : 'Submit Feedback'}
            </span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default GiveFeedback; 