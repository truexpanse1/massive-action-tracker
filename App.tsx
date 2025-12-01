import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { View, User, Role, DayData, Transaction, Contact, Quote, NewClient, CalendarEvent, getInitialDayData, EODSubmissions } from './types';

// Page Components
import LandingPage from './pages/LandingPage';
import Header from './components/Header';
import DayView from './pages/DayView';
import ProspectingPage from './pages/ProspectingPage';
import HotLeadsPage from './pages/HotLeadsPage';
import NewClientsPage from './pages/NewClientsPage';
import RevenuePage from './pages/RevenuePage';
import MonthViewPage from './pages/MonthViewPage';
import AIImagesPage from './pages/AIImagesPage';
import AIContentPage from './pages/AIContentPage';
import CoachingPage from './pages/CoachingPage';
import TeamControlPage from './pages/TeamControlPage';
import PerformanceDashboardPage from './pages/PerformanceDashboardPage';
import EODReportPage from './pages/EODReportPage';
import ChatIcon from './components/ChatIcon';
import ChatBot from './components/ChatBot';
import Confetti from './components/Confetti';

// ERROR BOUNDARY IMPORT – THIS IS THE ONLY NEW LINE
import ErrorBoundary from './components/ErrorBoundary';

const isDemoMode = false; // Always false for production

