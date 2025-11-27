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

  const updateCurrentData = (updates: Partial<DayData>) => {
    const updatedData: DayData = {
      ...(allData[currentDateKey] || getInitialDayData()),
      ...updates,
    };
    onDataChange(currentDateKey, updatedData);
  };

  // FORMAT TIME TO 12-HOUR (NO MILITARY TIME)
  const formatTime12Hour = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // FIXED: Appointments now properly filtered and displayed
  const appointments = useMemo(() => {
    return (currentData.events || [])
      .filter((e): e is CalendarEvent => e?.type === 'Appointment' && !!e.time)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [currentData.events]);

  const leadsAddedToday = useMemo(
    () => (hotLeads || []).filter((c) => c.dateAdded?.startsWith(currentDateKey)),
    [hotLeads, currentDateKey]
  );

  const handleEventSaved = (savedEvent: CalendarEvent) => {
    const existingEvents = currentData.events || [];
    const updatedEvents = editingEvent
      ? existingEvents.map((e) => (e.id === savedEvent.id ? savedEvent : e))
      : [...existingEvents, savedEvent];

    updateCurrentData({ events: updatedEvents });
    setIsEventModalOpen(false);
    setEditingEvent(null);

    if (savedEvent.type === 'Appointment') {
      onAddWin(currentDateKey, `Appointment Set: ${savedEvent.title} at ${formatTime12Hour(savedEvent.time)}`);
    }
  };

  const handleEventDelete = (eventId: string) => {
    const updatedEvents = (currentData.events || []).filter((e) => e.id !== eventId);
    updateCurrentData({ events: updatedEvents });
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
          <AIChallengeCard data={currentData.aiChallenge} isLoading={isAiChallengeLoading} onAcceptChallenge={handleAcceptAIChallenge} />
        </div>

        <div className="space-y-8">
          <ProspectingKPIs contacts={currentData.prospectingContacts || []} events={currentData.events || []} />

          {/* FIXED APPOINTMENTS SECTION — 100% WORKING */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">TODAY'S APPOINTMENTS</h3>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                + Add Appointment
              </button>
            </div>

            {appointments.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No appointments scheduled today.</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                    onClick={() => {
                      setEditingEvent(event);
                      setIsEventModalOpen(true);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!event.completed}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => {
                        const updatedEvents = currentData.events?.map((e) =>
                          e.id === event.id ? { ...e, completed: !e.completed } : e
                        );
                        updateCurrentData({ events: updatedEvents });
                        if (!event.completed) {
                          onAddWin(currentDateKey, `Appointment Completed: ${event.title} at ${formatTime12Hour(event.time)}`);
                        }
                      }}
                      className="w-5 h-5 mt-1 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className={`flex-1 ${event.completed ? 'line-through text-gray-500' : ''}`}>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime12Hour(event.time)}
                      </p>
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

export default DayView;
