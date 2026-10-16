import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon';

const ResetPasswordView = React.memo(() => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const resetToken = sessionStorage.getItem('reflecto_reset_token');

  useEffect(() => {
    if (!resetToken) {
      toast.error('Reset session expired. Please start over.');
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, navigate, toast]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, password);

      sessionStorage.removeItem('reflecto_reset_token');

      toast.success('Password reset successfully! Please log in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, resetToken, toast, navigate]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 bg-[#000000]" aria-labelledby="reset-heading">
      <div className="w-full max-w-xl text-center">
        <div className="w-16 h-16 bg-[#FF5C35]/10 shadow-[0_8px_30px_rgba(255,92,53,0.15)] rounded-2xl flex items-center justify-center text-2xl text-[#FF5C35] mx-auto mb-10">
          <Icon name="lock_reset" aria-hidden="true" />
        </div>

        <h1 id="reset-heading" className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tighter text-white">
          NEW <span className="text-[#FF5C35]">PASSWORD</span>
        </h1>
        <p className="text-gray-400 mb-12 font-light">Create a new password for your account</p>

        <form 
          onSubmit={handleSubmit}
          className="bg-white/[0.02] p-10 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden group"
        >
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF5C35] blur-[120px] opacity-20 transition-opacity group-hover:opacity-30 pointer-events-none" aria-hidden="true"></div>

          <div className="text-left mb-6">
            <label htmlFor="password-input" className="block text-sm font-bold text-gray-200 mb-3">New Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.05] shadow-inner rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all"
              placeholder="Minimum 6 characters"
              disabled={isLoading}
              required
            />
          </div>

          <div className="text-left mb-8">
            <label htmlFor="confirm-password-input" className="block text-sm font-bold text-gray-200 mb-3">Confirm New Password</label>
            <input
              id="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/[0.05] shadow-inner rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all"
              placeholder="Re-enter new password"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#FF5C35] text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(255,92,53,0.3)] hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status">
                  <span className="sr-only">Resetting...</span>
                </div>
                Resetting...
              </>
            ) : (
              <>
                Reset Password
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
});

export default ResetPasswordView;
