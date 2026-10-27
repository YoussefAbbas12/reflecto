import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const EmployeeCodeBadge = ({ className = '', isLight = false, variant = 'compact' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const employeeCode = user?.employee_code || null;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!employeeCode) return;
    navigator.clipboard.writeText(employeeCode);
    setCopied(true);
    toast.success('تم نسخ الرقم الوظيفي إلى الحافظة');
    setTimeout(() => setCopied(false), 2000);
  };

  // Don't render if no code assigned yet
  if (!employeeCode) return null;


  if (variant === 'hero') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold transition-all shadow-sm ${
          isLight
            ? 'bg-purple-50/80 border-purple-200 text-[#5C24EB]'
            : 'bg-[#5C24EB]/15 border-[#5C24EB]/30 text-[#A78BFA]'
        } ${className}`}
        dir="rtl"
      >
        <span className="material-symbols-outlined text-sm">badge</span>
        <span className="text-[11px] text-gray-400 font-medium">الرقم الوظيفي:</span>
        <span className="font-mono tracking-wider font-extrabold text-white bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
          {employeeCode}
        </span>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          title="نسخ الرقم الوظيفي"
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white cursor-pointer"
        >
          <span className="material-symbols-outlined text-[15px]">
            {copied ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>
    );
  }

  // Default: Compact variant (for headers next to name)
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-bold transition-all ${
        isLight
          ? 'bg-purple-50 border-purple-200 text-[#5C24EB]'
          : 'bg-[#5C24EB]/15 border-[#5C24EB]/30 text-[#A78BFA]'
      } ${className}`}
      dir="rtl"
    >
      <span className="material-symbols-outlined text-[13px] opacity-80">badge</span>
      <span className="font-mono tracking-wider font-extrabold text-[11px]">
        {employeeCode}
      </span>

      {/* Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        title="نسخ الرقم الوظيفي"
        className="p-0.5 hover:bg-white/10 rounded transition-colors text-gray-300 hover:text-white cursor-pointer inline-flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-[13px]">
          {copied ? 'check' : 'content_copy'}
        </span>
      </button>
    </div>
  );
};

export default EmployeeCodeBadge;
