import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Icon from '../components/Icon';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 300; // 5 minutes in seconds

// 1. Extracted to module scope to avoid recreation on every render
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const OTPView = React.memo(() => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const inputs = useRef([]);
  const { phone, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!phone) {
      navigate('/login', { replace: true });
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // 2. Wrap event handlers in useCallback
  const handleChange = useCallback((value, index) => {
    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      newOtp[index] = value.slice(-1);
      
      // Focus next input automatically
      if (value && index < OTP_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      }
      return newOtp;
    });
  }, []);

  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === 0) return;

    setOtp((prevOtp) => {
      const newOtp = [...prevOtp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      return newOtp;
    });

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputs.current[nextIndex]?.focus();
  }, []);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault(); // Handle standard form submission
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      toast.warning('Please enter the full 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyOTP(phone, code, false, 'client');
      login({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        user: res.user,
      });

      sessionStorage.removeItem('reflecto_otp_phone');
      toast.success(`Welcome back, ${res.user?.full_name || 'User'}!`);

      const isStaff = res.user && (res.user.role === 'admin' || res.user.role === 'super_admin' || Boolean(res.user.is_super_admin) || Boolean(res.user.role_id) || (res.user.role && res.user.role !== 'client' && res.user.role !== 'technician'));
      if (isStaff) {
        navigate('/admin', { replace: true });
      } else if (res.user?.role === 'technician') {
        navigate('/technician', { replace: true });
      } else {
        navigate('/clientDashboard', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP code. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }, [otp, phone, login, navigate, toast]);

  const handleResend = useCallback(async () => {
    if (resendTimer > 0) return;

    try {
      const res = await authService.sendOTP(phone);
      setResendTimer(RESEND_COOLDOWN);

      toast.success('A new code has been sent');
    } catch (err) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  }, [phone, resendTimer, toast]);

  // 3. Memoize computed values
  const maskedPhone = useMemo(() => phone ? `****${phone.slice(-4)}` : 'your phone', [phone]);

  return (
    // Replaced generic div with <main> for a11y, set to #000000 background
    <main className="min-h-[70vh] flex items-center justify-center px-6 bg-[#000000]" aria-labelledby="otp-heading">
      <div className="w-full max-w-xl text-center">
        
        {/* Adherence: Removed border, used glass/shadow approach */}
        <div className="w-16 h-16 bg-[#FF5C35]/10 shadow-[0_8px_30px_rgba(255,92,53,0.15)] rounded-2xl flex items-center justify-center text-2xl text-[#FF5C35] mx-auto mb-10">
          <Icon name="shield" aria-hidden="true" />
        </div>

        <h1 id="otp-heading" className="text-2xl md:text-4xl font-display font-bold mb-4 tracking-tighter text-white">
          CLIENT <span className="text-[#FF5C35]">DASHBOARD</span>
        </h1>
        <p className="text-gray-400 mb-12 font-light">Access your service history and rewards</p>

        {/* Changed div to <form> for semantic structure & native 'Enter' key submission */}
        <form 
          dir='ltr'
          onSubmit={handleSubmit}
          className="bg-white/[0.02] p-10 rounded-3xl shadow-2xl backdrop-blur-2xl relative overflow-hidden group"
          aria-labelledby="otp-instructions"
        >
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FF5C35] blur-[120px] opacity-20 pointer-events-none" aria-hidden="true"></div>

          <div className="text-left mb-10" id="otp-instructions">
            <h2 className="font-bold text-gray-200 mb-1 text-xl">Enter OTP Code</h2>
            <p className="text-gray-500 text-sm">We've sent a 6-digit code to {maskedPhone}</p>
          </div>

          {/* Grouped inputs semantically */}
          <fieldset className="border-none p-0 m-0">
            <legend className="sr-only">6-digit OTP code</legend>
            <div className="flex justify-between gap-2 sm:gap-3 mb-10">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  // Adherence: Removed hard borders, added soft glass background and focus shadow ring
                  className="w-full aspect-square bg-white/[0.05] shadow-inner rounded-xl text-center text-2xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 focus:bg-white/[0.1] transition-all disabled:opacity-50"
                  maxLength={1}
                  disabled={isLoading}
                  aria-label={`Digit ${idx + 1} of OTP`}
                  required
                />
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-5 bg-[#FF5C35] text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(255,92,53,0.3)] hover:brightness-110 transition-all mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status">
                  <span className="sr-only">Verifying code...</span>
                </div>
                Verifying...
              </>
            ) : (
              <>
                Verify & login
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </>
            )}
          </button>

          <div className="flex items-center justify-between">
            <Link
              to="/login"
              // Added focus ring for keyboard navigability
              className="text-gray-500 text-sm hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded px-2 py-1"
            >
              Change phone number
            </Link>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0}
              aria-live="polite"
              // Added focus ring for keyboard navigability
              className="text-sm transition-colors disabled:text-gray-600 disabled:cursor-not-allowed text-[#FF5C35] hover:text-[#ff8060] focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 rounded px-2 py-1"
            >
              {resendTimer > 0
                ? `Resend in ${formatTime(resendTimer)}`
                : 'Resend OTP'
              }
            </button>
          </div>
        </form>
      </div>
    </main>
  );
});

export default OTPView;
