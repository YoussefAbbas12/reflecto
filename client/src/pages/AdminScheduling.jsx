import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminScheduling = React.memo(() => {
  // Simple state for today's date
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: schedulingData, isLoading } = useQuery({
    queryKey: ['adminScheduling', selectedDate],
    queryFn: () => adminService.getScheduling(selectedDate),
  });

  // Memoize extracted data
  const technicians = useMemo(() => schedulingData?.technicians || [
    { name: 'Mike Ross', status: 'Polishing - Bay 1', active: true, color: 'bg-blue-500' },
    { name: 'Jenny Wilson', status: 'Interior - Bay 3', active: true, color: 'bg-green-500' },
    { name: 'Ahmed Hassan', status: 'On Break', active: false, color: 'bg-yellow-500' },
    { name: 'Kenji Sato', status: 'Coating - Bay 2', active: true, color: 'bg-blue-500' },
  ], [schedulingData]);

  const bayCapacity = useMemo(() => schedulingData?.bay_capacity || { occupied: 6, total: 7 }, [schedulingData]);
  const bayPercent = useMemo(() => bayCapacity.total > 0 ? Math.round((bayCapacity.occupied / bayCapacity.total) * 100) : 0, [bayCapacity]);

  const quickStats = useMemo(() => schedulingData?.stats || {
    contacts: 12,
    active: 5,
    today_revenue: 4200
  }, [schedulingData]);

  // Convert raw appointments to our slot format, or fallback
  const appointments = useMemo(() => schedulingData?.appointments || [], [schedulingData]);
  
  const scheduleSlots = useMemo(() => {
    const defaultTimes = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
    
    return defaultTimes.map(time => {
      // Attempt to find an appointment matching this time slot
      const apt = appointments.find(a => {
        return a.time === time || (a.start_time && new Date(a.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) === time);
      });

      if (time === '12:00 PM') {
        return { time, spacer: 'LUNCH BREAK', job: null };
      }

      if (apt) {
        // Color map based on status
        const colorMap = {
          'in_progress': 'bg-blue-500/10 shadow-[inset_4px_0_0_#3b82f6]',
          'completed': 'bg-teal-500/10 shadow-[inset_4px_0_0_#14b8a6]',
          'pending': 'bg-yellow-500/10 shadow-[inset_4px_0_0_#eab308]',
          'cancelled': 'bg-red-500/10 shadow-[inset_4px_0_0_#ef4444]',
          'confirmed': 'bg-green-500/10 shadow-[inset_4px_0_0_#22c55e]'
        };

        return {
          time,
          job: {
            name: apt.client_name || 'Client',
            car: apt.vehicle || 'Vehicle',
            tech: apt.technician || 'Unassigned',
            status: (apt.status || 'PENDING').toUpperCase().replace('_', ' '),
            color: colorMap[apt.status] || colorMap['pending'],
            extra: apt.notes,
            right: Math.random() > 0.5 // Random stagger for visual effect
          }
        };
      }

      // Fallback static data if API is empty just to show the UI works
      if (appointments.length === 0) {
         if (time === '08:00 AM') return { time, job: { name: 'James Carter', car: 'Porsche 911 GT3 • Ceramic Coating', tech: 'Mike Ross • Bay 1', status: 'IN PROGRESS', color: 'bg-blue-500/10 shadow-[inset_4px_0_0_#3b82f6]' } };
         if (time === '09:00 AM') return { time, job: { name: 'Sarah Li', car: 'BMW X5 • Interior Detail', tech: 'Jenny Wilson • Bay 3', status: 'CONFIRMED', color: 'bg-green-500/10 shadow-[inset_4px_0_0_#22c55e]', right: true } };
         if (time === '11:00 AM') return { time, job: { name: 'Robert Fox', car: 'Mercedes S-Class • Paint Correction', status: 'PENDING', color: 'bg-yellow-500/10 shadow-[inset_4px_0_0_#eab308]' } };
         if (time === '01:00 PM') return { time, job: { name: 'Elena Gomez', car: 'Audi RS7 • Full Detail Package', tech: 'Alex • Bay 2', status: 'COMPLETED', color: 'bg-teal-500/10 shadow-[inset_4px_0_0_#14b8a6]', extra: 'Ready for pickup' } };
         if (time === '03:00 PM') return { time, job: { name: 'Arjun Singh', car: 'Tesla Model S', status: 'CANCELLED', color: 'bg-red-500/10 shadow-[inset_4px_0_0_#ef4444]' } };
      }

      return { time, job: null };
    });
  }, [appointments]);

  const pendingDispatch = useMemo(() => schedulingData?.pending_dispatch || [
    { car: 'Ferrari 488 Pista', type: 'Express Wash • VIP', time: '4:00 PM' }
  ], [schedulingData]);

  return (
    <div className="flex bg-[#000000] min-h-screen text-white overflow-hidden pt-20 font-body selection:bg-[#FF5C35]/30">
      <AdminSidebar />

      <main className="flex-1 flex flex-col xl:flex-row w-full overflow-hidden" aria-labelledby="scheduling-heading">
        <section className="flex-grow p-4 lg:p-10 border-b xl:border-b-0 xl:border-r border-white/5 w-full overflow-y-auto" aria-label="Schedule Timeline">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-6 pl-12 lg:pl-0 mt-4 lg:mt-0">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2 font-bold">
                Dashboard / Scheduling 
                <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} aria-hidden="true"></span> 
                <span aria-live="polite">{isLoading ? 'Syncing...' : `${technicians.filter(t => t.active).length} Active Techs`}</span>
              </div>
              <h1 id="scheduling-heading" className="text-4xl font-display font-black tracking-tight">Scheduling</h1>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <div className="relative shrink-0">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Search Client..." className="bg-white/[0.05] shadow-inner border-0 rounded-xl pl-12 pr-6 py-3 text-sm w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50 transition-all font-medium text-white placeholder-gray-500" aria-label="Search appointments" />
              </div>
              <Link
                to="/admin/add-client"
                className="px-6 py-3 shrink-0 bg-[#FF5C35] text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:brightness-110 shadow-[0_8px_30px_rgba(255,92,53,0.3)] transition-all active:scale-95"
                aria-label="Create a new client"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                <span className="hidden sm:inline">New Client</span>
                <span className="sm:hidden">New</span>
              </Link>
            </div>
          </header>

          <nav className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" aria-label="Date Navigation">
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto overflow-x-auto">
              <button 
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-2 text-gray-500 bg-white/[0.02] rounded-lg shadow-inner hover:text-white shrink-0 transition-colors"
                aria-label="Previous day"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              
              <h2 className="text-lg sm:text-xl font-bold whitespace-nowrap" aria-live="polite">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              
              <button 
                type="button"
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-2 text-gray-500 bg-white/[0.02] rounded-lg shadow-inner hover:text-white shrink-0 transition-colors"
                aria-label="Next day"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
            <div className="flex bg-white/[0.02] p-1 rounded-xl w-full sm:w-auto overflow-x-auto shrink-0 shadow-inner" role="group" aria-label="View mode">
              <button type="button" className="px-4 py-1.5 rounded-lg text-xs text-gray-500 font-bold whitespace-nowrap hover:bg-white/[0.05] transition-all" aria-pressed="false">Month</button>
              <button type="button" className="px-4 py-1.5 rounded-lg text-xs text-gray-500 font-bold whitespace-nowrap hover:bg-white/[0.05] transition-all" aria-pressed="false">Week</button>
              <button type="button" className="px-4 py-1.5 rounded-lg text-xs bg-[#FF5C35] text-white font-bold whitespace-nowrap shadow-md" aria-pressed="true">Day</button>
            </div>
          </nav>

          {/* Timeline Grid */}
          <div className="relative space-y-20 pt-10 overflow-x-auto w-full pb-12 pr-4 min-w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-[#000000]/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl" aria-busy="true">
                <div className="w-8 h-8 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="min-w-[600px]" role="list">
              {scheduleSlots.map((slot, i) => (
                <div key={i} className="flex relative h-0" role="listitem">
                  <div className="w-20 sm:w-24 text-[10px] text-gray-500 font-bold uppercase tracking-widest -mt-2 shrink-0">{slot.time}</div>
                  <div className="flex-grow h-[1px] bg-white/[0.05] relative shadow-inner" aria-hidden="true"></div>

                  {slot.job && (
                    <article 
                      className={`absolute top-0 rounded-2xl p-4 sm:p-6 w-[280px] sm:w-[350px] md:w-[400px] lg:w-[450px] shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-10 transition-all hover:-translate-y-6 cursor-pointer border-0 ${slot.job.color} ${slot.job.right ? 'left-[40%] sm:right-0 sm:left-auto lg:-translate-x-12 -translate-y-4' : 'left-24 sm:left-32 -translate-y-4'}`}
                      tabIndex={0}
                      aria-label={`Appointment for ${slot.job.name} at ${slot.time}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/[0.05] shadow-inner flex items-center justify-center text-xs font-bold text-white shrink-0" aria-hidden="true">
                            {slot.job.name.charAt(0)}
                          </div>
                          <h3 className="font-bold text-sm truncate max-w-[120px] sm:max-w-[200px] text-white tracking-wide">{slot.job.name}</h3>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-sm shadow-inner uppercase tracking-widest inline-block w-fit ${slot.job.status === 'COMPLETED' ? 'bg-teal-500/20 text-teal-400' : 'bg-black/40 text-gray-300'}`}>{slot.job.status}</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-300 flex items-center gap-2 mb-2 uppercase tracking-wider">
                        <svg className="shrink-0 text-gray-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
                        <span className="truncate">{slot.job.car}</span>
                      </div>
                      {slot.job.tech && (
                        <div className="text-[10px] font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                          <svg className="shrink-0 text-gray-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                          <span className="truncate">Tech: {slot.job.tech}</span>
                        </div>
                      )}
                      {slot.job.extra && (
                        <div className="mt-4 text-[10px] font-bold text-teal-400 flex items-center gap-2 uppercase tracking-wider">
                          <svg className="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                          {slot.job.extra}
                        </div>
                      )}
                    </article>
                  )}

                  {slot.spacer && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 text-[10px] text-gray-600 font-bold uppercase tracking-[0.5em] whitespace-nowrap bg-[#000000] px-4" aria-hidden="true">{slot.spacer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sidebar Widgets */}
        <aside className="w-full xl:w-[320px] lg:p-6 space-y-8 bg-white/[0.01] backdrop-blur-2xl shrink-0 border-t xl:border-t-0 border-white/[0.05] overflow-y-auto flex-1 p-4 shadow-2xl" aria-label="Status Widgets">
          <section aria-labelledby="snapshot-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="snapshot-heading" className="text-lg font-bold tracking-tight">Snapshot</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border-0 shadow-inner p-4 rounded-xl flex flex-col items-center">
                <div className="text-2xl font-bold text-white drop-shadow-md">{quickStats.contacts}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Contacts</div>
              </div>
              <div className="bg-white/[0.02] border-0 shadow-inner p-4 rounded-xl flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-400 drop-shadow-md">{quickStats.active}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Active</div>
              </div>
              <div className="bg-white/[0.02] border-0 shadow-inner p-4 rounded-xl flex flex-col items-center col-span-2">
                <div className="text-2xl font-bold text-[#FF5C35] drop-shadow-md">${(quickStats.today_revenue || 0).toLocaleString()}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Today's Revenue</div>
              </div>
            </div>
          </section>

          <section className="bg-white/[0.02] border-0 shadow-inner p-6 rounded-xl" aria-labelledby="capacity-heading">
            <div className="flex justify-between items-center mb-4">
              <h2 id="capacity-heading" className="text-sm font-bold text-gray-200 uppercase tracking-widest">Bay Capacity</h2>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{bayPercent}% Load</span>
            </div>
            <div className="h-2 w-full bg-black/50 rounded-full mb-4 overflow-hidden shadow-inner" role="progressbar" aria-valuenow={bayPercent} aria-valuemin="0" aria-valuemax="100">
              <div className="h-full bg-gradient-to-r from-[#FF5C35] to-[#ff8060] rounded-full shadow-[0_0_10px_rgba(255,92,53,0.5)] transition-all duration-1000" style={{ width: `${bayPercent}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <span>Occupied: {bayCapacity.occupied}</span>
              <span>Total: {bayCapacity.total}</span>
            </div>
          </section>

          <section className="bg-white/[0.02] border-0 shadow-inner p-6 rounded-xl" aria-labelledby="tech-status-heading">
            <h2 id="tech-status-heading" className="text-sm font-bold text-gray-200 mb-6 tracking-widest uppercase">Technician Status</h2>
            <div className="space-y-4">
              {technicians.map((tech, i) => (
                <article key={i} className="flex items-center gap-3 group cursor-pointer bg-white/[0.02] p-3 rounded-xl border-0 shadow-sm hover:bg-white/[0.05] transition-all">
                  <div className="w-8 h-8 rounded-full bg-white/[0.05] shadow-inner flex items-center justify-center font-bold text-xs shrink-0" aria-hidden="true">
                    {tech.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-200 truncate tracking-wide">{tech.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 shadow-sm ${tech.active ? tech.color : 'bg-gray-700'}`} aria-hidden="true"></span>
                      <span className="truncate">{tech.status}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white/[0.02] border-0 shadow-inner p-6 rounded-xl" aria-labelledby="dispatch-heading">
            <h2 id="dispatch-heading" className="text-sm font-bold text-gray-200 mb-6 tracking-widest uppercase">Pending Dispatch</h2>
            <div className="space-y-4">
              {pendingDispatch.map((pd, idx) => (
                <article key={idx} className="p-4 bg-white/[0.02] border-0 shadow-sm rounded-xl relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF5C35] shadow-[0_0_10px_rgba(255,92,53,0.8)]" aria-hidden="true"></div>
                  <div className="flex justify-between mb-4 pl-3">
                    <div className="overflow-hidden pr-2">
                      <h3 className="font-bold text-xs truncate text-white tracking-wide">{pd.car}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate mt-1">{pd.type}</p>
                    </div>
                    <span className="text-[#FF5C35] font-bold text-[10px] uppercase tracking-widest shrink-0">{pd.time}</span>
                  </div>
                  <button type="button" className="w-full py-2.5 bg-white/[0.05] hover:bg-[#FF5C35] shadow-inner text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-[#FF5C35]/50">Assign Bay</button>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
});

export default AdminScheduling;
