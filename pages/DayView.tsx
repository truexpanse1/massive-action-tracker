import React, { useMemo, useState, useEffect } from 'react';
import {
  DayData,
  RevenueData,
  CalendarEvent,
  Goal,
  Contact,
  Transaction,
  User,
  getInitialDayData,
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

/** 24h → 12h time formatting e.g. "15:00" -> "3:00 PM" */
const formatTime12Hour = (time?: string): string => {
  if (!time) return '';
  const [hourStr, minuteStr = '00'] = time.split(':');
  let hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minuteStr} ${suffix}`;
};

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

  /** 🔹 Local events so a click doesn’t instantly get overwritten */
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(currentData.events || []);

  /** When the date changes, reset local events to that day’s events */
  useEffect(() => {
    const newData: DayData = allData[currentDateKey] || getInitialDayData();
    setLocalEvents(newData.events || []);
  }, [currentDateKey, allData]);

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

    let today = 0,
      week = 0,
      month = 0,
      ytd = 0,
      mcv = 0;

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

  /** Only pull appointments from localEvents */
  const appointments = useMemo(() => {
    return (localEvents || [])
      .filter((e): e is CalendarEvent => e?.type === 'Appointment')
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [localEvents]);

  const leadsAddedToday = useMemo(
    () => (hotLeads || []).filter((c) => c.dateAdded?.startsWith(currentDateKey)),
    [hotLeads, currentDateKey]
  );

  const handleAcceptAIChallenge = async () => {
    setIsAiChallengeLoading(true);
    try {
      const newChallenges = await getSalesChallenges();
      if (!newChallenges?.length) throw new Error('No challenges');
      const currentTopTargets = [...(currentData.topTargets || [])];
      let placed = 0;
      for (let i = 0; i < currentTopTargets.length && placed < newChallenges.length; i++) {
        const goal = currentTopTargets[i] as Goal;
        if (!goal.text?.trim()) {
          currentTopTargets[i] = { ...goal, text: newChallenges[placed++] };
        }
      }
      await updateCurrentData({
        topTargets: currentTopTargets,
        aiChallenge: { ...currentData.aiChallenge, challengesAccepted: true, challenges: [] },
      });
      onAddWin(currentDateKey, 'AI Challenges Added to Targets!');
    } catch (err) {
      alert('Failed to generate AI challenges.');
    } finally {
      setIsAiChallengeLoading(false);
    }
  };

  const handleGoalChange = async (
    type: 'topTargets' | 'massiveGoals',
    updatedGoal: Goal,
    isCompletion: boolean,
  ) => {
    const goals = (currentData[type] || []) as Goal[];
    const newGoals = goals.map((g) =>
      g.id === updatedGoal.id ? { ...updatedGoal, completed: isCompletion } : g
    );
    await updateCurrentData({ [type]: newGoals });
    if (isCompletion && updatedGoal.text?.trim()) {
      onAddWin(currentDateKey, `Target Completed: ${updatedGoal.text}`);
    }
  };

  const handleEventSaved = (savedEvent: CalendarEvent) => {
    const existingEvents = localEvents || [];
    const updatedEvents = editingEvent
      ? existingEvents.map((e) => (e.id === savedEvent.id ? savedEvent : e))
      : [...existingEvents, savedEvent];

    setLocalEvents(updatedEvents);
    updateCurrentData({ events: updatedEvents });
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    const updatedEvents = (localEvents || []).filter((e) => e.id !== eventId);
    setLocalEvents(updatedEvents);
    updateCurrentData({ events: updatedEvents });
  };

  return (
    <>
      <AddLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={() => {}}
      />
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
      <ViewLeadsModal
        isOpen={isViewLeadsModalOpen}
        onClose={() => setIsViewLeadsModalOpen(false)}
        leads={leadsAddedToday}
        users={users}
      />

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
          <AIChallengeCard
            data={currentData.aiChallenge}
            isLoading={isAiChallengeLoading}
            onAcceptChallenge={handleAcceptAIChallenge}
          />
        </div>

        <div className="space-y-8">
          <ProspectingKPIs
            contacts={currentData.prospectingContacts || []}
            events={localEvents || []}
          />

          {/* TODAY'S APPOINTMENTS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">TODAY'S APPOINTMENTS</h3>
              <button
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                + Add
              </button>
            </div>

            {appointments.length === 0 ? (
              <p className="text-gray-500 italic">No appointments today.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((event) => {
                  // Prefer the client/contact name from the event
                  const clientName =
                    (event as any).clientName ||
                    (event as any).contactName ||
                    '';

                  const label = clientName
                    ? `${clientName} — ${event.title || 'Appointment'}`
                    : event.title || 'Appointment';

                  return (
                    <div key={event.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 form-checkbox text-green-600 rounded focus:ring-green-500"
                        checked={!!event.completed}
                        onChange={async (e) => {
                          const newCompleted = e.target.checked;

                          // 1) Update local state immediately so it stays checked
                          const updatedEvents = (localEvents || []).map((evt) =>
                            evt.id === event.id ? { ...evt, completed: newCompleted } : evt
                          );
                          setLocalEvents(updatedEvents);

                          // 2) Persist to parent / backend
                          await updateCurrentData({ events: updatedEvents });

                          // 3) Fire win + followup trigger when completed
                          if (newCompleted) {
                            onAddWin(
                              currentDateKey,
                              `Appointment Completed: ${event.title || 'Appointment'}`
                            );
                            // <=== hook follow-up campaign trigger here if needed
                          }
                        }}
                      />
                      <div className={event.completed ? 'line-through text-gray-500' : ''}>
                        <p className="font-medium">{label}</p>
                        {event.time && (
                          <p className="text-sm text-gray-600">
                            {formatTime12Hour(event.time)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DailyFollowUps
            hotLeads={hotLeads}
            onUpdateHotLead={onUpdateHotLead}
            selectedDate={selectedDate}
            onWin={(msg) => onAddWin(currentDateKey, msg)}
          />
          <WinsTodayCard wins={currentData.winsToday || []} />
        </div>

        <div className="space-y-8">
          <GoalsBlock
            title="Today's Top 6 Targets"
            goals={currentData.topTargets || []}
            onGoalChange={(goal, isCompletion) =>
              handleGoalChange('topTargets', goal, isCompletion)
            }
          />
          <GoalsBlock
            title="Massive Action Goals"
            goals={currentData.massiveGoals || []}
            onGoalChange={(goal, isCompletion) =>
              handleGoalChange('massiveGoals', goal, isCompletion)
            }
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
