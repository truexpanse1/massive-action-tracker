import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

import {
  View,
  User,
  Role,
  DayData,
  Transaction,
  Contact,
  Quote,
  NewClient,
  CalendarEvent,
  getInitialDayData,
  UserStatus,
  EODSubmissions,
} from '../types';

// Page Components
import LandingPage from '../pages/LandingPage';

import Header from '../components/Header';
import DayView from '../pages/DayView';
import ProspectingPage from '../pages/ProspectingPage';
import HotLeadsPage from '../pages/HotLeadsPage';
import NewClientsPage from '../pages/NewClientsPage';
import RevenuePage from '../pages/RevenuePage';
import MonthViewPage from '../pages/MonthViewPage';
import AIImagesPage from '../pages/AIImagesPage';
import AIContentPage from '../pages/AIContentPage';
import CoachingPage from '../pages/CoachingPage';
import TeamControlPage from '../pages/TeamControlPage';
import PerformanceDashboardPage from '../pages/PerformanceDashboardPage';
import EODReportPage from '../pages/EODReportPage';
import ChatIcon from '../components/ChatIcon';
import ChatBot from '../components/ChatBot';
import Confetti from '../components/Confetti';

const isDemoMode = false; // Always false for production

const FullPageError: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink text-center p-4">
    <div className="bg-brand-light-card dark:bg-brand-navy p-8 rounded-lg border border-brand-light-border dark:border-brand-gray max-w-lg">
      <h2 className="text-2xl font-bold text-brand-red mb-4">Application Error</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        This can happen if the app can't connect to the database or if there's a problem
        with your account credentials. Please check your internet connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [view, setView] = useState<View>('day-view');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [allData, setAllData] = useState<{ [key: string]: DayData }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hotLeads, setHotLeads] = useState<Contact[]>([]);
  const [newClients, setNewClients] = useState<NewClient[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [contextualUserId, setContextualUserId] = useState<string | null>(null);
  const [revenuePageInitialState, setRevenuePageInitialState] = useState<{
    viewMode: 'daily' | 'analysis';
    dateRange?: { start: string; end: string };
  } | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const preferredTheme =
      storedTheme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferredTheme);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchInitialSession = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        if (!session) setIsLoading(false);
      } catch (error) {
        console.error('Error fetching initial session:', error);
        setFetchError('Could not connect to authentication service.');
        setIsLoading(false);
      }
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          setUser(null);
          setAllData({});
          setHotLeads([]);
          setTransactions([]);
          setNewClients([]);
