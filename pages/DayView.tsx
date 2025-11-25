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
  Role,
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
import ViewAppointmentsModal from '../components/ViewAppointmentsModal';
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
    const updatedData = {
      ...(allData[currentDateKey] || getInitialDayData()),
      ...updates,
    };
    onDataChange(currentDateKey, updatedData);
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
      if (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      ) {
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

  const handleAcceptAIChallenge = async () => {
    setIsAiChallengeLoading(true);
    try {
      const newChallenges = await getSalesChallenges();
      if (!newChallenges || newChallenges.length === 0) {
        throw new Error('AI did not return any challenges.');
      }

      const currentTopTargets = [...currentData.topTargets];
      let challengesPlaced = 0;

      for (let i = 0; i < currentTopTargets.length; i++) {
        if (challengesPlaced >= newChallenges.length) break;
        if (currentTopTargets[i].text.trim() === '') {
          currentTopTargets[i].text = newChallenges[challengesPlaced];
          challengesPlaced++;
        }
      }

      const newAiChallengeData: AIChallengeData = {
        ...currentData.aiChallenge,
        challengesAccepted: true,
        challenges: [],
      };

      updateCurrentData({
        topTargets: currentTopTargets,
        aiChallenge: newAiChallengeData,
      });
      onAddWin(currentDateKey, 'AI Challenges Added to Targets!');
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      alert(
        'Could not generate AI challenges. The Gemini API may be unavailable or the API key is missing.',
      );
    } finally {
      setIsAiChallengeLoading(false);
    }
  };

  const handleGoalChange = (
    type: 'topTargets' | 'massiveGoals',
    updatedGoal: Goal,
    isCompletion: boolean,
  ) => {
    const goals = currentData[type] || [];
    const newGoals = goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));

    updateCurrentData({ [type]: newGoals });

    if (isCompletion && updatedGoal.text.trim() !== '') {
      onAddWin(currentDateKey, `Target
