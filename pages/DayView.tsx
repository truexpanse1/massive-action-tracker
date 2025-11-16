

import React, { useMemo, useState } from 'react';
import { DayData, RevenueData, CalendarEvent, Goal, Contact, Transaction, User, getInitialDayData, AIChallengeData, formatCurrency, Role } from '../types';
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


const DayView: React.FC<DayViewProps> = ({ allData, onDataChange, selectedDate, onDateChange, onAddWin, onAddHotLead, onUpdateHotLead, hotLeads, transactions, users, onNavigateToRevenue, user }) => {
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isViewLeadsModalOpen, setIsViewLeadsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [isAiChallengeLoading, setIsAiChallengeLoading] = useState(false);

    const getDateKey = (date: Date): string => date.toISOString().split('T')[0];
    const currentDateKey = getDateKey(selectedDate);

    const currentData: DayData = allData[currentDateKey] || getInitialDayData();

    const updateCurrentData = (updates: Partial<DayData>) => {
        const updatedData = { ...(allData[currentDateKey] || getInitialDayData()), ...updates };
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

        let today = 0, week = 0, month = 0, ytd = 0, mcv = 0;

        (transactions || []).forEach(t => {
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
            today: formatCurrency(today), week: formatCurrency(week), month: formatCurrency(month),
            ytd: formatCurrency(ytd), mcv: formatCurrency(mcv), acv: formatCurrency(acv),
        };

    }, [transactions, selectedDate]);
    
    const handleAcceptAIChallenge = async () => {
        setIsAiChallengeLoading(true);
        try {
            const newChallenges = await getSalesChallenges();
            if (!newChallenges || newChallenges.length === 0) {
                throw new Error("AI did not return any challenges.");
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
            
            const newAiChallengeData = { ...currentData.aiChallenge, challengesAccepted: true, challenges: [] };

            updateCurrentData({ topTargets: currentTopTargets, aiChallenge: newAiChallengeData });
            onAddWin(currentDateKey, 'AI Challenges Added to Targets!');

        } catch (error) {
            console.error("Failed to fetch challenges:", error);
            alert("Could not generate AI challenges. The Gemini API may be unavailable or the API key is missing.");
        } finally {
            setIsAiChallengeLoading(false);
        }
    };
    
 const handleGoalChange = (
    type: 'topTargets' | 'massiveGoals',
    updatedGoal: Goal,
    isCompletion: boolean
) => {
    // Use the goals for the current day that are already in memory
    const goals = currentData[type] || [];

    // Replace just the one goal we updated
    const newGoals = goals.map(g =>
        g.id === updatedGoal.id ? updatedGoal : g
    );

    // Persist the change for this day
    updateCurrentData({ [type]: newGoals });

    // Trigger win/confetti only when actually completing a non-blank goal
    if (isCompletion && updatedGoal.text.trim() !== '') {
        onAddWin(currentDateKey, `Target Completed: ${updatedGoal.text}`);
    }
};

    
    const handleSaveNewLead = async (leadData: Omit<Contact, 'id' | 'date' | 'prospecting' | 'dateAdded' | 'completedFollowUps'>) => {
        const newHotLead = {
            ...leadData,
            date: currentDateKey,
            prospecting: {},
            dateAdded: new Date().toISOString(),
            completedFollowUps: {},
            userId: user.id,
        };
        const addedLead = await onAddHotLead(newHotLead);
        
        if (addedLead) {
            onAddWin(currentDateKey, `New Lead Added: ${addedLead.name}`);
        } else {
            alert("Failed to save the new lead. Please try again.");
        }
        setIsLeadModalOpen(false);
    };

    const handleAddAppointment = () => { setEditingEvent(null); setIsEventModalOpen(true); };
    
    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        const events = [...currentData.events];
        const index = events.findIndex(e => e.id === updatedEvent.id);
        if (index > -1) {
            events[index] = updatedEvent;
            updateCurrentData({ events });
        }
    };

    const handleSaveEvent = (eventData: CalendarEvent, originalDateKey: string | null, newDateKey: string) => {
        if (originalDateKey && allData[originalDateKey] && originalDateKey !== newDateKey) {
            const originalDayData = allData[originalDateKey];
            const updatedEvents = originalDayData.events.filter(e => e.id !== eventData.id);
            onDataChange(originalDateKey, { ...originalDayData, events: updatedEvents });
        }

        const newDayData = allData[newDateKey] || getInitialDayData();
        const existingEventIndex = newDayData.events.findIndex(e => e.id === eventData.id);
        if (existingEventIndex > -1) {
            newDayData.events[existingEventIndex] = eventData;
        } else {
            newDayData.events.push(eventData);
        }
        newDayData.events.sort((a, b) => a.time.localeCompare(b.time));
        onDataChange(newDateKey, newDayData);
        
        setIsEventModalOpen(false);
    };

    const handleDeleteEvent = (eventId: string, dateKey: string) => {
        const dayData = allData[dateKey];
        if (dayData) {
            const updatedEvents = dayData.events.filter(e => e.id !== eventId);
            onDataChange(dateKey, { ...dayData, events: updatedEvents });
        }
        setIsEventModalOpen(false);
    };

    const appointments = useMemo(() => (currentData.events || []).filter(event => event.type === 'Appointment'), [currentData.events]);
    const leadsAddedToday = useMemo(() => (hotLeads || []).filter(c => c.dateAdded && c.dateAdded.startsWith(currentDateKey)), [hotLeads, currentDateKey]);

    return (
        <>
            <AddLeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} onSave={handleSaveNewLead} />
            <AddEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} date={selectedDate} eventToEdit={editingEvent} />
            <ViewLeadsModal isOpen={isViewLeadsModalOpen} onClose={() => setIsViewLeadsModalOpen(false)} leads={leadsAddedToday} users={users} />
            
            <div className="text-left mb-6">
                <h2 className="text-2xl font-bold uppercase text-brand-light-text dark:text-white">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</h2>
                <p className="text-brand-light-gray dark:text-gray-400 text-sm font-medium">{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
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
                    <ProspectingKPIs contacts={currentData.prospectingContacts || []} events={currentData.events || []} />
                    <AppointmentsBlock events={currentData.events || []} onEventUpdate={handleEventUpdate} onAddAppointment={handleAddAppointment} />
                    <DailyFollowUps hotLeads={hotLeads} onUpdateHotLead={onUpdateHotLead} selectedDate={selectedDate} onWin={(msg) => onAddWin(currentDateKey, msg)} />
                    <WinsTodayCard wins={currentData.winsToday || []} />
                </div>

                <div className="space-y-8">
                    <GoalsBlock title="Today's Top 6 Targets" goals={currentData.topTargets} onGoalChange={(goal, isCompletion) => handleGoalChange('topTargets', goal, isCompletion)} />
                    <GoalsBlock title="Massive Action Goals" goals={currentData.massiveGoals} onGoalChange={(goal, isCompletion) => handleGoalChange('massiveGoals', goal, isCompletion)} highlight />
                    <NewLeadsBlock leads={leadsAddedToday} userRole={user.role} onAddLeadClick={() => setIsLeadModalOpen(true)} onViewLeadsClick={() => setIsViewLeadsModalOpen(true)} />
                </div>
            </div>
        </>
    );
};

export default DayView;
