import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  const canEdit = hasPermission('edit_client');
  const canDelete = hasPermission('delete_client');

  const handleEditClick = (e) => {
    if (!canEdit) {
      e.preventDefault();
      alert('عفواً، ليس لديك صلاحية تعديل بيانات العملاء (edit_client)');
    }
  };

  const handleDeleteClick = (e) => {
    if (!canDelete) {
      e.preventDefault();
      alert('عفواً، ليس لديك صلاحية حذف العملاء (delete_client)');
      return;
    }
    if (onDelete) onDelete(id, name);
  };

  return (
    <article className="group bg-[#000000]/40 backdrop-blur-3xl rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 border-0 hover:shadow-[0_20px_50px_rgba(255,92,53,0.15)]">
      <header className="h-24 bg-white/[0.02] relative overflow-hidden shadow-inner">
        {gradientColorClass && (
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${gradientColorClass} to-transparent`} aria-hidden="true"></div>
        )}
      </header>
      <div className="px-6 pb-6 -mt-10 relative">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.05] flex items-center justify-center text-3xl font-black text-white shadow-inner mb-4 group-hover:scale-105 transition-transform overflow-hidden backdrop-blur-md">
          {avatarUrl ? (
            <picture>
              <img alt={`Profile of ${name || 'Unknown Client'}`} className="w-full h-full object-cover" src={avatarUrl} loading="lazy" decoding="async" />
            </picture>
          ) : (
            <span className="opacity-50 tracking-widest uppercase">{name ? name.charAt(0).toUpperCase() : '?'}</span>
          )}
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-black tracking-widest uppercase text-[13px] leading-tight group-hover:text-[#FF5C35] transition-colors text-white">
              {name || 'Unknown Client'}
            </h3>
            <p className="text-[10px] font-bold tracking-widest uppercase mt-1 text-gray-400">{role}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-inner border-0 ${
              isActiveStatus
                ? 'bg-green-500/10 text-green-500'
                : 'bg-white/[0.05] text-gray-400'
            }`}
          >
            {status}
          </span>
        </div>

        {/* Corporate & Branch Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {company_name && (
            <span className="px-2.5 py-1 bg-[#FF5C35]/15 border border-[#FF5C35]/30 text-[#FF5C35] rounded-md text-[10px] font-bold truncate">
              🏢 {company_name} ({company_discount_percent}%)
            </span>
          )}
          {branch_name && (
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-[10px] font-bold truncate">
              📍 {branch_name}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <span className="material-symbols-outlined text-[16px] bg-white/[0.05] p-1.5 rounded-lg shadow-inner" aria-hidden="true">
              directions_car
            </span>
            <span className="truncate">{company}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <span className="material-symbols-outlined text-[16px] bg-white/[0.05] p-1.5 rounded-lg shadow-inner" aria-hidden="true">
              mail
            </span>
            <span className="truncate">{email}</span>
          </div>
        </div>
        <footer className="mt-6 pt-6 border-t border-white/[0.05] flex gap-3">
          <Link
            to={canEdit ? `/admin/edit-client?id=${id}` : '#'}
            onClick={handleEditClick}
            className={`flex-1 py-3 rounded-xl bg-white/[0.05] font-black text-[10px] uppercase tracking-widest text-[#FF5C35] hover:bg-white/[0.1] transition-colors text-center shadow-inner border-0 ${!canEdit ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
          >
            تعديل (Edit)
          </Link>
          <Link to={`/admin/client-details?id=${id}`} className="flex-1 py-3 rounded-xl bg-[#FF5C35]/10 text-[#FF5C35] hover:bg-[#FF5C35] hover:text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center shadow-inner border-0">
            تفاصيل
          </Link>
          <button
            type="button"
            onClick={handleDeleteClick}
            className={`p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-inner border-0 flex items-center justify-center cursor-pointer ${!canDelete ? 'opacity-40 filter grayscale cursor-not-allowed' : ''}`}
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
