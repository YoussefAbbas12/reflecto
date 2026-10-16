import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon';

const ForgotPasswordView = React.memo(() => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setPhone: savePhone } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) {
      toast.warning('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendResetOTP(trimmed);

      savePhone(trimmed);

      toast.success(res.message || 'OTP sent successfully');

      navigate('/forgot-password/otp');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [phone, savePhone, toast, navigate]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 bg-[#000000]" aria-labelledby="forgot-heading">
      <div className="w-full max-w-xl text-center">
        <div className="w-16 h-16 bg-[#FF5C35]/10 shadow-[0_8px_30px_rgba(255,92,53,0.15)] rounded-2xl flex items-center justify-center text-2xl text-[#FF5C35] mx-auto mb-10">
          <Icon name="lock_reset" aria-hidden="true" />
        </div>

        <h1 id="forgot-heading" className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tighter text-white">
          FORGOT <span className="text-[#FF5C35]">PASSWORD</span>
        </h1>
        <p className="text-gray-400 mb-12 font-light">Enter your phone number to receive a verification code</p>

        <form 
          onSubmit={handleSubmit}
          className="bg-white/[0.02] p-10 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden group"
        >
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF5C35] blur-[120px] opacity-20 transition-opacity group-hover:opacity-30 pointer-events-none" aria-hidden="true"></div>

          <div className="text-left mb-8">
            <label htmlFor="phone-input" className="block text-sm font-bold text-gray-200 mb-3">Phone Number</label>
            <input
              id="phone-input"
              type="text"
              value={phone}
              onChange={(e) => {
                let val = e.target.value;
                if (val.startsWith('0')) val = val.replace(/^0+/, '');
                setPhone(val);
              }}
              className="w-full bg-white/[0.05] shadow-inner rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all"
              placeholder="+966 501234567"
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
                  <span className="sr-only">Sending OTP...</span>
                </div>
                Sending...
              </>
            ) : (
              <>
                Send Verification Code
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
});

export default ForgotPasswordView;
