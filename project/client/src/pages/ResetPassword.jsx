import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      toast.success('Password reset successful!');
      setSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Reset Token</label>
            <input
              type="text"
              className="form-input"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
              placeholder="Paste your reset token"
            />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {success && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded text-center">
            Password has been reset! You can now log in with your new password.
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 