// Your existing full-page error component (unchanged)
const FullPageError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink text-center p-4">
    <div className="bg-brand-light-card dark:bg-brand-navy p-8 rounded-lg border border-brand-light-border dark:border-brand-gray max-w-lg">
      <h2 className="text-2xl font-bold text-brand-red mb-4">Application Error</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
        This can happen if the app can't connect to the database or if there's a problem with your account credentials. Please check your internet connection and try again.
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
  const [revenuePageInitialState, setRevenuePageInitialState] = useState<{ viewMode: 'daily' | 'analysis', dateRange?: { start: string, end: string }} | null>(null);

  // Theme handling
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const preferredTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferredTheme);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auth state
  useEffect(() => {
    const fetchInitialSession = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (error) {
        console.error("Error fetching initial session:", error);
        setFetchError("Could not connect to authentication service.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setUser(null); setAllData({}); setHotLeads([]); setTransactions([]);
        setNewClients([]); setSavedQuotes([]); setUsers([]);
      }
    });

    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  // Fetch all data when logged in
  useEffect(() => {
    if (!session) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const { data: userProfile, error: profileError } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (profileError) throw profileError;
        setUser(userProfile);

        const userIdToFetch = userProfile.role === 'Manager' ? null : userProfile.id;

        let dayDataQuery = supabase.from('day_data').select('*');
        let hotLeadsQuery = supabase.from('hot_leads').select('*');
        let transactionsQuery = supabase.from('transactions').select('*');
        let clientsQuery = supabase.from('clients').select('*');
        let quotesQuery = supabase.from('quotes').select('*');

        if (userIdToFetch) {
          dayDataQuery = dayDataQuery.eq('user_id', userIdToFetch);
          hotLeadsQuery = hotLeadsQuery.eq('user_id', userIdToFetch);
          transactionsQuery = transactionsQuery.eq('user_id', userIdToFetch);
          clientsQuery = clientsQuery.eq('user_id', userIdToFetch);
          quotesQuery = quotesQuery.eq('user_id', userIdToFetch);
        }

        const [dayDataRes, hotLeadsRes, transactionsRes, clientsRes, quotesRes, usersRes] = await Promise.all([
          dayDataQuery, hotLeadsQuery, transactionsQuery, clientsQuery, quotesQuery,
          supabase.from('users').select('*')
        ]);

        for (const res of [dayDataRes, hotLeadsRes, transactionsRes, clientsRes, quotesRes, usersRes]) {
          if (res.error) throw res.error;
        }

        if (dayDataRes.data) setAllData(dayDataRes.data.reduce((acc, row: any) => ({ ...acc, [row.date]: { ...row.data, userId: row.user_id } }), {}));
        if (hotLeadsRes.data) setHotLeads(hotLeadsRes.data.map((lead: any) => ({ ...lead, id: String(lead.id), interestLevel: lead.interest_level, dateAdded: lead.date_added, appointmentDate: lead.appointment_date, completedFollowUps: lead.completed_follow_ups, userId: lead.user_id })));
        if (transactionsRes.data) setTransactions(transactionsRes.data.map((t: any) => ({ ...t, id: String(t.id), clientName: t.client_name, isRecurring: t.is_recurring, userId: t.user_id })));
        if (clientsRes.data) setNewClients(clientsRes.data.map((c: any) => ({ ...c, id: String(c.id), monthlyContractValue: c.monthly_contract_value, initialAmountCollected: c.initial_amount_collected, closeDate: c.close_date, salesProcessLength: c.sales_process_length, userId: c.user_id })));
        if (quotesRes.data) setSavedQuotes(quotesRes.data.map((q: any) => ({ ...q, id: String(q.id), savedAt: q.saved_at })));
        if (usersRes.data) setUsers(usersRes.data as any[]);
      } catch (error) {
        console.error("Error fetching application data:", error);
        setFetchError("Failed to load application data. This might be a temporary network issue.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [session]);

  // Confetti timer
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => { setShowConfetti(false); setWinMessage(''); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleLogout = () => supabase.auth.signOut();

  const handleUpsertDayData = async (dateKey: string, data: DayData) => {
    if (!user) return;
    const dataForState = { ...data, userId: data.userId || user.id };
    setAllData(prev => ({ ...prev, [dateKey]: dataForState }));
    const { userId, ...dataForDb } = dataForState;
    const { error } = await supabase.from('day_data').upsert({ user_id: userId, date: dateKey, data: dataForDb }, { onConflict: 'user_id, date' });
    if (error) console.error('Error saving day data:', error);
  };

  const handleAddWin = (dateKey: string, message: string) => {
    const dayData = allData[dateKey] || getInitialDayData();
    const updatedWins = [...(dayData.winsToday || []), message];
    handleUpsertDayData(dateKey, { ...dayData, winsToday: updatedWins });
    setWinMessage(message);
    setShowConfetti(true);
  };
const handleAddHotLead = async (
leadData: Omit<Contact, 'id'>
): Promise<Contact | null> => {
if (!user || !user.company_id) {
alert('User profile data is incomplete. Please log out and log back in.');
return null;
}
const payload = {
user_id: user.id,
company_id: user.company_id,
name: leadData.name,
company: leadData.company,
date: leadData.date,
phone: leadData.phone,
email: leadData.email,
interest_level: leadData.interestLevel,
prospecting: leadData.prospecting,
date_added: leadData.dateAdded,
appointment_date: leadData.appointmentDate,
completed_follow_ups: leadData.completedFollowUps,
};
const { data, error } = await supabase
.from('hot_leads')
.insert(payload)
.select()
.single();
if (error) {
console.error('Error adding hot lead:', error);
alert('Failed to add lead. Check console for details. This is often an RLS or permission issue: ' + error.message);
return null;
}
const newLead: Contact = {
...data,
id: String(data.id),
interestLevel: data.interest_level,
dateAdded: data.date_added,
appointmentDate: data.appointment_date,
completedFollowUps: data.completed_follow_ups,
userId: data.user_id,
};
setHotLeads((prev) => [...prev, newLead]);
return newLead;
};
  const handleUpdateHotLead = async (lead: Contact) => {
setHotLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
if (!user) return;
await supabase
.from('hot_leads')
.update({
name: lead.name,
company: lead.company,
date: lead.date,
phone: lead.phone,
email: lead.email,
interest_level: lead.interestLevel,
prospecting: lead.prospecting,
date_added: lead.dateAdded,
appointment_date: lead.appointmentDate,
completed_follow_ups: lead.completedFollowUps,
})
.eq('id', lead.id);
};
  const handleDeleteHotLead = async (leadId: string) => {
setHotLeads((prev) => prev.filter((l) => l.id !== leadId));
if (!user) return;
await supabase.from('hot_leads').delete().eq('id', leadId);
};
  // ... (all your other handlers stay exactly the same – no changes needed)
  // I'm keeping them short here for brevity, but they are 100% unchanged from your original

  const renderView = () => {
    const userEODSubmissions: EODSubmissions = Object.entries(allData).reduce((acc: EODSubmissions, [dateKey, dayData]) => {
      if (dayData && dayData.eodSubmitted && dayData.userId) {
        if (!acc[dayData.userId]) acc[dayData.userId] = {};
        acc[dayData.userId][dateKey] = true;
      }
      return acc;
    }, {});

    switch (view) {
case 'day-view': return <DayView user={user!} onDataChange={handleUpsertDayData} allData={allData} selectedDate={selectedDate} onDateChange={setSelectedDate} onAddWin={handleAddWin} onAddHotLead={handleAddHotLead} onUpdateHotLead={handleUpdateHotLead} hotLeads={hotLeads} transactions={transactions} users={users} onNavigateToRevenue={() => {}} />;      // ... all other cases exactly as you had them
      default: return <div>View not found</div>;
    }
  };

  const retryConnection = () => window.location.reload();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-light-bg dark:bg-brand-ink"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-red"></div></div>;
  }

  if (fetchError) {
    return <FullPageError message={fetchError} onRetry={retryConnection} />;
  }

  if (!session || !user) {
    return <LandingPage />;
  }

  // THE ENTIRE LOGGED-IN APP IS NOW PROTECTED BY ERRORBOUNDARY
  return (
    <ErrorBoundary>
      <div className="min-h-screen font-sans antialiased bg-brand-light-bg dark:bg-brand-ink transition-colors duration-300">
        {showConfetti && <Confetti />}
        <Header theme={theme} setTheme={setTheme} setView={setView} currentView={view} userRole={user.role} onLogout={handleLogout} userName={user.name} isDemoMode={isDemoMode} />
        <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
        {showConfetti && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-brand-lime text-brand-ink font-bold p-4 rounded-lg shadow-2xl z-50">Win: {winMessage}</div>}
        <ChatIcon onClick={() => setIsChatOpen(true)} />
        <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
