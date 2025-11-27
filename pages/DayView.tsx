import React, { useMemo, useState } from 'react';
import {
  DayData,
  RevenueData,
  CalendarEvent,
  Goal,
  Contact,
  Transaction,
  User,
  getInitialDayData,
  AIChallengeData,
  formatCurrency,
} from '../types';
import { getSalesChallenges } from '../services/geminiService';
import Calendar from '../components/Calendar';
import RevenueCard from '../components/RevenueCard';
import AIChallengeCard from '../components/AIChallengeCard';
import ProspectingKPIs from '../components/ProspectingKPIs';
import GoalsBlock from '../components/GoalsBlock';
import NewLeadsBlock from '../components/NewLeadsBlock';
import DailyFollowUps from '../components/DailyFollowUps';
import AddLeadModal from '../components/AddLeadModal';
import AddEventModal from '../components/AddEventModal';
import ViewLeadsModal from '../components/ViewLeadsModal';
import WinsTodayCard from '../components/WinsTodayCard';

interface DayViewProps {
  allData: { [key: string]: DayData };
  onDataChange: (dateKey: string, data: DayData) => Promise<void>;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onAddWin: (dateKey: string, winMessage: string) => void;
  onAddHotLead: (leadData: Omit<Contact, 'id'>) => Promise<Contact | null>;
  onUpdateHotLead: (lead: Contact) => void;
  hotLeads: Contact[];
  transactions: Transaction[];
  users: User[];
  onNavigateToRevenue: (period: 'today' | 'week' | 'month' | 'ytd' | 'mcv' | 'acv') => void;
  user: User;
}

