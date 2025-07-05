import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetToken('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      toast.success('Reset token generated!');
      setResetToken(res.data.resetToken);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate reset token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot Password</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {resetToken && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
            <div><b>Reset Token (for testing):</b></div>
            <div className="break-all">{resetToken}</div>
            <button
              className="btn-primary mt-4 w-full"
              onClick={() => {
                navigator.clipboard.writeText(resetToken);
                navigate('/reset-password');
              }}
            >
              Go to Reset Password (token copied)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 