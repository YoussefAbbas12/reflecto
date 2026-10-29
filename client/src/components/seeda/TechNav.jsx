import React from 'react';
import { Home, ClipboardList, CalendarDays, LayoutGrid, Clock, History, Wallet, Bell, LogOut, Globe } from 'lucide-react';
import { Logo } from './Brand';

export function TechBottomNav({ activeTab, onSelectTab, isArabic, unreadCount = 0 }) {
  const items = [
    { id: 'home', label: isArabic ? 'الرئيسية' : 'Home', icon: Home },
    { id: 'tasks', label: isArabic ? 'المهام' : 'Tasks', icon: ClipboardList },
    { id: 'schedule', label: isArabic ? 'المواعيد' : 'Schedule', icon: CalendarDays },
    { id: 'more', label: isArabic ? 'المزيد' : 'More', icon: LayoutGrid },
  ];

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 shadow-nav backdrop-blur lg:hidden" aria-label="main">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map((it) => {
          const active = activeTab === it.id;
          const Icon = it.icon;
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => onSelectTab(it.id)}
                className={`flex w-full flex-col items-center gap-1 pb-1.5 pt-2.5 text-[11px] font-medium transition ${
                  active ? 'text-brand-700' : 'text-ink-muted hover:text-ink'
                }`}
              >
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${active ? 'bg-brand-50' : ''}`}>
                  <Icon className="h-[21px] w-[21px]" strokeWidth={active ? 2.2 : 1.7} />
                </span>
                <span>{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TechSideNav({ activeTab, onSelectTab, user, onLogout, onToggleLang, isArabic, unreadCount = 0 }) {
  const mainItems = [
    { id: 'home', label: isArabic ? 'الرئيسية' : 'Home', icon: Home },
    { id: 'tasks', label: isArabic ? 'المهام' : 'Tasks', icon: ClipboardList },
    { id: 'schedule', label: isArabic ? 'المواعيد' : 'Schedule', icon: CalendarDays },
    { id: 'more', label: isArabic ? 'المزيد' : 'More', icon: LayoutGrid },
  ];

  const extraItems = [
    { id: 'attendance', label: isArabic ? 'الحضور والانصراف' : 'Attendance', icon: Clock },
    { id: 'history', label: isArabic ? 'سجل العمليات' : 'Task History', icon: History },
    { id: 'commissions', label: isArabic ? 'العمولات والمستحقات' : 'Commissions & Earnings', icon: Wallet },
    { id: 'notifications', label: isArabic ? 'الإشعارات' : 'Notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-line bg-white p-4 lg:flex select-none">
      <div className="mb-8 mt-2 px-2 flex items-center justify-between">
        <Logo height={30} />
      </div>

      <nav className="space-y-1">
        {mainItems.map((it) => {
          const active = activeTab === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelectTab(it.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-soft hover:bg-surface-sunken'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <p className="mb-2 mt-6 px-3 text-2xs font-semibold uppercase tracking-wide text-ink-faint">
        {isArabic ? 'سجلي ومستنداتي' : 'My Records'}
      </p>

      <nav className="space-y-1">
        {extraItems.map((it) => {
          const active = activeTab === it.id;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelectTab(it.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-soft hover:bg-surface-sunken'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                <span>{it.label}</span>
              </span>
              {Boolean(it.badge) && it.badge > 0 && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-bad-600 text-2xs font-bold text-white">
                  {it.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 pt-4 border-t border-line-soft">
        <button
          type="button"
          onClick={onToggleLang}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-ink-muted hover:bg-surface-sunken transition"
        >
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{isArabic ? 'English' : 'العربية'}</span>
          </span>
          <span className="text-2xs text-brand-700 font-semibold">{isArabic ? 'EN' : 'AR'}</span>
        </button>

        <div className="rounded-xl bg-surface-subtle p-3 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="truncate text-sm font-semibold text-ink">{user?.full_name || (isArabic ? 'فني سيدا' : 'Technician')}</p>
            <p className="truncate text-xs text-ink-muted">{user?.employee_code || 'RT-001'} · {user?.branch_name || 'جدة'}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={isArabic ? 'تسجيل الخروج' : 'Logout'}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-bad-50 hover:text-bad-600 transition"
          >
            <LogOut className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </aside>
  );
}