const DayView: React.FC<DayViewProps> = ({
  allData,
  onDataChange,
  selectedDate,
  onDateChange,
  onAddWin,
  onAddHotLead,
  onUpdateHotLead,
  hotLeads,
  transactions,
  users,
  onNavigateToRevenue,
  user,
}) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isViewLeadsModalOpen, setIsViewLeadsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isAiChallengeLoading, setIsAiChallengeLoading] = useState(false);

  const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
  const currentDateKey = getDateKey(selectedDate);
  const currentData: DayData = allData[currentDateKey] || getInitialDayData();

  const updateCurrentData = async (updates: Partial<DayData>) => {
    const updatedData: DayData = {
      ...(allData[currentDateKey] || getInitialDayData()),
      ...updates,
    };
    await onDataChange(currentDateKey, updatedData);
  };

  const calculatedRevenue = useMemo<RevenueData>(() => {
    const todayKey = getDateKey(selectedDate);
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    const startOfWeekKey = getDateKey(startOfWeek);
    const endOfWeekKey = getDateKey(endOfWeek);
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    let today = 0, week = 0, month = 0, ytd = 0, mcv = 0;

    (transactions || []).forEach((t) => {
      const transactionDate = new Date(t.date + 'T00:00:00');
      if (t.date === todayKey) today += t.amount;
      if (t.date >= startOfWeekKey && t.date <= endOfWeekKey) week += t.amount;
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
        month += t.amount;
        if (t.isRecurring) mcv += t.amount;
      }
      if (transactionDate.getFullYear() === currentYear) ytd += t.amount;
    });

    const acv = mcv * 12;

    return {
      today: formatCurrency(today),
      week: formatCurrency(week),
      month: formatCurrency(month),
      ytd: formatCurrency(ytd),
      mcv: formatCurrency(mcv),
      acv: formatCurrency(acv),
    };
  }, [transactions, selectedDate]);

  const formatTime12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const appointments = useMemo(() => {
    return (currentData.events || [])
      .filter((e): e is CalendarEvent => e?.type === 'Appointment' && !!e.time)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [currentData.events]);

  const leadsAddedToday = useMemo(
    () => (hotLeads || []).filter((c) => c.dateAdded?.startsWith(currentDateKey)),
    [hotLeads, currentDateKey]
  );

  const handleEventSaved = async (savedEvent: CalendarEvent) => {
    const existingEvents = currentData.events || [];
    const updatedEvents = editingEvent
      ? existingEvents.map((e) => (e.id === savedEvent.id ? savedEvent : e))
      : [...existingEvents, savedEvent];
    await updateCurrentData({ events: updatedEvents });
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventDelete = async (eventId: string) => {
    const updatedEvents = (currentData.events || []).filter((e) => e.id !== eventId);
    await updateCurrentData({ events: updatedEvents });
  };

  return (
    <>
      <AddLeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} onSave={() => {}} />
      <AddEventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleEventSaved}
        onDelete={handleEventDelete}
        date={selectedDate}
        eventToEdit={editingEvent}
      />
      <ViewLeadsModal isOpen={isViewLeadsModalOpen} onClose={() => setIsViewLeadsModalOpen(false)} leads={leadsAddedToday} users={users} />

      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold uppercase text-brand-light-text dark:text-white">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </h2>
        <p className="text-brand-light-gray dark:text-gray-400 text-sm font-medium">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-start">
        <div className="space-y-8">
          <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
          <RevenueCard data={calculatedRevenue} onNavigate={onNavigateToRevenue} />
          <AIChallengeCard data={currentData.aiChallenge} isLoading={isAiChallengeLoading} onAcceptChallenge={async () => {}} />
        </div>

        <div className="space-y-8">
          <ProspectingKPIs contacts={currentData.prospectingContacts || []} events={currentData.events || []} />

          {/* FINAL APPOINTMENTS — CLIENT NAME FIRST, NO BULLSHIT */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-red-600">TODAY'S APPOINTMENTS</h3>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-green-700 transition"
              >
                + Add Appointment
              </button>
            </div>

            {appointments.length === 0 ? (
              <p className="text-gray-500 italic text-center py-12 text-xl">No appointments scheduled today.</p>
            ) : (
              <div className="space-y-5">
                {appointments.map((event) => (
                  <div
                    key={event.id}
                    className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                    onClick={() => {
                      setEditingEvent(event);
                      setIsEventModalOpen(true);
                    }}
                  >
                    <div className="flex items-start gap-5">
                      <input
                        type="checkbox"
                        checked={!!event.completed}
                        onClick={(e) => e.stopPropagation()}
                        onChange={async () => {
                          const updatedEvents = (currentData.events || []).map((e) =>
                            e.id === event.id ? { ...e, completed: !e.completed } : e
                          );
                          await updateCurrentData({ events: updatedEvents });
                          if (!event.completed) {
                            onAddWin(currentDateKey, `Appointment Completed: ${event.contact || event.title} at ${formatTime12Hour(event.time)}`);
                          }
                        }}
                        className="w-7 h-7 mt-1 text-green-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-green-500 cursor-pointer"
                      />

                      <div className={`flex-1 ${event.completed ? 'opacity-60' : ''}`}>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                          {event.contact || 'Unknown Client'}
                        </p>
                        {event.title && event.title !== event.contact && (
                          <p className="text-xl text-gray-600 dark:text-gray-300 mt-1">{event.title}</p>
                        )}
                        <p className="text-2xl font-bold text-red-600 mt-3">
                          {formatTime12Hour(event.time)}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DailyFollowUps hotLeads={hotLeads} onUpdateHotLead={onUpdateHotLead} selectedDate={selectedDate} onWin={(msg) => onAddWin(currentDateKey, msg)} />
          <WinsTodayCard wins={currentData.winsToday || []} />
        </div>

        <div className="space-y-8">
          <GoalsBlock
            title="Today's Top 6 Targets"
            goals={currentData.topTargets || []}
            onGoalChange={(goal, isCompletion) => handleGoalChange('topTargets', goal, isCompletion)}
          />
          <GoalsBlock
            title="Massive Action Goals"
            goals={currentData.massiveGoals || []}
            onGoalChange={(goal, isCompletion) => handleGoalChange('massiveGoals', goal, isCompletion)}
            highlight
          />
          <NewLeadsBlock
            leads={leadsAddedToday}
            userRole={user.role}
            onAddLeadClick={() => setIsLeadModalOpen(true)}
            onViewLeadsClick={() => setIsViewLeadsModalOpen(true)}
          />
        </div>
      </div>
    </>
  );
};

const handleGoalChange = () => {}; // Your real handler is probably defined elsewhere

export default DayView;
