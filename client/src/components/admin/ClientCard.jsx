import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import { useLanguage } from '../../hooks/useLanguage';

const ClientCard = React.memo(({
  id,
  name,
  role,
  status,
  company,
  company_name,
  company_discount_percent,
  branch_name,
  email,
  avatarUrl,
  isActiveStatus,
  gradientColorClass,
  onDelete
}) => {
  const { hasPermission } = useAuth();
  const { isLight } = useAdminTheme();
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const canEdit = hasPermission('edit_client');
  const canDelete = hasPermission('delete_client');

  const handleEditClick = (e) => {
    if (!canEdit) {
      e.preventDefault();
      alert(isArabic ? 'عفواً، ليس لديك صلاحية تعديل بيانات العملاء (edit_client)' : 'You do not have permission to edit clients');
    }
  };

  const handleDeleteClick = (e) => {
    if (!canDelete) {
      e.preventDefault();
      alert(isArabic ? 'عفواً، ليس لديك صلاحية حذف العملاء (delete_client)' : 'You do not have permission to delete clients');
      return;
    }
    if (onDelete) onDelete(id, name);
  };

  return (
    <article className={`group rounded-2xl overflow-hidden transition-all duration-300 border ${
      isLight
        ? 'bg-white border-gray-200 shadow-sm hover:border-[#5C24EB]/40 hover:shadow-lg'
        : 'bg-[#000000]/40 backdrop-blur-3xl border-white/5 hover:border-[#5C24EB]/40 hover:shadow-[0_20px_50px_rgba(92,36,235,0.2)]'
    }`}>
      <header className={`h-24 relative overflow-hidden ${isLight ? 'bg-gradient-to-r from-purple-50 to-indigo-50/50' : 'bg-white/[0.02]'}`}>
        {gradientColorClass && (
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${gradientColorClass} to-transparent`} aria-hidden="true"></div>
        )}
      </header>
      <div className="px-6 pb-6 -mt-10 relative">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mb-4 group-hover:scale-105 transition-transform overflow-hidden shadow-sm border ${
          isLight ? 'bg-white border-gray-200 text-[#5C24EB]' : 'bg-white/[0.05] border-white/10 text-white backdrop-blur-md'
        }`}>
          {avatarUrl ? (
            <picture>
              <img alt={`Profile of ${name || 'Unknown Client'}`} className="w-full h-full object-cover" src={avatarUrl} loading="lazy" decoding="async" />
            </picture>
          ) : (
            <span className="tracking-widest uppercase">{name ? name.charAt(0).toUpperCase() : '?'}</span>
          )}
        </div>
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 mr-2">
            <h3 className={`font-display font-black tracking-wider uppercase text-[13px] leading-tight group-hover:text-[#8B5CF6] transition-colors truncate ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}>
              {name || 'Unknown Client'}
            </h3>
            <p className={`text-[10px] font-bold tracking-wider uppercase mt-1 truncate ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{role}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0 border ${
              isActiveStatus
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
                : isLight
                ? 'bg-gray-100 text-gray-500 border-gray-200'
                : 'bg-white/[0.05] text-gray-400 border-white/5'
            }`}
          >
            {status}
          </span>
        </div>

        {/* Corporate & Branch Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {company_name && (
            <span className="px-2.5 py-1 bg-[#5C24EB]/15 border border-[#5C24EB]/30 text-[#8B5CF6] rounded-md text-[10px] font-bold truncate">
              🏢 {company_name} ({company_discount_percent}%)
            </span>
          )}
          {branch_name && (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold truncate border ${
              isLight ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-white/5 border-white/10 text-gray-300'
            }`}>
              📍 {branch_name}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          <div className={`flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            <span className={`material-symbols-outlined text-[16px] p-1.5 rounded-lg ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/[0.05]'}`} aria-hidden="true">
              directions_car
            </span>
            <span className="truncate">{company}</span>
          </div>
          <div className={`flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            <span className={`material-symbols-outlined text-[16px] p-1.5 rounded-lg ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-white/[0.05]'}`} aria-hidden="true">
              mail
            </span>
            <span className="truncate font-mono">{email}</span>
          </div>
        </div>
        <footer className={`mt-6 pt-5 border-t flex gap-2.5 ${isLight ? 'border-gray-100' : 'border-white/[0.05]'}`}>
          <Link
            to={canEdit ? `/admin/edit-client?id=${id}` : '#'}
            onClick={handleEditClick}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-center transition-colors border ${
              isLight 
                ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700' 
                : 'bg-white/[0.05] border-white/5 text-[#8B5CF6] hover:bg-white/[0.1]'
            } ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
          >
            {isArabic ? 'تعديل' : 'Edit'}
          </Link>
          <Link 
            to={`/admin/client-details?id=${id}`} 
            className="flex-1 py-2.5 rounded-xl bg-[#5C24EB]/15 text-[#8B5CF6] hover:bg-[#5C24EB] hover:text-white font-bold text-xs active:scale-95 transition-all text-center border border-[#5C24EB]/30"
          >
            {isArabic ? 'تفاصيل' : 'Details'}
          </Link>
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold text-xs active:scale-95 transition-all border border-red-500/20 flex items-center justify-center cursor-pointer ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
            title="Delete Client"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </footer>
      </div>
    </article>
  );
});

export default ClientCard;
