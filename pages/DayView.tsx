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
import AppointmentsBlock from '../components/AppointmentsBlock';
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

  const handleAcceptAIChallenge = async () => {
    setIsAiChallengeLoading(true);
    try {
      const newChallenges = await getSalesChallenges();
      if (!newChallenges?.length) throw new Error('No challenges');
      const currentTopTargets = [...currentData.topTargets];
      let placed = 0;
      for (let i = 0; i < currentTopTargets.length && placed < newChallenges.length; i++) {
        const text = typeof currentTopTargets[i] === 'string' ? currentTopTargets[i] : currentTopTargets[i].text || '';
        if (!text.trim()) {
          currentTopTargets[i] = { ...(currentTopTargets[i] as any), text: newChallenges[placed++] };
        }
      }
      updateCurrentData({
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
    updateCurrentData({ [type]: newGoals });
    if (type === 'topTargets' && updatedGoal.text?.trim()) {
      await supabase
        .from('goals')
        .upsert(
          {
            user_id: user.id,
            goal_date: currentDateKey,
            text: updatedGoal.text.trim(),
            completed: isCompletion,
            type: 'target',
          },
          { onConflict: 'user_id,goal_date,text', ignoreDuplicates: false }
        );
    }
    if (isCompletion && updatedGoal.text?.trim()) {
      onAddWin(currentDateKey, `Target Completed: ${updatedGoal.text}`);
    }
  };

  // APPOINTMENT COMPLETION — WORKS 100%
  const toggleAppointmentComplete = (eventId: string) => {
    const updatedEvents = (currentData.events || []).map((e: any) =>
      e.id === eventId ? { ...e, completed: !e.completed } : e
    );
    updateCurrentData({ events: updatedEvents });

    const event = updatedEvents.find((e: any) => e.id === eventId);
    if (event?.completed) {
      onAddWin(currentDateKey, `Appointment Completed: ${event.title || event.text || 'Appointment'}`);
    }
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

  const appointments = useMemo(
    () => (currentData.events || []).filter((e) => e.type === 'Appointment'),
    [currentData.events]
  );

  const leadsAddedToday = useMemo(
    () => (hotLeads || []).filter((c) => c.dateAdded?.startsWith(currentDateKey)),
    [hotLeads, currentDateKey]
  );

  return (
    <>
      <AddLeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} onSave={() => {}} />
      <AddEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={() => {}} onDelete={() => {}} date={selectedDate} eventToEdit={editingEvent} />
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
          
          {/* APPOINTMENTS — NOW WITH WORKING CHECKBOXES */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">TODAY'S APPOINTMENTS</h3>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                + Add
              </button>
            </div>
            {appointments.length === 0 ? (
              <p className="text-gray-500 italic">No appointments today.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((event: any) => (
                  <div key={event.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={!!event.completed}
                      onChange={() => toggleAppointmentComplete(event.id)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className={event.completed ? 'line-through text-gray-500' : ''}>
                      <p className="font-medium">{event.title || event.text || 'Appointment'}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
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
