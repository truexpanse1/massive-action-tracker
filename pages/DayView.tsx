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

  // DAILY SCORE BADGE — THE #1 UPGRADE
  const topTargetsCompleted = currentData.topTargets?.filter((t: any) => t.completed).length || 0;
  const topTargetsTotal = 6;

  return (
    <>
      {/* Modals */}
      <AddLeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} onSave={() => {}} />
      <AddEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={() => {}} onDelete={() => {}} date={selectedDate} eventToEdit={editingEvent} />
      <ViewLeadsModal isOpen={isViewLeadsModalOpen} onClose={() => setIsViewLeadsModalOpen(false)} leads={[]} users={users} />

      {/* DAILY SCORE — BIG, CENTERED, BEAUTIFUL */}
      <div className="text-center my-8">
        <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-6xl font-bold shadow-2xl border-8 border-white/20">
          {topTargetsCompleted}/{topTargetsTotal}
        </div>
        <h3 className="mt-4 text-3xl font-bold text-white">
          {topTargetsCompleted === 6 ? 'PERFECT DAY!' : 'Top Targets Today'}
        </h3>
        <p className="text-xl text-green-300">
          {topTargetsCompleted === 6 ? 'You crushed it!' : `${Math.round((topTargetsCompleted / topTargetsTotal) * 100)}% Complete`}
        </p>
      </div>

      {/* Date Header */}
      <div className="text-left mb-6">
        <h2 className="text-2xl font-bold uppercase text-brand-light-text dark:text-white">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </h2>
        <p className="text-brand-light-gray dark:text-gray-400 text-sm font-medium">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-start">
        {/* Left Column */}
        <div className="space-y-8">
          <Calendar selectedDate={selectedDate} onDateChange={onDateChange} />
          <RevenueCard data={{ today: '$0', week: '$0', month: '$0', ytd: '$0', mcv: '$0', acv: '$0' }} onNavigate={onNavigateToRevenue} />
          <AIChallengeCard data={currentData.aiChallenge || {}} isLoading={isAiChallengeLoading} onAcceptChallenge={() => {}} />
        </div>

        {/* Middle Column */}
        <div className="space-y-8">
          <ProspectingKPIs contacts={currentData.prospectingContacts || []} events={currentData.events || []} />
          <AppointmentsBlock events={[]} onEventUpdate={() => {}} onAddAppointment={() => setIsEventModalOpen(true)} />
          <DailyFollowUps hotLeads={hotLeads} onUpdateHotLead={onUpdateHotLead} selectedDate={selectedDate} onWin={(msg) => onAddWin(currentDateKey, msg)} />
          <WinsTodayCard wins={currentData.winsToday || []} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <GoalsBlock
            title="Today's Top 6 Targets"
            goals={currentData.topTargets || []}
            onGoalChange={() => {}}
          />
          <GoalsBlock
            title="Massive Action Goals"
            goals={currentData.massiveGoals || []}
            onGoalChange={() => {}}
            highlight
          />
          <NewLeadsBlock
            leads={[]}
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
